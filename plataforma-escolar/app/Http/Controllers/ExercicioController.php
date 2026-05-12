<?php

namespace App\Http\Controllers;

use App\Models\Exercicio;
use App\Models\Questao;
use App\Models\Sala;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ExercicioController extends Controller
{
    /**
     * Listar exercícios de uma sala.
     */
    public function index(Request $request, Sala $sala)
    {
        $user = $request->user();

        if (! $sala->temMembro($user->id)) {
            return response()->json(['message' => 'Sem acesso a esta sala.'], 403);
        }

        $query = $sala->exercicios()
                      ->with(['autor:id,name', 'questoes:id,exercicio_id,enunciado,tipo,pontuacao,ordem'])
                      ->withCount('submissoes');

        // Alunos só vêem exercícios publicados
        if ($user->isAluno()) {
            $query->publicados();
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Criar exercício (apenas professores da sala).
     */
    public function store(Request $request, Sala $sala)
    {
        $user = $request->user();

        if (! $user->isProfessor() || ! $sala->temMembro($user->id)) {
            return response()->json([
                'message' => 'Apenas professores da sala podem criar exercícios.'
            ], 403);
        }

        $data = $request->validate([
            'titulo'            => ['required', 'string', 'max:255'],
            'descricao'         => ['nullable', 'string', 'max:3000'],
            'tipo'              => ['required', 'in:upload,plataforma'],
            'prazo'             => ['nullable', 'date', 'after:now'],
            'pontuacao_maxima'  => ['nullable', 'numeric', 'min:0', 'max:1000'],
            'publicado'         => ['sometimes', 'boolean'],
            'ficheiro_enunciado'=> ['nullable', 'file', 'max:10240'],
            // Questões (para tipo plataforma)
            'questoes'          => ['required_if:tipo,plataforma', 'array', 'min:1'],
            'questoes.*.enunciado'      => ['required', 'string'],
            'questoes.*.tipo'           => ['required', 'in:multipla_escolha,verdadeiro_falso,dissertativa,preenchimento'],
            'questoes.*.opcoes'         => ['nullable', 'array'],
            'questoes.*.resposta_correta'=> ['nullable'],
            'questoes.*.pontuacao'      => ['required', 'numeric', 'min:0'],
            'questoes.*.explicacao'     => ['nullable', 'string'],
        ]);

        $exercicio = DB::transaction(function () use ($request, $sala, $user, $data) {
            $ficheiroCaminho = null;
            if ($request->hasFile('ficheiro_enunciado')) {
                $ficheiroCaminho = $request->file('ficheiro_enunciado')
                    ->store('exercicios/' . $sala->id, 'public');
            }

            $exercicio = Exercicio::create([
                'sala_id'            => $sala->id,
                'autor_id'           => $user->id,
                'titulo'             => $data['titulo'],
                'descricao'          => $data['descricao'] ?? null,
                'tipo'               => $data['tipo'],
                'prazo'              => $data['prazo'] ?? null,
                'pontuacao_maxima'   => $data['pontuacao_maxima'] ?? null,
                'publicado'          => $data['publicado'] ?? false,
                'ficheiro_enunciado' => $ficheiroCaminho,
            ]);

            // Criar questões se for do tipo plataforma
            if ($data['tipo'] === 'plataforma' && ! empty($data['questoes'])) {
                foreach ($data['questoes'] as $index => $q) {
                    $exercicio->questoes()->create([
                        'enunciado'       => $q['enunciado'],
                        'tipo'            => $q['tipo'],
                        'opcoes'          => $q['opcoes'] ?? null,
                        'resposta_correta'=> isset($q['resposta_correta'])
                                              ? (array) $q['resposta_correta']
                                              : null,
                        'pontuacao'       => $q['pontuacao'],
                        'ordem'           => $index + 1,
                        'explicacao'      => $q['explicacao'] ?? null,
                    ]);
                }

                // Calcular pontuação máxima automaticamente se não foi definida
                if (empty($data['pontuacao_maxima'])) {
                    $total = collect($data['questoes'])->sum('pontuacao');
                    $exercicio->update(['pontuacao_maxima' => $total]);
                }
            }

            return $exercicio;
        });

        return response()->json([
            'message'   => 'Exercício criado com sucesso.',
            'exercicio' => $exercicio->load(['autor:id,name', 'questoes']),
        ], 201);
    }

    /**
     * Ver detalhes de um exercício.
     */
    public function show(Request $request, Sala $sala, Exercicio $exercicio)
    {
        $user = $request->user();

        if (! $sala->temMembro($user->id) || $exercicio->sala_id !== $sala->id) {
            return response()->json(['message' => 'Sem acesso.'], 403);
        }

        if ($user->isAluno() && ! $exercicio->publicado) {
            return response()->json(['message' => 'Exercício não disponível.'], 403);
        }

        $exercicio->load(['autor:id,name', 'questoes' => fn($q) => $q->orderBy('ordem')]);

        // Para alunos, omitir as respostas corretas das questões objectivas
        if ($user->isAluno()) {
            $exercicio->questoes->transform(function ($q) {
                if ($q->tipo !== 'dissertativa') {
                    unset($q->resposta_correta);
                }
                unset($q->explicacao);
                return $q;
            });
        }

        // Verificar se o aluno já submeteu
        $submissao = null;
        if ($user->isAluno()) {
            $submissao = $exercicio->submissoes()
                                   ->where('aluno_id', $user->id)
                                   ->first();
        }

        return response()->json([
            'exercicio' => $exercicio,
            'submissao' => $submissao,
        ]);
    }

    /**
     * Actualizar exercício.
     */
    public function update(Request $request, Sala $sala, Exercicio $exercicio)
    {
        $user = $request->user();

        if ($exercicio->autor_id !== $user->id && ! $user->isProfessorDiretor()) {
            return response()->json(['message' => 'Sem permissão.'], 403);
        }

        $data = $request->validate([
            'titulo'           => ['sometimes', 'string', 'max:255'],
            'descricao'        => ['nullable', 'string', 'max:3000'],
            'prazo'            => ['nullable', 'date'],
            'pontuacao_maxima' => ['nullable', 'numeric', 'min:0'],
            'publicado'        => ['sometimes', 'boolean'],
        ]);

        $exercicio->update($data);

        return response()->json([
            'message'   => 'Exercício actualizado.',
            'exercicio' => $exercicio->fresh()->load(['autor:id,name', 'questoes']),
        ]);
    }

    /**
     * Publicar / despublicar exercício.
     */
    public function publicar(Request $request, Sala $sala, Exercicio $exercicio)
    {
        $user = $request->user();

        if ($exercicio->autor_id !== $user->id && ! $user->isProfessorDiretor()) {
            return response()->json(['message' => 'Sem permissão.'], 403);
        }

        $exercicio->update(['publicado' => ! $exercicio->publicado]);

        return response()->json([
            'message'   => $exercicio->publicado ? 'Exercício publicado.' : 'Exercício ocultado.',
            'publicado' => $exercicio->publicado,
        ]);
    }

    /**
     * Apagar exercício.
     */
    public function destroy(Request $request, Sala $sala, Exercicio $exercicio)
    {
        $user = $request->user();

        if ($exercicio->autor_id !== $user->id && ! $user->isProfessorDiretor()) {
            return response()->json(['message' => 'Sem permissão.'], 403);
        }

        if ($exercicio->ficheiro_enunciado) {
            Storage::disk('public')->delete($exercicio->ficheiro_enunciado);
        }

        $exercicio->delete();

        return response()->json(['message' => 'Exercício removido.']);
    }
}
