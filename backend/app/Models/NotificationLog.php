<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NotificationLog extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id', 'employee_name', 'phone', 'message', 'type', 'status',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
