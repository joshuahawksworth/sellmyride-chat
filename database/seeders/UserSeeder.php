<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // clear existing users first - dev use only
        User::truncate();

        User::create([
            'name' => 'Alice Johnson',
            'email' => 'alice@test.com',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'Bob Smith',
            'email' => 'bob@test.com',
            'password' => Hash::make('password'),
        ]);

        $this->command->info('✅ Test users created successfully!');
        $this->command->info('   - alice@test.com / password');
        $this->command->info('   - bob@test.com / password');
    }
}