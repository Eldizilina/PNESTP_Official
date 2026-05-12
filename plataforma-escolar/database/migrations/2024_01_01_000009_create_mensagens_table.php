<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('mensagens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('remetente_id')->constrained('users')->cascadeOnDelete();
            // null = mensagem de sala (broadcast para todos os membros)
            $table->foreignId('destinatario_id')->nullable()->constrained('users')->nullOnDelete();
            // null = mensagem directa; preenchido = mensagem de sala
            $table->foreignId('sala_id')->nullable()->constrained()->nullOnDelete();
            $table->string('assunto');
            $table->text('corpo');
            $table->boolean('lida')->default(false);
            $table->timestamp('lida_em')->nullable();
            $table->string('anexo_path')->nullable();
            $table->string('anexo_nome')->nullable();
            $table->timestamps();

            $table->index(['destinatario_id', 'lida']);
            $table->index('sala_id');
        });
    }

    public function down(): void { Schema::dropIfExists('mensagens'); }
};
