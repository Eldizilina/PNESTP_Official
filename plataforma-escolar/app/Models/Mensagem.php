<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Mensagem extends Model
{
    use HasFactory;
 protected $table = 'mensagens';
    protected $fillable = [
        'remetente_id',
        'destinatario_id',
        'sala_id',         // null = mensagem directa; preenchido = mensagem na sala
        'assunto',
        'corpo',
        'lida',
        'lida_em',
        'anexo_path',      // ficheiro anexado opcional
        'anexo_nome',
    ];

    protected $casts = [
        'lida'   => 'boolean',
        'lida_em'=> 'datetime',
    ];

    protected $appends = ['url_anexo'];

    // ─────────────────────────────────────────────
    // Relacionamentos
    // ─────────────────────────────────────────────

    public function remetente()
    {
        return $this->belongsTo(User::class, 'remetente_id');
    }

    public function destinatario()
    {
        return $this->belongsTo(User::class, 'destinatario_id');
    }

    public function sala()
    {
        return $this->belongsTo(Sala::class);
    }

    // ─────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────

    public function getUrlAnexoAttribute(): ?string
    {
        if ($this->anexo_path) {
            return Storage::disk('public')->url($this->anexo_path);
        }
        return null;
    }

    // ─────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────

    public function scopeNaoLidas($query)
    {
        return $query->where('lida', false);
    }
}
