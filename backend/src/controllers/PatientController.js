const patientService = require('../services/PatientService');

class PatientController {
  /**
    Criar novo paciente
    POST /patients
    Body: { email, password, name, cpf, phone, birthDate, address }
    Requer autenticação: ADMIN
   */
  async create(req, res) {
    const data = req.body;

    const patient = await patientService.create(data);

    return res.status(201).json({
      status: 'success',
      message: 'Paciente cadastrado com sucesso',
      data: patient,
    });
  }

  /**
    Buscar paciente por ID
    GET /patients/:id
    Requer autenticação: ADMIN ou próprio paciente
   */
  async findById(req, res) {
    const { id } = req.params;

    const patient = await patientService.findById(id);

    // Verificar permissão
    if (req.user.role === 'PATIENT' && patient.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para ver este paciente',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: patient,
    });
  }

  /**
    Listar todos os pacientes
    GET /patients
    Query params: name, cpf, phone (filtros opcionais)
    Requer autenticação: ADMIN
   */
  async findAll(req, res) {
    const filters = {
      name: req.query.name,
      cpf: req.query.cpf,
      phone: req.query.phone,
    };

    const patients = await patientService.findAll(filters);

    return res.status(200).json({
      status: 'success',
      data: patients,
      count: patients.length,
    });
  }

  /**
    Buscar pacientes com consultas futuras
    GET /patients/with-upcoming-appointments
    Requer autenticação: ADMIN
   */
  async findWithUpcomingAppointments(req, res) {
    const patients = await patientService.findWithUpcomingAppointments();

    return res.status(200).json({
      status: 'success',
      data: patients,
      count: patients.length,
    });
  }

  /**
    Atualizar paciente
    PUT /patients/:id
    Body: { name, phone, birthDate, address }
    Requer autenticação: ADMIN ou próprio paciente
   */
  async update(req, res) {
    const { id } = req.params;
    const data = req.body;
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    const patient = await patientService.update(id, data, requestUserId, requestUserRole);

    return res.status(200).json({
      status: 'success',
      message: 'Paciente atualizado com sucesso',
      data: patient,
    });
  }

  /**
    Atualizar email do paciente
    PUT /patients/:id/email
    Body: { email }
    Requer autenticação: ADMIN ou próprio paciente
   */
  async updateEmail(req, res) {
    const { id } = req.params;
    const { email } = req.body;
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    await patientService.updateEmail(id, email, requestUserId, requestUserRole);

    return res.status(200).json({
      status: 'success',
      message: 'Email atualizado com sucesso',
    });
  }

  /**
    Deletar paciente
    DELETE /patients/:id
    Requer autenticação: ADMIN
   */
  async delete(req, res) {
    const { id } = req.params;

    await patientService.delete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Paciente deletado com sucesso',
    });
  }

  /**
    Ativar/Desativar paciente
    PATCH /patients/:id/toggle-active
    Body: { isActive }
    Requer autenticação: ADMIN
   */
  async toggleActive(req, res) {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        status: 'error',
        message: 'isActive deve ser true ou false',
      });
    }

    const patient = await patientService.toggleActive(id, isActive);

    return res.status(200).json({
      status: 'success',
      message: `Paciente ${isActive ? 'ativado' : 'desativado'} com sucesso`,
      data: patient,
    });
  }

  /**
    Contar pacientes
    GET /patients/count
    Query params: name (filtro opcional)
    Requer autenticação: ADMIN
   */
  async count(req, res) {
    const filters = {
      name: req.query.name,
    };

    const count = await patientService.count(filters);

    return res.status(200).json({
      status: 'success',
      data: { count },
    });
  }

  /**
    Buscar histórico de consultas do paciente
    GET /patients/:id/appointments
    Requer autenticação: ADMIN ou próprio paciente
   */
  async getAppointmentHistory(req, res) {
    const { id } = req.params;
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    const appointments = await patientService.getAppointmentHistory(
      id,
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
    Buscar paciente logado (atalho para /patients/:id quando é o próprio)
    GET /patients/me
    Requer autenticação: PATIENT
   */
  async getMe(req, res) {
    const userId = req.user.id;

    const patient = await patientService.findByUserId(userId);

    return res.status(200).json({
      status: 'success',
      data: patient,
    });
  }
}

module.exports = new PatientController();