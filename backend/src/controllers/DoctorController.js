const doctorService = require('../services/DoctorService');

class DoctorController {
  /**
    Criar novo médico
    POST /doctors
    Body: { email, password, name, crm, specialty, phone }
    Requer autenticação: ADMIN
   */
  async create(req, res) {
    const data = req.body;

    const doctor = await doctorService.create(data);

    return res.status(201).json({
      status: 'success',
      message: 'Médico cadastrado com sucesso',
      data: doctor,
    });
  }

  /**
    Buscar médico por ID
    GET /doctors/:id
    Requer autenticação: ADMIN, DOCTOR (próprio) ou PATIENT
   */
  async findById(req, res) {
    const { id } = req.params;

    const doctor = await doctorService.findById(id);

    // DOCTOR só pode ver seus próprios dados completos
    if (req.user.role === 'DOCTOR' && doctor.userId !== req.user.id) {
      // Retorna apenas dados públicos
      return res.status(200).json({
        status: 'success',
        data: {
          id: doctor.id,
          name: doctor.name,
          specialty: doctor.specialty,
        },
      });
    }

    return res.status(200).json({
      status: 'success',
      data: doctor,
    });
  }

  /**
   * Listar todos os médicos
    GET /doctors
    Query params: name, specialty, crm (filtros opcionais)
    Público (não requer autenticação para listar médicos ativos)
   */
  async findAll(req, res) {
    const filters = {
      name: req.query.name,
      specialty: req.query.specialty,
      crm: req.query.crm,
    };

    const doctors = await doctorService.findAll(filters);

    return res.status(200).json({
      status: 'success',
      data: doctors,
      count: doctors.length,
    });
  }

  /**
    Listar médicos ativos
    GET /doctors/active
    Público (não requer autenticação)
   */
  async findActive(req, res) {
    const doctors = await doctorService.findActive();

    return res.status(200).json({
      status: 'success',
      data: doctors,
      count: doctors.length,
    });
  }

  /**
    Listar especialidades únicas
    GET /doctors/specialties
    Público (não requer autenticação)
   */
  async findUniqueSpecialties(req, res) {
    const specialties = await doctorService.findUniqueSpecialties();

    return res.status(200).json({
      status: 'success',
      data: specialties,
      count: specialties.length,
    });
  }

  /**
    Buscar médicos por especialidade
    GET /doctors/specialty/:specialty
    Público (não requer autenticação)
   */
  async findBySpecialty(req, res) {
    const { specialty } = req.params;

    const doctors = await doctorService.findBySpecialty(specialty);

    return res.status(200).json({
      status: 'success',
      data: doctors,
      count: doctors.length,
    });
  }

  /**
    Atualizar médico
    PUT /doctors/:id
    Body: { name, specialty, phone }
    Requer autenticação: ADMIN ou próprio médico
   */
  async update(req, res) {
    const { id } = req.params;
    const data = req.body;
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    const doctor = await doctorService.update(id, data, requestUserId, requestUserRole);

    return res.status(200).json({
      status: 'success',
      message: 'Médico atualizado com sucesso',
      data: doctor,
    });
  }

  /**
    Atualizar email do médico
    PUT /doctors/:id/email
    Body: { email }
    Requer autenticação: ADMIN ou próprio médico
   */
  async updateEmail(req, res) {
    const { id } = req.params;
    const { email } = req.body;
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    await doctorService.updateEmail(id, email, requestUserId, requestUserRole);

    return res.status(200).json({
      status: 'success',
      message: 'Email atualizado com sucesso',
    });
  }

  /**
    Deletar médico
    DELETE /doctors/:id
    Requer autenticação: ADMIN
   */
  async delete(req, res) {
    const { id } = req.params;

    await doctorService.delete(id);

    return res.status(200).json({
      status: 'success',
      message: 'Médico deletado com sucesso',
    });
  }

  /**
    Ativar/Desativar médico
    PATCH /doctors/:id/toggle-active
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

    const doctor = await doctorService.toggleActive(id, isActive);

    return res.status(200).json({
      status: 'success',
      message: `Médico ${isActive ? 'ativado' : 'desativado'} com sucesso`,
      data: doctor,
    });
  }

  /**
    Contar médicos
    GET /doctors/count
    Query params: specialty (filtro opcional)
    Requer autenticação: ADMIN
   */
  async count(req, res) {
    const filters = {
      specialty: req.query.specialty,
    };

    const count = await doctorService.count(filters);

    return res.status(200).json({
      status: 'success',
      data: { count },
    });
  }

  /**
    Buscar agenda do médico
    GET /doctors/:id/schedule
    Requer autenticação: ADMIN ou próprio médico
   */
  async getSchedule(req, res) {
    const { id } = req.params;
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    const schedule = await doctorService.getSchedule(id, requestUserId, requestUserRole);

    return res.status(200).json({
      status: 'success',
      data: schedule,
    });
  }

  /**
   Buscar médico logado (atalho para /doctors/:id quando é o próprio)
   GET /doctors/me
   Requer autenticação: DOCTOR
   */
  async getMe(req, res) {
    const userId = req.user.id;

    const doctor = await doctorService.findByUserId(userId);

    return res.status(200).json({
      status: 'success',
      data: doctor,
    });
  }
}

module.exports = new DoctorController();