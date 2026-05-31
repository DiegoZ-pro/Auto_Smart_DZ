// ============================================================================
// HOME - PÁGINA PRINCIPAL PÚBLICA
// ============================================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Wrench, Calendar, Shield, ArrowRight, Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/layout/Navbar/Navbar';
import Footer from '../../../components/layout/Footer/Footer';
import styles from './Home.module.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Redirigir automáticamente si es admin o mecánico
  useEffect(() => {
    if (user?.rol === 'admin') {
      navigate('/taller/kpis', { replace: true });
    } else if (user?.rol === 'mecanico') {
      navigate('/taller/diagnostico-tecnico', { replace: true });
    }
  }, [user, navigate]);

  const slides = [
    {
      title: 'Tecnología de Punta',
      subtitle: 'para su Vehículo',
      description: 'Diagnóstico preciso y reparaciones con equipos de última generación.',
      cta: 'Servicio Taller',
      link: '/login',
      backgroundImage: '/images/heroes/hero-1.jpg'
    },
    {
      title: 'Repuestos Originales',
      subtitle: 'y de Calidad',
      description: 'Contamos con las mejores marcas del mercado automotriz.',
      cta: 'Ver Catálogo',
      link: '/login',
      backgroundImage: '/images/heroes/hero-2.jpg'
    },
    {
      title: 'Atención Personalizada',
      subtitle: 'para cada Cliente',
      description: 'Nuestro equipo está comprometido con tu satisfacción.',
      cta: 'Agendar Cita',
      link: '/agendar-cita',
      backgroundImage: '/images/heroes/hero-3.jpg'
    }
  ];

  const brands = [
    {
      name: 'IMCRUZ',
      logo: '/images/brands/logo-imcruz.jpg'
    },
    {
      name: 'Toyosa S.A.',
      logo: '/images/brands/logo-toyosa.jpg'
    },
    {
      name: 'Taiyo Motors',
      logo: '/images/brands/logo-taiyo.png'
    },
    {
      name: 'Mitsubishi',
      logo: '/images/brands/logo-mitsubishi.png'
    },
    {
      name: 'Ford',
      logo: '/images/brands/logo-ford.png'
    }
  ];

  const aboutImage = '/images/about/taller-mecanico.jpg';

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.main}>
        {/* ================================================================
            HERO SECTION - CAROUSEL
            ================================================================ */}
        <section 
          className={styles.hero}
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${slides[currentSlide].backgroundImage}')`
          }}
        >
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              {slides[currentSlide].title}{' '}
              <span className={styles.heroHighlight}>
                {slides[currentSlide].subtitle}
              </span>
            </h1>
            <p className={styles.heroDescription}>
              {slides[currentSlide].description}
            </p>
            <Link to={slides[currentSlide].link} className={styles.heroCTA}>
              <Wrench size={20} />
              {slides[currentSlide].cta}
            </Link>
          </div>

          {/* Carousel Controls */}
          <button 
            onClick={prevSlide} 
            className={`${styles.carouselButton} ${styles.carouselButtonLeft}`}
            aria-label="Anterior"
          >
            <ChevronLeft size={32} />
          </button>

          <button 
            onClick={nextSlide} 
            className={`${styles.carouselButton} ${styles.carouselButtonRight}`}
            aria-label="Siguiente"
          >
            <ChevronRight size={32} />
          </button>

          {/* Carousel Indicators */}
          <div className={styles.carouselIndicators}>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`${styles.indicator} ${
                  index === currentSlide ? styles.indicatorActive : ''
                }`}
                aria-label={`Ir a slide ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* ================================================================
            MARCAS CON LAS QUE TRABAJAMOS
            ================================================================ */}
        <section className={styles.brandsSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>
              Marcas <span className={styles.titleHighlight}>con las que Trabajamos</span>
            </h2>
            <div className={styles.brandsGrid}>
              {brands.map((brand, index) => (
                <div key={index} className={styles.brandCard}>
                  <img 
                    src={brand.logo} 
                    alt={brand.name}
                    className={styles.brandLogo}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            QUIÉNES SOMOS
            ================================================================ */}
        <section className={styles.aboutSection}>
          <div className={styles.container}>
            <div className={styles.aboutGrid}>
              <div className={styles.aboutText}>
                <h2 className={styles.aboutTitle}>Quiénes Somos</h2>
                <p className={styles.aboutDescription}>
                  Fundada en <strong>2025</strong>, Auto Smart se ha consolidado como líder en Cochabamba en la importación y comercialización de repuestos para sistemas de frenos y direcciones hidráulicas, además de ofrecer servicios especializados de taller.
                </p>
                <div className={styles.aboutItem}>
                  <strong>Misión:</strong> Brindar soluciones integrales y confiables para la seguridad y rendimiento vehicular, superando las expectativas de nuestros clientes con productos de calidad y servicio experto.
                </div>
                <div className={styles.aboutItem}>
                  <strong>Visión:</strong> Ser la empresa referente a nivel nacional en sistemas de frenos y dirección, reconocida por nuestra innovación, profesionalismo y compromiso con la satisfacción del cliente.
                </div>
                <div className={styles.aboutItem}>
                  <strong>Valores:</strong> Honestidad, Calidad, Responsabilidad, Innovación y Pasión por el Servicio.
                </div>
                <Link to="/quienes-somos" className={styles.aboutButton}>
                  <Users size={20} />
                  Nuestro Equipo
                </Link>
              </div>

              <div className={styles.aboutImage}>
                <img 
                  src={aboutImage} 
                  alt="Mecánico trabajando - AutoSmart"
                  className={styles.aboutImageReal}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            CALIDAD Y CONFIANZA GARANTIZADA
            ================================================================ */}
        <section className={styles.qualitySection}>
          <div className={styles.qualityContent}>
            <Shield size={64} className={styles.qualityIcon} />
            <h2 className={styles.qualityTitle}>Calidad y Confianza Garantizada</h2>
            <p className={styles.qualityDescription}>
              En Auto Smart, nos comprometemos con la excelencia. Utilizamos repuestos de alta calidad y contamos con técnicos especializados para asegurar el óptimo rendimiento y seguridad de su vehículo.
            </p>
            <Link to="/contacto" className={styles.qualityButton}>
              Contáctanos
            </Link>
          </div>
        </section>

        {/* ================================================================
            NUESTROS SERVICIOS DESTACADOS
            ================================================================ */}
        <section className={styles.servicesSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>
              Nuestros <span className={styles.titleHighlight}>Servicios</span> Destacados
            </h2>
            
            <div className={styles.servicesGrid}>
              {/* Servicio 1: Servicios de Taller */}
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon}>
                  <Wrench size={32} />
                </div>
                <h3 className={styles.serviceTitle}>Servicios de Taller</h3>
                <p className={styles.serviceDescription}>
                  Reparación de direcciones hidráulicas, frenos y mantenimiento general para vehículos medianos y grandes.
                </p>
                <Link to="/login" className={styles.serviceButton}>
                  Gestionar Taller
                  <ArrowRight size={18} />
                </Link>
              </div>

              {/* Servicio 2: Agendamiento de Citas */}
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon}>
                  <Calendar size={32} />
                </div>
                <h3 className={styles.serviceTitle}>Agendamiento de Citas</h3>
                <p className={styles.serviceDescription}>
                  Reserve su cita para servicios de taller de forma rápida y sencilla. Reciba recordatorios automáticos.
                </p>
                <Link to="/agendar-cita" className={styles.serviceButton}>
                  Agendar Ahora
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;