<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Exercicio extends Model
{
    use HasFactory, SoftDeletes;
 protected $table = 'exercicios';
    const TIPO_UPLOAD     = 'upload';     // aluno envia ficheiro
    const TIPO_PLATAFORMA = 'plataforma'; // aluno responde na plataforma (quiz/formulário)

    protected $fillable = [
        'sala_id',
        'autor_id',
        'titulo',
        'descricao',
        'tipo',             // upload | plataforma
        'prazo',            // data limite de entrega
        'pontuacao_maxima', // pontuação total possível
        'publicado',        // true = visível aos alunos
        'ficheiro_enunciado', // path do enunciado (PDF, etc.)
    ];

    protected $casts = [
        'prazo'      => 'datetime',
        'publicado'  => 'boolean',
        'questoes'   => 'array',
    ];

    // ─────────────────────────────────────────────
    // Relacionamentos
    // ─────────────────────────────────────────────

    public function sala()
    {
        return $this->belongsTo(Sala::class);
    }

    public function autor()
    {
        return $this->belongsTo(User::class, 'autor_id');
    }

    public function questoes()
    {
        return $this->hasMany(Questao::class)->orderBy('ordem');
    }

    public function submissoes()
    {
        return $this->hasMany(Submissao::class);
    }

    // ─────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────

    public function scopePublicados($query)
    {
        return $query->where('publicado', true);
    }

    public function scopeAbertos($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('prazo')->orWhere('prazo', '>', now());
        });
    }
}
