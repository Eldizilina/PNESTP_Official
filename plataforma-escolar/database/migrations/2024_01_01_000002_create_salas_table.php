<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('salas', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->foreignId('criador_id')->constrained('users')->cascadeOnDelete();
            $table->string('codigo_acesso', 10)->unique();
            $table->boolean('ativa')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // Tabela pivot sala <-> utilizador
        Schema::create('sala_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sala_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('papel', ['aluno', 'professor', 'professor_diretor'])->default('aluno');
            $table->timestamp('aceite_em')->nullable();
            $table->timestamps();

            $table->unique(['sala_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sala_user');
        Schema::dropIfExists('salas');
    }
};
