import './Button.css'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ariaLabel,
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
    >
      {isLoading ? (
        <span className="loading-spinner" aria-hidden="true"></span>
      ) : (
        children
      )}
    </button>
  )
}