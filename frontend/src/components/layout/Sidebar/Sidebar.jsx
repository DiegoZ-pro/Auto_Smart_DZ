// ============================================================================
// SIDEBAR - ADMIN/MECÁNICO
// ============================================================================

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Car, 
  FlaskConical, 
  Wrench,
  FileText, 
  DollarSign, 
  LayoutDashboard,
  Brain,
  Scan,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Menú según rol
  const menuItems = {
    admin: [
      { icon: BarChart3, label: 'KPIs Taller', path: '/taller/kpis' },
      { icon: Car, label: 'Recepción Vehículo', path: '/taller/recepcion-vehiculo' },
      { icon: FlaskConical, label: 'Recepción Laboratorio', path: '/taller/recepcion-laboratorio' },
      { icon: Wrench, label: 'Diagnóstico Técnico', path: '/taller/diagnostico-tecnico' },
      { icon: FileText, label: 'Cotizaciones', path: '/taller/cotizaciones' },
      { icon: FileText, label: 'Órdenes de Trabajo', path: '/taller/ordenes' },
      { icon: LayoutDashboard, label: 'Kanban de Tareas', path: '/taller/kanban' },
      { icon: Brain, label: 'Diagnóstico con IA', path: '/taller/diagnostico-ia' },
      { icon: Scan, label: 'Escaneo 3D', path: '/taller/escaneo-3d' },
      { icon: Calendar, label: 'Control de Citas', path: '/taller/citas' },
      { icon: Users, label: 'Gestión de Usuarios', path: '/taller/usuarios' },
      { icon: Settings, label: 'Configuración Taller', path: '/taller/configuracion' },
    ],
    mecanico: [
      { icon: Wrench, label: 'Diagnóstico Técnico', path: '/taller/diagnostico-tecnico' },
      { icon: LayoutDashboard, label: 'Kanban de Tareas', path: '/taller/kanban' },
      { icon: Brain, label: 'Diagnóstico con IA', path: '/taller/diagnostico-ia' },
      { icon: Scan, label: 'Escaneo 3D', path: '/taller/escaneo-3d' },
    ]
  };

  const currentMenu = menuItems[user?.rol] || [];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className={styles.mobileToggle}
        onClick={toggleMobileSidebar}
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className={styles.mobileOverlay}
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isMobileOpen ? styles.mobileOpen : ''}`}
      >
        {/* Header */}
        <div className={styles.sidebarHeader}>
          {!isCollapsed && <h2 className={styles.sidebarTitle}>Menú Taller</h2>}
          <button 
            className={styles.toggleBtn}
            onClick={toggleSidebar}
            aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className={styles.menu}>
          {currentMenu.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => 
                `${styles.menuItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => setIsMobileOpen(false)}
            >
              <item.icon size={20} className={styles.menuIcon} />
              {!isCollapsed && <span className={styles.menuLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;