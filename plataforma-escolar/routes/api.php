<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConviteController;
use App\Http\Controllers\ExercicioController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\MensagemController;
use App\Http\Controllers\SalaController;
use App\Http\Controllers\SubmissaoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Plataforma Escolar
|--------------------------------------------------------------------------
|
| Prefixo base: /api
|
*/

// ════════════════════════════════════════════════════════════════════
// ROTAS PÚBLICAS (sem autenticação)
// ════════════════════════════════════════════════════════════════════

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ════════════════════════════════════════════════════════════════════
// ROTAS PROTEGIDAS (requerem token Sanctum)
// ════════════════════════════════════════════════════════════════════

Route::middleware('auth:sanctum')->group(function () {

    // ── Autenticação ────────────────────────────────────────────────
    Route::post('/logout',           [AuthController::class, 'logout']);
    Route::get('/me',                [AuthController::class, 'me']);
    Route::post('/me/profile',       [AuthController::class, 'updateProfile']);
    Route::post('/me/password',      [AuthController::class, 'changePassword']);

    // ── Salas ────────────────────────────────────────────────────────
    Route::get    ('/salas',                     [SalaController::class, 'index']);
    Route::post   ('/salas',                     [SalaController::class, 'store']);          // apenas professor_diretor
    Route::get    ('/salas/{sala}',              [SalaController::class, 'show']);
    Route::put    ('/salas/{sala}',              [SalaController::class, 'update']);
    Route::delete ('/salas/{sala}',              [SalaController::class, 'destroy']);
    Route::get    ('/salas/{sala}/membros',      [SalaController::class, 'membros']);
    Route::delete ('/salas/{sala}/membros/{membro}', [SalaController::class, 'removerMembro']);
    Route::post   ('/salas/entrar',              [SalaController::class, 'entrarPorCodigo']);

    // ── Convites ─────────────────────────────────────────────────────
    Route::get  ('/convites',                    [ConviteController::class, 'meusConvites']);
    Route::post ('/salas/{sala}/convites',       [ConviteController::class, 'enviar']);
    Route::get  ('/salas/{sala}/convites',       [ConviteController::class, 'listarPorSala']);
    Route::post ('/convites/{convite}/aceitar',  [ConviteController::class, 'aceitar']);
    Route::post ('/convites/{convite}/recusar',  [ConviteController::class, 'recusar']);
    Route::delete('/convites/{convite}',         [ConviteController::class, 'cancelar']);

    // ── Materiais ────────────────────────────────────────────────────
    Route::get    ('/salas/{sala}/materiais',              [MaterialController::class, 'index']);
    Route::post   ('/salas/{sala}/materiais',              [MaterialController::class, 'store']);
    Route::get    ('/salas/{sala}/materiais/{material}',   [MaterialController::class, 'show']);
    Route::post   ('/salas/{sala}/materiais/{material}',   [MaterialController::class, 'update']);  // POST por causa do multipart
    Route::delete ('/salas/{sala}/materiais/{material}',   [MaterialController::class, 'destroy']);
    Route::get    ('/salas/{sala}/materiais/{material}/download', [MaterialController::class, 'download']);

    // ── Exercícios ───────────────────────────────────────────────────
    Route::get    ('/salas/{sala}/exercicios',                   [ExercicioController::class, 'index']);
    Route::post   ('/salas/{sala}/exercicios',                   [ExercicioController::class, 'store']);
    Route::get    ('/salas/{sala}/exercicios/{exercicio}',       [ExercicioController::class, 'show']);
    Route::post   ('/salas/{sala}/exercicios/{exercicio}',       [ExercicioController::class, 'update']);
    Route::post   ('/salas/{sala}/exercicios/{exercicio}/publicar', [ExercicioController::class, 'publicar']);
    Route::delete ('/salas/{sala}/exercicios/{exercicio}',       [ExercicioController::class, 'destroy']);

    // ── Submissões ───────────────────────────────────────────────────
    Route::get  ('/salas/{sala}/exercicios/{exercicio}/submissoes',
                 [SubmissaoController::class, 'index']);

    Route::get  ('/salas/{sala}/exercicios/{exercicio}/submissoes/{submissao}',
                 [SubmissaoController::class, 'show']);

    // Aluno envia por ficheiro
    Route::post ('/salas/{sala}/exercicios/{exercicio}/submeter/upload',
                 [SubmissaoController::class, 'submitUpload']);

    // Aluno responde na plataforma
    Route::post ('/salas/{sala}/exercicios/{exercicio}/submeter/plataforma',
                 [SubmissaoController::class, 'submitPlataforma']);

    // Professor corrige
    Route::post ('/salas/{sala}/exercicios/{exercicio}/submissoes/{submissao}/corrigir',
                 [SubmissaoController::class, 'corrigir']);

    // ── Mensagens ────────────────────────────────────────────────────
    Route::get  ('/mensagens/inbox',             [MensagemController::class, 'inbox']);
    Route::get  ('/mensagens/enviadas',          [MensagemController::class, 'enviadas']);
    Route::get  ('/mensagens/nao-lidas',         [MensagemController::class, 'naoLidas']);
    Route::get  ('/mensagens/contactos',         [MensagemController::class, 'contactos']);
    Route::post ('/mensagens',                   [MensagemController::class, 'enviarDirecta']);
    Route::get  ('/mensagens/{mensagem}',        [MensagemController::class, 'show']);
    Route::post ('/mensagens/{mensagem}/lida',   [MensagemController::class, 'marcarLida']);
    Route::post ('/mensagens/todas-lidas',       [MensagemController::class, 'marcarTodasLidas']);
    Route::delete('/mensagens/{mensagem}',       [MensagemController::class, 'destroy']);

    // Mensagens de sala (mural)
    Route::get  ('/salas/{sala}/mensagens',      [MensagemController::class, 'mensagensDaSala']);
    Route::post ('/salas/{sala}/mensagens',      [MensagemController::class, 'enviarParaSala']);

});
