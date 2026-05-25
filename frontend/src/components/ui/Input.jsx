import './Input.css'

export default function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  label,
  className = '',
  ...props
}) {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`input ${error ? 'input-error' : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'input-error' : undefined}
        {...props}
      />

      {error && (
        <span id="input-error" className="input-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}