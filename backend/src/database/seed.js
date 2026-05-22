const bcrypt = require('bcrypt');
const prisma = require('../config/database');

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  try {
    // Limpar banco (cuidado: deleta todos os dados)
    console.log('🗑️  Limpando banco de dados...');
    await prisma.notification.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.doctorUnavailability.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Banco limpo!\n');

    // Criar senha padrão (hash)
    const passwordHash = await bcrypt.hash('senha123', 10);

    // ============================================
    // 1. CRIAR USUÁRIO ADMIN
    // ============================================
    console.log('👤 Criando usuário ADMIN...');
    const admin = await prisma.user.create({
      data: {
        email: 'admin@clinica.com',
        passwordHash,
        role: 'ADMIN',
      },
    });
    console.log(`✅ Admin criado: ${admin.email}\n`);

    // ============================================
    // 2. CRIAR MÉDICOS
    // ============================================
    console.log('👨‍⚕️ Criando médicos...');

    // Médico 1 - Cardiologista
    const userDoctor1 = await prisma.user.create({
      data: {
        email: 'dr.silva@clinica.com',
        passwordHash,
        role: 'DOCTOR',
      },
    });

    const doctor1 = await prisma.doctor.create({
      data: {
        userId: userDoctor1.id,
        name: 'Dr. João Silva',
        crm: '123456',
        specialty: 'Cardiologia',
        phone: '11987654321',
      },
    });
    console.log(`✅ ${doctor1.name} - ${doctor1.specialty}`);

    // Médico 2 - Dermatologista
    const userDoctor2 = await prisma.user.create({
      data: {
        email: 'dra.santos@clinica.com',
        passwordHash,
        role: 'DOCTOR',
      },
    });

    const doctor2 = await prisma.doctor.create({
      data: {
        userId: userDoctor2.id,
        name: 'Dra. Maria Santos',
        crm: '654321',
        specialty: 'Dermatologia',
        phone: '11976543210',
      },
    });
    console.log(`✅ ${doctor2.name} - ${doctor2.specialty}\n`);

    // ============================================
    // 3. CRIAR PACIENTES
    // ============================================
    console.log('🧑 Criando pacientes...');

    // Paciente 1
    const userPatient1 = await prisma.user.create({
      data: {
        email: 'carlos@email.com',
        passwordHash,
        role: 'PATIENT',
      },
    });

    const patient1 = await prisma.patient.create({
      data: {
        userId: userPatient1.id,
        name: 'Carlos Oliveira',
        cpf: '12345678901',
        phone: '11965432109',
        birthDate: new Date('1985-03-15'),
        address: 'Rua das Flores, 123 - São Paulo',
      },
    });
    console.log(`✅ ${patient1.name}`);

    // Paciente 2
    const userPatient2 = await prisma.user.create({
      data: {
        email: 'ana@email.com',
        passwordHash,
        role: 'PATIENT',
      },
    });

    const patient2 = await prisma.patient.create({
      data: {
        userId: userPatient2.id,
        name: 'Ana Costa',
        cpf: '98765432100',
        phone: '11954321098',
        birthDate: new Date('1990-07-20'),
        address: 'Av. Paulista, 1000 - São Paulo',
      },
    });
    console.log(`✅ ${patient2.name}`);

    // Paciente 3
    const userPatient3 = await prisma.user.create({
      data: {
        email: 'pedro@email.com',
        passwordHash,
        role: 'PATIENT',
      },
    });

    const patient3 = await prisma.patient.create({
      data: {
        userId: userPatient3.id,
        name: 'Pedro Almeida',
        cpf: '11122233344',
        phone: '11943210987',
        birthDate: new Date('1995-11-10'),
        address: 'Rua Augusta, 500 - São Paulo',
      },
    });
    console.log(`✅ ${patient3.name}\n`);

    // ============================================
    // 4. CRIAR CONSULTAS
    // ============================================
    console.log('📅 Criando consultas...');

    // Consulta 1 - Passada (Realizada)
    const appointment1 = await prisma.appointment.create({
      data: {
        patientId: patient1.id,
        doctorId: doctor1.id,
        appointmentDate: new Date('2026-05-10'),
        appointmentTime: new Date('1970-01-01T09:00:00'),
        durationMinutes: 30,
        status: 'REALIZADA',
        notes: 'Consulta de rotina',
      },
    });
    console.log(`✅ Consulta realizada: ${patient1.name} com ${doctor1.name}`);

    // Consulta 2 - Futura (Agendada)
    const appointment2 = await prisma.appointment.create({
      data: {
        patientId: patient2.id,
        doctorId: doctor2.id,
        appointmentDate: new Date('2026-06-15'),
        appointmentTime: new Date('1970-01-01T14:00:00'),
        durationMinutes: 30,
        status: 'AGENDADA',
        notes: 'Primeira consulta',
      },
    });
    console.log(`✅ Consulta agendada: ${patient2.name} com ${doctor2.name}`);

    // Consulta 3 - Futura (Confirmada)
    const appointment3 = await prisma.appointment.create({
      data: {
        patientId: patient3.id,
        doctorId: doctor1.id,
        appointmentDate: new Date('2026-06-20'),
        appointmentTime: new Date('1970-01-01T10:00:00'),
        durationMinutes: 30,
        status: 'CONFIRMADA',
        notes: 'Retorno',
      },
    });
    console.log(`✅ Consulta confirmada: ${patient3.name} com ${doctor1.name}\n`);

    // ============================================
    // 5. CRIAR INDISPONIBILIDADES
    // ============================================
    console.log('🚫 Criando indisponibilidades...');

    // Indisponibilidade 1 - Férias do Dr. João
    await prisma.doctorUnavailability.create({
      data: {
        doctorId: doctor1.id,
        unavailableDate: new Date('2026-07-01'),
        startTime: new Date('1970-01-01T08:00:00'),
        endTime: new Date('1970-01-01T18:00:00'),
        reason: 'Férias',
      },
    });
    console.log(`✅ Dr. João Silva - Férias em 01/07/2026`);

    // Indisponibilidade 2 - Congresso Dra. Maria
    await prisma.doctorUnavailability.create({
      data: {
        doctorId: doctor2.id,
        unavailableDate: new Date('2026-06-25'),
        startTime: new Date('1970-01-01T14:00:00'),
        endTime: new Date('1970-01-01T18:00:00'),
        reason: 'Congresso de Dermatologia',
      },
    });
    console.log(`✅ Dra. Maria Santos - Congresso em 25/06/2026\n`);

    // ============================================
    // RESUMO
    // ============================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SEED CONCLUÍDO COM SUCESSO!\n');
    console.log('📊 DADOS CRIADOS:');
    console.log('  - 1 Admin');
    console.log('  - 2 Médicos');
    console.log('  - 3 Pacientes');
    console.log('  - 3 Consultas');
    console.log('  - 2 Indisponibilidades\n');
    console.log('🔐 CREDENCIAIS DE ACESSO:');
    console.log('  Admin:');
    console.log('    Email: admin@clinica.com');
    console.log('    Senha: senha123\n');
    console.log('  Médicos:');
    console.log('    Email: dr.silva@clinica.com');
    console.log('    Senha: senha123');
    console.log('    Email: dra.santos@clinica.com');
    console.log('    Senha: senha123\n');
    console.log('  Pacientes:');
    console.log('    Email: carlos@email.com');
    console.log('    Senha: senha123');
    console.log('    Email: ana@email.com');
    console.log('    Senha: senha123');
    console.log('    Email: pedro@email.com');
    console.log('    Senha: senha123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar seed
seed();