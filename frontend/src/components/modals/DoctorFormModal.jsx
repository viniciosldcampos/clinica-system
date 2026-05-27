import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import './DoctorFormModal.css'

export default function DoctorFormModal({
  isOpen,
  onClose,
  onSubmit,
  doctor = null, // Se null = criar, se objeto = editar
  isLoading = false,
}) {
  const isEditing = !!doctor

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    crm: '',
    specialty: '',
    phone: '',
  })

  const [errors, setErrors] = useState({})

  // Preencher form ao editar
  useEffect(() => {
    if (doctor) {
      setFormData({
        email: doctor.user?.email || '',
        password: '', // Não preencher senha ao editar
        name: doctor.name || '',
        crm: doctor.crm || '',
        specialty: doctor.specialty || '',
        phone: doctor.phone || '',
      })
    } else {
      // Limpar form ao criar
      setFormData({
        email: '',
        password: '',
        name: '',
        crm: '',
        specialty: '',
        phone: '',
      })
    }
    setErrors({})
  }, [doctor, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    // Senha (apenas ao criar)
    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter no mínimo 6 caracteres'
      }
    }

    // Nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter no mínimo 3 caracteres'
    }

    // CRM
    if (!formData.crm.trim()) {
      newErrors.crm = 'CRM é obrigatório'
    } else if (!/^\d{4,10}$/.test(formData.crm.replace(/\D/g, ''))) {
      newErrors.crm = 'CRM deve ter entre 4 e 10 dígitos'
    }

    // Especialidade
    if (!formData.specialty.trim()) {
      newErrors.specialty = 'Especialidade é obrigatória'
    }

    // Telefone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    } else if (!/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Telefone inválido (ex: 11987654321)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Preparar dados para envio
    const dataToSend = {
      email: formData.email.trim(),
      name: formData.name.trim(),
      crm: formData.crm.trim(),
      specialty: formData.specialty.trim(),
      phone: formData.phone.replace(/\D/g, ''), // Apenas números
    }

    // Adicionar senha apenas ao criar
    if (!isEditing && formData.password) {
      dataToSend.password = formData.password
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
            {isEditing ? '✏️ Editar Médico' : '➕ Novo Médico'}
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
        <form onSubmit={handleSubmit} className="doctor-form">
          <div className="form-grid">
            {/* Nome */}
            <Input
              label="Nome completo"
              name="name"
              type="text"
              placeholder="Dr. João Silva"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              disabled={isLoading}
            />

            {/* Email */}
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="joao.silva@clinica.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              disabled={isLoading}
            />

            {/* Senha (apenas ao criar) */}
            {!isEditing && (
              <Input
                label="Senha"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                disabled={isLoading}
              />
            )}

            {/* CRM */}
            <Input
              label="CRM"
              name="crm"
              type="text"
              placeholder="123456"
              value={formData.crm}
              onChange={handleChange}
              error={errors.crm}
              disabled={isLoading}
            />

            {/* Especialidade */}
            <Input
              label="Especialidade"
              name="specialty"
              type="text"
              placeholder="Cardiologia"
              value={formData.specialty}
              onChange={handleChange}
              error={errors.specialty}
              disabled={isLoading}
            />

            {/* Telefone */}
            <Input
              label="Telefone"
              name="phone"
              type="tel"
              placeholder="11987654321"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              disabled={isLoading}
            />
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
              {isEditing ? 'Salvar Alterações' : 'Criar Médico'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}