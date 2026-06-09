<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });

        Schema::table('convenios', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });

        Schema::table('notification_logs', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });

        Schema::table('clt_alerts', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('employees', fn (Blueprint $t) => $t->dropForeign(['company_id']));
        Schema::table('convenios', fn (Blueprint $t) => $t->dropForeign(['company_id']));
        Schema::table('notification_logs', fn (Blueprint $t) => $t->dropForeign(['company_id']));
        Schema::table('clt_alerts', fn (Blueprint $t) => $t->dropForeign(['company_id']));
    }
};
