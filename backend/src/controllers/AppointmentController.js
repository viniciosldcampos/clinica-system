const appointmentService = require('../services/AppointmentService');

class AppointmentController {
  async getAll(req, res, next) {
    try {
      const appointments = await appointmentService.findAll(req.query);

      return res.json({
        status: 'success',
        message: 'Consultas listadas com sucesso',
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMy(req, res, next) {
    try {
      const appointments = await appointmentService.findMyAppointments(req.user.id, req.user.role);

      return res.json({
        status: 'success',
        message: 'Minhas consultas listadas com sucesso',
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUpcoming(req, res, next) {
    try {
      const appointments = await appointmentService.findUpcoming(req.query);

      return res.json({
        status: 'success',
        message: 'Consultas futuras listadas com sucesso',
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  async count(req, res, next) {
    try {
      const count = await appointmentService.count(req.query);

      return res.json({
        status: 'success',
        message: 'Consultas contadas com sucesso',
        data: count,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const appointment = await appointmentService.findById(id);

      return res.json({
        status: 'success',
        message: 'Consulta encontrada com sucesso',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

async create(req, res, next) {
  try {
    console.log('📤 Dados recebidos no backend:', req.body) // <--- LOG
    const appointment = await appointmentService.create(req.body, req.user.id, req.user.role);

    return res.status(201).json({
      status: 'success',
      message: 'Consulta criada com sucesso',
      data: appointment,
    });
  } catch (error) {
    console.error('❌ Erro ao criar consulta:', error.message) // <--- LOG
    next(error);
  }
}

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const appointment = await appointmentService.update(id, req.body, req.user.id, req.user.role);

      return res.json({
        status: 'success',
        message: 'Consulta atualizada com sucesso',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const appointment = await appointmentService.cancel(id, reason, req.user.id, req.user.role);

      return res.json({
        status: 'success',
        message: 'Consulta cancelada com sucesso',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const appointment = await appointmentService.updateStatus(id, status, req.user.id, req.user.role);

      return res.json({
        status: 'success',
        message: 'Status da consulta atualizado com sucesso',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await appointmentService.delete(id);

      return res.json({
        status: 'success',
        message: 'Consulta deletada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AppointmentController();