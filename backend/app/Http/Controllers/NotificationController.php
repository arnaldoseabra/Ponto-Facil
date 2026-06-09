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

    public function index(Request $request): JsonResponse
    {
        $companyId   = $request->user()->company_id;
        $employeeIds = Employee::where('company_id', $companyId)->pluck('id');

        return response()->json(
            NotificationLog::whereIn('employee_id', $employeeIds)
                ->orderByDesc('created_at')
                ->get()
        );
    }

    public function send(Request $request): JsonResponse
    {
        $request->validate([
            'employee_ids'   => 'required|array',
            'employee_ids.*' => 'exists:employees,id',
            'message'        => 'required|string|max:1000',
            'type'           => 'nullable|in:entrada,almoco,retorno,saida,alerta',
        ]);

        $companyId = $request->user()->company_id;
        $logs = [];

        foreach ($request->employee_ids as $empId) {
            $employee = Employee::where('id', $empId)->where('company_id', $companyId)->first();
            if (! $employee) continue;

            $status = $this->whatsapp->send($employee->phone, $request->message) ? 'enviado' : 'falha';

            $logs[] = NotificationLog::create([
                'company_id'    => $companyId,
                'employee_id'   => $employee->id,
                'employee_name' => $employee->name,
                'phone'         => $employee->phone,
                'message'       => $request->message,
                'type'          => $request->type ?? 'alerta',
                'status'        => $status,
            ]);
        }

        return response()->json($logs, 201);
    }
}
