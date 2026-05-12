<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('questoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exercicio_id')->constrained('exercicios')->cascadeOnDelete();
            $table->text('enunciado');
            $table->enum('tipo', [
                'multipla_escolha',
                'verdadeiro_falso',
                'dissertativa',
                'preenchimento',
            ])->default('multipla_escolha');
            $table->json('opcoes')->nullable();
            $table->json('resposta_correta')->nullable();
            $table->decimal('pontuacao', 8, 2)->default(1);
            $table->unsignedSmallInteger('ordem')->default(0);
            $table->text('explicacao')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questoes');
    }
};