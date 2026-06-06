<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'cpf' => $this->cpf,
            'rg' => $this->rg,
            'birth_date' => $this->birth_date?->format('Y-m-d'),
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'department' => $this->department,
            'salary' => (float) $this->salary,
            'weekly_hours' => $this->weekly_hours,
            'admission_date' => $this->admission_date?->format('Y-m-d'),
            'emergency_contact' => [
                'name' => $this->emergency_contact_name,
                'phone' => $this->emergency_contact_phone,
            ],
            'gps_location' => [
                'lat' => (float) $this->gps_lat,
                'lng' => (float) $this->gps_lng,
                'radius' => $this->gps_radius,
            ],
            'status' => $this->status,
            'avatar' => $this->avatar,
            'profile' => $this->profile,
        ];
    }
}
