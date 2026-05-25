import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isLoading } = useAuth()

  // Enquanto carrega, mostra tela de loading
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '24px'
      }}>
        <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    )
  }

  // Se não está logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Se tem roles específicas, verifica permissão
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '16px'
      }}>
        <h1>⛔ Acesso Negado</h1>
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    )
  }

  // Se passou por todas as verificações, renderiza o componente
  return children
}