<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('convenios', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category', 100);
            $table->string('discount', 100);
            $table->text('description');
            $table->string('phone', 20)->nullable();
            $table->string('website')->nullable();
            $table->string('address')->nullable();
            $table->string('code', 50)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('convenios');
    }
};
