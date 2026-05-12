<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('perfil', ['aluno', 'professor', 'professor_diretor'])
                  ->default('aluno')
                  ->after('email');
            $table->string('escola')->nullable()->after('perfil');
            $table->text('bio')->nullable()->after('escola');
            $table->string('avatar')->nullable()->after('bio');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['perfil', 'escola', 'bio', 'avatar']);
        });
    }
};