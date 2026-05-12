<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('respostas_questao', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submissao_id')->constrained('submissoes')->cascadeOnDelete();
            $table->foreignId('questao_id')->constrained('questoes')->cascadeOnDelete();
            $table->json('resposta')->nullable();
            $table->boolean('correta')->nullable();
            $table->decimal('pontuacao_obtida', 8, 2)->default(0);
            $table->timestamps();

            $table->unique(['submissao_id', 'questao_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('respostas_questao');
    }
};