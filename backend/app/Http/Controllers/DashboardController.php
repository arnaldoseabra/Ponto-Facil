<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\TimeRecord;
use App\Models\CLTAlert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $month = now()->month;
        $year  = now()->year;

        $employeeIds = Employee::where('company_id', $companyId)->pluck('id');

        $monthRecords = TimeRecord::whereIn('employee_id', $employeeIds)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get();

        return response()->json([
            'kpis' => [
                'total_employees' => Employee::where('company_id', $companyId)->where('profile', 'employee')->where('status', true)->count(),
                'total_extra_hours' => $monthRecords->sum('extra_hours'),
                'total_delays'      => $monthRecords->where('status', 'atraso')->count(),
                'total_absences'    => $monthRecords->where('status', 'falta')->count(),
            ],
            'recent_records' => TimeRecord::with('employee')
                ->whereIn('employee_id', $employeeIds)
                ->orderByDesc('date')
                ->limit(8)
                ->get(),
            'clt_alerts' => CLTAlert::whereIn('employee_id', $employeeIds)
                ->orderByDesc('created_at')
                ->limit(10)
                ->get(),
            'chart_data' => $this->getChartData($employeeIds->toArray(), $month, $year),
        ]);
    }

    public function rankings(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $employees = Employee::where('company_id', $companyId)->where('profile', 'employee')->where('status', true)->get();

        $data = $employees->map(function ($emp) {
            $records = $emp->timeRecords()->get();
            return [
                'employee'     => $emp,
                'extra_hours'  => round($records->sum('extra_hours'), 1),
                'delays'       => $records->where('status', 'atraso')->count(),
                'delay_minutes'=> $records->sum('delay_minutes'),
                'absences'     => $records->where('status', 'falta')->count(),
            ];
        });

        return response()->json([
            'extras'   => $data->sortByDesc('extra_hours')->values(),
            'delays'   => $data->sortByDesc('delays')->values(),
            'absences' => $data->sortByDesc('absences')->values(),
        ]);
    }

    private function getChartData(array $employeeIds, int $month, int $year): array
    {
        $days = [];
        $daysInMonth = Carbon::createFromDate($year, $month)->daysInMonth;

        for ($d = 1; $d <= min($daysInMonth, 7); $d++) {
            $date = sprintf('%04d-%02d-%02d', $year, $month, $d);
            $dayRecords = TimeRecord::whereIn('employee_id', $employeeIds)->where('date', $date)->get();
            $days[] = [
                'day'    => "Dia {$d}",
                'horas'  => round($dayRecords->sum(fn ($r) => $this->workedHours($r)), 1),
                'extras' => round($dayRecords->sum('extra_hours'), 1),
            ];
        }

        return $days;
    }

    private function workedHours(TimeRecord $r): float
    {
        if (! $r->entrada || ! $r->saida) return 0;
        $total = strtotime($r->saida) - strtotime($r->entrada);
        $lunch = ($r->inicio_almoco && $r->retorno_almoco)
            ? strtotime($r->retorno_almoco) - strtotime($r->inicio_almoco)
            : 0;
        return max(0, ($total - $lunch)) / 3600;
    }
}
