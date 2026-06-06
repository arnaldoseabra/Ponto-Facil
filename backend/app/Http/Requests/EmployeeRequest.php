<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $employeeId = $this->route('employee')?->id;

        return [
            'name' => 'required|string|max:255',
            'cpf' => ['nullable', 'string', 'max:20', Rule::unique('employees', 'cpf')->ignore($employeeId)],
            'rg' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'email' => ['required', 'email', Rule::unique('employees', 'email')->ignore($employeeId)],
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6',
            'role' => 'required|string|max:100',
            'department' => 'required|string|max:100',
            'salary' => 'required|numeric|min:0',
            'weekly_hours' => 'required|integer|min:1|max:44',
            'admission_date' => 'nullable|date',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'gps_lat' => 'nullable|numeric',
            'gps_lng' => 'nullable|numeric',
            'gps_radius' => 'nullable|integer|min:50',
            'status' => 'boolean',
            'avatar' => 'nullable|string|max:500',
            'profile' => 'required|in:employee,admin',
        ];
    }
}
