// ============================================================================
// NAVBAR PRINCIPAL - DINÁMICO SEGÚN AUTENTICACIÓN
// ============================================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut, Wrench, Calendar, Newspaper, MessageCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  // NO mostrar Navbar si el usuario es admin o mecánico
  if (user && (user.rol === 'admin' || user.rol === 'mecanico')) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    navigate('/');
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate('/mi-perfil');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoBlue}>AUTO</span>
          <span className={styles.logoRed}>SMART</span>
        </Link>

        {/* Navigation Links */}
        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>
            <Wrench size={18} />
            <span>Inicio</span>
          </Link>

          <Link to="/agendar-cita" className={styles.navLink}>
            <Calendar size={18} />
            <span>Agendar Cita</span>
          </Link>

          <Link to="/noticias" className={styles.navLink}>
            <Newspaper size={18} />
            <span>Noticias</span>
          </Link>

          <a 
            href="https://wa.me/59167522948" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.navLink}
          >
            <MessageCircle size={18} />
            <span>WhatsApp</span>
          </a>

          {/* Auth Section */}
          {user ? (
            // Usuario autenticado - Mostrar dropdown
            <div className={styles.userMenu}>
              <button 
                className={styles.userButton}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <User size={18} />
                <span>{user.nombreCompleto || user.email}</span>
                <ChevronDown size={16} className={styles.chevron} />
              </button>

              {showDropdown && (
                <>
                  {/* Overlay para cerrar dropdown al hacer clic afuera */}
                  <div 
                    className={styles.dropdownOverlay}
                    onClick={() => setShowDropdown(false)}
                  />

                  {/* Dropdown Menu */}
                  <div className={styles.dropdown}>
                    <button 
                      className={styles.dropdownItem}
                      onClick={handleProfileClick}
                    >
                      <User size={16} />
                      <span>Mi Perfil</span>
                    </button>

                    <div className={styles.dropdownDivider} />

                    <button 
                      className={styles.dropdownItem}
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            // Usuario NO autenticado - Mostrar "Iniciar Sesión"
            <Link to="/login" className={styles.loginButton}>
              <User size={18} />
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;