const AppError = require('./AppError');

/**
 * Valida se o CPF é válido
  @param {string} cpf - CPF a ser validado
  @returns {boolean} - true se válido
 */
const validateCPF = (cpf) => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;

  if (parseInt(cpf.charAt(9)) !== digit1) {
    return false;
  }

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;

  if (parseInt(cpf.charAt(10)) !== digit2) {
    return false;
  }

  return true;
};

/**
 * Valida se o email é válido
  @param {string} email - Email a ser validado
  @returns {boolean} - true se válido
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida se o telefone é válido (formato brasileiro)
  @param {string} phone - Telefone a ser validado
  @returns {boolean} - true se válido
 */
const validatePhone = (phone) => {
  // Remove caracteres não numéricos
  phone = phone.replace(/[^\d]/g, '');

  // Verifica se tem 10 ou 11 dígitos (com ou sem 9 na frente)
  // Ex: (11) 98888-8888 ou (11) 3888-8888
  return phone.length === 10 || phone.length === 11;
};

/**
 * Valida se o CRM é válido
  @param {string} crm - CRM a ser validado
  @returns {boolean} - true se válido
 */
const validateCRM = (crm) => {
  // Remove espaços e caracteres especiais
  crm = crm.replace(/[^\d]/g, '');

  // CRM geralmente tem entre 4 e 8 dígitos
  return crm.length >= 4 && crm.length <= 8;
};

/**
 * Valida se a data é válida e não é futura
  @param {string} date - Data no formato YYYY-MM-DD
  @returns {boolean} - true se válida
 */
const validateBirthDate = (date) => {
  const birthDate = new Date(date);
  const today = new Date();

  // Verifica se é uma data válida
  if (isNaN(birthDate.getTime())) {
    return false;
  }

  // Verifica se não é data futura
  if (birthDate > today) {
    return false;
  }

  // Verifica se a pessoa tem menos de 150 anos (razoável)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 150);
  if (birthDate < minDate) {
    return false;
  }

  return true;
};

/**
 * Valida se a senha atende aos requisitos mínimos
  @param {string} password - Senha a ser validada
  @returns {boolean} - true se válida
 */
const validatePassword = (password) => {
  // Mínimo 6 caracteres
  if (password.length < 6) {
    return false;
  }

  return true;
};

/**
 * Formata CPF removendo caracteres especiais
  @param {string} cpf - CPF a ser formatado
  @returns {string} - CPF apenas com números
 */
const formatCPF = (cpf) => {
  return cpf.replace(/[^\d]/g, '');
};

/**
 * Formata telefone removendo caracteres especiais
  @param {string} phone - Telefone a ser formatado
  @returns {string} - Telefone apenas com números
 */
const formatPhone = (phone) => {
  return phone.replace(/[^\d]/g, '');
};

/**
 * Valida se o horário está no formato HH:MM
  @param {string} time - Horário a ser validado
  @returns {boolean} - true se válido
 */
const validateTime = (time) => {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
};

/**
 * Valida se a data está no formato YYYY-MM-DD
  @param {string} date - Data a ser validada
  @returns {boolean} - true se válido
 */
const validateDateFormat = (date) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
};

module.exports = {
  validateCPF,
  validateEmail,
  validatePhone,
  validateCRM,
  validateBirthDate,
  validatePassword,
  formatCPF,
  formatPhone,
  validateTime,
  validateDateFormat,
};