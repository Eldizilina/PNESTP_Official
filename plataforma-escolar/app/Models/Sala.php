<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sala extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'salas';

    protected $fillable = [
        'nome',
        'descricao',
        'criador_id',
        'codigo_acesso',  // código único para entrar na sala
        'ativa',
    ];

    protected $casts = [
        'ativa' => 'boolean',
    ];

    // ─────────────────────────────────────────────
    // Relacionamentos
    // ─────────────────────────────────────────────

    public function criador()
    {
        return $this->belongsTo(User::class, 'criador_id');
    }

    public function membros()
    {
        return $this->belongsToMany(User::class, 'sala_user')
            ->withPivot('papel', 'aceite_em')
            ->withTimestamps();
    }

    public function professores()
    {
        return $this->belongsToMany(User::class, 'sala_user')
            ->whereIn('sala_user.papel', ['professor', 'professor_diretor'])
            ->withPivot('papel', 'aceite_em')
            ->withTimestamps();
    }

    public function alunos()
    {
        return $this->belongsToMany(User::class, 'sala_user')
            ->where('sala_user.papel', 'aluno')
            ->withPivot('papel', 'aceite_em')
            ->withTimestamps();
    }
    public function convites()
    {
        return $this->hasMany(Convite::class);
    }

    public function materiais()
    {
        return $this->hasMany(Material::class);
    }

    public function exercicios()
    {
        return $this->hasMany(Exercicio::class);
    }

    // ─────────────────────────────────────────────
    // Accessors / Scopes
    // ─────────────────────────────────────────────

    public function scopeAtivas($query)
    {
        return $query->where('ativa', true);
    }

    /** Verifica se um utilizador é membro desta sala */
    public function temMembro(int $userId): bool
    {
        return $this->membros()->where('users.id', $userId)->exists();
    }
}
