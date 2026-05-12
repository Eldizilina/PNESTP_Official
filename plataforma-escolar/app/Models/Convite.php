<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Convite extends Model
{
    use HasFactory;
      protected $table = 'convites';

    const STATUS_PENDENTE  = 'pendente';
    const STATUS_ACEITE    = 'aceite';
    const STATUS_RECUSADO  = 'recusado';

    protected $fillable = [
        'sala_id',
        'convidador_id',
        'convidado_id',
        'email_convidado',  // para convites por e-mail quando o user ainda não existe
        'papel',            // papel que o convidado terá: aluno | professor
        'status',
        'token',
        'expira_em',
    ];

    protected $casts = [
        'expira_em' => 'datetime',
    ];

    // ─────────────────────────────────────────────
    // Relacionamentos
    // ─────────────────────────────────────────────

    public function sala()
    {
        return $this->belongsTo(Sala::class);
    }

    public function convidador()
    {
        return $this->belongsTo(User::class, 'convidador_id');
    }

    public function convidado()
    {
        return $this->belongsTo(User::class, 'convidado_id');
    }

    // ─────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────

    public function scopePendentes($query)
    {
        return $query->where('status', self::STATUS_PENDENTE);
    }

    public function scopeValidos($query)
    {
        return $query->where('status', self::STATUS_PENDENTE)
                     ->where(function ($q) {
                         $q->whereNull('expira_em')
                           ->orWhere('expira_em', '>', now());
                     });
    }
}
