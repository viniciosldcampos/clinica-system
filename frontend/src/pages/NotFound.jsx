import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '24px',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '120px', margin: 0 }}>404</h1>
      <h2 style={{ fontSize: '32px', margin: 0 }}>Página não encontrada</h2>
      <p style={{ color: '#64748b', maxWidth: '400px' }}>
        A página que você está procurando não existe ou foi movida.
      </p>
      <Button onClick={() => navigate('/dashboard')}>
        Voltar ao Dashboard
      </Button>
    </div>
  )
}