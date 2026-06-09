<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'cnpj', 'email', 'phone', 'plan', 'status'];

    public const PLANS = [
        'free'       => ['name' => 'Free',       'max_employees' => 2,    'price' => 0.00],
        'basic'      => ['name' => 'Basic',      'max_employees' => 10,   'price' => 39.90],
        'premium'    => ['name' => 'Premium',    'max_employees' => 50,   'price' => 99.90],
        'enterprise' => ['name' => 'Enterprise', 'max_employees' => null, 'price' => 299.90],
    ];

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public function convenios()
    {
        return $this->hasMany(Convenio::class);
    }

    public function maxEmployees(): ?int
    {
        return self::PLANS[$this->plan]['max_employees'] ?? 2;
    }

    public function canAddEmployee(): bool
    {
        $max = $this->maxEmployees();
        if ($max === null) return true;

        return $this->employees()
            ->where('profile', 'employee')
            ->where('status', true)
            ->count() < $max;
    }

    public function activeEmployeeCount(): int
    {
        return $this->employees()->where('profile', 'employee')->where('status', true)->count();
    }
}
