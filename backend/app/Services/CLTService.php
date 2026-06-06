<?php

namespace App\Services;

use App\Models\TimeRecord;
use App\Models\CLTAlert;

class CLTService
{
    public function checkAndCreateAlerts(TimeRecord $record): void
    {
        if (! $record->saida) return;

        $workedSeconds = $this->workedSeconds($record);
        $extraHours = max(0, $workedSeconds / 3600 - 8);

        $employee = $record->employee;
        if (! $employee) return;

        if ($extraHours > 2) {
            CLTAlert::updateOrCreate(
                ['employee_id' => $employee->id, 'message' => "Limite diário excedido em {$record->date}"],
                [
                    'employee_name' => $employee->name,
                    'level' => 'danger',
                ]
            );
        } elseif ($extraHours > 1.5) {
            CLTAlert::updateOrCreate(
                ['employee_id' => $employee->id, 'message' => "Próximo do limite diário em {$record->date}"],
                [
                    'employee_name' => $employee->name,
                    'level' => 'warning',
                ]
            );
        }

        if ($record->inicio_almoco && $record->retorno_almoco && $workedSeconds > 21600) {
            $lunchSeconds = strtotime($record->retorno_almoco) - strtotime($record->inicio_almoco);
            if ($lunchSeconds < 3600) {
                CLTAlert::updateOrCreate(
                    ['employee_id' => $employee->id, 'message' => "Intervalo insuficiente em {$record->date}"],
                    [
                        'employee_name' => $employee->name,
                        'level' => 'danger',
                    ]
                );
            }
        }
    }

    public function calculateHours(TimeRecord $record): void
    {
        if (! $record->entrada || ! $record->saida) return;

        $workedSeconds = $this->workedSeconds($record);
        $extraHours = max(0, $workedSeconds / 3600 - 8);

        $entradaTime = strtotime($record->entrada);
        $expectedTime = strtotime('08:00:00');
        $delaySeconds = max(0, $entradaTime - $expectedTime - 300);

        $status = match (true) {
            $extraHours > 0 => 'extra',
            $delaySeconds > 0 => 'atraso',
            default => 'normal',
        };

        $record->update([
            'extra_hours' => round($extraHours, 2),
            'delay_minutes' => (int) ($delaySeconds / 60),
            'status' => $status,
        ]);
    }

    private function workedSeconds(TimeRecord $record): int
    {
        if (! $record->entrada || ! $record->saida) return 0;

        $total = strtotime($record->saida) - strtotime($record->entrada);
        $lunch = ($record->inicio_almoco && $record->retorno_almoco)
            ? strtotime($record->retorno_almoco) - strtotime($record->inicio_almoco)
            : 0;

        return max(0, $total - $lunch);
    }
}
