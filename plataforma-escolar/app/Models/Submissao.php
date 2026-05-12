<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Submissao extends Model
{
     protected $table = 'submissoes';
    use HasFactory;

    const STATUS_PENDENTE   = 'pendente';   // aguarda correcção
    const STATUS_CORRIGIDA  = 'corrigida';  // professor já avaliou
    const STATUS_DEVOLVIDA  = 'devolvida';  // feedback enviado ao aluno

    const METODO_UPLOAD     = 'upload';
    const METODO_PLATAFORMA = 'plataforma';

    protected $fillable = [
        'exercicio_id',
        'aluno_id',
        'metodo',           // upload | plataforma
        'ficheiro_path',    // path do ficheiro enviado (upload)
        'status',
        'nota',             // nota atribuída pelo professor
        'feedback',         // comentário do professor
        'corrigido_por',    // id do professor que corrigiu
        'corrigido_em',
        'submetido_em',
    ];

    protected $casts = [
        'nota'         => 'float',
        'corrigido_em' => 'datetime',
        'submetido_em' => 'datetime',
    ];

    protected $appends = ['url_ficheiro'];

    // ─────────────────────────────────────────────
    // Relacionamentos
    // ─────────────────────────────────────────────

    public function exercicio()
    {
        return $this->belongsTo(Exercicio::class);
    }

    public function aluno()
    {
        return $this->belongsTo(User::class, 'aluno_id');
    }

    public function professor()
    {
        return $this->belongsTo(User::class, 'corrigido_por');
    }

    /** Respostas às questões (submissões na plataforma) */
    public function respostas()
    {
        return $this->hasMany(RespostaQuestao::class);
    }

    // ─────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────

    public function getUrlFicheiroAttribute(): ?string
    {
        if ($this->ficheiro_path) {
            return Storage::disk('public')->url($this->ficheiro_path);
        }
        return null;
    }
}
