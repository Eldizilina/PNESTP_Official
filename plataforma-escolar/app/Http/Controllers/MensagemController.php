<?php

namespace App\Http\Controllers;

use App\Models\Mensagem;
use App\Models\Sala;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MensagemController extends Controller
{
    /**
     * Caixa de entrada do utilizador autenticado (mensagens directas).
     */
    public function inbox(Request $request)
    {
        $user = $request->user();

        $mensagens = Mensagem::where('destinatario_id', $user->id)
            ->whereNull('sala_id')
            ->with('remetente:id,name,email,perfil,avatar')
            ->latest()
            ->paginate(20);

        return response()->json($mensagens);
    }

    /**
     * Mensagens enviadas pelo utilizador.
     */
    public function enviadas(Request $request)
    {
        $user = $request->user();

        $mensagens = Mensagem::where('remetente_id', $user->id)
            ->whereNull('sala_id')
            ->with('destinatario:id,name,email,perfil,avatar')
            ->latest()
            ->paginate(20);

        return response()->json($mensagens);
    }

    /**
     * Enviar mensagem directa a um utilizador da plataforma.
     */
    public function enviarDirecta(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'destinatario_id' => ['required', 'integer', 'exists:users,id', 'different:' . $user->id],
            'assunto'         => ['required', 'string', 'max:255'],
            'corpo'           => ['required', 'string', 'max:10000'],
            'anexo'           => ['nullable', 'file', 'max:10240'],
        ]);

        $destinatario = User::findOrFail($data['destinatario_id']);

        // Verificar se partilham pelo menos uma sala
        $partilhamSala = $user->salas()
            ->whereHas('membros', fn ($q) => $q->where('users.id', $destinatario->id))
            ->exists();

        if (! $partilhamSala) {
            return response()->json([
                'message' => 'Só podes enviar mensagens a membros das tuas salas.'
            ], 403);
        }

        $anexoCaminho = null;
        $anexoNome    = null;

        if ($request->hasFile('anexo')) {
            $anexoNome    = $request->file('anexo')->getClientOriginalName();
            $anexoCaminho = $request->file('anexo')->store('mensagens/anexos', 'public');
        }

        $mensagem = Mensagem::create([
            'remetente_id'    => $user->id,
            'destinatario_id' => $destinatario->id,
            'sala_id'         => null,
            'assunto'         => $data['assunto'],
            'corpo'           => $data['corpo'],
            'lida'            => false,
            'anexo_path'      => $anexoCaminho,
            'anexo_nome'      => $anexoNome,
        ]);

        return response()->json([
            'message'  => 'Mensagem enviada com sucesso.',
            'mensagem' => $mensagem->load('remetente:id,name', 'destinatario:id,name'),
        ], 201);
    }

    /**
     * Enviar mensagem para a sala (visível a todos os membros).
     */
    public function enviarParaSala(Request $request, Sala $sala)
    {
        $user = $request->user();

        if (! $sala->temMembro($user->id)) {
            return response()->json(['message' => 'Não és membro desta sala.'], 403);
        }

        $data = $request->validate([
            'assunto' => ['required', 'string', 'max:255'],
            'corpo'   => ['required', 'string', 'max:10000'],
            'anexo'   => ['nullable', 'file', 'max:10240'],
        ]);

        $anexoCaminho = null;
        $anexoNome    = null;

        if ($request->hasFile('anexo')) {
            $anexoNome    = $request->file('anexo')->getClientOriginalName();
            $anexoCaminho = $request->file('anexo')->store('mensagens/sala/' . $sala->id, 'public');
        }

        $mensagem = Mensagem::create([
            'remetente_id'    => $user->id,
            'destinatario_id' => null,  // null = mensagem de sala (broadcast)
            'sala_id'         => $sala->id,
            'assunto'         => $data['assunto'],
            'corpo'           => $data['corpo'],
            'lida'            => false,
            'anexo_path'      => $anexoCaminho,
            'anexo_nome'      => $anexoNome,
        ]);

        return response()->json([
            'message'  => 'Mensagem enviada à sala.',
            'mensagem' => $mensagem->load('remetente:id,name,avatar'),
        ], 201);
    }

    /**
     * Listar mensagens de uma sala (mural / chat da sala).
     */
    public function mensagensDaSala(Request $request, Sala $sala)
    {
        $user = $request->user();

        if (! $sala->temMembro($user->id)) {
            return response()->json(['message' => 'Sem acesso a esta sala.'], 403);
        }

        $mensagens = Mensagem::where('sala_id', $sala->id)
            ->with('remetente:id,name,avatar,perfil')
            ->latest()
            ->paginate(30);

        return response()->json($mensagens);
    }

    /**
     * Ver uma mensagem e marcá-la como lida.
     */
    public function show(Request $request, Mensagem $mensagem)
    {
        $user = $request->user();

        $podeVer = $mensagem->destinatario_id === $user->id
            || $mensagem->remetente_id === $user->id
            || ($mensagem->sala_id && $mensagem->sala->temMembro($user->id));

        if (! $podeVer) {
            return response()->json(['message' => 'Sem acesso a esta mensagem.'], 403);
        }

        // Marcar como lida se for o destinatário
        if ($mensagem->destinatario_id === $user->id && ! $mensagem->lida) {
            $mensagem->update([
                'lida'   => true,
                'lida_em'=> now(),
            ]);
        }

        return response()->json(
            $mensagem->load('remetente:id,name,avatar,perfil', 'destinatario:id,name,avatar')
        );
    }

    /**
     * Marcar mensagem como lida.
     */
    public function marcarLida(Request $request, Mensagem $mensagem)
    {
        $user = $request->user();

        if ($mensagem->destinatario_id !== $user->id) {
            return response()->json(['message' => 'Sem permissão.'], 403);
        }

        $mensagem->update(['lida' => true, 'lida_em' => now()]);

        return response()->json(['message' => 'Mensagem marcada como lida.']);
    }

    /**
     * Marcar todas as mensagens como lidas.
     */
    public function marcarTodasLidas(Request $request)
    {
        $user = $request->user();

        Mensagem::where('destinatario_id', $user->id)
            ->where('lida', false)
            ->update(['lida' => true, 'lida_em' => now()]);

        return response()->json(['message' => 'Todas as mensagens marcadas como lidas.']);
    }

    /**
     * Apagar mensagem (apenas remetente ou destinatário).
     */
    public function destroy(Request $request, Mensagem $mensagem)
    {
        $user = $request->user();

        if ($mensagem->remetente_id !== $user->id && $mensagem->destinatario_id !== $user->id) {
            return response()->json(['message' => 'Sem permissão.'], 403);
        }

        if ($mensagem->anexo_path) {
            Storage::disk('public')->delete($mensagem->anexo_path);
        }

        $mensagem->delete();

        return response()->json(['message' => 'Mensagem removida.']);
    }

    /**
     * Contagem de mensagens não lidas.
     */
    public function naoLidas(Request $request)
    {
        $user  = $request->user();
        $total = Mensagem::where('destinatario_id', $user->id)
            ->whereNull('sala_id')
            ->where('lida', false)
            ->count();

        return response()->json(['nao_lidas' => $total]);
    }

    /**
     * Listar contactos disponíveis (membros das salas do utilizador).
     */
    public function contactos(Request $request)
    {
        $user = $request->user();

        $contactos = User::whereHas('salas', function ($q) use ($user) {
                $q->whereHas('membros', fn ($m) => $m->where('users.id', $user->id));
            })
            ->where('id', '!=', $user->id)
            ->select('id', 'name', 'email', 'perfil', 'avatar')
            ->distinct()
            ->get();

        return response()->json($contactos);
    }
}
