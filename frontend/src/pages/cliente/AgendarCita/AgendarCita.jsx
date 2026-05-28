// ============================================================================
// AGENDAR CITA - PÁGINA PÚBLICA (requiere autenticación)
// ============================================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/layout/Navbar/Navbar';
import Footer from '../../../components/layout/Footer/Footer';
import Alert from '../../../components/common/Alert/Alert';
import citasService from '../../../services/citasService';
import styles from './AgendarCita.module.css';

const AgendarCita = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estado del calendario
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Estado de alert
  const [alert, setAlert] = useState(null);
  
  // Estado de loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombreCompleto: user?.nombreCompleto || '',
    telefono: '',
    email: user?.email || '',
    marcaVehiculo: '',
    modeloVehiculo: '',
    motivoCita: {
      revisionFreno: false,
      problemaDireccion: false,
      mantenimientoGeneral: false,
      diagnosticoComputarizado: false
    },
    detallesAdicionales: ''
  });

  // Horarios disponibles
  const horariosDisponibles = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
  ];

  // Funciones del calendario
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (day) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(selected);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      motivoCita: {
        ...formData.motivoCita,
        [name]: checked
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      setAlert({
        type: 'warning',
        message: 'Por favor seleccione una fecha y hora para su cita'
      });
      
      // Scroll hacia arriba para ver la alerta
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validar que se haya seleccionado al menos un motivo
    const motivosSeleccionados = Object.values(formData.motivoCita).some(val => val === true);
    if (!motivosSeleccionados) {
      setAlert({
        type: 'warning',
        message: 'Por favor seleccione al menos un motivo para la cita'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar los datos para enviar al backend
      const citaData = {
        nombre_cliente: formData.nombreCompleto,
        telefono_cliente: formData.telefono,
        email_cliente: formData.email || null,
        marca_vehiculo: formData.marcaVehiculo,
        modelo_vehiculo: formData.modeloVehiculo,
        
        // Convertir el objeto de motivos a un array de strings para JSON
        motivo: Object.entries(formData.motivoCita)
          .filter(([key, value]) => value === true)
          .map(([key]) => {
            const motivos = {
              revisionFreno: 'Revisión de Frenos',
              problemaDireccion: 'Problema de Dirección',
              mantenimientoGeneral: 'Mantenimiento General',
              diagnosticoComputarizado: 'Diagnóstico Computarizado'
            };
            return motivos[key];
          }),
        
        detalles: formData.detallesAdicionales || null,
        
        // Formatear fecha como YYYY-MM-DD
        fecha_cita: selectedDate.toISOString().split('T')[0],
        
        // Formatear hora como HH:MM:SS
        hora_cita: selectedTime + ':00'
      };

      const response = await citasService.crearCita(citaData);

      // Mostrar alerta de éxito
      setAlert({
        type: 'success',
        message: `¡Cita agendada exitosamente para el ${selectedDate.toLocaleDateString()} a las ${selectedTime}!`
      });

      // Scroll hacia arriba para ver la alerta
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Limpiar formulario después de 3 segundos
      setTimeout(() => {
        setSelectedDate(null);
        setSelectedTime(null);
        setFormData({
          nombreCompleto: user?.nombreCompleto || '',
          telefono: user?.telefono || '',
          email: user?.email || '',
          marcaVehiculo: '',
          modeloVehiculo: '',
          motivoCita: {
            revisionFreno: false,
            problemaDireccion: false,
            mantenimientoGeneral: false,
            diagnosticoComputarizado: false
          },
          detallesAdicionales: ''
        });
        setAlert(null);
      }, 3000);

    } catch (error) {
      console.error('[AgendarCita] Cita creation failed:', error.message);
      
      // Mostrar mensaje de error
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al agendar la cita. Por favor intente nuevamente.';
      
      setAlert({
        type: 'error',
        message: errorMessage
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Si NO hay usuario, mostrar aviso de autenticación
  if (!user) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        
        <div className={styles.authRequired}>
          <div className={styles.authCard}>
            <Calendar size={64} className={styles.authIcon} />
            <h2 className={styles.authTitle}>Inicie Sesión para Agendar una Cita</h2>
            <p className={styles.authDescription}>
              Para agendar una cita en nuestro taller, necesita tener una cuenta e iniciar sesión.
            </p>
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.loginBtn}>
                Iniciar Sesión
              </Link>
              <Link to="/register" className={styles.registerBtn}>
                Crear Cuenta
              </Link>
            </div>
            <Link to="/" className={styles.backLink}>
              ← Volver al inicio
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Si SÍ hay usuario, mostrar formulario completo
  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.main}>
        {/* Header */}
        <section className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <Calendar size={40} />
            </div>
            <div>
              <h1 className={styles.headerTitle}>Agendar Cita</h1>
              <p className={styles.headerSubtitle}>
                Reserve su cita para nuestros servicios de taller de forma fácil y rápida.
              </p>
            </div>
          </div>
        </section>

        {/* Alert */}
        {alert && (
          <div className={styles.alertContainer}>
            <div className={styles.alertWrapper}>
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <section className={styles.content}>
          <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.grid}>
              {/* Columna Izquierda - Formulario */}
              <div className={styles.formColumn}>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Información de Contacto y Vehículo</h2>
                  <p className={styles.cardSubtitle}>Complete sus datos y los de su vehículo</p>

                  {/* Nombre y Teléfono */}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Nombre Completo*</label>
                      <input
                        type="text"
                        name="nombreCompleto"
                        value={formData.nombreCompleto}
                        onChange={handleInputChange}
                        placeholder="Ej: Juan Pérez"
                        className={styles.input}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Teléfono*</label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        placeholder="Ej: 75123456"
                        className={styles.input}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Correo Electrónico (Opcional)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="ejemplo@correo.com"
                      className={styles.input}
                    />
                  </div>

                  {/* Marca y Modelo */}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Marca del Vehículo*</label>
                      <input
                        type="text"
                        name="marcaVehiculo"
                        value={formData.marcaVehiculo}
                        onChange={handleInputChange}
                        placeholder="Ej: Toyota"
                        className={styles.input}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Modelo del Vehículo*</label>
                      <input
                        type="text"
                        name="modeloVehiculo"
                        value={formData.modeloVehiculo}
                        onChange={handleInputChange}
                        placeholder="Ej: Corolla 2020"
                        className={styles.input}
                        required
                      />
                    </div>
                  </div>

                  {/* Motivo de la Cita */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Motivo de la Cita*</label>
                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          name="revisionFreno"
                          checked={formData.motivoCita.revisionFreno}
                          onChange={handleCheckboxChange}
                        />
                        <span>Revisión de Frenos</span>
                      </label>

                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          name="problemaDireccion"
                          checked={formData.motivoCita.problemaDireccion}
                          onChange={handleCheckboxChange}
                        />
                        <span>Problema de Dirección</span>
                      </label>

                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          name="mantenimientoGeneral"
                          checked={formData.motivoCita.mantenimientoGeneral}
                          onChange={handleCheckboxChange}
                        />
                        <span>Mantenimiento General</span>
                      </label>

                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          name="diagnosticoComputarizado"
                          checked={formData.motivoCita.diagnosticoComputarizado}
                          onChange={handleCheckboxChange}
                        />
                        <span>Diagnóstico Computarizado</span>
                      </label>
                    </div>
                  </div>

                  {/* Detalles adicionales */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Otro motivo o detalles adicionales...</label>
                    <textarea
                      name="detallesAdicionales"
                      value={formData.detallesAdicionales}
                      onChange={handleInputChange}
                      placeholder="Otro motivo o detalles adicionales..."
                      className={styles.textarea}
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Columna Derecha - Calendario y Horarios */}
              <div className={styles.calendarColumn}>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Seleccione Fecha y Hora</h2>
                  <p className={styles.cardSubtitle}>Elija un horario disponible para su cita</p>

                  {/* Calendario */}
                  <div className={styles.calendar}>
                    <div className={styles.calendarHeader}>
                      <button
                        type="button"
                        onClick={previousMonth}
                        className={styles.calendarNav}
                      >
                        <ChevronLeft size={20} />
                      </button>

                      <h3 className={styles.calendarMonth}>
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                      </h3>

                      <button
                        type="button"
                        onClick={nextMonth}
                        className={styles.calendarNav}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>

                    <div className={styles.calendarDays}>
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <div key={day} className={styles.dayName}>{day}</div>
                      ))}
                    </div>

                    <div className={styles.calendarGrid}>
                      {/* Empty cells for days before month starts */}
                      {[...Array(startingDayOfWeek)].map((_, index) => (
                        <div key={`empty-${index}`} className={styles.emptyDay} />
                      ))}

                      {/* Days of the month */}
                      {[...Array(daysInMonth)].map((_, index) => {
                        const day = index + 1;
                        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                        const isSelected = selectedDate && 
                          date.toDateString() === selectedDate.toDateString();

                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDateSelect(day)}
                            className={`${styles.day} ${isSelected ? styles.daySelected : ''}`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Horarios Disponibles */}
                  <div className={styles.timeSection}>
                    <label className={styles.label}>
                      <Clock size={18} />
                      Hora Disponible*
                    </label>
                    <div className={styles.timeGrid}>
                      {horariosDisponibles.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`${styles.timeSlot} ${
                            selectedTime === time ? styles.timeSlotSelected : ''
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Botón Confirmar */}
                  <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    <Calendar size={20} />
                    {isSubmitting ? 'Agendando...' : 'Confirmar Cita'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AgendarCita;