import Button from '../ui/Button'
import './ConfirmModal.css'

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger', // danger, warning, info
  isLoading = false,
}) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose()
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`modal-content confirm-modal ${variant}`}>
        {/* Ícone */}
        <div className={`modal-icon ${variant}`}>
          {variant === 'danger' && '⚠️'}
          {variant === 'warning' && '⚡'}
          {variant === 'info' && 'ℹ️'}
        </div>

        {/* Título */}
        <h2 id="modal-title" className="modal-title">
          {title}
        </h2>

        {/* Mensagem */}
        <p className="modal-message">
          {message}
        </p>

        {/* Botões */}
        <div className="modal-actions">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>

          <Button
            variant={variant === 'danger' ? 'primary' : 'primary'}
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}