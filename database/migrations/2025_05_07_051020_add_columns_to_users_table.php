<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('connectware_id')->unique();
            $table->string('access_token');
            $table->string('refresh_token');
            $table->json('meta');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('connectware_id');
            $table->dropColumn('access_token');
            $table->dropColumn('refresh_token');
            $table->dropColumn('meta');
        });
    }
};
