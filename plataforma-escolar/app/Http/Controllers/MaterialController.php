<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Models\Sala;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MaterialController extends Controller
{
    /**
     * Listar materiais de uma sala.
     */
    public function index(Request $request, Sala $sala)
    {
        $user = $request->user();

        if (!$sala->temMembro($user->id)) {
            return response()->json(['message' => 'Sem acesso a esta sala.'], 403);
        }

        $materiais = $sala->materiais()
            ->with('autor:id,name,avatar')
            ->latest()
            ->get();

        return response()->json($materiais);
    }

    /**
     * Carregar novo material (upload ou link).
     * Apenas professores da sala podem carregar materiais.
     */
    public function store(Request $request, Sala $sala)
    {
        $user = $request->user();

        if (!$user->isProfessor() || !$sala->temMembro($user->id)) {
            return response()->json([
                'message' => 'Apenas professores da sala podem carregar materiais.'
            ], 403);
        }

        $data = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string', 'max:2000'],
            'tipo' => ['required', 'in:pdf,imagem,video,link,outro'],
            // ✅ forma correcta no Laravel
            'ficheiro' => ['required_unless:tipo,link', 'nullable', 'file', 'max:51200'],
            'url_externa' => ['required_if:tipo,link', 'nullable', 'url'],
        ]);

        $caminho = null;
        $tamanho = null;
        $nomeOriginal = null;

        if ($request->hasFile('ficheiro') && $request->input('tipo') !== 'link') {
            $file = $request->file('ficheiro');
            $nomeOriginal = $file->getClientOriginalName();
            $tamanho = $file->getSize();
            $nomeSafe = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $nomeOriginal);
            $caminho = $file->storeAs(
                'materiais/' . $sala->id,
                $nomeSafe,
                'public'
            );
        }

        $material = Material::create([
            'sala_id' => $sala->id,
            'autor_id' => $user->id,
            'titulo' => $data['titulo'],
            'descricao' => $data['descricao'] ?? null,
            'tipo' => $data['tipo'],
            'caminho_ficheiro' => $caminho,
            'url_externa' => $data['url_externa'] ?? null,
            'tamanho_bytes' => $tamanho,
            'nome_original' => $nomeOriginal,
        ]);

        return response()->json([
            'message' => 'Material carregado com sucesso.',
            'material' => $material->load('autor:id,name'),
        ], 201);
    }

    /**
     * Ver detalhes de um material.
     */
    public function show(Request $request, Sala $sala, Material $material)
    {
        $user = $request->user();

        if (!$sala->temMembro($user->id) || $material->sala_id !== $sala->id) {
            return response()->json(['message' => 'Sem acesso.'], 403);
        }

        return response()->json($material->load('autor:id,name,avatar'));
    }

    /**
     * Actualizar material.
     */
    public function update(Request $request, Sala $sala, Material $material)
    {
        $user = $request->user();

        if ($material->autor_id !== $user->id && !$user->isProfessorDiretor()) {
            return response()->json(['message' => 'Sem permissão para editar este material.'], 403);
        }

        $data = $request->validate([
            'titulo' => ['sometimes', 'string', 'max:255'],
            'descricao' => ['nullable', 'string', 'max:2000'],
        ]);

        $material->update($data);

        return response()->json([
            'message' => 'Material actualizado.',
            'material' => $material->fresh()->load('autor:id,name'),
        ]);
    }

    /**
     * Apagar material.
     */
    public function destroy(Request $request, Sala $sala, Material $material)
    {
        $user = $request->user();

        if ($material->autor_id !== $user->id && !$user->isProfessorDiretor()) {
            return response()->json(['message' => 'Sem permissão para apagar este material.'], 403);
        }

        // Remover ficheiro do disco
        if ($material->caminho_ficheiro) {
            Storage::disk('public')->delete($material->caminho_ficheiro);
        }

        $material->delete();

        return response()->json(['message' => 'Material removido.']);
    }

    /**
     * Fazer download de um material (gera URL temporária).
     */
    public function download(Request $request, Sala $sala, Material $material)
    {
        $user = $request->user();

        if (!$sala->temMembro($user->id) || $material->sala_id !== $sala->id) {
            return response()->json(['message' => 'Sem acesso.'], 403);
        }

        if (!$material->caminho_ficheiro) {
            return response()->json(['message' => 'Este material não tem ficheiro para download.'], 422);
        }

        return Storage::disk('public')->download(
            $material->caminho_ficheiro,
            $material->nome_original ?? 'material'
        );
    }
}
