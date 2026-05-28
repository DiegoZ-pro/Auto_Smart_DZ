// ============================================================================
// COMPONENTE BUTTON - Botón reutilizable
// ============================================================================

import styles from './Button.module.css';

const Button = ({ 
  children, 
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon: Icon,
  ...props 
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className={styles.spinner}></span>
      )}
      {Icon && !loading && (
        <Icon className={styles.icon} size={20} />
      )}
      {children}
    </button>
  );
};

export default Button;