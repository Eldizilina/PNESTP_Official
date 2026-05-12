<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RespostaQuestao extends Model
{
    use HasFactory;

    protected $table = 'respostas_questao';

    protected $fillable = [
        'submissao_id',
        'questao_id',
        'resposta',      // resposta do aluno (JSON ou texto)
        'correta',       // calculado automaticamente para questões objectivas
        'pontuacao_obtida',
    ];

    protected $casts = [
        'resposta'         => 'array',
        'correta'          => 'boolean',
        'pontuacao_obtida' => 'float',
    ];

    // ─────────────────────────────────────────────
    // Relacionamentos
    // ─────────────────────────────────────────────

    public function submissao()
    {
        return $this->belongsTo(Submissao::class);
    }

    public function questao()
    {
        return $this->belongsTo(Questao::class);
    }
}
