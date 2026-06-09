<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Employee extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'company_id', 'name', 'cpf', 'rg', 'birth_date', 'email', 'phone', 'password',
        'role', 'department', 'salary', 'weekly_hours', 'admission_date',
        'emergency_contact_name', 'emergency_contact_phone',
        'gps_lat', 'gps_lng', 'gps_radius',
        'status', 'avatar', 'profile',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'salary' => 'decimal:2',
            'weekly_hours' => 'integer',
            'gps_lat' => 'decimal:8',
            'gps_lng' => 'decimal:8',
            'gps_radius' => 'integer',
            'status' => 'boolean',
            'birth_date' => 'date',
            'admission_date' => 'date',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function timeRecords()
    {
        return $this->hasMany(TimeRecord::class);
    }

    public function notificationLogs()
    {
        return $this->hasMany(NotificationLog::class);
    }

    public function cltAlerts()
    {
        return $this->hasMany(CLTAlert::class);
    }
}
