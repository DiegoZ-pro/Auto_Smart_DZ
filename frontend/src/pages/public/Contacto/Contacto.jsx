import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, CheckCircle } from 'lucide-react';
import Navbar from '../../../components/layout/Navbar/Navbar';
import Footer from '../../../components/layout/Footer/Footer';
import styles from './Contacto.module.css';

const Contacto = () => {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEnviado(true);
      setForm({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' });
    }, 1200);
  };

  return (
    <>
      <Navbar />
      <main className={styles.page}>

        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroTag}>Contáctanos</span>
            <h1 className={styles.heroTitle}>¿Cómo podemos ayudarte?</h1>
            <p className={styles.heroSubtitle}>
              Estamos disponibles para responder tus preguntas, agendar tu cita o atender
              cualquier consulta sobre tu vehículo. No dudes en escribirnos.
            </p>
          </div>
        </section>

        {/* Contenido principal */}
        <section className={styles.main}>
          <div className={styles.container}>
            <div className={styles.grid}>

              {/* Info de contacto */}
              <div className={styles.infoCol}>
                <h2 className={styles.infoTitle}>Información de Contacto</h2>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}><MapPin size={22} /></div>
                  <div>
                    <p className={styles.infoLabel}>Dirección</p>
                    <p className={styles.infoValue}>Av. Principal 123, Cochabamba, Bolivia</p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}><Phone size={22} /></div>
                  <div>
                    <p className={styles.infoLabel}>Teléfono</p>
                    <a href="tel:+59167522948" className={styles.infoLink}>+591 67522948</a>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}><Mail size={22} /></div>
                  <div>
                    <p className={styles.infoLabel}>Correo Electrónico</p>
                    <a href="mailto:info@frenocentro.bo" className={styles.infoLink}>info@frenocentro.bo</a>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}><Clock size={22} /></div>
                  <div>
                    <p className={styles.infoLabel}>Horario de Atención</p>
                    <p className={styles.infoValue}>Lun–Vie: 08:00 – 18:30</p>
                    <p className={styles.infoValue}>Sábados: 08:00 – 15:30</p>
                    <p className={styles.infoValue}>Domingos: Cerrado</p>
                  </div>
                </div>

                <a
                  href="https://wa.me/59167522948"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappBtn}
                >
                  <MessageCircle size={20} />
                  Escribir por WhatsApp
                </a>
              </div>

              {/* Formulario */}
              <div className={styles.formCol}>
                {enviado ? (
                  <div className={styles.successCard}>
                    <CheckCircle size={56} className={styles.successIcon} />
                    <h3 className={styles.successTitle}>¡Mensaje enviado!</h3>
                    <p className={styles.successText}>
                      Gracias por contactarnos. Nos comunicaremos contigo a la brevedad posible.
                    </p>
                    <button className={styles.successBtn} onClick={() => setEnviado(false)}>
                      Enviar otro mensaje
                    </button>
                  </div>
                ) : (
                  <form className={styles.form} onSubmit={handleSubmit}>
                    <h2 className={styles.formTitle}>Envíanos un Mensaje</h2>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Nombre completo *</label>
                        <input
                          type="text"
                          name="nombre"
                          value={form.nombre}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="Tu nombre"
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Correo electrónico *</label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="tu@correo.com"
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Teléfono</label>
                        <input
                          type="tel"
                          name="telefono"
                          value={form.telefono}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="+591 XXXXXXXX"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Asunto *</label>
                        <select
                          name="asunto"
                          value={form.asunto}
                          onChange={handleChange}
                          className={styles.select}
                          required
                        >
                          <option value="">Selecciona un asunto</option>
                          <option value="consulta">Consulta general</option>
                          <option value="cita">Agendar cita</option>
                          <option value="presupuesto">Solicitar presupuesto</option>
                          <option value="reclamo">Reclamo / Sugerencia</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Mensaje *</label>
                      <textarea
                        name="mensaje"
                        value={form.mensaje}
                        onChange={handleChange}
                        className={styles.textarea}
                        placeholder="Describe en qué podemos ayudarte..."
                        rows={5}
                        required
                      />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                      {loading ? 'Enviando...' : 'Enviar Mensaje'}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
};

export default Contacto;
