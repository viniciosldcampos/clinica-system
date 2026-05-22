const express = require('express');
const doctorController = require('../controllers/DoctorController');
const authMiddleware = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

/**
  GET /doctors/me
  Buscar médico logado (DOCTOR)
 */
router.get('/me', authMiddleware, checkRole(['DOCTOR']), doctorController.getMe);

/**
  GET /doctors/active
  Listar médicos ativos (público)
 */
router.get('/active', doctorController.findActive);

/**
  GET /doctors/specialties
  Listar especialidades únicas (público)
 */
router.get('/specialties', doctorController.findUniqueSpecialties);

/**
  GET /doctors/specialty/:specialty
  Buscar médicos por especialidade (público)
 */
router.get('/specialty/:specialty', doctorController.findBySpecialty);

/**
  GET /doctors/count
  Contar médicos (ADMIN)
 */
router.get('/count', authMiddleware, checkRole(['ADMIN']), doctorController.count);

/**
  POST /doctors
  Criar médico (ADMIN)
 */
router.post('/', authMiddleware, checkRole(['ADMIN']), doctorController.create);

/**
  GET /doctors
  Listar médicos (autenticado)
 */
router.get('/', authMiddleware, doctorController.findAll);

/**
  GET /doctors/:id
  Buscar médico por ID (autenticado)
 */
router.get('/:id', authMiddleware, doctorController.findById);

/**
  GET /doctors/:id/schedule
  Buscar agenda do médico (ADMIN ou próprio DOCTOR)
 */
router.get('/:id/schedule', authMiddleware, doctorController.getSchedule);

/**
  PUT /doctors/:id
  Atualizar médico (ADMIN ou próprio DOCTOR)
 */
router.put('/:id', authMiddleware, doctorController.update);

/**
  PUT /doctors/:id/email
  Atualizar email do médico (ADMIN ou próprio DOCTOR)
 */
router.put('/:id/email', authMiddleware, doctorController.updateEmail);

/**
  PATCH /doctors/:id/toggle-active
  Ativar/Desativar médico (ADMIN)
 */
router.patch('/:id/toggle-active', authMiddleware, checkRole(['ADMIN']), doctorController.toggleActive);

/**
  DELETE /doctors/:id
  Deletar médico (ADMIN)
 */
router.delete('/:id', authMiddleware, checkRole(['ADMIN']), doctorController.delete);

module.exports = router;