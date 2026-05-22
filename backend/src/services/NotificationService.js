const AppError = require('../utils/AppError');
const notificationRepository = require('../repositories/NotificationRepository');
const appointmentRepository = require('../repositories/AppointmentRepository');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const env = require('../config/env');

class NotificationService {
  constructor() {
    // Configurar Nodemailer (Email)
    this.emailTransporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: false,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });

    // Configurar Twilio (SMS e WhatsApp)
    // Só inicializa se tiver credenciais válidas (começa com AC)
    if (
      env.TWILIO_ACCOUNT_SID && 
      env.TWILIO_AUTH_TOKEN &&
      env.TWILIO_ACCOUNT_SID.startsWith('AC')
    ) {
      this.twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    } else {
      console.log('⚠️  Twilio não configurado. SMS e WhatsApp desabilitados.');
    }
  }

  /**
    Criar notificação (sem enviar)
    @param {string} appointmentId - ID da consulta
    @param {string} type - Tipo de notificação (EMAIL, SMS, WHATSAPP)
    @returns {Promise<Object>} - Notificação criada
   */
  async create(appointmentId, type) {
    // Validar tipo
    const validTypes = ['EMAIL', 'SMS', 'WHATSAPP'];
    if (!validTypes.includes(type)) {
      throw new AppError(`Tipo inválido. Use: ${validTypes.join(', ')}`, 400);
    }

    // Verificar se consulta existe
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new AppError('Consulta não encontrada', 404);
    }

    // Verificar se já existe notificação deste tipo para esta consulta
    const existing = await notificationRepository.findByAppointmentAndType(appointmentId, type);
    if (existing) {
      throw new AppError('Notificação já existe para esta consulta', 400);
    }

    // Criar notificação
    const notification = await notificationRepository.create({
      appointmentId,
      type,
      status: 'PENDING',
    });

    return notification;
  }

  /**
    Enviar email
    @param {Object} notification - Notificação com dados da consulta
    @returns {Promise<void>}
   */
  async sendEmail(notification) {
    const { appointment } = notification;
    const patientEmail = appointment.patient.user.email;
    const patientName = appointment.patient.name;
    const doctorName = appointment.doctor.name;
    const doctorSpecialty = appointment.doctor.specialty;

    // Formatar data e hora
    const appointmentDate = new Date(appointment.appointmentDate);
    const dateFormatted = appointmentDate.toLocaleDateString('pt-BR');
    const appointmentTime = appointment.appointmentTime.toISOString().substring(11, 16);

    // Montar email
    const subject = 'Lembrete de Consulta - Clínica System';
    const html = `
      <h2>Lembrete de Consulta</h2>
      <p>Olá <strong>${patientName}</strong>,</p>
      <p>Este é um lembrete da sua consulta agendada:</p>
      <ul>
        <li><strong>Médico:</strong> ${doctorName}</li>
        <li><strong>Especialidade:</strong> ${doctorSpecialty}</li>
        <li><strong>Data:</strong> ${dateFormatted}</li>
        <li><strong>Horário:</strong> ${appointmentTime}</li>
      </ul>
      <p>Por favor, chegue com 15 minutos de antecedência.</p>
      <p>Em caso de imprevistos, entre em contato com antecedência mínima de 2 dias.</p>
      <br>
      <p>Atenciosamente,<br>Clínica System</p>
    `;

    try {
      await this.emailTransporter.sendMail({
        from: env.EMAIL_FROM,
        to: patientEmail,
        subject,
        html,
      });

      // Marcar como enviado
      await notificationRepository.markAsSent(notification.id);
    } catch (error) {
      // Marcar como falha
      await notificationRepository.markAsFailed(notification.id, error.message);
      throw error;
    }
  }

  /**
   * Enviar SMS
    @param {Object} notification - Notificação com dados da consulta
    @returns {Promise<void>}
   */
  async sendSMS(notification) {
    if (!this.twilioClient) {
      throw new AppError('Serviço de SMS não configurado', 500);
    }

    const { appointment } = notification;
    const patientPhone = appointment.patient.phone;
    const patientName = appointment.patient.name;
    const doctorName = appointment.doctor.name;

    // Formatar data e hora
    const appointmentDate = new Date(appointment.appointmentDate);
    const dateFormatted = appointmentDate.toLocaleDateString('pt-BR');
    const appointmentTime = appointment.appointmentTime.toISOString().substring(11, 16);

    // Montar mensagem
    const message = `Olá ${patientName}! Lembrete: consulta com ${doctorName} em ${dateFormatted} às ${appointmentTime}. Chegue com 15min de antecedência. Clínica System`;

    try {
      await this.twilioClient.messages.create({
        body: message,
        from: env.TWILIO_PHONE_NUMBER,
        to: `+55${patientPhone}`,
      });

      // Marcar como enviado
      await notificationRepository.markAsSent(notification.id);
    } catch (error) {
      // Marcar como falha
      await notificationRepository.markAsFailed(notification.id, error.message);
      throw error;
    }
  }

  /**
   * Enviar WhatsApp
    @param {Object} notification - Notificação com dados da consulta
    @returns {Promise<void>}
   */
  async sendWhatsApp(notification) {
    if (!this.twilioClient) {
      throw new AppError('Serviço de WhatsApp não configurado', 500);
    }

    const { appointment } = notification;
    const patientPhone = appointment.patient.phone;
    const patientName = appointment.patient.name;
    const doctorName = appointment.doctor.name;
    const doctorSpecialty = appointment.doctor.specialty;

    // Formatar data e hora
    const appointmentDate = new Date(appointment.appointmentDate);
    const dateFormatted = appointmentDate.toLocaleDateString('pt-BR');
    const appointmentTime = appointment.appointmentTime.toISOString().substring(11, 16);

    // Montar mensagem
    const message = `
    *Lembrete de Consulta* 🏥

    Olá *${patientName}*!

    Você tem uma consulta agendada:

    👨‍⚕️ *Médico:* ${doctorName}
    🩺 *Especialidade:* ${doctorSpecialty}
    📅 *Data:* ${dateFormatted}
    🕐 *Horário:* ${appointmentTime}

    ⏰ Por favor, chegue com 15 minutos de antecedência.

    _Clínica System_
        `.trim();

    try {
      await this.twilioClient.messages.create({
        body: message,
        from: env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:+55${patientPhone}`,
      });

      // Marcar como enviado
      await notificationRepository.markAsSent(notification.id);
    } catch (error) {
      // Marcar como falha
      await notificationRepository.markAsFailed(notification.id, error.message);
      throw error;
    }
  }

  /**
    Processar notificação (envia de acordo com o tipo)
    @param {string} notificationId - ID da notificação
    @returns {Promise<void>}
   */
  async process(notificationId) {
    const notification = await notificationRepository.findById(notificationId);

    if (!notification) {
      throw new AppError('Notificação não encontrada', 404);
    }

    if (notification.status === 'SENT') {
      throw new AppError('Notificação já foi enviada', 400);
    }

    // Enviar de acordo com o tipo
    switch (notification.type) {
      case 'EMAIL':
        await this.sendEmail(notification);
        break;
      case 'SMS':
        await this.sendSMS(notification);
        break;
      case 'WHATSAPP':
        await this.sendWhatsApp(notification);
        break;
      default:
        throw new AppError('Tipo de notificação inválido', 400);
    }
  }

  /**
    Processar todas as notificações pendentes
    @returns {Promise<Object>} - Resultado do processamento
   */
  async processPending() {
    const pending = await notificationRepository.findPending();

    const results = {
      total: pending.length,
      sent: 0,
      failed: 0,
      errors: [],
    };

    for (const notification of pending) {
      try {
        await this.process(notification.id);
        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          notificationId: notification.id,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
    Criar e enviar notificações para consultas de amanhã
    @returns {Promise<Object>} - Resultado do processamento
   */
  async sendTomorrowReminders() {
    // Buscar consultas de amanhã
    const appointments = await appointmentRepository.findTomorrow();

    const results = {
      total: appointments.length,
      created: 0,
      sent: 0,
      failed: 0,
      errors: [],
    };

    for (const appointment of appointments) {
      try {
        // Criar notificação de cada tipo (se ainda não existir)
        const types = ['EMAIL', 'SMS', 'WHATSAPP'];

        for (const type of types) {
          try {
            // Verificar se já existe
            const existing = await notificationRepository.findByAppointmentAndType(
              appointment.id,
              type
            );

            if (!existing) {
              // Criar notificação
              const notification = await notificationRepository.create({
                appointmentId: appointment.id,
                type,
                status: 'PENDING',
              });

              results.created++;

              // Enviar imediatamente
              await this.process(notification.id);
              results.sent++;
            }
          } catch (error) {
            results.failed++;
            results.errors.push({
              appointmentId: appointment.id,
              type,
              error: error.message,
            });
          }
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          appointmentId: appointment.id,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
    Listar notificações
    @param {Object} filters - Filtros opcionais
    @returns {Promise<Array>} - Lista de notificações
   */
  async findAll(filters = {}) {
    return await notificationRepository.findAll(filters);
  }

  /**
   * Deletar notificações antigas
    @param {number} daysOld - Dias atrás (padrão 30)
    @returns {Promise<Object>} - Resultado da operação
   */
  async deleteOld(daysOld = 30) {
    return await notificationRepository.deleteOld(daysOld);
  }
}

module.exports = new NotificationService();