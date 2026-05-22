const appointmentService = require('../services/AppointmentService');

class AppointmentController {
  /**
    Criar nova consulta
    POST /appointments
    Body: { patientId, doctorId, appointmentDate, appointmentTime, durationMinutes, notes }
    Requer autenticação: PATIENT
   */
  async create(req, res) {
    const data = req.body;
    const requestUserId = req.user.id;

    const appointment = await appointmentService.create(data, requestUserId);

    return res.status(201).json({
      status: 'success',
      message: 'Consulta agendada com sucesso',
      data: appointment,
    });
  }

  /**
    Buscar consulta por ID
    GET /appointments/:id
    Requer autenticação: ADMIN, DOCTOR (próprias), PATIENT (próprias)
   */
  async findById(req, res) {
    const { id } = req.params;
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    const appointment = await appointmentService.findById(id, requestUserId, requestUserRole);

    return res.status(200).json({
      status: 'success',
      data: appointment,
    });
  }

  /**
    Listar consultas
    GET /appointments
    Query params: patientId, doctorId, date, startDate, endDate, status
    Requer autenticação: ADMIN vê todas, DOCTOR vê suas, PATIENT vê suas
   */
  async findAll(req, res) {
    const filters = {
      patientId: req.query.patientId,
      doctorId: req.query.doctorId,
      date: req.query.date,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status,
    };

    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    const appointments = await appointmentService.findAll(
      filters,
      requestUserId,
      requestUserRole
    );

    return res.status(200).json({
      status: 'success',
      data: appointments,
      count: appointments.length,
    });
  }

  /**
    Buscar consultas futuras
    GET /appointments/upcoming
    Requer autenticação: ADMIN
   */
  async findUpcoming(req, res) {
    const appointments = await appointmentService.findUpcoming();

    return res.status(200).json({
      status: 'success',
      data: appointments,
      count: appointments.length,
    });
  }

  /**
    Atualizar consulta (reagendar)
    PUT /appointments/:id
    Body: { appointmentDate, appointmentTime, notes }
    Requer autenticação: ADMIN ou PATIENT (própria)
   */
  async update(req, res) {
    const { id } = req.params;
    const data = req.body;
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    const appointment = await appointmentService.update(id, data, requestUserId, requestUserRole);

    return res.status(200).json({
      status: 'success',
      message: 'Consulta reagendada com sucesso',
      data: appointment,
    });
  }

  /**
    Cancelar consulta
    PATCH /appointments/:id/cancel
    Requer autenticação: ADMIN, DOCTOR (próprias), PATIENT (próprias)
   */
  async cancel(req, res) {
    const { id } = req.params;
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    const appointment = await appointmentService.cancel(id, requestUserId, requestUserRole);

    return res.status(200).json({
      status: 'success',
      message: 'Consulta cancelada com sucesso',
      data: appointment,
    });
  }

  /**
    Atualizar status da consulta
    PATCH /appointments/:id/status
    Body: { status }
    Requer autenticação: ADMIN ou DOCTOR
   */
  async updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const requestUserRole = req.user.role;

    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Status é obrigatório',
      });
    }

    const appointment = await appointmentService.updateStatus(id, status, requestUserRole);

    return res.status(200).json({
      status: 'success',
      message: 'Status atualizado com sucesso',
      data: appointment,
    });
  }

  /**
    Deletar consulta
    DELETE /appointments/:id
    Requer autenticação: ADMIN
   */
  async delete(req, res) {
    const { id } = req.params;

    await appointmentService.delete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Consulta deletada com sucesso',
    });
  }

  /**
    Contar consultas
    GET /appointments/count
    Query params: status, doctorId, patientId
    Requer autenticação: ADMIN
   */
  async count(req, res) {
    const filters = {
      status: req.query.status,
      doctorId: req.query.doctorId,
      patientId: req.query.patientId,
    };

    const count = await appointmentService.count(filters);

    return res.status(200).json({
      status: 'success',
      data: { count },
    });
  }

  /**
    Buscar minhas consultas (paciente ou médico logado)
    GET /appointments/my
    Requer autenticação: PATIENT ou DOCTOR
   */
  async getMy(req, res) {
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    // Filtros automáticos baseados no role
    const filters = {};

    const appointments = await appointmentService.findAll(
      filters,
      requestUserId,
      requestUserRole
    );

    return res.status(200).json({
      status: 'success',
      data: appointments,
      count: appointments.length,
    });
  }
}

module.exports = new AppointmentController();