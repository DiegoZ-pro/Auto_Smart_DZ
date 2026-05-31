import { Link } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar/Navbar';
import Footer from '../../../components/layout/Footer/Footer';
import styles from './TerminosCondiciones.module.css';

const secciones = [
  {
    id: '1',
    titulo: '1. Aceptación de los Términos',
    contenido: `Al acceder y utilizar la plataforma AutoSmart (en adelante "el Servicio"), usted acepta estar sujeto a los presentes Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al Servicio. El uso continuado de la plataforma implica la aceptación plena y sin reservas de todas las disposiciones aquí contenidas.`,
  },
  {
    id: '2',
    titulo: '2. Descripción del Servicio',
    contenido: `AutoSmart es una plataforma digital que permite a los usuarios gestionar citas para servicios automotrices, consultar el estado de órdenes de trabajo y comunicarse con el taller. El Servicio está disponible para personas mayores de 18 años o bajo supervisión de un tutor legal. AutoSmart se reserva el derecho de modificar, suspender o discontinuar el Servicio en cualquier momento sin previo aviso.`,
  },
  {
    id: '3',
    titulo: '3. Registro y Cuenta de Usuario',
    contenido: `Para acceder a las funciones privadas del Servicio, el usuario deberá crear una cuenta proporcionando información veraz, completa y actualizada. El usuario es responsable de mantener la confidencialidad de sus credenciales (correo y contraseña) y de todas las actividades que ocurran bajo su cuenta. AutoSmart no será responsable por pérdidas derivadas del uso no autorizado de su cuenta si el usuario no nos ha notificado dicha situación de forma oportuna.`,
  },
  {
    id: '4',
    titulo: '4. Agendamiento de Citas',
    contenido: `Las citas agendadas a través de la plataforma están sujetas a disponibilidad del taller. AutoSmart se esforzará por confirmar o reagendar las citas en el menor tiempo posible. El usuario deberá presentarse en el taller en el horario acordado. En caso de no poder asistir, deberá cancelar la cita con al menos 24 horas de anticipación a través de la plataforma o contactando directamente al taller. Cancelaciones reiteradas sin previo aviso podrán resultar en restricciones de uso del Servicio.`,
  },
  {
    id: '5',
    titulo: '5. Privacidad y Protección de Datos',
    contenido: `AutoSmart recopila y trata datos personales (nombre, correo electrónico, teléfono, información del vehículo) con el fin exclusivo de prestar el Servicio. Los datos no serán compartidos con terceros sin el consentimiento del usuario, salvo obligación legal. El usuario tiene derecho a solicitar la rectificación, eliminación o portabilidad de sus datos personales enviando una solicitud a info@frenocentro.bo. AutoSmart aplica medidas técnicas y organizativas apropiadas para proteger la información almacenada.`,
  },
  {
    id: '6',
    titulo: '6. Propiedad Intelectual',
    contenido: `Todo el contenido disponible en AutoSmart, incluyendo pero no limitado a textos, imágenes, logotipos, íconos, software y diseño, es propiedad de AutoSmart o de sus licenciantes y está protegido por las leyes de propiedad intelectual aplicables. Queda prohibida la reproducción, distribución, modificación o uso comercial de cualquier elemento sin autorización expresa y por escrito de AutoSmart.`,
  },
  {
    id: '7',
    titulo: '7. Limitación de Responsabilidad',
    contenido: `AutoSmart no garantiza que el Servicio sea ininterrumpido, libre de errores o completamente seguro. En la máxima medida permitida por la ley, AutoSmart no será responsable por daños indirectos, incidentales, especiales o consecuentes derivados del uso o la imposibilidad de uso del Servicio. La responsabilidad total de AutoSmart, en cualquier caso, no excederá el monto pagado por el usuario en los últimos tres meses de servicio.`,
  },
  {
    id: '8',
    titulo: '8. Modificaciones a los Términos',
    contenido: `AutoSmart se reserva el derecho de actualizar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en la plataforma. El uso continuado del Servicio tras la publicación de los cambios constituye la aceptación de los nuevos términos. Se recomienda revisar esta página periódicamente para mantenerse informado de cualquier actualización.`,
  },
  {
    id: '9',
    titulo: '9. Ley Aplicable y Jurisdicción',
    contenido: `Estos Términos y Condiciones se rigen por las leyes de la República Plurinacional de Bolivia. Cualquier controversia derivada de los presentes términos será sometida a la jurisdicción de los tribunales competentes de la ciudad de Cochabamba, Bolivia, renunciando las partes a cualquier otro fuero que pudiera corresponderles.`,
  },
  {
    id: '10',
    titulo: '10. Contacto',
    contenido: `Si tiene preguntas, comentarios o solicitudes relacionadas con estos Términos y Condiciones, puede contactarnos a través de los siguientes medios:\n\nCorreo electrónico: info@frenocentro.bo\nTeléfono: +591 67522948\nDirección: Av. Principal 123, Cochabamba, Bolivia`,
  },
];

const TerminosCondiciones = () => {
  return (
    <>
      <Navbar />
      <main className={styles.page}>

        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroTag}>Legal</span>
            <h1 className={styles.heroTitle}>Términos y Condiciones</h1>
            <p className={styles.heroMeta}>
              Última actualización: <strong>30 de mayo de 2026</strong>
            </p>
            <p className={styles.heroSubtitle}>
              Por favor lea detenidamente estos Términos y Condiciones antes de utilizar
              la plataforma AutoSmart. Al acceder al servicio, usted acepta estas condiciones.
            </p>
          </div>
        </section>

        {/* Documento */}
        <section className={styles.docSection}>
          <div className={styles.container}>
            <div className={styles.layout}>

              {/* Índice lateral */}
              <aside className={styles.sidebar}>
                <div className={styles.sidebarCard}>
                  <h3 className={styles.sidebarTitle}>Contenido</h3>
                  <nav>
                    <ul className={styles.sidebarList}>
                      {secciones.map((s) => (
                        <li key={s.id}>
                          <a href={`#seccion-${s.id}`} className={styles.sidebarLink}>
                            {s.titulo}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </aside>

              {/* Contenido */}
              <article className={styles.content}>
                <div className={styles.intro}>
                  <p>
                    Este documento establece los términos legales que rigen el uso de la plataforma
                    AutoSmart. Su aceptación es requisito indispensable para acceder a los servicios ofrecidos.
                    Si tiene dudas, puede contactarnos en{' '}
                    <a href="mailto:info@frenocentro.bo" className={styles.inlineLink}>info@frenocentro.bo</a>.
                  </p>
                </div>

                {secciones.map((s) => (
                  <div key={s.id} id={`seccion-${s.id}`} className={styles.seccion}>
                    <h2 className={styles.seccionTitulo}>{s.titulo}</h2>
                    {s.contenido.split('\n').map((parrafo, i) => (
                      parrafo.trim() ? <p key={i} className={styles.seccionTexto}>{parrafo}</p> : null
                    ))}
                  </div>
                ))}

                <div className={styles.footer}>
                  <p>
                    ¿Tienes preguntas sobre estos términos?{' '}
                    <Link to="/contacto" className={styles.inlineLink}>Contáctanos</Link>.
                  </p>
                </div>
              </article>

            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
};

export default TerminosCondiciones;
