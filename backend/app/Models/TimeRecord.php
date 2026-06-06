<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TimeRecord extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id', 'date', 'entrada', 'inicio_almoco', 'retorno_almoco', 'saida',
        'gps_lat', 'gps_lng', 'location_name', 'status', 'extra_hours', 'delay_minutes',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'gps_lat' => 'decimal:8',
            'gps_lng' => 'decimal:8',
            'extra_hours' => 'decimal:2',
            'delay_minutes' => 'integer',
        ];
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
