const bcrypt = require('bcrypt');
const prisma = require('../config/database');

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  try {
    // Limpar banco
    console.log('🗑️  Limpando banco de dados...');
    await prisma.notification.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.doctorUnavailability.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Banco limpo!\n');

    const passwordHash = await bcrypt.hash('senha123', 10);

    // CRIAR ADMIN
    console.log('👤 Criando usuário ADMIN...');
    const admin = await prisma.user.create({
      data: {
        email: 'admin@clinica.com',
        passwordHash,
        role: 'ADMIN',
      },
    });
    console.log(`✅ Admin criado: ${admin.email}\n`);

    // CRIAR MÉDICOS
    console.log('👨‍⚕️ Criando médicos...');
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

    // CRIAR PACIENTES
    console.log('🧑 Criando pacientes...');
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

    // CRIAR CONSULTAS (com appointmentDate e appointmentDateEnd)
    console.log('📅 Criando consultas...');

    const appointment1 = await prisma.appointment.create({
      data: {
        patientId: patient1.id,
        doctorId: doctor1.id,
        appointmentDate: new Date('2026-05-10T09:00:00'),
        appointmentDateEnd: new Date('2026-05-10T09:30:00'),
        durationMinutes: 30,
        status: 'REALIZADA',
        notes: 'Consulta de rotina',
      },
    });
    console.log(`✅ Consulta realizada: ${patient1.name} com ${doctor1.name}`);

    const appointment2 = await prisma.appointment.create({
      data: {
        patientId: patient2.id,
        doctorId: doctor2.id,
        appointmentDate: new Date('2026-06-15T14:00:00'),
        appointmentDateEnd: new Date('2026-06-15T14:30:00'),
        durationMinutes: 30,
        status: 'AGENDADA',
        notes: 'Primeira consulta',
      },
    });
    console.log(`✅ Consulta agendada: ${patient2.name} com ${doctor2.name}`);

    const appointment3 = await prisma.appointment.create({
      data: {
        patientId: patient3.id,
        doctorId: doctor1.id,
        appointmentDate: new Date('2026-06-20T10:00:00'),
        appointmentDateEnd: new Date('2026-06-20T10:30:00'),
        durationMinutes: 30,
        status: 'CONFIRMADA',
        notes: 'Retorno',
      },
    });
    console.log(`✅ Consulta confirmada: ${patient3.name} com ${doctor1.name}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SEED CONCLUÍDO COM SUCESSO!\n');
    console.log('🔐 CREDENCIAIS:');
    console.log('  admin@clinica.com / senha123');
    console.log('  dr.silva@clinica.com / senha123');
    console.log('  dra.santos@clinica.com / senha123');
    console.log('  carlos@email.com / senha123');
    console.log('  ana@email.com / senha123');
    console.log('  pedro@email.com / senha123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();