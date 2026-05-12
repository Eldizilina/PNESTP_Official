<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Questao extends Model
{
    protected $table = 'questoes';
    
    use HasFactory;

    const TIPO_MULTIPLA_ESCOLHA = 'multipla_escolha';
    const TIPO_VERDADEIRO_FALSO = 'verdadeiro_falso';
    const TIPO_DISSERTATIVA     = 'dissertativa';
    const TIPO_PREENCHIMENTO    = 'preenchimento';

    protected $fillable = [
        'exercicio_id',
        'enunciado',
        'tipo',
        'opcoes',          // JSON array de opções (para múltipla escolha)
        'resposta_correta', // Resposta(s) correcta(s)
        'pontuacao',       // pontuação desta questão
        'ordem',
        'explicacao',      // explicação da resposta (exibida após correcção)
    ];

    protected $casts = [
        'opcoes'           => 'array',
        'resposta_correta' => 'array',
    ];

    // ─────────────────────────────────────────────
    // Relacionamentos
    // ─────────────────────────────────────────────

    public function exercicio()
    {
        return $this->belongsTo(Exercicio::class);
    }

    public function respostas()
    {
        return $this->hasMany(RespostaQuestao::class);
    }
}
