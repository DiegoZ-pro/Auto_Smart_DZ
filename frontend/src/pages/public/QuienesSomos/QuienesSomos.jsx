import { Shield, Award, Users, Wrench, Clock, CheckCircle, Target, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar/Navbar';
import Footer from '../../../components/layout/Footer/Footer';
import styles from './QuienesSomos.module.css';

const valores = [
  { icon: <Shield size={32} />, titulo: 'Confianza', descripcion: 'Trabajamos con total transparencia en cada diagnóstico y presupuesto.' },
  { icon: <Award size={32} />, titulo: 'Excelencia', descripcion: 'Aplicamos los más altos estándares de calidad en cada servicio que brindamos.' },
  { icon: <Wrench size={32} />, titulo: 'Experiencia', descripcion: 'Más de 10 años atendiendo vehículos con técnicos certificados.' },
  { icon: <Clock size={32} />, titulo: 'Puntualidad', descripcion: 'Respetamos tu tiempo. Cumplimos los plazos de entrega acordados.' },
  { icon: <Users size={32} />, titulo: 'Atención Personalizada', descripcion: 'Cada cliente recibe una atención única adaptada a sus necesidades.' },
  { icon: <CheckCircle size={32} />, titulo: 'Garantía', descripcion: 'Todos nuestros servicios cuentan con garantía de mano de obra.' },
];

const QuienesSomos = () => {
  return (
    <>
      <Navbar />
      <main className={styles.page}>

        {/* Hero */}
        <section
          className={styles.hero}
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('/images/heroes/hero-3.jpg')`
          }}
        >
          <div className={styles.heroContent}>
            <span className={styles.heroTag}>Sobre Nosotros</span>
            <h1 className={styles.heroTitle}>
              El taller que cuida tu vehículo{' '}
              <span className={styles.heroHighlight}>como si fuera el nuestro</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Somos AutoSmart, un taller automotriz especializado en diagnóstico, mantenimiento
              y reparación de vehículos con más de una década de experiencia en Cochabamba, Bolivia.
            </p>
            <div className={styles.heroBadges}>
              <div className={styles.heroBadge}>
                <span className={styles.badgeNumber}>10+</span>
                <span className={styles.badgeLabel}>Años de experiencia</span>
              </div>
              <div className={styles.heroBadge}>
                <span className={styles.badgeNumber}>5,000+</span>
                <span className={styles.badgeLabel}>Vehículos atendidos</span>
              </div>
              <div className={styles.heroBadge}>
                <span className={styles.badgeNumber}>98%</span>
                <span className={styles.badgeLabel}>Clientes satisfechos</span>
              </div>
            </div>
            <Link to="/agendar-cita" className={styles.heroBtn}>Agendar una Cita</Link>
          </div>
        </section>

        {/* Historia */}
        <section className={styles.historia}>
          <div className={styles.container}>
            <div className={styles.historiaGrid}>
              <div className={styles.historiaText}>
                <h2 className={styles.sectionTitle}>Nuestra Historia</h2>
                <p>
                  AutoSmart nació en 2014 con una visión clara: modernizar la atención en talleres automotrices
                  y ofrecer un servicio honesto, transparente y de alta calidad. Lo que comenzó como un pequeño
                  taller familiar en Cochabamba, hoy es un centro automotriz equipado con tecnología de diagnóstico
                  de última generación.
                </p>
                <p>
                  A lo largo de los años hemos atendido miles de vehículos de distintas marcas y modelos,
                  consolidándonos como uno de los talleres de mayor confianza en la región. Nuestro equipo
                  de técnicos certificados se capacita continuamente para estar al día con las últimas
                  tecnologías del sector automotriz.
                </p>
                <p>
                  Hoy, con AutoSmart puedes agendar tu cita en línea, recibir diagnósticos digitales
                  y hacer seguimiento del estado de tu vehículo en tiempo real.
                </p>
              </div>
              <div className={styles.historiaStats}>
                <div className={styles.statCard}>
                  <span className={styles.statNumber}>5,000+</span>
                  <span className={styles.statLabel}>Vehículos atendidos</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNumber}>10+</span>
                  <span className={styles.statLabel}>Años en el mercado</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNumber}>98%</span>
                  <span className={styles.statLabel}>Clientes satisfechos</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNumber}>8</span>
                  <span className={styles.statLabel}>Técnicos especializados</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Misión y Visión */}
        <section className={styles.misionVision}>
          <div className={styles.container}>
            <div className={styles.mvGrid}>
              <div className={styles.mvCard}>
                <div className={styles.mvIcon}><Target size={40} /></div>
                <h3 className={styles.mvTitle}>Nuestra Misión</h3>
                <p className={styles.mvText}>
                  Brindar servicios automotrices de calidad superior con honestidad, eficiencia y tecnología,
                  asegurando la seguridad y satisfacción de cada cliente que confía en nosotros su vehículo.
                </p>
              </div>
              <div className={styles.mvCard}>
                <div className={styles.mvIcon}><Rocket size={40} /></div>
                <h3 className={styles.mvTitle}>Nuestra Visión</h3>
                <p className={styles.mvText}>
                  Ser el taller automotriz de referencia en Bolivia, reconocido por la excelencia técnica,
                  la innovación digital y el compromiso genuino con el bienestar de nuestros clientes y sus vehículos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className={styles.valoresSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitleCenter}>Nuestros Valores</h2>
            <p className={styles.sectionSubtitle}>
              Estos principios guían cada decisión que tomamos y cada servicio que ofrecemos.
            </p>
            <div className={styles.valoresGrid}>
              {valores.map((v, i) => (
                <div key={i} className={styles.valorCard}>
                  <div className={styles.valorIcon}>{v.icon}</div>
                  <h4 className={styles.valorTitulo}>{v.titulo}</h4>
                  <p className={styles.valorDesc}>{v.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.cta}>
          <div className={styles.container}>
            <h2 className={styles.ctaTitle}>¿Listo para conocernos en persona?</h2>
            <p className={styles.ctaSubtitle}>Visítanos o agenda tu cita en línea. Estamos aquí para ayudarte.</p>
            <div className={styles.ctaButtons}>
              <Link to="/agendar-cita" className={styles.ctaBtnPrimary}>Agendar Cita</Link>
              <Link to="/contacto" className={styles.ctaBtnSecondary}>Contáctanos</Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
};

export default QuienesSomos;
