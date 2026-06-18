// Ruta pública: redirige al usuario autenticado a su área correspondiente

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Muestra un spinner mientras carga el estado de autenticación
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

  // Si ya tiene sesión activa, no tiene sentido mostrar login o registro
  if (user) {
    if (user.rol === 'admin' || user.rol === 'mecanico') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PublicRoute;