<?php

namespace Database\Seeders;

use App\Models\Convite;
use App\Models\Exercicio;
use App\Models\Material;
use App\Models\Mensagem;
use App\Models\Questao;
use App\Models\Sala;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Criar utilizadores de demonstração ──────────────────────

        $diretor = User::create([
            'name'     => 'Prof. António Diretor',
            'email'    => 'diretor@escola.com',
            'password' => Hash::make('Password1'),
            'perfil'   => 'professor_diretor',
        ]);

        $professor1 = User::create([
            'name'     => 'Prof. Maria Silva',
            'email'    => 'professor@escola.com',
            'password' => Hash::make('Password1'),
            'perfil'   => 'professor',
        ]);

        $professor2 = User::create([
            'name'     => 'Prof. Carlos Santos',
            'email'    => 'professor2@escola.com',
            'password' => Hash::make('Password1'),
            'perfil'   => 'professor',
        ]);

        $aluno1 = User::create([
            'name'     => 'Ana Aluna',
            'email'    => 'aluno@escola.com',
            'password' => Hash::make('Password1'),
            'perfil'   => 'aluno',
            'escola'   => 'Escola Secundária Nacional',
        ]);

        $aluno2 = User::create([
            'name'     => 'Bruno Estudante',
            'email'    => 'aluno2@escola.com',
            'password' => Hash::make('Password1'),
            'perfil'   => 'aluno',
            'escola'   => 'Escola Secundária Nacional',
        ]);

        // ── Criar sala de aula ───────────────────────────────────────

        $sala = Sala::create([
            'nome'          => 'Matemática 10ª Classe',
            'descricao'     => 'Sala de aula de Matemática para a 10ª classe.',
            'criador_id'    => $diretor->id,
            'codigo_acesso' => 'MAT10A',
            'ativa'         => true,
        ]);

        // Adicionar membros à sala
        $sala->membros()->attach($diretor->id, ['papel' => 'professor_diretor', 'aceite_em' => now()]);
        $sala->membros()->attach($professor1->id, ['papel' => 'professor', 'aceite_em' => now()]);
        $sala->membros()->attach($professor2->id, ['papel' => 'professor', 'aceite_em' => now()]);
        $sala->membros()->attach($aluno1->id, ['papel' => 'aluno', 'aceite_em' => now()]);
        $sala->membros()->attach($aluno2->id, ['papel' => 'aluno', 'aceite_em' => now()]);

        // Segunda sala
        $sala2 = Sala::create([
            'nome'          => 'Física 11ª Classe',
            'descricao'     => 'Sala de Física para a 11ª classe.',
            'criador_id'    => $diretor->id,
            'codigo_acesso' => 'FIS11B',
            'ativa'         => true,
        ]);

        $sala2->membros()->attach($diretor->id, ['papel' => 'professor_diretor', 'aceite_em' => now()]);
        $sala2->membros()->attach($professor2->id, ['papel' => 'professor', 'aceite_em' => now()]);
        $sala2->membros()->attach($aluno1->id, ['papel' => 'aluno', 'aceite_em' => now()]);

        // ── Convite pendente ─────────────────────────────────────────

        Convite::create([
            'sala_id'         => $sala->id,
            'convidador_id'   => $diretor->id,
            'email_convidado' => 'novo.aluno@email.com',
            'papel'           => 'aluno',
            'status'          => 'pendente',
            'token'           => Str::uuid(),
            'expira_em'       => now()->addDays(7),
        ]);

        // ── Material didáctico ───────────────────────────────────────

        Material::create([
            'sala_id'     => $sala->id,
            'autor_id'    => $professor1->id,
            'titulo'      => 'Introdução às Equações do 2º Grau',
            'descricao'   => 'Apresentação em PDF sobre equações do segundo grau.',
            'tipo'        => 'link',
            'url_externa' => 'https://example.com/equacoes-2grau.pdf',
        ]);

        Material::create([
            'sala_id'     => $sala->id,
            'autor_id'    => $professor1->id,
            'titulo'      => 'Vídeo Aula — Funções Quadráticas',
            'descricao'   => 'Vídeo explicativo sobre funções quadráticas.',
            'tipo'        => 'video',
            'url_externa' => 'https://youtube.com/watch?v=exemplo',
        ]);

        // ── Exercício tipo plataforma (quiz) ─────────────────────────

        $exercicioQuiz = Exercicio::create([
            'sala_id'          => $sala->id,
            'autor_id'         => $professor1->id,
            'titulo'           => 'Quiz — Equações do 2º Grau',
            'descricao'        => 'Responda às questões sobre equações do segundo grau.',
            'tipo'             => 'plataforma',
            'prazo'            => now()->addDays(14),
            'pontuacao_maxima' => 10,
            'publicado'        => true,
        ]);

        Questao::create([
            'exercicio_id'    => $exercicioQuiz->id,
            'enunciado'       => 'Qual é a fórmula geral para resolver equações do 2º grau?',
            'tipo'            => 'multipla_escolha',
            'opcoes'          => ['x = -b ± √(b²-4ac) / 2a', 'x = b ± √(b²+4ac) / 2a', 'x = -b / 2a', 'x = √(b²-4ac)'],
            'resposta_correta'=> ['x = -b ± √(b²-4ac) / 2a'],
            'pontuacao'       => 4,
            'ordem'           => 1,
            'explicacao'      => 'A fórmula de Bhaskara é x = (-b ± √(b²-4ac)) / 2a.',
        ]);

        Questao::create([
            'exercicio_id'    => $exercicioQuiz->id,
            'enunciado'       => 'O discriminante (Δ) de uma equação do 2º grau é dado por Δ = b² - 4ac. Quando Δ < 0, a equação possui duas raízes reais distintas.',
            'tipo'            => 'verdadeiro_falso',
            'opcoes'          => ['Verdadeiro', 'Falso'],
            'resposta_correta'=> ['Falso'],
            'pontuacao'       => 3,
            'ordem'           => 2,
            'explicacao'      => 'Quando Δ < 0, a equação não possui raízes reais (raízes complexas).',
        ]);

        Questao::create([
            'exercicio_id'    => $exercicioQuiz->id,
            'enunciado'       => 'Explique por palavras suas o que representa o vértice de uma parábola.',
            'tipo'            => 'dissertativa',
            'pontuacao'       => 3,
            'ordem'           => 3,
        ]);

        // ── Exercício tipo upload ────────────────────────────────────

        Exercicio::create([
            'sala_id'          => $sala->id,
            'autor_id'         => $professor1->id,
            'titulo'           => 'Trabalho Prático — Sistemas de Equações',
            'descricao'        => 'Resolva os exercícios do enunciado e envie a resolução em PDF.',
            'tipo'             => 'upload',
            'prazo'            => now()->addDays(7),
            'pontuacao_maxima' => 20,
            'publicado'        => true,
        ]);

        // ── Mensagem na sala ─────────────────────────────────────────

        Mensagem::create([
            'remetente_id'    => $professor1->id,
            'destinatario_id' => null,
            'sala_id'         => $sala->id,
            'assunto'         => 'Bem-vindos à Sala de Matemática!',
            'corpo'           => 'Olá a todos! Esta é a nossa sala virtual de Matemática. Aqui irão encontrar todos os materiais e exercícios. Qualquer dúvida, não hesitem em contactar-me.',
            'lida'            => false,
        ]);

        // ── Mensagem directa ─────────────────────────────────────────

        Mensagem::create([
            'remetente_id'    => $professor1->id,
            'destinatario_id' => $aluno1->id,
            'sala_id'         => null,
            'assunto'         => 'Dúvida sobre o exercício',
            'corpo'           => 'Olá Ana, vi que já submeteste o exercício. Bom trabalho! Vou analisar e dar feedback em breve.',
            'lida'            => false,
        ]);

        $this->command->info('✅ Base de dados populada com dados de demonstração.');
        $this->command->info('');
        $this->command->info('Credenciais de acesso:');
        $this->command->info('  Professor Diretor : diretor@escola.com   / Password1');
        $this->command->info('  Professor         : professor@escola.com / Password1');
        $this->command->info('  Aluno             : aluno@escola.com     / Password1');
    }
}
