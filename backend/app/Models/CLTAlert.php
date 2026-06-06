<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CLTAlert extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'clt_alerts';

    protected $fillable = [
        'employee_id', 'employee_name', 'level', 'message',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
