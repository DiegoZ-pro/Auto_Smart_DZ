// ============================================================================
// FOOTER - COMPONENTE PRINCIPAL
// ============================================================================

import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import styles from './Footer.module.css';

const Footer = () => {
  const { user } = useAuth();

  // NO mostrar Footer si el usuario es admin o mecánico
  if (user && (user.rol === 'admin' || user.rol === 'mecanico')) {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Columna 1: Logo y descripción */}
        <div className={styles.column}>
          <div className={styles.logo}>
            <span className={styles.logoText}>AUTO</span>
            <span className={styles.logoRed}>SMART</span>
          </div>
          <p className={styles.description}>
            Especialistas en autopartes y servicios automotrices. Tu seguridad es nuestra prioridad.
          </p>
          <div className={styles.socialLinks}>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialIcon}
              aria-label="YouTube"
            >
              <Youtube size={20} />
            </a>
          </div>
        </div>

        {/* Columna 2: Enlaces Rápidos */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Enlaces Rápidos</h3>
          <ul className={styles.linkList}>
            <li>
              <Link to="/catalogo" className={styles.link}>Catálogo</Link>
            </li>
            <li>
              <Link to="/agendar-cita" className={styles.link}>Agendar Cita</Link>
            </li>
            <li>
              <Link to="/servicios-taller" className={styles.link}>Servicios de Taller</Link>
            </li>
            <li>
              <Link to="/quienes-somos" className={styles.link}>Quiénes Somos</Link>
            </li>
            <li>
              <Link to="/contacto" className={styles.link}>Contacto</Link>
            </li>
          </ul>
        </div>

        {/* Columna 3: Contacto Principal */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Contacto Principal</h3>
          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <MapPin size={18} className={styles.contactIcon} />
              <div>
                <p>Av. Principal 123, Cochabamba,</p>
                <p>Bolivia</p>
              </div>
            </li>
            <li className={styles.contactItem}>
              <Phone size={18} className={styles.contactIcon} />
              <a href="https://wa.me/59167522948" className={styles.contactLink}>
                +591 67522948 (WhatsApp)
              </a>
            </li>
            <li className={styles.contactItem}>
              <Mail size={18} className={styles.contactIcon} />
              <a href="mailto:info@frenocentro.bo" className={styles.contactLink}>
                info@frenocentro.bo
              </a>
            </li>
          </ul>
        </div>

        {/* Columna 4: Horario de Atención */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>
            <Clock size={20} className={styles.titleIcon} />
            Horario de Atención
          </h3>
          <ul className={styles.scheduleList}>
            <li className={styles.scheduleItem}>
              <span className={styles.scheduleDay}>Lunes a Viernes:</span>
              <span className={styles.scheduleTime}>08:00 - 18:30</span>
            </li>
            <li className={styles.scheduleItem}>
              <span className={styles.scheduleDay}>Sábados:</span>
              <span className={styles.scheduleTime}>08:00 - 15:30</span>
            </li>
            <li className={styles.scheduleItem}>
              <span className={styles.scheduleDay}>Domingos:</span>
              <span className={styles.scheduleTime}>Cerrado</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className={styles.copyright}>
        <p>© {new Date().getFullYear()} AutoSmart. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;