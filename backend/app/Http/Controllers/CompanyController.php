<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class CompanyController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_name' => 'required|string|max:255',
            'cnpj'         => 'nullable|string|max:20|unique:companies,cnpj',
            'company_email'=> 'required|email|unique:companies,email',
            'phone'        => 'nullable|string|max:20',
            'plan'         => 'required|in:free,basic,premium,enterprise',
            'admin_name'   => 'required|string|max:255',
            'admin_email'  => 'required|email|unique:employees,email',
            'password'     => 'required|string|min:6',
        ]);

        $company = Company::create([
            'name'   => $data['company_name'],
            'cnpj'   => $data['cnpj'] ?? null,
            'email'  => $data['company_email'],
            'phone'  => $data['phone'] ?? null,
            'plan'   => $data['plan'],
            'status' => 'active',
        ]);

        $admin = Employee::create([
            'company_id'  => $company->id,
            'name'        => $data['admin_name'],
            'email'       => $data['admin_email'],
            'password'    => Hash::make($data['password']),
            'role'        => 'Administrador',
            'department'  => 'Gestão',
            'salary'      => 0,
            'weekly_hours'=> 40,
            'gps_lat'     => -23.5505,
            'gps_lng'     => -46.6333,
            'gps_radius'  => 9999,
            'profile'     => 'admin',
            'status'      => true,
            'avatar'      => "https://i.pravatar.cc/150?u={$data['admin_email']}",
        ]);

        $token = $admin->createToken('auth-token')->plainTextToken;

        return response()->json([
            'company'  => $company,
            'employee' => $admin,
            'token'    => $token,
        ], 201);
    }

    public function show(Request $request): JsonResponse
    {
        $company = $request->user()->company;

        return response()->json([
            'company'        => $company,
            'plan_info'      => Company::PLANS[$company->plan],
            'employee_count' => $company->activeEmployeeCount(),
            'can_add'        => $company->canAddEmployee(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $company = $request->user()->company;

        $data = $request->validate([
            'name'  => 'sometimes|required|string|max:255',
            'cnpj'  => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
        ]);

        $company->update($data);

        return response()->json($company);
    }

    public function changePlan(Request $request): JsonResponse
    {
        $request->validate(['plan' => 'required|in:free,basic,premium,enterprise']);

        $company = $request->user()->company;
        $company->update(['plan' => $request->plan]);

        return response()->json([
            'company'   => $company,
            'plan_info' => Company::PLANS[$company->plan],
        ]);
    }
}
