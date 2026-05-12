<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Verificar se o utilizador autenticado tem o(s) perfil(is) necessário(s).
     *
     * Uso nas rotas:
     *   Route::middleware('role:professor_diretor')
     *   Route::middleware('role:professor,professor_diretor')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Não autenticado.'], 401);
        }

        if (! in_array($user->perfil, $roles)) {
            return response()->json([
                'message' => 'Acesso negado. Não tem permissão para esta acção.',
            ], 403);
        }

        return $next($request);
    }
}
