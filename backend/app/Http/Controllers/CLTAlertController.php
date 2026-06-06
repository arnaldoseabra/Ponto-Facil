<?php

namespace App\Http\Controllers;

use App\Models\CLTAlert;
use Illuminate\Http\JsonResponse;

class CLTAlertController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            CLTAlert::with('employee')->orderByDesc('created_at')->get()
        );
    }

    public function destroy(CLTAlert $alert): JsonResponse
    {
        $alert->delete();

        return response()->json(null, 204);
    }
}
