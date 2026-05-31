// ============================================================================
// APP ROUTES - Configuración de todas las rutas
// ============================================================================

import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

// Páginas públicas
import Home from '../pages/public/Home/Home';
import Login from '../pages/public/Login/Login';
import Register from '../pages/public/Register/Register';
import QuienesSomos from '../pages/public/QuienesSomos/QuienesSomos';
import Contacto from '../pages/public/Contacto/Contacto';
import TerminosCondiciones from '../pages/public/TerminosCondiciones/TerminosCondiciones';

// Páginas de cliente
import AgendarCita from '../pages/cliente/AgendarCita/AgendarCita';
import MiPerfil from '../pages/cliente/MiPerfil/MiPerfil';

// Layout para Admin/Mecánico
import MainLayout from '../components/layout/MainLayout/MainLayout';

// Páginas de Taller (Admin/Mecánico)
import MiPerfilTaller from '../pages/taller/MiPerfilTaller/MiPerfilTaller';
import RecepcionVehiculo from '../pages/taller/RecepcionVehiculo/RecepcionVehiculo';
import RecepcionLaboratorio from '../pages/taller/RecepcionLaboratorio/RecepcionLaboratorio';
import Cotizaciones from '../pages/taller/Cotizaciones/Cotizaciones';
import DiagnosticoTecnico from '../pages/taller/DiagnosticoTecnico/DiagnosticoTecnico'
import OrdenesTrabajoList from '../pages/taller/OrdenesTrabajoList/OrdenesTrabajoList'
import KanbanTareas from '../pages/taller/KanbanTareas/KanbanTareas'
import GestionUsuarios from '../pages/taller/GestionUsuarios/GestionUsuarios'
import KPIsTaller from '../pages/taller/KPIsTaller/KPIsTaller'
import ConfiguracionTaller from '../pages/taller/ConfiguracionTaller/ConfiguracionTaller'
import ControlCitas from '../pages/taller/ControlCitas/ControlCitas'

const AppRoutes = () => {
  return (
    <Routes>
      {/* ==================== RUTAS PÚBLICAS ==================== */}
      
      {/* Home - Redirige automáticamente si es admin/mecánico */}
      <Route path="/" element={<Home />} />

      {/* Login */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Register */}
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Agendar Cita - No requiere PublicRoute porque maneja auth internamente */}
      <Route path="/agendar-cita" element={<AgendarCita />} />

      {/* Páginas informativas públicas */}
      <Route path="/quienes-somos" element={<QuienesSomos />} />
      <Route path="/contacto" element={<Contacto />} />
      <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />

      {/* ==================== RUTAS PRIVADAS - TALLER ==================== */}
      
      {/* Rutas del Taller - Admin y Mecánico */}
      <Route
        path="/taller"
        element={
          <PrivateRoute allowedRoles={['admin', 'mecanico']}>
            <MainLayout />
          </PrivateRoute>
        }
      >
        {/* Solo Admin */}
        <Route path="recepcion-vehiculo" element={
          <PrivateRoute allowedRoles={['admin']}><RecepcionVehiculo /></PrivateRoute>
        } />
        <Route path="recepcion-laboratorio" element={
          <PrivateRoute allowedRoles={['admin']}><RecepcionLaboratorio /></PrivateRoute>
        } />
        <Route path="cotizaciones" element={
          <PrivateRoute allowedRoles={['admin']}><Cotizaciones /></PrivateRoute>
        } />
        <Route path="ordenes" element={
          <PrivateRoute allowedRoles={['admin']}><OrdenesTrabajoList /></PrivateRoute>
        } />
        <Route path="usuarios" element={
          <PrivateRoute allowedRoles={['admin']}><GestionUsuarios /></PrivateRoute>
        } />
        <Route path="citas" element={
          <PrivateRoute allowedRoles={['admin']}><ControlCitas /></PrivateRoute>
        } />
        <Route path="kpis" element={
          <PrivateRoute allowedRoles={['admin']}><KPIsTaller /></PrivateRoute>
        } />
        <Route path="configuracion" element={
          <PrivateRoute allowedRoles={['admin']}><ConfiguracionTaller /></PrivateRoute>
        } />

        {/* Admin y Mecánico */}
        <Route path="diagnostico-tecnico" element={<DiagnosticoTecnico />} />
        <Route path="kanban" element={<KanbanTareas />} />
        <Route path="mi-perfil" element={<MiPerfilTaller />} />

        {/* Redirect /taller según rol */}
        <Route index element={
          <PrivateRoute allowedRoles={['admin']}>
            <Navigate to="/taller/kpis" replace />
          </PrivateRoute>
        } />
      </Route>

      {/* ==================== RUTAS PRIVADAS - CLIENTE ==================== */}
      
      {/* Mi Perfil */}
      <Route
        path="/mi-perfil"
        element={
          <PrivateRoute>
            <MiPerfil />
          </PrivateRoute>
        }
      />

      {/* ==================== 404 - NOT FOUND ==================== */}
      <Route
        path="*"
        element={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h1 style={{ fontSize: '4rem', fontWeight: '700', color: '#0066CC' }}>404</h1>
            <p style={{ fontSize: '1.5rem', color: '#6B7280' }}>Página no encontrada</p>
            <a href="/" style={{ 
              padding: '0.75rem 1.5rem', 
              backgroundColor: '#0066CC', 
              color: 'white', 
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              marginTop: '1rem'
            }}>
              Volver al inicio
            </a>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;