import '../styles/Login.css'

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-container">

        {/* LEFT SIDE */}
        <div className="login-left">

          <div className="blur-circle top"></div>
          <div className="blur-circle bottom"></div>

          <div className="left-content">
            <div className="logo-area">
              <div className="logo-icon">❤️</div>

              <div>
                <h1 className="logo-title">
                  HealthCare Pro
                </h1>

                <p className="logo-subtitle">
                  Sistema Inteligente para Clínicas
                </p>
              </div>
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

            <form className="login-form">
              <div className="input-group">
                <label>Email</label>

                <input
                  type="email"
                  placeholder="Digite seu email"
                />
              </div>

              <div className="input-group">
                <label>Senha</label>

                <input
                  type="password"
                  placeholder="Digite sua senha"
                />
              </div>

              <div className="form-options">
                <label className="remember-option">
                  <input type="checkbox" />
                  Lembrar-me
                </label>

                <button type="button" className="forgot-password">
                  Esqueci minha senha
                </button>
              </div>

              <button type="submit" className="login-button">
                Entrar no sistema
              </button>
            </form>

            <div className="divider">
              <div></div>
              <span>OU</span>
              <div></div>
            </div>

            <button className="google-button">
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