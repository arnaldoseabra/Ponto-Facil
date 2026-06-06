<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private string $apiUrl;
    private string $apiKey;
    private string $instance;

    public function __construct()
    {
        $this->apiUrl = config('services.evolution.url', '');
        $this->apiKey = config('services.evolution.key', '');
        $this->instance = config('services.evolution.instance', '');
    }

    public function send(string $phone, string $message): bool
    {
        if (empty($this->apiUrl) || empty($this->apiKey)) {
            Log::info("WhatsApp (modo demo): {$phone} — {$message}");
            return true;
        }

        try {
            $response = Http::withHeaders([
                'apikey' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->apiUrl}/message/sendText/{$this->instance}", [
                'number' => $this->formatPhone($phone),
                'textMessage' => ['text' => $message],
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error("Falha ao enviar WhatsApp para {$phone}: {$e->getMessage()}");
            return false;
        }
    }

    private function formatPhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);
        if (strlen($digits) === 11) {
            return "55{$digits}";
        }
        return $digits;
    }
}
