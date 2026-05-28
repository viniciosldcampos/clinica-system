const env = require('../config/env');

/**
 * Valida formato de data YYYY-MM-DD
 * @param {string} dateString - Data a ser validada
 * @returns {boolean} - true se é válido
 */
const validateDateFormat = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
};

/**
 * Valida formato de hora HH:MM
 * @param {string} timeString - Hora a ser validada
 * @returns {boolean} - true se é válido
 */
const validateTime = (timeString) => {
  const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(timeString);
};

/**
 * Verifica se a data é um dia útil da clínica
 * @param {Date} date - Data a ser verificada
 * @returns {boolean} - true se é dia útil
 */
const isWorkDay = (date) => {
  const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  return env.CLINIC_WORK_DAYS.includes(dayOfWeek);
};

/**
 * Verifica se o horário está dentro do expediente da clínica
 * @param {string} time - Horário no formato HH:MM
 * @returns {boolean} - true se está no expediente
 */
const isWithinWorkHours = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;

  const [openHours, openMinutes] = env.CLINIC_OPEN_TIME.split(':').map(Number);
  const openTimeInMinutes = openHours * 60 + openMinutes;

  const [closeHours, closeMinutes] = env.CLINIC_CLOSE_TIME.split(':').map(Number);
  const closeTimeInMinutes = closeHours * 60 + closeMinutes;

  return timeInMinutes >= openTimeInMinutes && timeInMinutes < closeTimeInMinutes;
};

/**
 * Adiciona dias a uma data
 * @param {Date} date - Data base
 * @param {number} days - Número de dias a adicionar
 * @returns {Date} - Nova data
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Calcula a diferença em dias entre duas datas
 * @param {Date} date1 - Primeira data
 * @param {Date} date2 - Segunda data
 * @returns {number} - Diferença em dias
 */
const diffInDays = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000; // milissegundos em um dia
  const diffInMillis = Math.abs(date1 - date2);
  return Math.floor(diffInMillis / oneDay);
};

/**
 * Verifica se a data está no passado
 * @param {Date} date - Data a ser verificada
 * @returns {boolean} - true se está no passado
 */
const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

/**
 * Verifica se a data é hoje
 * @param {Date} date - Data a ser verificada
 * @returns {boolean} - true se é hoje
 */
const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Formata data para YYYY-MM-DD
 * @param {Date} date - Data a ser formatada
 * @returns {string} - Data formatada
 */
const formatDateToString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formata horário para HH:MM
 * @param {Date} date - Data/hora a ser formatada
 * @returns {string} - Horário formatado
 */
const formatTimeToString = (date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Converte string de data para objeto Date
 * @param {string} dateString - Data no formato YYYY-MM-DD
 * @returns {Date} - Objeto Date
 */
const parseDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Verifica se pode agendar com a antecedência mínima
 * @param {Date} appointmentDate - Data da consulta
 * @returns {boolean} - true se pode agendar
 */
const canScheduleWithMinAdvance = (appointmentDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const appointment = new Date(appointmentDate);
  appointment.setHours(0, 0, 0, 0);
  
  const diff = diffInDays(appointment, today);
  return diff >= env.MIN_DAYS_ADVANCE;
};

/**
 * Verifica se pode cancelar com a antecedência mínima
 * @param {Date} appointmentDate - Data da consulta
 * @returns {boolean} - true se pode cancelar
 */
const canCancelWithMinAdvance = (appointmentDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const appointment = new Date(appointmentDate);
  appointment.setHours(0, 0, 0, 0);
  
  const diff = diffInDays(appointment, today);
  return diff >= env.MIN_DAYS_CANCEL;
};

/**
 * Adiciona minutos a um horário
 * @param {string} time - Horário no formato HH:MM
 * @param {number} minutes - Minutos a adicionar
 * @returns {string} - Novo horário no formato HH:MM
 */
const addMinutesToTime = (time, minutes) => {
  const [hours, mins] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes, 0, 0);
  return formatTimeToString(date);
};

/**
 * Verifica se dois horários têm conflito
 * @param {string} time1Start - Horário inicial 1
 * @param {number} duration1 - Duração 1 em minutos
 * @param {string} time2Start - Horário inicial 2
 * @param {number} duration2 - Duração 2 em minutos
 * @returns {boolean} - true se há conflito
 */
const hasTimeConflict = (time1Start, duration1, time2Start, duration2) => {
  const time1End = addMinutesToTime(time1Start, duration1);
  const time2End = addMinutesToTime(time2Start, duration2);

  const start1 = timeToMinutes(time1Start);
  const end1 = timeToMinutes(time1End);
  const start2 = timeToMinutes(time2Start);
  const end2 = timeToMinutes(time2End);

  return (start1 < end2 && end1 > start2);
};

/**
 * Converte horário HH:MM para minutos
 * @param {string} time - Horário no formato HH:MM
 * @returns {number} - Total de minutos
 */
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

module.exports = {
  validateDateFormat,
  validateTime,
  isWorkDay,
  isWithinWorkHours,
  addDays,
  diffInDays,
  isPastDate,
  isToday,
  formatDateToString,
  formatTimeToString,
  parseDate,
  canScheduleWithMinAdvance,
  canCancelWithMinAdvance,
  addMinutesToTime,
  hasTimeConflict,
  timeToMinutes,
};