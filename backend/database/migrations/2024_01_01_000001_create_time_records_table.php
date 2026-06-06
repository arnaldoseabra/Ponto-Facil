<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('time_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->time('entrada')->nullable();
            $table->time('inicio_almoco')->nullable();
            $table->time('retorno_almoco')->nullable();
            $table->time('saida')->nullable();
            $table->decimal('gps_lat', 10, 8)->nullable();
            $table->decimal('gps_lng', 11, 8)->nullable();
            $table->string('location_name')->nullable();
            $table->enum('status', ['normal', 'extra', 'atraso', 'falta'])->default('normal');
            $table->decimal('extra_hours', 5, 2)->default(0);
            $table->unsignedInteger('delay_minutes')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['employee_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('time_records');
    }
};
