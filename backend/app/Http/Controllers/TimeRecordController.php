<?php

namespace App\Http\Controllers;

use App\Models\TimeRecord;
use App\Models\Employee;
use App\Http\Requests\TimeRecordRequest;
use App\Http\Resources\TimeRecordResource;
use App\Services\CLTService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TimeRecordController extends Controller
{
    public function __construct(private CLTService $cltService) {}

    public function index(Request $request): JsonResponse
    {
        $query = TimeRecord::with('employee')->orderByDesc('date');

        if ($request->employee_id) {
            $query->where('employee_id', $request->employee_id);
        }
        if ($request->date_start) {
            $query->where('date', '>=', $request->date_start);
        }
        if ($request->date_end) {
            $query->where('date', '<=', $request->date_end);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json(TimeRecordResource::collection($query->get()));
    }

    public function store(TimeRecordRequest $request): JsonResponse
    {
        $record = TimeRecord::create($request->validated());
        $this->cltService->checkAndCreateAlerts($record);

        return response()->json(new TimeRecordResource($record), 201);
    }

    public function show(TimeRecord $timeRecord): JsonResponse
    {
        return response()->json(new TimeRecordResource($timeRecord));
    }

    public function update(TimeRecordRequest $request, TimeRecord $timeRecord): JsonResponse
    {
        $timeRecord->update($request->validated());
        $this->cltService->checkAndCreateAlerts($timeRecord);

        return response()->json(new TimeRecordResource($timeRecord));
    }

    public function destroy(TimeRecord $timeRecord): JsonResponse
    {
        $timeRecord->delete();

        return response()->json(null, 204);
    }

    public function byEmployee(Employee $employee, Request $request): JsonResponse
    {
        $records = $employee->timeRecords()
            ->when($request->month, fn ($q) => $q->whereMonth('date', $request->month))
            ->when($request->year, fn ($q) => $q->whereYear('date', $request->year))
            ->orderBy('date')
            ->get();

        return response()->json(TimeRecordResource::collection($records));
    }

    public function punch(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:entrada,inicio_almoco,retorno_almoco,saida',
            'gps_lat' => 'nullable|numeric',
            'gps_lng' => 'nullable|numeric',
            'location_name' => 'nullable|string',
        ]);

        $employee = $request->user();
        $today = now()->toDateString();
        $time = now()->toTimeString();

        $record = TimeRecord::firstOrCreate(
            ['employee_id' => $employee->id, 'date' => $today],
            ['status' => 'normal', 'extra_hours' => 0, 'delay_minutes' => 0]
        );

        $record->update([
            $request->type => $time,
            'gps_lat' => $request->gps_lat,
            'gps_lng' => $request->gps_lng,
            'location_name' => $request->location_name,
        ]);

        if ($request->type === 'saida') {
            $this->cltService->calculateHours($record);
        }

        return response()->json(new TimeRecordResource($record));
    }
}
