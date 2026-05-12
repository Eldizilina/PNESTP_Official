<?php

namespace App\Http\Controllers;

use App\Models\Sala;
use App\Models\Convite;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SalaController extends Controller
{
    /**
     * Listar salas do utilizador autenticado.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $salas = $user->salas()
            ->with(['criador:id,name,email'])
            ->withCount([
                // 👇 usar where directo em vez de wherePivot
                'membros as alunos_count' => function ($q) {
                    $q->where('sala_user.papel', 'aluno');
                },
                'membros as professores_count' => function ($q) {
                    $q->whereIn('sala_user.papel', ['professor', 'professor_diretor']);
                },
                'materiais as materiais_count',
                'exercicios as exercicios_count',
            ])
            ->get();

        return response()->json($salas);
    }

    /**
     * Criar nova sala (apenas professor_diretor).
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user->isProfessorDiretor()) {
            return response()->json([
                'message' => 'Apenas o Professor Diretor pode criar salas.'
            ], 403);
        }

        $data = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string', 'max:1000'],
        ]);

        $sala = DB::transaction(function () use ($user, $data) {
            $sala = Sala::create([
                'nome' => $data['nome'],
                'descricao' => $data['descricao'] ?? null,
                'criador_id' => $user->id,
                'codigo_acesso' => strtoupper(Str::random(8)),
                'ativa' => true,
            ]);

            // O criador entra automaticamente como professor_diretor
            $sala->membros()->attach($user->id, [
                'papel' => 'professor_diretor',
                'aceite_em' => now(),
            ]);

            return $sala;
        });

        return response()->json([
            'message' => 'Sala criada com sucesso.',
            'sala' => $sala->load('criador:id,name,email'),
        ], 201);
    }

    /**
     * Ver detalhes de uma sala.
     */
    public function show(Request $request, Sala $sala)
    {
        $user = $request->user();

        if (!$sala->temMembro($user->id)) {
            return response()->json(['message' => 'Sem acesso a esta sala.'], 403);
        }

        $sala->load([
            'criador:id,name,email,avatar',
            'membros:id,name,email,perfil,avatar',
            'materiais.autor:id,name',
            'exercicios' => function ($q) {
                $q->where('publicado', true)
                    ->with('autor:id,name')
                    ->withCount('submissoes');
            },
        ]);

        return response()->json($sala);
    }

    /**
     * Actualizar sala (apenas criador / professor_diretor da sala).
     */
    public function update(Request $request, Sala $sala)
    {
        $this->autorizarGestao($request->user(), $sala);

        $data = $request->validate([
            'nome' => ['sometimes', 'string', 'max:255'],
            'descricao' => ['nullable', 'string', 'max:1000'],
            'ativa' => ['sometimes', 'boolean'],
        ]);

        $sala->update($data);

        return response()->json([
            'message' => 'Sala actualizada.',
            'sala' => $sala->fresh(),
        ]);
    }

    /**
     * Apagar sala (soft delete).
     */
    public function destroy(Request $request, Sala $sala)
    {
        $this->autorizarGestao($request->user(), $sala);

        $sala->delete();

        return response()->json(['message' => 'Sala removida com sucesso.']);
    }

    /**
     * Listar membros da sala.
     */
    public function membros(Request $request, Sala $sala)
    {
        $user = $request->user();

        if (!$sala->temMembro($user->id)) {
            return response()->json(['message' => 'Sem acesso a esta sala.'], 403);
        }

        $membros = $sala->membros()
            ->select('users.id', 'users.name', 'users.email', 'users.perfil', 'users.avatar')
            ->get();

        return response()->json($membros);
    }

    /**
     * Remover membro da sala.
     */
    public function removerMembro(Request $request, Sala $sala, User $membro)
    {
        $this->autorizarGestao($request->user(), $sala);

        if ($membro->id === $sala->criador_id) {
            return response()->json(['message' => 'Não é possível remover o criador da sala.'], 422);
        }

        $sala->membros()->detach($membro->id);

        return response()->json(['message' => 'Membro removido da sala.']);
    }

    /**
     * Entrar numa sala pelo código de acesso.
     */
    public function entrarPorCodigo(Request $request)
    {
        $request->validate(['codigo' => ['required', 'string']]);

        $sala = Sala::where('codigo_acesso', strtoupper($request->codigo))
            ->ativas()
            ->firstOrFail();

        $user = $request->user();

        if ($sala->temMembro($user->id)) {
            return response()->json(['message' => 'Já és membro desta sala.'], 422);
        }

        $sala->membros()->attach($user->id, [
            'papel' => $user->perfil,
            'aceite_em' => now(),
        ]);

        return response()->json([
            'message' => 'Entraste na sala com sucesso.',
            'sala' => $sala->load('criador:id,name'),
        ]);
    }

    // ─────────────────────────────────────────────
    // Helpers privados
    // ─────────────────────────────────────────────

    private function autorizarGestao(User $user, Sala $sala): void
    {
        if ($sala->criador_id !== $user->id && !$user->isProfessorDiretor()) {
            abort(403, 'Sem permissão para gerir esta sala.');
        }
    }
}
