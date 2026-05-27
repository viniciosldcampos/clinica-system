import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import './PatientFormModal.css'

export default function PatientFormModal({
  isOpen,
  onClose,
  onSubmit,
  patient = null, // Se null = criar, se objeto = editar
  isLoading = false,
}) {
  const isEditing = !!patient

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    cpf: '',
    phone: '',
    birthDate: '',
    address: '',
  })

  const [errors, setErrors] = useState({})

  // Preencher form ao editar
  useEffect(() => {
    if (patient) {
      setFormData({
        email: patient.user?.email || '',
        password: '', // Não preencher senha ao editar
        name: patient.name || '',
        cpf: patient.cpf || '',
        phone: patient.phone || '',
        birthDate: patient.birthDate ? patient.birthDate.split('T')[0] : '',
        address: patient.address || '',
      })
    } else {
      // Limpar form ao criar
      setFormData({
        email: '',
        password: '',
        name: '',
        cpf: '',
        phone: '',
        birthDate: '',
        address: '',
      })
    }
    setErrors({})
  }, [patient, isOpen])

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

    // CPF
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório'
    } else {
      const cpfNumbers = formData.cpf.replace(/\D/g, '')
      if (cpfNumbers.length !== 11) {
        newErrors.cpf = 'CPF deve ter 11 dígitos'
      }
    }

    // Telefone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    } else {
      const phoneNumbers = formData.phone.replace(/\D/g, '')
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        newErrors.phone = 'Telefone inválido (10 ou 11 dígitos)'
      }
    }

    // Data de nascimento
    if (!formData.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória'
    } else {
      const birthDate = new Date(formData.birthDate)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()

      if (age < 18) {
        newErrors.birthDate = 'Paciente deve ter no mínimo 18 anos'
      }

      if (birthDate > today) {
        newErrors.birthDate = 'Data de nascimento não pode ser no futuro'
      }
    }

    // Endereço
    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório'
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'Endereço deve ter no mínimo 5 caracteres'
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
      cpf: formData.cpf.replace(/\D/g, ''), // Apenas números
      phone: formData.phone.replace(/\D/g, ''), // Apenas números
      birthDate: formData.birthDate,
      address: formData.address.trim(),
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
            {isEditing ? '✏️ Editar Paciente' : '➕ Novo Paciente'}
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
        <form onSubmit={handleSubmit} className="patient-form">
          <div className="form-grid">
            {/* Nome */}
            <Input
              label="Nome completo"
              name="name"
              type="text"
              placeholder="João Silva"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              disabled={isLoading}
              className="col-span-2"
            />

            {/* Email */}
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="joao@email.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              disabled={isLoading}
              className="col-span-2"
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
                className="col-span-2"
              />
            )}

            {/* CPF */}
            <Input
              label="CPF"
              name="cpf"
              type="text"
              placeholder="12345678901"
              value={formData.cpf}
              onChange={handleChange}
              error={errors.cpf}
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

            {/* Data de Nascimento */}
            <Input
              label="Data de Nascimento"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              error={errors.birthDate}
              disabled={isLoading}
              className="col-span-2"
            />

            {/* Endereço */}
            <Input
              label="Endereço"
              name="address"
              type="text"
              placeholder="Rua das Flores, 123 - São Paulo"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              disabled={isLoading}
              className="col-span-2"
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
              {isEditing ? 'Salvar Alterações' : 'Criar Paciente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}