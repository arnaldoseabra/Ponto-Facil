<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TimeRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'entrada' => 'nullable|date_format:H:i:s',
            'inicio_almoco' => 'nullable|date_format:H:i:s',
            'retorno_almoco' => 'nullable|date_format:H:i:s',
            'saida' => 'nullable|date_format:H:i:s',
            'gps_lat' => 'nullable|numeric',
            'gps_lng' => 'nullable|numeric',
            'location_name' => 'nullable|string|max:255',
            'status' => 'nullable|in:normal,extra,atraso,falta',
            'extra_hours' => 'nullable|numeric|min:0',
            'delay_minutes' => 'nullable|integer|min:0',
        ];
    }
}
