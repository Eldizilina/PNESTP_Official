<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Registo de novo utilizador.
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'                  => ['required', 'string', 'min:3', 'regex:/^[A-Za-zÀ-ÿ\s]+$/'],
            'email'                 => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(6)->numbers()],
            'perfil'                => ['required', 'in:aluno,professor,professor_diretor'],
            'escola'                => ['required_if:perfil,aluno', 'nullable', 'string', 'max:255'],
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'perfil'   => $data['perfil'],
            'escola'   => $data['escola'] ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Utilizador criado com sucesso.',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }

    /**
     * Login — devolve token Sanctum.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        // Revogar tokens antigos (opcional — para sessão única)
        // $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login efectuado com sucesso.',
            'user'    => $user,
            'token'   => $token,
        ]);
    }

    /**
     * Logout — revoga o token actual.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sessão terminada com sucesso.']);
    }

    /**
     * Devolve o utilizador autenticado.
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Actualizar perfil do utilizador.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name'   => ['sometimes', 'string', 'min:3', 'regex:/^[A-Za-zÀ-ÿ\s]+$/'],
            'bio'    => ['nullable', 'string', 'max:500'],
            'escola' => ['nullable', 'string', 'max:255'],
            'avatar' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $path;
        }

        $user->update($data);

        return response()->json([
            'message' => 'Perfil actualizado.',
            'user'    => $user->fresh(),
        ]);
    }

    /**
     * Alterar password.
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'password_atual' => ['required'],
            'password'       => ['required', 'confirmed', Password::min(6)->mixedCase()->numbers()],
        ]);

        $user = $request->user();

        if (! Hash::check($request->password_atual, $user->password)) {
            throw ValidationException::withMessages([
                'password_atual' => ['A password actual está incorrecta.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password alterada com sucesso.']);
    }
}
