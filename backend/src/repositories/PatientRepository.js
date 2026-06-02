const prisma = require('../config/database');

class PatientRepository {
  async create(data) {
    return await prisma.patient.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async findById(id) {
    return await prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
        appointments: {
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                specialty: true,
              },
            },
          },
          orderBy: {
            appointmentDate: 'desc',
          },
        },
      },
    });
  }

  async findByUserId(userId) {
    return await prisma.patient.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async findByCPF(cpf) {
    return await prisma.patient.findUnique({
      where: { cpf },
    });
  }

  async findByEmail(email) {
    return await prisma.patient.findUnique({
      where: { email },
    });
  }

  async findAll(filters = {}) {
    const where = {};

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    if (filters.cpf) {
      where.cpf = filters.cpf;
    }

    if (filters.phone) {
      where.phone = filters.phone;
    }

    if (typeof filters.isActive === 'boolean') {
      where.isActive = filters.isActive;
    }

    return await prisma.patient.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async update(id, data) {
    return await prisma.patient.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async delete(id) {
    return await prisma.patient.delete({
      where: { id },
    });
  }

  async count(filters = {}) {
    const where = {};

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    return await prisma.patient.count({ where });
  }

  async findWithUpcomingAppointments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.patient.findMany({
      where: {
        appointments: {
          some: {
            appointmentDate: {
              gte: today,
            },
            status: {
              in: ['AGENDADA', 'CONFIRMADA'],
            },
          },
        },
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        appointments: {
          where: {
            appointmentDate: {
              gte: today,
            },
            status: {
              in: ['AGENDADA', 'CONFIRMADA'],
            },
          },
          include: {
            doctor: {
              select: {
                name: true,
                specialty: true,
              },
            },
          },
          orderBy: {
            appointmentDate: 'asc',
          },
        },
      },
    });
  }

  async getAppointmentHistory(patientId) {
    return await prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
          },
        },
      },
      orderBy: {
        appointmentDate: 'desc',
      },
    });
  }
}

module.exports = new PatientRepository();
