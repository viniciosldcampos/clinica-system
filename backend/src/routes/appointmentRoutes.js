const express = require('express');
const appointmentController = require('../controllers/AppointmentController');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(auth);

// Listar todas as consultas (ADMIN)
router.get('/', checkRole('ADMIN'), appointmentController.getAll);

// Listar minhas consultas
router.get('/my', appointmentController.getMy);

// Listar consultas futuras
router.get('/upcoming', appointmentController.getUpcoming);

// Contar consultas
router.get('/count', appointmentController.count);

// Buscar consulta por ID
router.get('/:id', appointmentController.getById);

// Criar nova consulta
router.post('/', appointmentController.create);

// Atualizar/Reagendar consulta
router.put('/:id', appointmentController.update);

// Cancelar consulta
router.patch('/:id/cancel', appointmentController.cancel);

// Atualizar status da consulta
router.patch('/:id/status', appointmentController.updateStatus);

// Deletar consulta (ADMIN)
router.delete('/:id', checkRole('ADMIN'), appointmentController.delete);

module.exports = router;