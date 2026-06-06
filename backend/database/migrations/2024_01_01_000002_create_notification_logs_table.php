<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->nullable()->constrained()->onDelete('set null');
            $table->string('employee_name');
            $table->string('phone', 20);
            $table->text('message');
            $table->enum('type', ['entrada', 'almoco', 'retorno', 'saida', 'alerta'])->default('alerta');
            $table->enum('status', ['enviado', 'lido', 'falha'])->default('enviado');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
