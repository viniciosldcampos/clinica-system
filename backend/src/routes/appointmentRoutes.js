const express = require('express');
const appointmentController = require('../controllers/AppointmentController');
const authMiddleware = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

/**
  GET /appointments/my
  Buscar minhas consultas (PATIENT ou DOCTOR)
 */
router.get('/my', authMiddleware, checkRole(['PATIENT', 'DOCTOR']), appointmentController.getMy);

/**
  GET /appointments/upcoming
  Buscar consultas futuras (ADMIN)
 */
router.get('/upcoming', authMiddleware, checkRole(['ADMIN']), appointmentController.findUpcoming);

/**
  GET /appointments/count
  Contar consultas (ADMIN)
 */
router.get('/count', authMiddleware, checkRole(['ADMIN']), appointmentController.count);

/**
  POST /appointments
  Criar consulta (PATIENT)
 */
router.post('/', authMiddleware, checkRole(['PATIENT']), appointmentController.create);

/**
  GET /appointments
  Listar consultas (autenticado - filtros automáticos por role)
 */
router.get('/', authMiddleware, appointmentController.findAll);

/**
  GET /appointments/:id
  Buscar consulta por ID (autenticado - validação de permissão no controller)
 */
router.get('/:id', authMiddleware, appointmentController.findById);

/**
  PUT /appointments/:id
  Atualizar consulta/Reagendar (ADMIN ou PATIENT própria)
 */
router.put('/:id', authMiddleware, appointmentController.update);

/**
  PATCH /appointments/:id/cancel
  Cancelar consulta (ADMIN, DOCTOR, PATIENT)
 */
router.patch('/:id/cancel', authMiddleware, appointmentController.cancel);

/**
  PATCH /appointments/:id/status
  Atualizar status da consulta (ADMIN ou DOCTOR)
 */
router.patch('/:id/status', authMiddleware, checkRole(['ADMIN', 'DOCTOR']), appointmentController.updateStatus);

/**
  DELETE /appointments/:id
  Deletar consulta (ADMIN)
 */
router.delete('/:id', authMiddleware, checkRole(['ADMIN']), appointmentController.delete);

module.exports = router;