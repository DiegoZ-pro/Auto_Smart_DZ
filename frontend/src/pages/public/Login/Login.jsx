// ============================================================================
// PÁGINA DE LOGIN
// ============================================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { validateLoginForm } from '../../../utils/validators';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import Alert from '../../../components/common/Alert/Alert';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setSubmitError('');
    setErrors({});
    
    // Validar formulario
    const validation = validateLoginForm(formData.email, formData.password);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const { rol } = result.user;
      
      if (rol === 'admin') {
        navigate('/taller/kpis');
      } else if (rol === 'mecanico') {
        navigate('/taller/diagnostico-tecnico');
      } else {
        navigate('/');
      }
    } else {
      setSubmitError(result.error || 'Error al iniciar sesión. Intenta nuevamente.');
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        {/* Panel Izquierdo - Formulario */}
        <div className={styles.formPanel}>
          <div className={styles.formContent}>
            {/* Logo */}
            <div className={styles.logo}>
              <span className={styles.logoBlue}>AUTO</span>
              <span className={styles.logoRed}>SMART</span>
            </div>

            {/* Título */}
            <h1 className={styles.title}>Iniciar Sesión</h1>
            <p className={styles.subtitle}>Bienvenido de nuevo</p>

            {submitError && (
              <Alert
                type="error"
                message={submitError}
                onClose={() => setSubmitError('')}
              />
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className={styles.form}>
              <Input
                label="Correo Electrónico"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                error={errors.email}
                icon={Mail}
                required
              />

              <Input
                label="Contraseña"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
                icon={Lock}
                required
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                icon={LogIn}
              >
                Iniciar Sesión
              </Button>
            </form>

            {/* Link a registro */}
            <p className={styles.registerLink}>
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className={styles.link}>
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Panel Derecho - Información */}
        <div className={styles.infoPanel}>
          <div className={styles.infoContent}>
            <h2 className={styles.infoTitle}>
              Sistema de Gestión<br />Automotriz
            </h2>
            <p className={styles.infoText}>
              Gestiona tu taller de manera eficiente con tecnología de punta
            </p>
          </div>
        </div>
      </div>

      {/* Botón flotante de WhatsApp */}
      <a
        href="https://wa.me/59167522948"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappButton}
        aria-label="Contactar por WhatsApp"
      >
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="white"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
};

export default Login;