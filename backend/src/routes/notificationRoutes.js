const express = require('express');
const notificationController = require('../controllers/NotificationController');
const authMiddleware = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

/**
  POST /notifications/process-pending
  Processar todas as notificações pendentes (ADMIN)
 */
router.post(
  '/process-pending',
  authMiddleware,
  checkRole(['ADMIN']),
  notificationController.processPending
);

/**
  POST /notifications/send-tomorrow-reminders
  Enviar lembretes de consultas de amanhã (ADMIN)
 */
router.post(
  '/send-tomorrow-reminders',
  authMiddleware,
  checkRole(['ADMIN']),
  notificationController.sendTomorrowReminders
);

/**
  DELETE /notifications/old
  Deletar notificações antigas (ADMIN)
 */
router.delete('/old', authMiddleware, checkRole(['ADMIN']), notificationController.deleteOld);

/**
  POST /notifications
  Criar notificação (ADMIN)
 */
router.post('/', authMiddleware, checkRole(['ADMIN']), notificationController.create);

/**
  GET /notifications
  Listar notificações (ADMIN)
 */
router.get('/', authMiddleware, checkRole(['ADMIN']), notificationController.findAll);

/**
  POST /notifications/:id/process
  Processar/enviar uma notificação (ADMIN)
 */
router.post('/:id/process', authMiddleware, checkRole(['ADMIN']), notificationController.process);

module.exports = router;