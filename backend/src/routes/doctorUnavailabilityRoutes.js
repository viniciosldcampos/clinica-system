const express = require('express');
const doctorUnavailabilityController = require('../controllers/DoctorUnavailabilityController');
const authMiddleware = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

/**
  GET /doctor-unavailability/my
  Buscar minhas indisponibilidades (DOCTOR)
 */
router.get('/my', authMiddleware, checkRole(['DOCTOR']), doctorUnavailabilityController.getMy);

/**
  GET /doctor-unavailability/doctor/:doctorId/future
  Buscar indisponibilidades futuras de um médico (público)
 */
router.get('/doctor/:doctorId/future', doctorUnavailabilityController.findFutureByDoctor);

/**
  DELETE /doctor-unavailability/doctor/:doctorId/past
  Deletar indisponibilidades passadas de um médico (ADMIN)
 */
router.delete(
  '/doctor/:doctorId/past',
  authMiddleware,
  checkRole(['ADMIN']),
  doctorUnavailabilityController.deletePastByDoctor
);

/**
  POST /doctor-unavailability
  Criar indisponibilidade (ADMIN ou DOCTOR próprio)
 */
router.post('/', authMiddleware, checkRole(['ADMIN', 'DOCTOR']), doctorUnavailabilityController.create);

/**
  GET /doctor-unavailability
  Listar indisponibilidades (ADMIN ou DOCTOR próprias)
 */
router.get('/', authMiddleware, checkRole(['ADMIN', 'DOCTOR']), doctorUnavailabilityController.findAll);

/**
  GET /doctor-unavailability/:id
  Buscar indisponibilidade por ID (ADMIN ou DOCTOR próprio)
 */
router.get('/:id', authMiddleware, checkRole(['ADMIN', 'DOCTOR']), doctorUnavailabilityController.findById);

/**
  PUT /doctor-unavailability/:id
  Atualizar indisponibilidade (ADMIN ou DOCTOR próprio)
 */
router.put('/:id', authMiddleware, checkRole(['ADMIN', 'DOCTOR']), doctorUnavailabilityController.update);

/**
  DELETE /doctor-unavailability/:id
  Deletar indisponibilidade (ADMIN ou DOCTOR próprio)
 */
router.delete('/:id', authMiddleware, checkRole(['ADMIN', 'DOCTOR']), doctorUnavailabilityController.delete);

module.exports = router;