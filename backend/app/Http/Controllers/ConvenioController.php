<?php

namespace App\Http\Controllers;

use App\Models\Convenio;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ConvenioController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Convenio::all());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'discount' => 'required|string|max:100',
            'description' => 'required|string',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'address' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:50',
        ]);

        return response()->json(Convenio::create($data), 201);
    }

    public function show(Convenio $convenio): JsonResponse
    {
        return response()->json($convenio);
    }

    public function update(Request $request, Convenio $convenio): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:100',
            'discount' => 'sometimes|required|string|max:100',
            'description' => 'sometimes|required|string',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'address' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:50',
        ]);

        $convenio->update($data);

        return response()->json($convenio);
    }

    public function destroy(Convenio $convenio): JsonResponse
    {
        $convenio->delete();

        return response()->json(null, 204);
    }
}
