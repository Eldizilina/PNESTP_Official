<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('materiais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sala_id')->constrained()->cascadeOnDelete();
            $table->foreignId('autor_id')->constrained('users')->cascadeOnDelete();
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->enum('tipo', ['pdf', 'imagem', 'video', 'link', 'outro'])->default('outro');
            $table->string('caminho_ficheiro')->nullable();
            $table->string('url_externa')->nullable();
            $table->unsignedBigInteger('tamanho_bytes')->nullable();
            $table->string('nome_original')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('sala_id');
        });
    }

    public function down(): void { Schema::dropIfExists('materiais'); }
};
