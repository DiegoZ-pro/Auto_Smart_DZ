// ============================================================================
// COMPONENTE ALERT - Alertas y mensajes visibles
// ============================================================================

import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import styles from './Alert.module.css';

const Alert = ({ 
  type = 'error', 
  message, 
  title,
  onClose,
  className = '' 
}) => {
  if (!message) return null;

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const Icon = icons[type] || icons.error;

  return (
    <div className={`${styles.alert} ${styles[type]} ${className}`}>
      <div className={styles.iconWrapper}>
        <Icon className={styles.icon} size={22} />
      </div>
      
      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.message}>{message}</div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Cerrar alerta"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default Alert;