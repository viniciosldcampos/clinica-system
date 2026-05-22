const doctorUnavailabilityService = require('../services/DoctorUnavailabilityService');

class DoctorUnavailabilityController {
  /**
    Criar nova indisponibilidade
    POST /doctor-unavailability
    Body: { doctorId, unavailableDate, startTime, endTime, reason }
    Requer autenticação: ADMIN ou DOCTOR (próprio)
   */
  async create(req, res) {
    const data = req.body;
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    const unavailability = await doctorUnavailabilityService.create(
      data,
      requestUserId,
      requestUserRole
    );

    return res.status(201).json({
      status: 'success',
      message: 'Indisponibilidade criada com sucesso',
      data: unavailability,
    });
  }

  /**
    Buscar indisponibilidade por ID
    GET /doctor-unavailability/:id
    Requer autenticação: ADMIN ou DOCTOR (próprio)
   */
  async findById(req, res) {
    const { id } = req.params;
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    const unavailability = await doctorUnavailabilityService.findById(
      id,
      requestUserId,
      requestUserRole
    );

    return res.status(200).json({
      status: 'success',
      data: unavailability,
    });
  }

  /**
    Listar indisponibilidades
    GET /doctor-unavailability
    Query params: doctorId, date, startDate, endDate
    Requer autenticação: ADMIN ou DOCTOR (próprias)
   */
  async findAll(req, res) {
    const filters = {
      doctorId: req.query.doctorId,
      date: req.query.date,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    const unavailabilities = await doctorUnavailabilityService.findAll(
      filters,
      requestUserId,
      requestUserRole
    );

    return res.status(200).json({
      status: 'success',
      data: unavailabilities,
      count: unavailabilities.length,
    });
  }

  /**
    Listar indisponibilidades futuras de um médico
    GET /doctor-unavailability/doctor/:doctorId/future
    Público (pacientes precisam ver para agendar)
   */
  async findFutureByDoctor(req, res) {
    const { doctorId } = req.params;

    const unavailabilities = await doctorUnavailabilityService.findFutureByDoctor(doctorId);

    return res.status(200).json({
      status: 'success',
      data: unavailabilities,
      count: unavailabilities.length,
    });
  }

  /**
    Atualizar indisponibilidade
    PUT /doctor-unavailability/:id
    Body: { unavailableDate, startTime, endTime, reason }
    Requer autenticação: ADMIN ou DOCTOR (próprio)
   */
  async update(req, res) {
    const { id } = req.params;
    const data = req.body;
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    const unavailability = await doctorUnavailabilityService.update(
      id,
      data,
      requestUserId,
      requestUserRole
    );

    return res.status(200).json({
      status: 'success',
      message: 'Indisponibilidade atualizada com sucesso',
      data: unavailability,
    });
  }

  /**
    Deletar indisponibilidade
    DELETE /doctor-unavailability/:id
    Requer autenticação: ADMIN ou DOCTOR (próprio)
   */
  async delete(req, res) {
    const { id } = req.params;
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    await doctorUnavailabilityService.delete(id, requestUserId, requestUserRole);

    return res.status(200).json({
      status: 'success',
      message: 'Indisponibilidade deletada com sucesso',
    });
  }

  /**
    Deletar indisponibilidades passadas de um médico
    DELETE /doctor-unavailability/doctor/:doctorId/past
    Requer autenticação: ADMIN
   */
  async deletePastByDoctor(req, res) {
    const { doctorId } = req.params;

    const result = await doctorUnavailabilityService.deletePastByDoctor(doctorId);

    return res.status(200).json({
      status: 'success',
      message: 'Indisponibilidades passadas deletadas com sucesso',
      data: result,
    });
  }

  /**
    Buscar minhas indisponibilidades (médico logado)
    GET /doctor-unavailability/my
    Requer autenticação: DOCTOR
   */
  async getMy(req, res) {
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    // Filtros automáticos baseados no médico logado
    const filters = {};

    const unavailabilities = await doctorUnavailabilityService.findAll(
      filters,
      requestUserId,
      requestUserRole
    );

    return res.status(200).json({
      status: 'success',
      data: unavailabilities,
      count: unavailabilities.length,
    });
  }
}

module.exports = new DoctorUnavailabilityController();