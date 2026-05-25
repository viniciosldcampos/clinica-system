// API
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333/api'

// Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
}

// Status de Consultas
export const APPOINTMENT_STATUS = {
  AGENDADA: 'Agendada',
  CONFIRMADA: 'Confirmada',
  EM_ANDAMENTO: 'Em andamento',
  REALIZADA: 'Realizada',
  CANCELADA: 'Cancelada',
  FALTOU: 'Faltou',
}

// Status Badges Mapping
export const STATUS_VARIANTS = {
  'Agendada': 'default',
  'Confirmada': 'success',
  'Em andamento': 'info',
  'Realizada': 'success',
  'Cancelada': 'error',
  'Faltou': 'warning',
  'Pendente': 'warning',
}

// Dias da semana
export const DAYS_OF_WEEK = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
}

// Meses
export const MONTHS = {
  0: 'Janeiro',
  1: 'Fevereiro',
  2: 'Março',
  3: 'Abril',
  4: 'Maio',
  5: 'Junho',
  6: 'Julho',
  7: 'Agosto',
  8: 'Setembro',
  9: 'Outubro',
  10: 'Novembro',
  11: 'Dezembro',
}

// Formato de data padrão
export const DATE_FORMAT = 'DD/MM/YYYY'
export const TIME_FORMAT = 'HH:mm'
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm'

// Validações
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 50,
  CPF_LENGTH: 11,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 11,
}

// Mensagens
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login realizado com sucesso!',
    LOGOUT: 'Logout realizado com sucesso!',
    SAVE: 'Salvo com sucesso!',
    DELETE: 'Deletado com sucesso!',
    UPDATE: 'Atualizado com sucesso!',
  },
  ERROR: {
    GENERIC: 'Ocorreu um erro. Tente novamente.',
    LOGIN: 'Email ou senha incorretos.',
    NETWORK: 'Erro de conexão. Verifique sua internet.',
    UNAUTHORIZED: 'Você não tem permissão para acessar.',
    NOT_FOUND: 'Não encontrado.',
  },
}