<?php

namespace Database\Seeders;

use App\Models\Employee;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $employees = [
            [
                'name' => 'Admin',
                'cpf' => '000.000.000-00',
                'email' => 'admin@admin.com',
                'phone' => '(11) 99999-9999',
                'role' => 'Administrador',
                'department' => 'Gestão',
                'salary' => 0,
                'weekly_hours' => 40,
                'admission_date' => '2020-01-01',
                'gps_lat' => -23.5505,
                'gps_lng' => -46.6333,
                'gps_radius' => 9999,
                'profile' => 'admin',
                'avatar' => 'https://i.pravatar.cc/150?u=admin@admin.com',
            ],
            [
                'name' => 'Admin Demo',
                'cpf' => null,
                'email' => 'admin@pontofacil.com',
                'phone' => '(11) 99999-0000',
                'role' => 'Administrador',
                'department' => 'Gestão',
                'salary' => 0,
                'weekly_hours' => 40,
                'admission_date' => '2020-01-01',
                'gps_lat' => -23.5505,
                'gps_lng' => -46.6333,
                'gps_radius' => 9999,
                'profile' => 'admin',
                'avatar' => 'https://i.pravatar.cc/150?u=admin@pontofacil.com',
            ],
            [
                'name' => 'João Silva',
                'cpf' => '123.456.789-00',
                'email' => 'joao@pontofacil.com',
                'phone' => '(11) 98765-4321',
                'role' => 'Desenvolvedor Frontend',
                'department' => 'Tecnologia',
                'salary' => 7500,
                'weekly_hours' => 40,
                'birth_date' => '1993-03-15',
                'admission_date' => '2022-01-10',
                'emergency_contact_name' => 'Maria Silva',
                'emergency_contact_phone' => '(11) 91234-5678',
                'gps_lat' => -23.5505,
                'gps_lng' => -46.6333,
                'gps_radius' => 500,
                'profile' => 'employee',
                'avatar' => 'https://i.pravatar.cc/150?u=joao@pontofacil.com',
            ],
            [
                'name' => 'Ana Souza',
                'cpf' => '234.567.890-11',
                'email' => 'ana@pontofacil.com',
                'phone' => '(11) 97654-3210',
                'role' => 'Analista de RH',
                'department' => 'Recursos Humanos',
                'salary' => 5800,
                'weekly_hours' => 40,
                'birth_date' => '1990-06-22',
                'admission_date' => '2021-05-03',
                'emergency_contact_name' => 'Pedro Souza',
                'emergency_contact_phone' => '(11) 92345-6789',
                'gps_lat' => -23.5489,
                'gps_lng' => -46.6388,
                'gps_radius' => 300,
                'profile' => 'employee',
                'avatar' => 'https://i.pravatar.cc/150?u=ana@pontofacil.com',
            ],
            [
                'name' => 'Carlos Santos',
                'cpf' => '345.678.901-22',
                'email' => 'carlos@pontofacil.com',
                'phone' => '(11) 96543-2109',
                'role' => 'Coordenador Comercial',
                'department' => 'Comercial',
                'salary' => 9200,
                'weekly_hours' => 44,
                'birth_date' => '1988-11-08',
                'admission_date' => '2020-08-15',
                'emergency_contact_name' => 'Lucia Santos',
                'emergency_contact_phone' => '(11) 93456-7890',
                'gps_lat' => -23.5512,
                'gps_lng' => -46.6344,
                'gps_radius' => 400,
                'profile' => 'employee',
                'avatar' => 'https://i.pravatar.cc/150?u=carlos@pontofacil.com',
            ],
            [
                'name' => 'Mariana Oliveira',
                'cpf' => '456.789.012-33',
                'email' => 'mariana@pontofacil.com',
                'phone' => '(11) 95432-1098',
                'role' => 'UX/UI Designer Sênior',
                'department' => 'Design',
                'salary' => 8100,
                'weekly_hours' => 40,
                'birth_date' => '1995-09-30',
                'admission_date' => '2023-02-20',
                'gps_lat' => -23.5498,
                'gps_lng' => -46.6350,
                'gps_radius' => 350,
                'profile' => 'employee',
                'avatar' => 'https://i.pravatar.cc/150?u=mariana@pontofacil.com',
            ],
            [
                'name' => 'Lucas Martins',
                'cpf' => '567.890.123-44',
                'email' => 'lucas@pontofacil.com',
                'phone' => '(11) 94321-0987',
                'role' => 'Analista Financeiro',
                'department' => 'Financeiro',
                'salary' => 6400,
                'weekly_hours' => 40,
                'birth_date' => '1997-12-05',
                'admission_date' => '2023-07-01',
                'gps_lat' => -23.5520,
                'gps_lng' => -46.6360,
                'gps_radius' => 250,
                'profile' => 'employee',
                'avatar' => 'https://i.pravatar.cc/150?u=lucas@pontofacil.com',
            ],
        ];

        foreach ($employees as $data) {
            Employee::updateOrCreate(
                ['email' => $data['email']],
                array_merge($data, ['password' => Hash::make('123456'), 'status' => true])
            );
        }
    }
}
