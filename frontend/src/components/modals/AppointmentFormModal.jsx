import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import './AppointmentFormModal.css'

export default function AppointmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  appointment = null,
  doctors = [],
  patients = [],
  isLoading = false,
  userRole = 'ADMIN',
}) {
  const isEditing = !!appointment

  const [formData, setFormData] = useState({
    doctorId: '',
    patientId: '',
    appointmentDateStart: '',
    appointmentDateEnd: '',
    notes: '',
  })

  const [errors, setErrors] = useState({})
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)

  // Preencher form ao editar
  useEffect(() => {
    if (appointment) {
      const startDate = appointment.appointmentDate
        ? new Date(appointment.appointmentDate).toISOString().slice(0, 16)
        : ''

      const endDate = appointment.appointmentDateEnd
        ? new Date(appointment.appointmentDateEnd).toISOString().slice(0, 16)
        : ''

      setFormData({
        doctorId: appointment.doctorId || '',
        patientId: appointment.patientId || '',
        appointmentDateStart: startDate,
        appointmentDateEnd: endDate,
        notes: appointment.notes || '',
      })

      const doctor = doctors.find(d => d.id === appointment.doctorId)
      const patient = patients.find(p => p.id === appointment.patientId)
      setSelectedDoctor(doctor)
      setSelectedPatient(patient)
    } else {
      setFormData({
        doctorId: '',
        patientId: '',
        appointmentDateStart: '',
        appointmentDateEnd: '',
        notes: '',
      })
      setSelectedDoctor(null)
      setSelectedPatient(null)
    }
    setErrors({})
  }, [appointment, isOpen, doctors, patients])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Atualizar doctor selecionado
    if (name === 'doctorId') {
      const doctor = doctors.find(d => d.id === value)
      setSelectedDoctor(doctor)
    }

    // Atualizar patient selecionado
    if (name === 'patientId') {
      const patient = patients.find(p => p.id === value)
      setSelectedPatient(patient)
    }

    // Auto-calcular data/hora de fim ao selecionar data/hora de início
    if (name === 'appointmentDateStart' && value && !formData.appointmentDateEnd) {
      const startDate = new Date(value)
      const endDate = new Date(startDate.getTime() + 20 * 60000) // 20 minutos
      const endDateISO = endDate.toISOString().slice(0, 16)
      setFormData(prev => ({ ...prev, appointmentDateEnd: endDateISO }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Médico
    if (!formData.doctorId) {
      newErrors.doctorId = 'Selecione um médico'
    }

    // Paciente
    if (!formData.patientId) {
      newErrors.patientId = 'Selecione um paciente'
    }

    // Data/Hora de início
    if (!formData.appointmentDateStart) {
      newErrors.appointmentDateStart = 'Selecione data e hora de entrada'
    }

    // Data/Hora de fim
    if (!formData.appointmentDateEnd) {
      newErrors.appointmentDateEnd = 'Selecione data e hora de saída'
    }

    // Validações de data/hora
    if (formData.appointmentDateStart && formData.appointmentDateEnd) {
      const startDate = new Date(formData.appointmentDateStart)
      const endDate = new Date(formData.appointmentDateEnd)
      const now = new Date()

      // Validar se início é no futuro
      if (startDate <= now) {
        newErrors.appointmentDateStart = 'A consulta deve ser agendada para o futuro'
      }

      // Validar se fim é após início
      if (endDate <= startDate) {
        newErrors.appointmentDateEnd = 'A hora de saída deve ser após a hora de entrada'
      }

      // Validar se é dias úteis (seg-sáb)
      const dayOfWeek = startDate.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        newErrors.appointmentDateStart = 'Consultas apenas de segunda a sábado'
      }

      // Validar horário (8h-18h)
      const hourStart = startDate.getHours()
      const hourEnd = endDate.getHours()
      if (hourStart < 8 || hourEnd > 18) {
        newErrors.appointmentDateStart = 'Horário deve ser entre 8h e 18h'
      }

      // Validar antecedência (mínimo 7 dias)
      const minDate = new Date()
      minDate.setDate(minDate.getDate() + 7)
      minDate.setHours(0, 0, 0, 0)

      if (!isEditing && startDate < minDate) {
        newErrors.appointmentDateStart = 'Consulta deve ser agendada com mínimo 7 dias de antecedência'
      }
    }

    // Observações
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Observações não podem exceder 500 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const dataToSend = {
      doctorId: formData.doctorId,
      patientId: formData.patientId,
      appointmentDate: new Date(formData.appointmentDateStart).toISOString(),
      appointmentDateEnd: new Date(formData.appointmentDateEnd).toISOString(),
      notes: formData.notes.trim() || null,
    }

    onSubmit(dataToSend)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-modal-title"
    >
      <div className="modal-content form-modal">
        {/* Header */}
        <div className="modal-header">
          <h2 id="form-modal-title">
            {isEditing ? '📅 Reagendar Consulta' : '➕ Agendar Consulta'}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-grid">
            {/* Médico */}
            <div className="col-span-2">
              <label className="form-label">Médico</label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className={`form-select ${errors.doctorId ? 'error' : ''}`}
                disabled={isLoading}
              >
                <option value="">Selecione um médico</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
              {errors.doctorId && <span className="form-error">{errors.doctorId}</span>}
            </div>

            {/* Paciente */}
            <div className="col-span-2">
              <label className="form-label">Paciente</label>
              <select
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className={`form-select ${errors.patientId ? 'error' : ''}`}
                disabled={isLoading}
              >
                <option value="">Selecione um paciente</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - ID: {patient.id}
                  </option>
                ))}
              </select>
              {errors.patientId && <span className="form-error">{errors.patientId}</span>}
            </div>

            {/* Informações do Paciente Selecionado */}
            {selectedPatient && (
              <div className="patient-info-display col-span-2">
                <div className="info-item">
                  <span className="label">Nome:</span>
                  <span className="value">{selectedPatient.name}</span>
                </div>
                <div className="info-item">
                  <span className="label">ID:</span>
                  <span className="value">{selectedPatient.id}</span>
                </div>
              </div>
            )}

            {/* Especialidade (somente leitura) */}
            {selectedDoctor && (
              <div className="col-span-2">
                <label className="form-label">Especialidade</label>
                <input
                  type="text"
                  value={selectedDoctor.specialty}
                  disabled
                  className="form-input"
                />
              </div>
            )}

            {/* Data e Hora de Entrada */}
            <div>
              <label className="form-label">Data e Hora de Entrada</label>
              <input
                type="datetime-local"
                name="appointmentDateStart"
                value={formData.appointmentDateStart}
                onChange={handleChange}
                className={`form-input ${errors.appointmentDateStart ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.appointmentDateStart && (
                <span className="form-error">{errors.appointmentDateStart}</span>
              )}
            </div>

            {/* Data e Hora de Saída */}
            <div>
              <label className="form-label">Data e Hora de Saída</label>
              <input
                type="datetime-local"
                name="appointmentDateEnd"
                value={formData.appointmentDateEnd}
                onChange={handleChange}
                className={`form-input ${errors.appointmentDateEnd ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.appointmentDateEnd && (
                <span className="form-error">{errors.appointmentDateEnd}</span>
              )}
            </div>

            {/* Duração da Consulta (informativa) */}
            {formData.appointmentDateStart && formData.appointmentDateEnd && (
              <div className="col-span-2">
                <div className="duration-info">
                  ⏱️ Duração: {calculateDuration(formData.appointmentDateStart, formData.appointmentDateEnd)}
                </div>
              </div>
            )}

            {/* Observações */}
            <div className="col-span-2">
              <label className="form-label">Observações (opcional)</label>
              <textarea
                name="notes"
                placeholder="Descreva qualquer informação adicional sobre a consulta..."
                value={formData.notes}
                onChange={handleChange}
                maxLength={500}
                rows={4}
                className="form-textarea"
                disabled={isLoading}
              />
              <div className="char-count">
                {formData.notes.length}/500
              </div>
              {errors.notes && <span className="form-error">{errors.notes}</span>}
            </div>
          </div>

          {/* Botões */}
          <div className="modal-footer">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isEditing ? 'Salvar Alterações' : 'Agendar Consulta'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Função auxiliar para calcular duração
function calculateDuration(startStr, endStr) {
  if (!startStr || !endStr) return '0 min'

  const start = new Date(startStr)
  const end = new Date(endStr)
  const diffMs = end - start
  const diffMins = Math.round(diffMs / 60000)

  if (diffMins < 60) {
    return `${diffMins} min`
  }

  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60

  return `${hours}h ${mins > 0 ? mins + 'min' : ''}`
}
