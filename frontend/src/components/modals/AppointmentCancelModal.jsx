import { useState } from 'react'
import Button from '../ui/Button'
import './AppointmentCancelModal.css'

export default function AppointmentCancelModal({
  isOpen,
  onClose,
  onConfirm,
  appointment = null,
  isLoading = false,
}) {
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!reason.trim()) {
      newErrors.reason = 'Motivo do cancelamento é obrigatório'
    } else if (reason.trim().length < 5) {
      newErrors.reason = 'Motivo deve ter no mínimo 5 caracteres'
    } else if (reason.length > 300) {
      newErrors.reason = 'Motivo não pode exceder 300 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleConfirm = () => {
    if (!validateForm()) {
      return
    }

    onConfirm(reason.trim())
    setReason('')
    setErrors({})
  }

  const handleClose = () => {
    setReason('')
    setErrors({})
    onClose()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleClose()
    }
  }

  if (!isOpen || !appointment) return null

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
    >
      <div className="modal-content cancel-modal">
        {/* Ícone */}
        <div className="modal-icon warning">❌</div>

        {/* Título */}
        <h2 id="cancel-modal-title" className="modal-title">
          Cancelar Consulta
        </h2>

        {/* Informações da consulta */}
        <div className="appointment-info">
          <div className="info-row">
            <span className="label">Paciente:</span>
            <span className="value">{appointment.patient?.name}</span>
          </div>
          <div className="info-row">
            <span className="label">Médico:</span>
            <span className="value">{appointment.doctor?.name}</span>
          </div>
          <div className="info-row">
            <span className="label">Data/Hora:</span>
            <span className="value">
              {new Date(appointment.appointmentDate).toLocaleDateString('pt-BR')} às{' '}
              {new Date(appointment.appointmentDate).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Motivo */}
        <div className="form-group">
          <label htmlFor="cancel-reason" className="form-label">
            Motivo do cancelamento
          </label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (errors.reason) {
                setErrors({ ...errors, reason: '' })
              }
            }}
            placeholder="Explique o motivo do cancelamento..."
            maxLength={300}
            rows={4}
            className={`form-textarea ${errors.reason ? 'error' : ''}`}
            disabled={isLoading}
          />
          <div className="char-count">
            {reason.length}/300
          </div>
          {errors.reason && (
            <span className="form-error">{errors.reason}</span>
          )}
        </div>

        {/* Aviso */}
        <div className="cancel-warning">
          ⚠️ Esta ação não pode ser desfeita. A consulta será marcada como cancelada.
        </div>

        {/* Botões */}
        <div className="modal-actions">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Manter Consulta
          </Button>

          <Button
            variant="primary"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Confirmar Cancelamento
          </Button>
        </div>
      </div>
    </div>
  )
}