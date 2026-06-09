<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        Company::updateOrCreate(
            ['email' => 'demo@pontofacilrh.com.br'],
            [
                'name'   => 'Empresa Demo',
                'cnpj'   => '00.000.000/0001-00',
                'phone'  => '(11) 99999-0000',
                'plan'   => 'premium',
                'status' => 'active',
            ]
        );
    }
}
