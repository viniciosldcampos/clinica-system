const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const prisma = require('../config/database');

router.get('/', auth, checkRole(['ADMIN']), async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [appointmentsToday, activePatients, activeDoctors, totalAppointments] =
      await Promise.all([
        prisma.appointment.count({
          where: {
            appointmentDate: { gte: today, lt: tomorrow },
            status: { notIn: ['CANCELADA'] },
          },
        }),
        prisma.patient.count({ where: { isActive: true } }),
        prisma.doctor.count({ where: { user: { isActive: true } } }),
        prisma.appointment.count({ where: { status: 'REALIZADA' } }),
      ]);

    return res.json({
      status: 'success',
      data: {
        appointmentsToday,
        activePatients,
        activeDoctors,
        totalAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;