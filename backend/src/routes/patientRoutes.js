const express = require('express');
const patientController = require('../controllers/PatientController');
const authMiddleware = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const router = express.Router();

// Apenas ADMIN pode gerenciar pacientes
router.get('/count', authMiddleware, checkRole(['ADMIN']), patientController.count);
router.post('/', authMiddleware, checkRole(['ADMIN']), patientController.create);
router.get('/', authMiddleware, checkRole(['ADMIN', 'DOCTOR']), patientController.findAll);
router.get('/:id', authMiddleware, checkRole(['ADMIN']), patientController.findById);
router.get('/:id/appointments', authMiddleware, checkRole(['ADMIN']), patientController.getAppointmentHistory);
router.put('/:id', authMiddleware, checkRole(['ADMIN']), patientController.update);
router.put('/:id/email', authMiddleware, checkRole(['ADMIN']), patientController.updateEmail);
router.patch('/:id/toggle-active', authMiddleware, checkRole(['ADMIN']), patientController.toggleActive);
router.delete('/:id', authMiddleware, checkRole(['ADMIN']), patientController.delete);

module.exports = router;
