// ============================================================================
// HEADER - ADMIN/MECÁNICO
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import styles from './Header.module.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [notificationCount] = useState(3); // Temporal - conectar con API después

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleProfile = () => {
    navigate('/taller/mi-perfil');
    setShowUserDropdown(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoAuto}>AUTO</span>
          <span className={styles.logoSmart}>SMART</span>
        </div>

        {/* Right side */}
        <div className={styles.headerRight}>
          {/* Notificaciones */}
          <button className={styles.notificationBtn}>
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className={styles.badge}>{notificationCount}</span>
            )}
          </button>

          {/* User Dropdown */}
          <div className={styles.userDropdown}>
            <button 
              className={styles.userBtn}
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <div className={styles.userAvatar}>
                {user?.nombreCompleto?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className={styles.userName}>
                {user?.nombreCompleto?.split(' ')[0] || 'Usuario'}
              </span>
              <ChevronDown size={16} />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <>
                <div 
                  className={styles.dropdownOverlay}
                  onClick={() => setShowUserDropdown(false)}
                />
                <div className={styles.dropdownMenu}>
                  <button 
                    className={styles.dropdownItem}
                    onClick={handleProfile}
                  >
                    <User size={16} />
                    Mi Perfil
                  </button>
                  <button 
                    className={styles.dropdownItem}
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Cerrar Sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;