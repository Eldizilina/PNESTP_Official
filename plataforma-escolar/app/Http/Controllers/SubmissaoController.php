<?php

namespace App\Http\Controllers;

use App\Models\Exercicio;
use App\Models\RespostaQuestao;
use App\Models\Sala;
use App\Models\Submissao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SubmissaoController extends Controller
{
    /**
     * Listar submissões de um exercício (para professores).
     */
    public function index(Request $request, Sala $sala, Exercicio $exercicio)
    {
        $user = $request->user();

        if (! $sala->temMembro($user->id) || $exercicio->sala_id !== $sala->id) {
            return response()->json(['message' => 'Sem acesso.'], 403);
        }

        if ($user->isAluno()) {
            // Aluno só vê as suas próprias submissões
            $submissoes = $exercicio->submissoes()
                                    ->where('aluno_id', $user->id)
                                    ->with('respostas.questao')
                                    ->get();
        } else {
            // Professor vê todas
            $submissoes = $exercicio->submissoes()
                                    ->with(['aluno:id,name,email,avatar', 'respostas.questao'])
                                    ->latest('submetido_em')
                                    ->get();
        }

        return response()->json($submissoes);
    }

    /**
     * Submeter exercício por upload (apenas alunos).
     */
    public function submitUpload(Request $request, Sala $sala, Exercicio $exercicio)
    {
        $user = $request->user();

        if (! $user->isAluno() || ! $sala->temMembro($user->id)) {
            return response()->json(['message' => 'Apenas alunos podem submeter exercícios.'], 403);
        }

        if ($exercicio->tipo !== Exercicio::TIPO_UPLOAD) {
            return response()->json(['message' => 'Este exercício não aceita envio por ficheiro.'], 422);
        }

        if (! $exercicio->publicado) {
            return response()->json(['message' => 'Exercício não disponível.'], 403);
        }

        if ($exercicio->prazo && $exercicio->prazo->isPast()) {
            return response()->json(['message' => 'O prazo de entrega passou.'], 422);
        }

        // Verificar submissão existente
        $existente = $exercicio->submissoes()->where('aluno_id', $user->id)->first();
        if ($existente) {
            return response()->json(['message' => 'Já submeteste este exercício.'], 422);
        }

        $request->validate([
            'ficheiro' => ['required', 'file', 'max:20480'], // 20 MB
        ]);

        $path = $request->file('ficheiro')
            ->store('submissoes/' . $sala->id . '/' . $exercicio->id, 'public');

        $submissao = Submissao::create([
            'exercicio_id'  => $exercicio->id,
            'aluno_id'      => $user->id,
            'metodo'        => Submissao::METODO_UPLOAD,
            'ficheiro_path' => $path,
            'status'        => Submissao::STATUS_PENDENTE,
            'submetido_em'  => now(),
        ]);

        return response()->json([
            'message'   => 'Exercício submetido com sucesso.',
            'submissao' => $submissao,
        ], 201);
    }

    /**
     * Submeter exercício na plataforma (responder questões).
     */
    public function submitPlataforma(Request $request, Sala $sala, Exercicio $exercicio)
    {
        $user = $request->user();

        if (! $user->isAluno() || ! $sala->temMembro($user->id)) {
            return response()->json(['message' => 'Apenas alunos podem submeter exercícios.'], 403);
        }

        if ($exercicio->tipo !== Exercicio::TIPO_PLATAFORMA) {
            return response()->json(['message' => 'Este exercício não é do tipo plataforma.'], 422);
        }

        if (! $exercicio->publicado) {
            return response()->json(['message' => 'Exercício não disponível.'], 403);
        }

        if ($exercicio->prazo && $exercicio->prazo->isPast()) {
            return response()->json(['message' => 'O prazo de entrega passou.'], 422);
        }

        $existente = $exercicio->submissoes()->where('aluno_id', $user->id)->first();
        if ($existente) {
            return response()->json(['message' => 'Já submeteste este exercício.'], 422);
        }

        $request->validate([
            'respostas'              => ['required', 'array'],
            'respostas.*.questao_id' => ['required', 'integer', 'exists:questoes,id'],
            'respostas.*.resposta'   => ['required'],
        ]);

        $submissao = DB::transaction(function () use ($request, $exercicio, $user) {
            $submissao = Submissao::create([
                'exercicio_id' => $exercicio->id,
                'aluno_id'     => $user->id,
                'metodo'       => Submissao::METODO_PLATAFORMA,
                'status'       => Submissao::STATUS_PENDENTE,
                'submetido_em' => now(),
            ]);

            $totalPontuacao = 0;
            $temDissertativa = false;

            foreach ($request->respostas as $resp) {
                $questao   = $exercicio->questoes()->find($resp['questao_id']);
                if (! $questao) continue;

                $resposta  = is_array($resp['resposta']) ? $resp['resposta'] : [$resp['resposta']];
                $correta   = false;
                $pontuacao = 0;

                // Correcção automática para questões objectivas
                if ($questao->tipo !== 'dissertativa') {
                    $respostaCorreta = $questao->resposta_correta ?? [];
                    $correta = ! array_diff($resposta, $respostaCorreta)
                               && ! array_diff($respostaCorreta, $resposta);

                    if ($correta) {
                        $pontuacao       = $questao->pontuacao;
                        $totalPontuacao += $pontuacao;
                    }
                } else {
                    $temDissertativa = true;
                }

                RespostaQuestao::create([
                    'submissao_id'     => $submissao->id,
                    'questao_id'       => $questao->id,
                    'resposta'         => $resposta,
                    'correta'          => $correta,
                    'pontuacao_obtida' => $pontuacao,
                ]);
            }

            // Se não há questões dissertativas, a nota é calculada automaticamente
            if (! $temDissertativa) {
                $submissao->update([
                    'nota'          => $totalPontuacao,
                    'status'        => Submissao::STATUS_CORRIGIDA,
                    'corrigido_em'  => now(),
                ]);
            }

            return $submissao;
        });

        return response()->json([
            'message'   => 'Exercício submetido com sucesso.',
            'submissao' => $submissao->load('respostas.questao'),
        ], 201);
    }

    /**
     * Corrigir / avaliar submissão (apenas professores).
     */
    public function corrigir(Request $request, Sala $sala, Exercicio $exercicio, Submissao $submissao)
    {
        $user = $request->user();

        if (! $user->isProfessor() || ! $sala->temMembro($user->id)) {
            return response()->json(['message' => 'Apenas professores podem corrigir submissões.'], 403);
        }

        $data = $request->validate([
            'nota'     => ['required', 'numeric', 'min:0', 'max:' . ($exercicio->pontuacao_maxima ?? 1000)],
            'feedback' => ['nullable', 'string', 'max:3000'],
            // Correcção manual de questões dissertativas
            'respostas'                     => ['nullable', 'array'],
            'respostas.*.id'                => ['required', 'integer', 'exists:respostas_questao,id'],
            'respostas.*.pontuacao_obtida'  => ['required', 'numeric', 'min:0'],
            'respostas.*.correta'           => ['sometimes', 'boolean'],
        ]);

        DB::transaction(function () use ($data, $submissao, $user) {
            // Actualizar respostas individuais (se fornecidas)
            if (! empty($data['respostas'])) {
                foreach ($data['respostas'] as $r) {
                    RespostaQuestao::where('id', $r['id'])
                        ->where('submissao_id', $submissao->id)
                        ->update([
                            'pontuacao_obtida' => $r['pontuacao_obtida'],
                            'correta'          => $r['correta'] ?? null,
                        ]);
                }
            }

            $submissao->update([
                'nota'          => $data['nota'],
                'feedback'      => $data['feedback'] ?? null,
                'status'        => Submissao::STATUS_DEVOLVIDA,
                'corrigido_por' => $user->id,
                'corrigido_em'  => now(),
            ]);
        });

        return response()->json([
            'message'   => 'Submissão corrigida com sucesso.',
            'submissao' => $submissao->fresh()->load(['aluno:id,name', 'professor:id,name', 'respostas']),
        ]);
    }

    /**
     * Ver detalhe de uma submissão.
     */
    public function show(Request $request, Sala $sala, Exercicio $exercicio, Submissao $submissao)
    {
        $user = $request->user();

        // Aluno só vê a sua própria
        if ($user->isAluno() && $submissao->aluno_id !== $user->id) {
            return response()->json(['message' => 'Sem acesso.'], 403);
        }

        if (! $sala->temMembro($user->id)) {
            return response()->json(['message' => 'Sem acesso.'], 403);
        }

        return response()->json(
            $submissao->load(['aluno:id,name,email,avatar', 'professor:id,name', 'respostas.questao'])
        );
    }
}
