<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TimeRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'date' => $this->date?->format('Y-m-d'),
            'entrada' => $this->entrada,
            'inicio_almoco' => $this->inicio_almoco,
            'retorno_almoco' => $this->retorno_almoco,
            'saida' => $this->saida,
            'gps_coords' => $this->gps_lat ? [
                'lat' => (float) $this->gps_lat,
                'lng' => (float) $this->gps_lng,
            ] : null,
            'location_name' => $this->location_name,
            'status' => $this->status,
            'extra_hours' => (float) $this->extra_hours,
            'delay_minutes' => $this->delay_minutes,
        ];
    }
}
