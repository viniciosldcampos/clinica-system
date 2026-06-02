import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../styles/Login.css'
import logo from '../logo.png'

export default function Login() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Limpar erro do campo quando o usuário digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Limpar erro da API
    if (apiError) {
      setApiError('')
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    if (!validateForm()) {
      return
    }

    const result = await login(formData.email, formData.password)

    if (result.success) {
      // Login bem-sucedido - redirecionar para dashboard
      navigate('/dashboard')
    } else {
      // Erro no login
      setApiError(result.error || 'Email ou senha incorretos')
    }
  }

  // Preencher com credenciais de teste (apenas desenvolvimento)
  const fillTestCredentials = (role) => {
    const credentials = {
      admin: { email: 'admin@clinica.com', password: 'senha123' },
      doctor: { email: 'dr.silva@clinica.com', password: 'senha123' },
      patient: { email: 'carlos@email.com', password: 'senha123' },
    }

    setFormData({
      ...formData,
      email: credentials[role].email,
      password: credentials[role].password,
    })
  }

  return (
    <div className="login-page">
      <div className="login-container">

        {/* LEFT SIDE */}
        <div className="login-left">

          <div className="blur-circle top"></div>
          <div className="blur-circle bottom"></div>

          <div className="left-content">
            <div className="logo-area">
              <img src={logo} alt="HealthCare Pro" className="logo-icon" />
            </div>

            <div className="hero-content">
              <span className="hero-badge">
                Plataforma Administrativa
              </span>

              <h2 className="hero-title">
                Gestão moderna para clínicas inteligentes.
              </h2>

              <p className="hero-description">
                Controle consultas, médicos, pacientes e relatórios em um único sistema profissional.
              </p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>+2.4k</h3>
              <p>Consultas realizadas</p>
            </div>

            <div className="stat-card">
              <h3>98%</h3>
              <p>Satisfação pacientes</p>
            </div>

            <div className="stat-card">
              <h3>24h</h3>
              <p>Monitoramento em tempo real</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right">
          <div className="form-container">

            <div className="form-header">
              <h2>Bem-vindo 👋</h2>

              <p>
                Acesse sua conta administrativa.
              </p>
            </div>

            {/* Erro da API */}
            {apiError && (
              <div className="api-error" role="alert">
                <span className="error-icon">⚠️</span>
                {apiError}
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  disabled={isLoading}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />

                {errors.email && (
                  <span id="email-error" className="field-error" role="alert">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="password">Senha</label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  disabled={isLoading}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />

                {errors.password && (
                  <span id="password-error" className="field-error" role="alert">
                    {errors.password}
                  </span>
                )}
              </div>

              <div className="form-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  Lembrar-me
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  disabled={isLoading}
                >
                  Esqueci minha senha
                </button>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Entrando...
                  </>
                ) : (
                  'Entrar no sistema'
                )}
              </button>
            </form>

            {/* Credenciais de teste (apenas desenvolvimento) */}
            <div className="test-credentials">
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                💡 Credenciais de teste:
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => fillTestCredentials('admin')}
                  className="test-btn"
                  disabled={isLoading}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillTestCredentials('doctor')}
                  className="test-btn"
                  disabled={isLoading}
                >
                  Médico
                </button>
              </div>
            </div>

            <div className="divider">
              <div></div>
              <span>OU</span>
              <div></div>
            </div>

            <button className="google-button" disabled={isLoading}>
              Entrar com Google
            </button>

            <div className="security-card">
              <div className="security-icon">
                i
              </div>

              <div>
                <h4>Ambiente Seguro</h4>
                <p>Todas as informações dos pacientes são protegidas com criptografia e autenticação segura.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}