<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Http\Requests\EmployeeRequest;
use App\Http\Resources\EmployeeResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $employees = Employee::where('company_id', $request->user()->company_id)->get();

        return response()->json(EmployeeResource::collection($employees));
    }

    public function store(EmployeeRequest $request): JsonResponse
    {
        $company = $request->user()->company;

        if ($request->input('profile', 'employee') === 'employee' && ! $company->canAddEmployee()) {
            $max = $company->maxEmployees();
            return response()->json([
                'message' => "Limite do plano {$company->plan} atingido ({$max} funcionários). Faça upgrade para adicionar mais.",
            ], 422);
        }

        $data = $request->validated();
        $data['company_id'] = $request->user()->company_id;
        $data['password'] = Hash::make($data['password'] ?? '123456');
        $data['avatar'] = $data['avatar'] ?? "https://i.pravatar.cc/150?u={$data['email']}";

        return response()->json(new EmployeeResource(Employee::create($data)), 201);
    }

    public function show(Request $request, Employee $employee): JsonResponse
    {
        $this->authorizeCompany($request, $employee->company_id);

        return response()->json(new EmployeeResource($employee));
    }

    public function update(EmployeeRequest $request, Employee $employee): JsonResponse
    {
        $this->authorizeCompany($request, $employee->company_id);

        $data = $request->validated();
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $employee->update($data);

        return response()->json(new EmployeeResource($employee));
    }

    public function destroy(Request $request, Employee $employee): JsonResponse
    {
        $this->authorizeCompany($request, $employee->company_id);
        $employee->delete();

        return response()->json(null, 204);
    }

    public function toggleStatus(Request $request, Employee $employee): JsonResponse
    {
        $this->authorizeCompany($request, $employee->company_id);
        $employee->update(['status' => ! $employee->status]);

        return response()->json(new EmployeeResource($employee));
    }

    private function authorizeCompany(Request $request, ?int $companyId): void
    {
        if ($companyId !== $request->user()->company_id) {
            abort(403, 'Acesso negado.');
        }
    }
}
