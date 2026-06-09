<?php

namespace App\Http\Controllers;

use App\Models\CLTAlert;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CLTAlertController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $employeeIds = Employee::where('company_id', $request->user()->company_id)->pluck('id');

        return response()->json(
            CLTAlert::whereIn('employee_id', $employeeIds)
                ->orderByDesc('created_at')
                ->get()
        );
    }

    public function destroy(Request $request, CLTAlert $alert): JsonResponse
    {
        $employeeIds = Employee::where('company_id', $request->user()->company_id)->pluck('id');

        if (! $employeeIds->contains($alert->employee_id)) {
            abort(403, 'Acesso negado.');
        }

        $alert->delete();

        return response()->json(null, 204);
    }
}
