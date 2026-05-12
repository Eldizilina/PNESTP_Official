<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Perfis disponíveis na plataforma.
     * - aluno: estudante
     * - professor: docente
     * - professor_diretor: diretor de turma com permissões de gestão
     */
    const ROLE_ALUNO              = 'aluno';
    const ROLE_PROFESSOR          = 'professor';
    const ROLE_PROFESSOR_DIRETOR  = 'professor_diretor';

    protected $fillable = [
        'name',
        'email',
        'password',
        'perfil',       // aluno | professor | professor_diretor
        'escola',       // nome da escola (obrigatório para alunos)
        'bio',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    // ─────────────────────────────────────────────
    // Helpers de perfil
    // ─────────────────────────────────────────────

    public function isAluno(): bool
    {
        return $this->perfil === self::ROLE_ALUNO;
    }

    public function isProfessor(): bool
    {
        return in_array($this->perfil, [
            self::ROLE_PROFESSOR,
            self::ROLE_PROFESSOR_DIRETOR,
        ]);
    }

    public function isProfessorDiretor(): bool
    {
        return $this->perfil === self::ROLE_PROFESSOR_DIRETOR;
    }

    // ─────────────────────────────────────────────
    // Relacionamentos
    // ─────────────────────────────────────────────

    /** Salas criadas por este utilizador (apenas professor_diretor) */
    public function salasComoDirector()
    {
        return $this->hasMany(Sala::class, 'criador_id');
    }

    /** Salas às quais este utilizador pertence (via pivot) */
    public function salas()
    {
        return $this->belongsToMany(Sala::class, 'sala_user')
                    ->withPivot('papel', 'aceite_em')
                    ->withTimestamps();
    }

    /** Convites recebidos */
    public function convites()
    {
        return $this->hasMany(Convite::class, 'convidado_id');
    }

    /** Materiais carregados por este utilizador */
    public function materiais()
    {
        return $this->hasMany(Material::class, 'autor_id');
    }

    /** Exercícios criados */
    public function exercicios()
    {
        return $this->hasMany(Exercicio::class, 'autor_id');
    }

    /** Submissões enviadas por este aluno */
    public function submissoes()
    {
        return $this->hasMany(Submissao::class, 'aluno_id');
    }

    /** Mensagens enviadas */
    public function mensagensEnviadas()
    {
        return $this->hasMany(Mensagem::class, 'remetente_id');
    }

    /** Mensagens recebidas */
    public function mensagensRecebidas()
    {
        return $this->hasMany(Mensagem::class, 'destinatario_id');
    }
}
