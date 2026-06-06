<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use App\Models\Employee;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $employee = Employee::where('email', $request->email)->where('status', true)->first();

        if (! $employee || ! Hash::check($request->password, $employee->password)) {
            return response()->json([
                'message' => 'E-mail ou senha inválidos. Verifique suas credenciais.',
            ], 401);
        }

        $token = $employee->createToken('auth-token')->plainTextToken;

        return response()->json([
            'employee' => $employee,
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout realizado com sucesso.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}
