<?php

namespace Database\Seeders;

use App\Models\Convenio;
use Illuminate\Database\Seeder;

class ConvenioSeeder extends Seeder
{
    public function run(): void
    {
        $convenios = [
            [
                'name' => 'Academia FitLife',
                'category' => 'Fitness',
                'discount' => '30% de desconto',
                'description' => 'Acesso a mais de 200 academias parceiras em todo o Brasil. Plano individual ou familiar.',
                'phone' => '(11) 3000-1111',
                'website' => 'https://fitlife.com.br',
                'address' => 'Av. Paulista, 2000 — São Paulo',
                'code' => 'PONTOFACIL30',
            ],
            [
                'name' => 'Farmácia SaúdeTotal',
                'category' => 'Medicamentos & Farmácia',
                'discount' => '15% em medicamentos',
                'description' => 'Desconto em toda linha de medicamentos, cosméticos e produtos de higiene. Válido em todas as filiais.',
                'phone' => '(11) 3000-2222',
                'address' => 'Rede com 150+ lojas em SP',
                'code' => 'COLABORADOR15',
            ],
            [
                'name' => 'Clínica VidaSaudável',
                'category' => 'Saúde & Bem-estar',
                'discount' => '40% em consultas',
                'description' => 'Consultas médicas, exames e procedimentos com desconto especial para colaboradores.',
                'phone' => '(11) 3000-3333',
                'address' => 'Rua das Clínicas, 500 — São Paulo',
                'code' => 'SAUDE40',
            ],
            [
                'name' => 'Universidade EduTech',
                'category' => 'Educação',
                'discount' => '20% em pós-graduação',
                'description' => 'Cursos de graduação, pós-graduação e MBAs com desconto exclusivo. Mais de 80 cursos disponíveis.',
                'phone' => '(11) 3000-4444',
                'website' => 'https://edutech.com.br',
                'code' => 'EDUCA20',
            ],
            [
                'name' => 'Restaurante SaborBrasileiro',
                'category' => 'Alimentação',
                'discount' => '10% no cardápio',
                'description' => 'Comida caseira de qualidade com desconto todo dia. Almoço executivo e refeições à la carte.',
                'phone' => '(11) 3000-5555',
                'address' => 'Rua do Almoço, 123 — São Paulo',
                'code' => 'SABOR10',
            ],
            [
                'name' => 'Pet Shop AnimalFeliz',
                'category' => 'Outros',
                'discount' => '25% em serviços',
                'description' => 'Desconto em banho, tosa, consultas veterinárias e produtos para pets.',
                'phone' => '(11) 3000-6666',
                'address' => 'Av. dos Animais, 450 — São Paulo',
                'code' => 'PET25',
            ],
        ];

        foreach ($convenios as $data) {
            Convenio::updateOrCreate(['name' => $data['name']], $data);
        }
    }
}
