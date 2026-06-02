const express = require('express');
const authRoutes = require('./authRoutes');
const patientRoutes = require('./patientRoutes');
const doctorRoutes = require('./doctorRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const doctorUnavailabilityRoutes = require('./doctorUnavailabilityRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = express.Router();
const statsRoutes = require('./statsRoutes');

// Definir rotas
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/doctor-unavailability', doctorUnavailabilityRoutes);
router.use('/notifications', notificationRoutes);
router.use('/stats', statsRoutes);

// Rota raiz da API
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API do Sistema de Agendamento de Consultas',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      patients: '/api/patients',
      doctors: '/api/doctors',
      appointments: '/api/appointments',
      doctorUnavailability: '/api/doctor-unavailability',
      notifications: '/api/notifications',
    },
  });
});

module.exports = router;