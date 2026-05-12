<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('convites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sala_id')->constrained()->cascadeOnDelete();
            $table->foreignId('convidador_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('convidado_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('email_convidado');
            $table->enum('papel', ['aluno', 'professor'])->default('aluno');
            $table->enum('status', ['pendente', 'aceite', 'recusado'])->default('pendente');
            $table->uuid('token')->unique();
            $table->timestamp('expira_em')->nullable();
            $table->timestamps();

            $table->index(['email_convidado', 'status']);
        });
    }

    public function down(): void { Schema::dropIfExists('convites'); }
};
