<?php

namespace App\Http\Controllers;

use App\Models\Convenio;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ConvenioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            Convenio::where('company_id', $request->user()->company_id)->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'category'    => 'required|string|max:100',
            'discount'    => 'required|string|max:100',
            'description' => 'required|string',
            'phone'       => 'nullable|string|max:20',
            'website'     => 'nullable|url|max:255',
            'address'     => 'nullable|string|max:255',
            'code'        => 'nullable|string|max:50',
        ]);

        $data['company_id'] = $request->user()->company_id;

        return response()->json(Convenio::create($data), 201);
    }

    public function show(Request $request, Convenio $convenio): JsonResponse
    {
        $this->authorize($request, $convenio);

        return response()->json($convenio);
    }

    public function update(Request $request, Convenio $convenio): JsonResponse
    {
        $this->authorize($request, $convenio);

        $data = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'category'    => 'sometimes|required|string|max:100',
            'discount'    => 'sometimes|required|string|max:100',
            'description' => 'sometimes|required|string',
            'phone'       => 'nullable|string|max:20',
            'website'     => 'nullable|url|max:255',
            'address'     => 'nullable|string|max:255',
            'code'        => 'nullable|string|max:50',
        ]);

        $convenio->update($data);

        return response()->json($convenio);
    }

    public function destroy(Request $request, Convenio $convenio): JsonResponse
    {
        $this->authorize($request, $convenio);
        $convenio->delete();

        return response()->json(null, 204);
    }

    private function authorize(Request $request, Convenio $convenio): void
    {
        if ($convenio->company_id !== $request->user()->company_id) {
            abort(403, 'Acesso negado.');
        }
    }
}
