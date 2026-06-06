<?php

namespace App\Http\Controllers;

use App\Models\NotificationLog;
use App\Models\Employee;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function __construct(private WhatsAppService $whatsapp) {}

    public function index(): JsonResponse
    {
        return response()->json(
            NotificationLog::orderByDesc('created_at')->get()
        );
    }

    public function send(Request $request): JsonResponse
    {
        $request->validate([
            'employee_ids' => 'required|array',
            'employee_ids.*' => 'exists:employees,id',
            'message' => 'required|string|max:1000',
            'type' => 'nullable|in:entrada,almoco,retorno,saida,alerta',
        ]);

        $logs = [];
        foreach ($request->employee_ids as $empId) {
            $employee = Employee::find($empId);
            if (! $employee) continue;

            $status = $this->whatsapp->send($employee->phone, $request->message)
                ? 'enviado'
                : 'falha';

            $log = NotificationLog::create([
                'employee_id' => $employee->id,
                'employee_name' => $employee->name,
                'phone' => $employee->phone,
                'message' => $request->message,
                'type' => $request->type ?? 'alerta',
                'status' => $status,
            ]);

            $logs[] = $log;
        }

        return response()->json($logs, 201);
    }
}
