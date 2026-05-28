// ============================================================================
// PUBLIC ROUTE - Redirige a dashboard si ya está autenticado
// ============================================================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Mostrar loading mientras se verifica autenticación
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

  // Si ya está autenticado, redirigir según rol
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