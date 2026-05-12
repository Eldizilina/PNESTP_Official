<?php

namespace App\Http\Controllers;

use App\Models\Convite;
use App\Models\Sala;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ConviteController extends Controller
{
    /**
     * Enviar convite a aluno ou professor para uma sala.
     * Apenas o professor_diretor (criador da sala) pode convidar.
     */
    public function enviar(Request $request, Sala $sala)
    {
        $user = $request->user();

        if (! $user->isProfessorDiretor() || $sala->criador_id !== $user->id) {
            return response()->json([
                'message' => 'Apenas o Professor Diretor da sala pode enviar convites.'
            ], 403);
        }

        $data = $request->validate([
            'email' => ['required', 'email'],
            'papel' => ['required', 'in:aluno,professor'],
        ]);

        // Verificar se o utilizador existe
        $convidado = User::where('email', $data['email'])->first();

        if ($convidado && $sala->temMembro($convidado->id)) {
            return response()->json([
                'message' => 'Este utilizador já é membro da sala.'
            ], 422);
        }

        // Verificar convite pendente já existente
        $conviteExistente = Convite::where('sala_id', $sala->id)
                                   ->where('email_convidado', $data['email'])
                                   ->pendentes()
                                   ->first();

        if ($conviteExistente) {
            return response()->json([
                'message' => 'Já existe um convite pendente para este email.'
            ], 422);
        }

        $convite = Convite::create([
            'sala_id'         => $sala->id,
            'convidador_id'   => $user->id,
            'convidado_id'    => $convidado?->id,
            'email_convidado' => $data['email'],
            'papel'           => $data['papel'],
            'status'          => Convite::STATUS_PENDENTE,
            'token'           => Str::uuid(),
            'expira_em'       => now()->addDays(7),
        ]);

        // TODO: disparar notificação por email
        // Notification::route('mail', $data['email'])->notify(new ConviteNotification($convite));

        return response()->json([
            'message' => 'Convite enviado com sucesso.',
            'convite' => $convite->load('sala:id,nome', 'convidador:id,name'),
        ], 201);
    }

    /**
     * Listar convites enviados pelo director para uma sala.
     */
    public function listarPorSala(Request $request, Sala $sala)
    {
        $user = $request->user();

        if ($sala->criador_id !== $user->id && ! $user->isProfessorDiretor()) {
            return response()->json(['message' => 'Sem acesso.'], 403);
        }

        $convites = $sala->convites()
                         ->with('convidado:id,name,email,perfil')
                         ->latest()
                         ->get();

        return response()->json($convites);
    }

    /**
     * Listar convites pendentes recebidos pelo utilizador autenticado.
     */
    public function meusConvites(Request $request)
    {
        $user = $request->user();

        $convites = Convite::where('email_convidado', $user->email)
                           ->pendentes()
                           ->with(['sala:id,nome,descricao', 'convidador:id,name,email'])
                           ->latest()
                           ->get();

        return response()->json($convites);
    }

    /**
     * Aceitar convite.
     */
    public function aceitar(Request $request, Convite $convite)
    {
        $user = $request->user();

        if ($convite->email_convidado !== $user->email) {
            return response()->json(['message' => 'Este convite não é para si.'], 403);
        }

        if ($convite->status !== Convite::STATUS_PENDENTE) {
            return response()->json(['message' => 'Este convite já foi processado.'], 422);
        }

        if ($convite->expira_em && $convite->expira_em->isPast()) {
            return response()->json(['message' => 'Este convite expirou.'], 422);
        }

        DB::transaction(function () use ($convite, $user) {
            $convite->update([
                'status'       => Convite::STATUS_ACEITE,
                'convidado_id' => $user->id,
            ]);

            // Adicionar à sala (se ainda não for membro)
            if (! $convite->sala->temMembro($user->id)) {
                $convite->sala->membros()->attach($user->id, [
                    'papel'     => $convite->papel,
                    'aceite_em' => now(),
                ]);
            }
        });

        return response()->json([
            'message' => 'Convite aceite. Entraste na sala ' . $convite->sala->nome . '.',
            'sala'    => $convite->sala->load('criador:id,name'),
        ]);
    }

    /**
     * Recusar convite.
     */
    public function recusar(Request $request, Convite $convite)
    {
        $user = $request->user();

        if ($convite->email_convidado !== $user->email) {
            return response()->json(['message' => 'Este convite não é para si.'], 403);
        }

        if ($convite->status !== Convite::STATUS_PENDENTE) {
            return response()->json(['message' => 'Este convite já foi processado.'], 422);
        }

        $convite->update(['status' => Convite::STATUS_RECUSADO]);

        return response()->json(['message' => 'Convite recusado.']);
    }

    /**
     * Cancelar convite (pelo director).
     */
    public function cancelar(Request $request, Convite $convite)
    {
        $user = $request->user();

        if ($convite->convidador_id !== $user->id) {
            return response()->json(['message' => 'Sem permissão.'], 403);
        }

        $convite->delete();

        return response()->json(['message' => 'Convite cancelado.']);
    }
}
