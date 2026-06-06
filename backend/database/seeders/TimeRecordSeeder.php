<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\TimeRecord;
use Illuminate\Database\Seeder;

class TimeRecordSeeder extends Seeder
{
    public function run(): void
    {
        $records = [
            // João Silva
            ['email' => 'joao@pontofacil.com', 'date' => '2026-06-01', 'entrada' => '08:02:00', 'inicio_almoco' => '12:00:00', 'retorno_almoco' => '13:00:00', 'saida' => '17:05:00', 'status' => 'normal', 'extra_hours' => 0, 'delay_minutes' => 2],
            ['email' => 'joao@pontofacil.com', 'date' => '2026-06-02', 'entrada' => '08:00:00', 'inicio_almoco' => '12:00:00', 'retorno_almoco' => '13:00:00', 'saida' => '19:30:00', 'status' => 'extra', 'extra_hours' => 2.5, 'delay_minutes' => 0],
            ['email' => 'joao@pontofacil.com', 'date' => '2026-06-03', 'entrada' => '08:15:00', 'inicio_almoco' => '12:00:00', 'retorno_almoco' => '13:00:00', 'saida' => '17:15:00', 'status' => 'atraso', 'extra_hours' => 0, 'delay_minutes' => 15],
            ['email' => 'joao@pontofacil.com', 'date' => '2026-06-04', 'entrada' => '08:00:00', 'inicio_almoco' => '12:00:00', 'retorno_almoco' => '13:00:00', 'saida' => '17:00:00', 'status' => 'normal', 'extra_hours' => 0, 'delay_minutes' => 0],
            ['email' => 'joao@pontofacil.com', 'date' => '2026-06-05', 'entrada' => '08:00:00', 'inicio_almoco' => '12:00:00', 'retorno_almoco' => '13:00:00', 'saida' => '18:00:00', 'status' => 'extra', 'extra_hours' => 1, 'delay_minutes' => 0],
            // Carlos Santos - horas extras excessivas
            ['email' => 'carlos@pontofacil.com', 'date' => '2026-06-01', 'entrada' => '07:30:00', 'inicio_almoco' => '12:00:00', 'retorno_almoco' => '13:00:00', 'saida' => '20:00:00', 'status' => 'extra', 'extra_hours' => 3.5, 'delay_minutes' => 0],
            ['email' => 'carlos@pontofacil.com', 'date' => '2026-06-02', 'entrada' => '07:30:00', 'inicio_almoco' => '12:00:00', 'retorno_almoco' => '13:00:00', 'saida' => '21:00:00', 'status' => 'extra', 'extra_hours' => 4.5, 'delay_minutes' => 0],
            ['email' => 'carlos@pontofacil.com', 'date' => '2026-06-03', 'entrada' => '08:00:00', 'inicio_almoco' => '12:00:00', 'retorno_almoco' => '13:00:00', 'saida' => '19:30:00', 'status' => 'extra', 'extra_hours' => 2.5, 'delay_minutes' => 0],
            // Lucas Martins - muitos atrasos
            ['email' => 'lucas@pontofacil.com', 'date' => '2026-06-01', 'entrada' => '08:32:00', 'inicio_almoco' => '12:00:00', 'retorno_almoco' => '13:00:00', 'saida' => '17:32:00', 'status' => 'atraso', 'extra_hours' => 0, 'delay_minutes' => 32],
            ['email' => 'lucas@pontofacil.com', 'date' => '2026-06-02', 'entrada' => '08:45:00', 'inicio_almoco' => '12:00:00', 'retorno_almoco' => '13:00:00', 'saida' => '17:45:00', 'status' => 'atraso', 'extra_hours' => 0, 'delay_minutes' => 45],
            ['email' => 'lucas@pontofacil.com', 'date' => '2026-06-03', 'entrada' => '08:20:00', 'inicio_almoco' => '12:00:00', 'retorno_almoco' => '13:00:00', 'saida' => '17:20:00', 'status' => 'atraso', 'extra_hours' => 0, 'delay_minutes' => 20],
        ];

        foreach ($records as $data) {
            $email = $data['email'];
            unset($data['email']);

            $employee = Employee::where('email', $email)->first();
            if (! $employee) continue;

            TimeRecord::updateOrCreate(
                ['employee_id' => $employee->id, 'date' => $data['date']],
                array_merge($data, [
                    'employee_id' => $employee->id,
                    'location_name' => 'Av. Paulista, 1000 — São Paulo',
                    'gps_lat' => -23.5505,
                    'gps_lng' => -46.6333,
                ])
            );
        }
    }
}
