// Árbol de rutas de la aplicación

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

// Layout con sidebar para el área de taller
import MainLayout from '../components/layout/MainLayout/MainLayout';

// Páginas del taller
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
import Escaneo3D from '../pages/taller/Escaneo3D/Escaneo3D';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}

      {/* Home: los usuarios autenticados se redirigen según su rol */}
      <Route path="/" element={<Home />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Agendar cita maneja la autenticación internamente */}
      <Route path="/agendar-cita" element={<AgendarCita />} />

      <Route path="/quienes-somos" element={<QuienesSomos />} />
      <Route path="/contacto" element={<Contacto />} />
      <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />

      {/* Rutas privadas del taller — admin y mecánico */}
      <Route
        path="/taller"
        element={
          <PrivateRoute allowedRoles={['admin', 'mecanico']}>
            <MainLayout />
          </PrivateRoute>
        }
      >
        {/* Rutas solo para admin */}
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

        {/* Rutas para admin y mecánico */}
        <Route path="diagnostico-tecnico" element={<DiagnosticoTecnico />} />
        <Route path="escaneo-3d" element={<Escaneo3D />} />
        <Route path="kanban" element={<KanbanTareas />} />
        <Route path="mi-perfil" element={<MiPerfilTaller />} />

        {/* Si accede a /taller sin subruta, redirige según rol */}
        <Route index element={
          <PrivateRoute allowedRoles={['admin']}>
            <Navigate to="/taller/kpis" replace />
          </PrivateRoute>
        } />
      </Route>

      {/* Perfil del cliente */}
      <Route
        path="/mi-perfil"
        element={
          <PrivateRoute>
            <MiPerfil />
          </PrivateRoute>
        }
      />

      {/* Página 404 para rutas inexistentes */}
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