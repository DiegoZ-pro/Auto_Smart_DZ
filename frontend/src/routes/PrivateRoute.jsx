// Protege rutas que requieren autenticación y roles específicos

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  // Muestra un spinner mientras se restaura la sesión
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div className="animate-spin" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTopColor: '#0066CC',
          borderRadius: '50%'
        }}></div>
      </div>
    );
  }

  // Si no hay sesión activa, manda al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si la ruta tiene restricción de roles, redirige según el rol del usuario
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
    if (user.rol === 'cliente') return <Navigate to="/" replace />;
    if (user.rol === 'mecanico') return <Navigate to="/taller/diagnostico-tecnico" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;