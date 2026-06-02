const AppError = require('../utils/AppError');
const patientRepository = require('../repositories/PatientRepository');
const { validateEmail, validateCPF, formatCPF } = require('../utils/validators');

class PatientService {
  async create(data) {
    const { name, cpf, phone, birthDate, address, email } = data;

    if (!validateCPF(cpf)) {
      throw new AppError('CPF inválido', 400);
    }

    const formattedCPF = formatCPF(cpf);
    const existingPatient = await patientRepository.findByCPF(formattedCPF);
    if (existingPatient) {
      throw new AppError('CPF já cadastrado', 400);
    }

    if (email && !validateEmail(email)) {
      throw new AppError('Email inválido', 400);
    }

    return await patientRepository.create({
      name,
      cpf: formattedCPF,
      phone,
      birthDate: new Date(birthDate),
      address,
      email,
    });
  }

  async findById(id) {
    const patient = await patientRepository.findById(id);
    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }
    return patient;
  }

  async findAll(filters = {}) {
    return await patientRepository.findAll(filters);
  }

  async findByCPF(cpf) {
    const formattedCPF = formatCPF(cpf);
    const patient = await patientRepository.findByCPF(formattedCPF);
    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }
    return patient;
  }

  async update(id, data) {
    const patient = await patientRepository.findById(id);
    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    const { name, cpf, phone, birthDate, address, email } = data;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (birthDate) updateData.birthDate = new Date(birthDate);
    if (address) updateData.address = address;

    if (email) {
      if (!validateEmail(email)) {
        throw new AppError('Email inválido', 400);
      }
      if (email !== patient.email) {
        const existingPatient = await patientRepository.findByEmail(email);
        if (existingPatient) {
          throw new AppError('Email já cadastrado', 400);
        }
      }
      updateData.email = email;
    }

    if (cpf) {
      const formattedCPF = formatCPF(cpf);
      if (formattedCPF !== patient.cpf) {
        const existingPatient = await patientRepository.findByCPF(formattedCPF);
        if (existingPatient) {
          throw new AppError('CPF já cadastrado', 400);
        }
      }
      updateData.cpf = formattedCPF;
    }

    return await patientRepository.update(id, updateData);
  }

  async delete(id) {
    const patient = await patientRepository.findById(id);
    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    return await patientRepository.delete(id);
  }

  async count(filters = {}) {
    return await patientRepository.count(filters);
  }

  async getAppointmentHistory(patientId) {
    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    return await patientRepository.getAppointmentHistory(patientId);
  }

  async toggleActive(id, isActive) {
    const patient = await patientRepository.findById(id);
    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    return await patientRepository.update(id, { isActive });
  }
}

module.exports = new PatientService();
