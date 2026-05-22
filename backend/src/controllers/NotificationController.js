const notificationService = require('../services/NotificationService');

class NotificationController {
  /**
    Criar notificação
    POST /notifications
    Body: { appointmentId, type }
    Requer autenticação: ADMIN
   */
  async create(req, res) {
    const { appointmentId, type } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        status: 'error',
        message: 'ID da consulta é obrigatório',
      });
    }

    if (!type) {
      return res.status(400).json({
        status: 'error',
        message: 'Tipo de notificação é obrigatório',
      });
    }

    const notification = await notificationService.create(appointmentId, type);

    return res.status(201).json({
      status: 'success',
      message: 'Notificação criada com sucesso',
      data: notification,
    });
  }

  /**
    Processar notificação (enviar)
    POST /notifications/:id/process
    Requer autenticação: ADMIN
   */
  async process(req, res) {
    const { id } = req.params;

    await notificationService.process(id);

    return res.status(200).json({
      status: 'success',
      message: 'Notificação processada com sucesso',
    });
  }

  /**
    Processar todas as notificações pendentes
    POST /notifications/process-pending
    Requer autenticação: ADMIN
   */
  async processPending(req, res) {
    const results = await notificationService.processPending();

    return res.status(200).json({
      status: 'success',
      message: 'Notificações pendentes processadas',
      data: results,
    });
  }

  /**
    Enviar lembretes de consultas de amanhã
    POST /notifications/send-tomorrow-reminders
    Requer autenticação: ADMIN
   */
  async sendTomorrowReminders(req, res) {
    const results = await notificationService.sendTomorrowReminders();

    return res.status(200).json({
      status: 'success',
      message: 'Lembretes enviados com sucesso',
      data: results,
    });
  }

  /**
    Listar notificações
    GET /notifications
    Query params: appointmentId, status, type
    Requer autenticação: ADMIN
   */
  async findAll(req, res) {
    const filters = {
      appointmentId: req.query.appointmentId,
      status: req.query.status,
      type: req.query.type,
    };

    const notifications = await notificationService.findAll(filters);

    return res.status(200).json({
      status: 'success',
      data: notifications,
      count: notifications.length,
    });
  }

  /**
   * Deletar notificações antigas
    DELETE /notifications/old
    Query params: daysOld (padrão 30)
    Requer autenticação: ADMIN
   */
  async deleteOld(req, res) {
    const daysOld = parseInt(req.query.daysOld) || 30;

    const result = await notificationService.deleteOld(daysOld);

    return res.status(200).json({
      status: 'success',
      message: `Notificações antigas (${daysOld} dias) deletadas com sucesso`,
      data: result,
    });
  }
}

module.exports = new NotificationController();