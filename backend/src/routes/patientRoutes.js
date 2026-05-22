const express = require('express');
const patientController = require('../controllers/PatientController');
const authMiddleware = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

/**
  GET /patients/me
  Buscar paciente logado (PATIENT)
 */
router.get('/me', authMiddleware, checkRole(['PATIENT']), patientController.getMe);

/**
  GET /patients/with-upcoming-appointments
  Buscar pacientes com consultas futuras (ADMIN)
 */
router.get(
  '/with-upcoming-appointments',
  authMiddleware,
  checkRole(['ADMIN']),
  patientController.findWithUpcomingAppointments
);

/**
  GET /patients/count
  Contar pacientes (ADMIN)
 */
router.get('/count', authMiddleware, checkRole(['ADMIN']), patientController.count);

/**
  POST /patients
  Criar paciente (ADMIN)
 */
router.post('/', authMiddleware, checkRole(['ADMIN']), patientController.create);

/**
  GET /patients
  Listar pacientes (ADMIN)
 */
router.get('/', authMiddleware, checkRole(['ADMIN']), patientController.findAll);

/**
  GET /patients/:id
  Buscar paciente por ID (ADMIN ou próprio PATIENT)
 */
router.get('/:id', authMiddleware, patientController.findById);

/**
  GET /patients/:id/appointments
  Buscar histórico de consultas (ADMIN ou próprio PATIENT)
 */
router.get('/:id/appointments', authMiddleware, patientController.getAppointmentHistory);

/**
  PUT /patients/:id
  Atualizar paciente (ADMIN ou próprio PATIENT)
 */
router.put('/:id', authMiddleware, patientController.update);

/**
  PUT /patients/:id/email
  Atualizar email do paciente (ADMIN ou próprio PATIENT)
 */
router.put('/:id/email', authMiddleware, patientController.updateEmail);

/**
  PATCH /patients/:id/toggle-active
  Ativar/Desativar paciente (ADMIN)
 */
router.patch('/:id/toggle-active', authMiddleware, checkRole(['ADMIN']), patientController.toggleActive);

/**
  DELETE /patients/:id
  Deletar paciente (ADMIN)
 */
router.delete('/:id', authMiddleware, checkRole(['ADMIN']), patientController.delete);

module.exports = router;