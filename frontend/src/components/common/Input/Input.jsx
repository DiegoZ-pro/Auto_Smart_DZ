// ============================================================================
// COMPONENTE INPUT - Input reutilizable
// ============================================================================

import styles from './Input.module.css';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  disabled = false,
  required = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const inputClasses = [
    styles.input,
    Icon && styles.withIcon,
    error && styles.error,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.inputWrapper}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {Icon && <Icon size={16} className={styles.labelIcon} />}
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputContainer}>
        {Icon && !label && (
          <Icon className={styles.icon} size={20} />
        )}
        
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          {...props}
        />
      </div>
      
      {error && (
        <span className={styles.errorMessage}>{error}</span>
      )}
    </div>
  );
};

export default Input;