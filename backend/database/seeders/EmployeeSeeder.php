<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Employee;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('email', 'demo@pontofacilrh.com.br')->first();

        $employees = [
            [
                'name' => 'Admin', 'email' => 'admin@admin.com',
                'role' => 'Administrador', 'department' => 'Gestão',
                'salary' => 0, 'weekly_hours' => 40,
                'gps_lat' => -23.5505, 'gps_lng' => -46.6333, 'gps_radius' => 9999,
                'profile' => 'admin', 'avatar' => 'https://i.pravatar.cc/150?u=admin@admin.com',
            ],
            [
                'name' => 'Admin Demo', 'email' => 'admin@pontofacil.com',
                'role' => 'Administrador', 'department' => 'Gestão',
                'salary' => 0, 'weekly_hours' => 40,
                'gps_lat' => -23.5505, 'gps_lng' => -46.6333, 'gps_radius' => 9999,
                'profile' => 'admin', 'avatar' => 'https://i.pravatar.cc/150?u=admin@pontofacil.com',
            ],
            [
                'name' => 'João Silva', 'email' => 'joao@pontofacil.com',
                'cpf' => '123.456.789-00', 'birth_date' => '1993-03-15',
                'phone' => '(11) 98765-4321',
                'role' => 'Desenvolvedor Frontend', 'department' => 'Tecnologia',
                'salary' => 7500, 'weekly_hours' => 40, 'admission_date' => '2022-01-10',
                'emergency_contact_name' => 'Maria Silva', 'emergency_contact_phone' => '(11) 91234-5678',
                'gps_lat' => -23.5505, 'gps_lng' => -46.6333, 'gps_radius' => 500,
                'profile' => 'employee', 'avatar' => 'https://i.pravatar.cc/150?u=joao@pontofacil.com',
            ],
            [
                'name' => 'Ana Souza', 'email' => 'ana@pontofacil.com',
                'cpf' => '234.567.890-11', 'birth_date' => '1990-06-22',
                'phone' => '(11) 97654-3210',
                'role' => 'Analista de RH', 'department' => 'Recursos Humanos',
                'salary' => 5800, 'weekly_hours' => 40, 'admission_date' => '2021-05-03',
                'gps_lat' => -23.5489, 'gps_lng' => -46.6388, 'gps_radius' => 300,
                'profile' => 'employee', 'avatar' => 'https://i.pravatar.cc/150?u=ana@pontofacil.com',
            ],
            [
                'name' => 'Carlos Santos', 'email' => 'carlos@pontofacil.com',
                'cpf' => '345.678.901-22', 'birth_date' => '1988-11-08',
                'phone' => '(11) 96543-2109',
                'role' => 'Coordenador Comercial', 'department' => 'Comercial',
                'salary' => 9200, 'weekly_hours' => 44, 'admission_date' => '2020-08-15',
                'gps_lat' => -23.5512, 'gps_lng' => -46.6344, 'gps_radius' => 400,
                'profile' => 'employee', 'avatar' => 'https://i.pravatar.cc/150?u=carlos@pontofacil.com',
            ],
            [
                'name' => 'Mariana Oliveira', 'email' => 'mariana@pontofacil.com',
                'cpf' => '456.789.012-33', 'birth_date' => '1995-09-30',
                'phone' => '(11) 95432-1098',
                'role' => 'UX/UI Designer Sênior', 'department' => 'Design',
                'salary' => 8100, 'weekly_hours' => 40, 'admission_date' => '2023-02-20',
                'gps_lat' => -23.5498, 'gps_lng' => -46.6350, 'gps_radius' => 350,
                'profile' => 'employee', 'avatar' => 'https://i.pravatar.cc/150?u=mariana@pontofacil.com',
            ],
            [
                'name' => 'Lucas Martins', 'email' => 'lucas@pontofacil.com',
                'cpf' => '567.890.123-44', 'birth_date' => '1997-12-05',
                'phone' => '(11) 94321-0987',
                'role' => 'Analista Financeiro', 'department' => 'Financeiro',
                'salary' => 6400, 'weekly_hours' => 40, 'admission_date' => '2023-07-01',
                'gps_lat' => -23.5520, 'gps_lng' => -46.6360, 'gps_radius' => 250,
                'profile' => 'employee', 'avatar' => 'https://i.pravatar.cc/150?u=lucas@pontofacil.com',
            ],
        ];

        foreach ($employees as $data) {
            Employee::updateOrCreate(
                ['email' => $data['email']],
                array_merge($data, [
                    'company_id' => $company->id,
                    'password'   => Hash::make('123456'),
                    'status'     => true,
                ])
            );
        }
    }
}
