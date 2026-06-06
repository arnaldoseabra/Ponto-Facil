<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\TimeRecordController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ConvenioController;
use App\Http\Controllers\CLTAlertController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Funcionários
    Route::apiResource('employees', EmployeeController::class);
    Route::patch('/employees/{employee}/toggle-status', [EmployeeController::class, 'toggleStatus']);

    // Registros de ponto
    Route::apiResource('time-records', TimeRecordController::class);
    Route::get('/time-records/employee/{employee}', [TimeRecordController::class, 'byEmployee']);
    Route::post('/time-records/punch', [TimeRecordController::class, 'punch']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/rankings', [DashboardController::class, 'rankings']);

    // Notificações e WhatsApp
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/send', [NotificationController::class, 'send']);

    // Alertas CLT
    Route::get('/clt-alerts', [CLTAlertController::class, 'index']);
    Route::delete('/clt-alerts/{alert}', [CLTAlertController::class, 'destroy']);

    // Convênios
    Route::apiResource('convenios', ConvenioController::class);
});
