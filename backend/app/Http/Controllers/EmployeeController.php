<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Http\Requests\EmployeeRequest;
use App\Http\Resources\EmployeeResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class EmployeeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(EmployeeResource::collection(Employee::all()));
    }

    public function store(EmployeeRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password'] ?? '123456');
        $data['avatar'] = $data['avatar'] ?? "https://i.pravatar.cc/150?u={$data['email']}";

        $employee = Employee::create($data);

        return response()->json(new EmployeeResource($employee), 201);
    }

    public function show(Employee $employee): JsonResponse
    {
        return response()->json(new EmployeeResource($employee));
    }

    public function update(EmployeeRequest $request, Employee $employee): JsonResponse
    {
        $data = $request->validated();
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $employee->update($data);

        return response()->json(new EmployeeResource($employee));
    }

    public function destroy(Employee $employee): JsonResponse
    {
        $employee->delete();

        return response()->json(null, 204);
    }

    public function toggleStatus(Employee $employee): JsonResponse
    {
        $employee->update(['status' => ! $employee->status]);

        return response()->json(new EmployeeResource($employee));
    }
}
