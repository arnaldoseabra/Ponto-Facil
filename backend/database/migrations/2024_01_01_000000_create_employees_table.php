<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('cpf', 20)->nullable()->unique();
            $table->string('rg', 20)->nullable();
            $table->date('birth_date')->nullable();
            $table->string('email')->unique();
            $table->string('phone', 20)->nullable();
            $table->string('password');
            $table->string('role', 100);
            $table->string('department', 100);
            $table->decimal('salary', 10, 2)->default(0);
            $table->unsignedSmallInteger('weekly_hours')->default(40);
            $table->date('admission_date')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone', 20)->nullable();
            $table->decimal('gps_lat', 10, 8)->nullable();
            $table->decimal('gps_lng', 11, 8)->nullable();
            $table->unsignedInteger('gps_radius')->default(500);
            $table->boolean('status')->default(true);
            $table->string('avatar')->nullable();
            $table->enum('profile', ['employee', 'admin'])->default('employee');
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
