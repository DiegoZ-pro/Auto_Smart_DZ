// ============================================================================
// MI PERFIL - DASHBOARD DEL CLIENTE
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Car, Calendar, FileText, BarChart3, 
  Edit2, Save, X, Lock, Mail, Phone, Building, 
  MapPin, CreditCard, Camera, Plus, Trash2,
  Eye, Download, PhoneCall, Clock, CheckCircle,
  XCircle, AlertCircle, Receipt
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/layout/Navbar/Navbar';
import Footer from '../../../components/layout/Footer/Footer';
import Alert from '../../../components/common/Alert/Alert';
import * as authService from '../../../services/authService';
import clientesService from '../../../services/clientesService';
import vehiculosService from '../../../services/vehiculosService';
import citasService from '../../../services/citasService';
import styles from './MiPerfil.module.css';
import { cotizacionesService } from '../../../services/cotizacionesService';

// ─── configuración de badges de cotización ────────────────────────────────────
const COT_ESTADOS = {
  borrador:  { label: 'Borrador',  bg: '#f1f5f9', color: '#64748b' },
  enviada:   { label: 'Enviada',   bg: '#eff6ff', color: '#2563eb' },
  aprobada:  { label: 'Aprobada',  bg: '#f0fdf4', color: '#16a34a' },
  rechazada: { label: 'Rechazada', bg: '#fef2f2', color: '#dc2626' },
  vencida:   { label: 'Vencida',   bg: '#fff7ed', color: '#ea580c' },
}

const MiPerfil = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estado de tabs
  const [activeTab, setActiveTab] = useState('resumen');

  // Estados de datos
  const [clienteData, setClienteData] = useState(null);
  const [stats, setStats] = useState(null);
  const [vehiculos, setVehiculos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [proximaCita, setProximaCita] = useState(null);
  const [ultimaOrden, setUltimaOrden] = useState(null);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [alert, setAlert] = useState(null);

  // Estado de formulario de edición
  const [formData, setFormData] = useState({
    nombre_completo: '',
    telefono: '',
    email: '',
    empresa: '',
    nit_ci: '',
    direccion: '',
    ciudad: ''
  });

  // Estado de cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estado de modal de vehículo
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehicleFormData, setVehicleFormData] = useState({
    marca: '',
    modelo: '',
    anio: '',
    placa: '',
    vin: '',
    color: '',
    kilometraje: '',
    tipo_combustible_id: 1
  });
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Estado de modales de citas
  const [showCitaModal, setShowCitaModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);

  // Estado de modales de órdenes
  const [showOrdenModal, setShowOrdenModal] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState(null);

  // Estado de modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  // Estado de modal de historial de vehículo
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [historialVehiculo, setHistorialVehiculo] = useState([]);

  // Filtros
  const [citasFilter, setCitasFilter] = useState('todas');
  const [ordenesFilter, setOrdenesFilter] = useState('todas');

  // ============================================================================
  // HELPERS
  // ============================================================================

  const parseMotivo = (motivo) => {
    try {
      if (Array.isArray(motivo)) return motivo.join(', ');
      if (typeof motivo === 'string') {
        try {
          const parsed = JSON.parse(motivo);
          return Array.isArray(parsed) ? parsed.join(', ') : motivo;
        } catch { return motivo; }
      }
      return '';
    } catch { return ''; }
  };

  // Badge de estado de cotización
  const renderCotizacionBadge = (estado) => {
    const cfg = COT_ESTADOS[estado] || COT_ESTADOS.borrador;
    return (
      <span style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '20px',
        fontSize: '0.7rem',
        fontWeight: 700,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}33`,
      }}>
        {cfg.label}
      </span>
    );
  };

  // Box de cotización para mostrar en orden card y modal
  const renderCotizacionBox = (orden) => {
  if (!orden?.numero_cotizacion) return null;
  const esEnviada = orden.cotizacion_estado === 'enviada';
 
  return (
    <div className={styles.cotizacionBox}>
      <div className={styles.cotizacionBoxHeader}>
        <Receipt size={14} />
        <span>Cotización disponible</span>
      </div>
      <div className={styles.cotizacionBoxBody}>
        <div className={styles.cotizacionBoxRow}>
          <span className={styles.cotizacionNum}>{orden.numero_cotizacion}</span>
          {renderCotizacionBadge(orden.cotizacion_estado)}
        </div>
        <div className={styles.cotizacionBoxRow}>
          <span className={styles.cotizacionTotal}>
            Total: Bs. {parseFloat(orden.cotizacion_total || 0).toFixed(2)}
          </span>
          {orden.cotizacion_valida_hasta && (
            <span className={styles.cotizacionFecha}>
              Válida hasta: {new Date(orden.cotizacion_valida_hasta).toLocaleDateString('es-BO')}
            </span>
          )}
        </div>
 
        {/* Botones solo cuando la cotización está en estado "enviada" */}
        {esEnviada && (
          <div className={styles.cotizacionAcciones}>
            <button
              className={styles.btnAprobar}
              onClick={(e) => { e.stopPropagation(); handleAprobarCotizacion(orden); }}
            >
              <CheckCircle size={14} />
              Aceptar
            </button>
            <button
              className={styles.btnRechazar}
              onClick={(e) => { e.stopPropagation(); handleRechazarCotizacion(orden); }}
            >
              <XCircle size={14} />
              Rechazar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (user) cargarDatosIniciales();
  }, [user]);

  const cargarDatosIniciales = async () => {
    setIsLoading(true);
    try {
      const clienteResponse = await clientesService.getMyProfile();
      if (clienteResponse.data) {
        const cliente = clienteResponse.data;
        setClienteData(cliente);
        setFormData({
          nombre_completo: cliente.nombre_completo || '',
          telefono: cliente.telefono || '',
          email: cliente.email || '',
          empresa: cliente.empresa || '',
          nit_ci: cliente.nit_ci || '',
          direccion: cliente.direccion || '',
          ciudad: cliente.ciudad || ''
        });
        await cargarDatosTab(activeTab, cliente.id);
      }
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      setAlert({ type: 'error', message: 'Error al cargar datos del perfil' });
    } finally {
      setIsLoading(false);
    }
  };

  const cargarDatosTab = async (tab, clienteId) => {
    try {
      switch (tab) {
        case 'resumen':
          const statsResponse = await clientesService.getEstadisticasCliente(clienteId);
          setStats(statsResponse.data);
          const citasResponse = await citasService.getCitasByCliente(clienteId);
          const citasPendientes = citasResponse.data.filter(c => c.estado_id === 1 || c.estado_id === 2);
          if (citasPendientes.length > 0) setProximaCita(citasPendientes[0]);
          const ordenesResponse = await clientesService.getOrdenesCliente(clienteId);
          if (ordenesResponse.data?.length > 0) setUltimaOrden(ordenesResponse.data[0]);
          break;
        case 'vehiculos':
          const vehiculosResponse = await clientesService.getVehiculosCliente(clienteId);
          setVehiculos(vehiculosResponse.data || []);
          break;
        case 'citas':
          const todasCitasResponse = await citasService.getCitasByCliente(clienteId);
          setCitas(todasCitasResponse.data || []);
          break;
        case 'ordenes':
          const todasOrdenesResponse = await clientesService.getOrdenesCliente(clienteId);
          setOrdenes(todasOrdenesResponse.data || []);
          break;
        default: break;
      }
    } catch (error) {
      console.error(`Error al cargar datos del tab ${tab}:`, error);
    }
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (clienteData) await cargarDatosTab(tab, clienteData.id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setAlert({ type: 'error', message: 'Por favor complete todos los campos de contraseña' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setAlert({ type: 'error', message: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlert({ type: 'error', message: 'Las contraseñas no coinciden' });
      return;
    }
    try {
      await authService.changePassword(passwordData.oldPassword, passwordData.newPassword);
      setAlert({ type: 'success', message: 'Contraseña actualizada exitosamente' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Error al actualizar la contraseña' });
    }
  };

  const handleSaveProfile = async () => {
    try {
      await clientesService.updateCliente(clienteData.id, formData);
      setAlert({ type: 'success', message: 'Perfil actualizado exitosamente' });
      setIsEditMode(false);
      await cargarDatosIniciales();
    } catch (error) {
      setAlert({ type: 'error', message: 'Error al actualizar el perfil' });
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setFormData({
      nombre_completo: clienteData.nombre_completo || '',
      telefono: clienteData.telefono || '',
      email: clienteData.email || '',
      empresa: clienteData.empresa || '',
      nit_ci: clienteData.nit_ci || '',
      direccion: clienteData.direccion || '',
      ciudad: clienteData.ciudad || ''
    });
  };

  // ============================================================================
  // MODALES
  // ============================================================================

  const handleOpenCitaModal  = (cita)  => { setSelectedCita(cita);   setShowCitaModal(true);  };
  const handleCloseCitaModal = ()      => { setSelectedCita(null);   setShowCitaModal(false); };
  const handleOpenOrdenModal = (orden) => { setSelectedOrden(orden); setShowOrdenModal(true);  };
  const handleCloseOrdenModal= ()      => { setSelectedOrden(null);  setShowOrdenModal(false); };

  const handleCloseVehicleModal = () => {
    setShowVehicleModal(false);
    setEditingVehicle(null);
    setVehicleFormData({ marca:'', modelo:'', anio:'', placa:'', vin:'', color:'', kilometraje:'', tipo_combustible_id:1 });
  };

  const handleSaveVehicle = async () => {
    try {
      if (!vehicleFormData.marca || !vehicleFormData.modelo || !vehicleFormData.placa) {
        setAlert({ type: 'error', message: 'Por favor completa los campos requeridos: Marca, Modelo y Placa' });
        return;
      }
      const vehicleData = { ...vehicleFormData, cliente_id: clienteData.id };
      if (editingVehicle) {
        await vehiculosService.updateVehiculo(editingVehicle.id, vehicleData);
        setAlert({ type: 'success', message: 'Vehículo actualizado exitosamente' });
      } else {
        await vehiculosService.createVehiculo(vehicleData);
        setAlert({ type: 'success', message: 'Vehículo agregado exitosamente' });
      }
      handleCloseVehicleModal();
      await cargarDatosTab('vehiculos', clienteData.id);
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Error al guardar el vehículo' });
    }
  };

  const handleEditVehicle = (vehiculo) => {
    setEditingVehicle(vehiculo);
    setVehicleFormData({
      marca: vehiculo.marca || '', modelo: vehiculo.modelo || '', anio: vehiculo.anio || '',
      placa: vehiculo.placa || '', vin: vehiculo.vin || '', color: vehiculo.color || '',
      kilometraje: vehiculo.kilometraje || '', tipo_combustible_id: vehiculo.tipo_combustible_id || 1
    });
    setShowVehicleModal(true);
  };

  const handleDeleteVehicle = (vehiculo) => {
    setConfirmMessage(`¿Estás seguro de que deseas eliminar el vehículo ${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.placa}?`);
    setConfirmAction(() => async () => {
      try {
        await vehiculosService.deleteVehiculo(vehiculo.id);
        setAlert({ type: 'success', message: 'Vehículo eliminado exitosamente' });
        await cargarDatosTab('vehiculos', clienteData.id);
      } catch (error) {
        setAlert({ type: 'error', message: error.response?.data?.message || 'Error al eliminar el vehículo' });
      }
    });
    setShowConfirmModal(true);
  };

  const handleViewHistorial = async (vehiculo) => {
    try {
      const response = await vehiculosService.getHistorialVehiculo(vehiculo.id);
      setHistorialVehiculo(Array.isArray(response.data) ? response.data : []);
      setEditingVehicle(vehiculo);
      setShowHistorialModal(true);
    } catch (error) {
      setHistorialVehiculo([]);
      setAlert({ type: 'error', message: error.response?.data?.message || 'Error al obtener el historial' });
    }
  };

  const handleCloseHistorialModal = () => { setShowHistorialModal(false); setHistorialVehiculo([]); setEditingVehicle(null); };
  const handleCloseConfirmModal   = () => { setShowConfirmModal(false); setConfirmMessage(''); setConfirmAction(null); };
  const handleConfirm = async () => { if (confirmAction) await confirmAction(); handleCloseConfirmModal(); };

  const handleCancelCita = (citaId) => {
    setConfirmMessage('¿Estás seguro de que deseas cancelar esta cita?');
    setConfirmAction(() => async () => {
      try {
        await citasService.cancelarCita(citaId);
        setAlert({ type: 'success', message: 'Cita cancelada exitosamente' });
        handleCloseCitaModal();
        await cargarDatosIniciales();
      } catch (error) {
        setAlert({ type: 'error', message: error.response?.data?.message || 'Error al cancelar la cita' });
      }
    });
    setShowConfirmModal(true);
  };

  const handleAprobarCotizacion = (orden) => {
  setConfirmMessage(
    `¿Deseas aprobar la cotización ${orden.numero_cotizacion} por un total de Bs. ${parseFloat(orden.cotizacion_total || 0).toFixed(2)}?`
  );
  setConfirmAction(() => async () => {
    try {
      await cotizacionesService.aprobar(orden.cotizacion_id);
      setAlert({ type: 'success', message: `Cotización ${orden.numero_cotizacion} aprobada. El taller fue notificado.` });
      // refrescar órdenes para actualizar el estado mostrado
      if (clienteData) await cargarDatosTab(activeTab, clienteData.id);
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Error al aprobar la cotización' });
    }
  });
  setShowConfirmModal(true);
};
 
const handleRechazarCotizacion = (orden) => {
  setConfirmMessage(
    `¿Deseas rechazar la cotización ${orden.numero_cotizacion}? Esta acción notificará al taller.`
  );
  setConfirmAction(() => async () => {
    try {
      await cotizacionesService.rechazar(orden.cotizacion_id);
      setAlert({ type: 'success', message: `Cotización ${orden.numero_cotizacion} rechazada.` });
      if (clienteData) await cargarDatosTab(activeTab, clienteData.id);
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Error al rechazar la cotización' });
    }
  });
  setShowConfirmModal(true);
};

  // ============================================================================
  // FORMATO
  // ============================================================================

  const formatCurrency = (amount) => `Bs. ${parseFloat(amount || 0).toFixed(2)}`;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'pendiente':      { color: '#FCD34D', icon: Clock,         text: 'Pendiente'      },
      'confirmada':     { color: '#0066CC', icon: CheckCircle,   text: 'Confirmada'     },
      'cancelada':      { color: '#EF4444', icon: XCircle,       text: 'Cancelada'      },
      'completada':     { color: '#10B981', icon: CheckCircle,   text: 'Completada'     },
      'recepcionado':   { color: '#0066CC', icon: Clock,         text: 'Recepcionado'   },
      'en_diagnostico': { color: '#FCD34D', icon: AlertCircle,   text: 'En Diagnóstico' },
      'diagnosticado':  { color: '#10B981', icon: CheckCircle,   text: 'Diagnosticado'  },
      'en_reparacion':  { color: '#FCD34D', icon: AlertCircle,   text: 'En Reparación'  },
      'completado':     { color: '#10B981', icon: CheckCircle,   text: 'Completado'     },
      'entregado':      { color: '#10B981', icon: CheckCircle,   text: 'Entregado'      }
    };
    const badge = badges[estado] || badges['pendiente'];
    const Icon = badge.icon;
    return (
      <span className={styles.badge} style={{ backgroundColor: badge.color }}>
        <Icon size={14} />
        {badge.text}
      </span>
    );
  };

  // ============================================================================
  // RENDER TABS
  // ============================================================================

  const renderTabContent = () => {
    switch (activeTab) {
      case 'resumen':    return renderResumen();
      case 'datos':      return renderDatosPersonales();
      case 'vehiculos':  return renderVehiculos();
      case 'citas':      return renderCitas();
      case 'ordenes':    return renderOrdenes();
      default:           return null;
    }
  };

  const renderResumen = () => (
    <div className={styles.tabContent}>
      {/* Estadísticas */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Car className={styles.statIcon} />
          <div className={styles.statValue}>{stats?.total_vehiculos || 0}</div>
          <div className={styles.statLabel}>Vehículos Registrados</div>
        </div>
        <div className={styles.statCard}>
          <Calendar className={styles.statIcon} />
          <div className={styles.statValue}>{stats?.citas_pendientes || 0}</div>
          <div className={styles.statLabel}>Citas Pendientes</div>
        </div>
        <div className={styles.statCard}>
          <FileText className={styles.statIcon} />
          <div className={styles.statValue}>{stats?.ordenes_completadas || 0}</div>
          <div className={styles.statLabel}>Órdenes Completadas</div>
        </div>
        <div className={styles.statCard}>
          <BarChart3 className={styles.statIcon} />
          <div className={styles.statValue}>{formatCurrency(stats?.total_gastado)}</div>
          <div className={styles.statLabel}>Total Gastado</div>
        </div>
      </div>

      {/* Próxima Cita */}
      {proximaCita && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}><Calendar size={20} />Próxima Cita</h3>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              {getEstadoBadge(proximaCita.estado_nombre)}
              <span className={styles.cardDate}>
                {formatDate(proximaCita.fecha_cita)} - {proximaCita.hora_cita}
              </span>
            </div>
            <div className={styles.cardBody}>
              <p><strong>Vehículo:</strong> {proximaCita.marca_vehiculo} {proximaCita.modelo_vehiculo}</p>
              <p><strong>Motivo:</strong> {parseMotivo(proximaCita.motivo)}</p>
              {proximaCita.detalles && <p><strong>Detalles:</strong> {proximaCita.detalles}</p>}
            </div>
            <div className={styles.cardActions}>
              <button className={styles.btnSecondary} onClick={() => handleOpenCitaModal(proximaCita)}>Ver Detalles</button>
              {(proximaCita.estado_id === 1 || proximaCita.estado_id === 2) && (
                <button className={styles.btnDanger} onClick={() => handleCancelCita(proximaCita.id)}>Cancelar Cita</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Última Orden — ahora con cotización */}
      {ultimaOrden && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}><FileText size={20} />Última Orden de Trabajo</h3>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{ultimaOrden.numero_orden}</span>
              {getEstadoBadge(ultimaOrden.estado_nombre)}
            </div>
            <div className={styles.cardBody}>
              {ultimaOrden.tipo_orden_id === 1 ? (
                <>
                  <p><strong>Vehículo:</strong> {ultimaOrden.marca_vehiculo} {ultimaOrden.modelo_vehiculo}</p>
                  <p><strong>Placa:</strong> {ultimaOrden.placa_vehiculo}</p>
                </>
              ) : (
                <p><strong>Pieza:</strong> {ultimaOrden.tipo_pieza}</p>
              )}
              <p><strong>Fecha:</strong> {formatDate(ultimaOrden.fecha_recepcion)}</p>
              <p><strong>Costo:</strong> {formatCurrency(ultimaOrden.costo_final || ultimaOrden.costo_estimado)}</p>
            </div>
            {/* Cotización de la última orden */}
            {renderCotizacionBox(ultimaOrden)}
            <div className={styles.cardActions}>
              <button className={styles.btnPrimary} onClick={() => handleOpenOrdenModal(ultimaOrden)}>Ver Detalles</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDatosPersonales = () => (
    <div className={styles.tabContent}>
      <div className={styles.profileSection}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}><User size={64} /></div>
            <button className={styles.avatarUpload}><Camera size={20} />Cambiar Foto</button>
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}><User size={20} />Información Personal</h3>
            {!isEditMode ? (
              <button className={styles.btnPrimary} onClick={() => setIsEditMode(true)}><Edit2 size={16} />Editar</button>
            ) : (
              <div className={styles.editActions}>
                <button className={styles.btnSuccess} onClick={handleSaveProfile}><Save size={16} />Guardar</button>
                <button className={styles.btnSecondary} onClick={handleCancelEdit}><X size={16} />Cancelar</button>
              </div>
            )}
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}><User size={16} />Nombre Completo</label>
              <input type="text" name="nombre_completo" value={formData.nombre_completo} onChange={handleInputChange} disabled={!isEditMode} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><Mail size={16} />Correo Electrónico</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditMode} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><Phone size={16} />Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} disabled={!isEditMode} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><Building size={16} />Empresa (Opcional)</label>
              <input type="text" name="empresa" value={formData.empresa} onChange={handleInputChange} disabled={!isEditMode} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><CreditCard size={16} />NIT/CI (Opcional)</label>
              <input type="text" name="nit_ci" value={formData.nit_ci} onChange={handleInputChange} disabled={!isEditMode} className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><MapPin size={16} />Ciudad</label>
              <input type="text" name="ciudad" value={formData.ciudad} onChange={handleInputChange} disabled={!isEditMode} className={styles.input} />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}><MapPin size={16} />Dirección</label>
              <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} disabled={!isEditMode} className={styles.input} />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}><Lock size={20} />Cambiar Contraseña</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Contraseña Actual</label>
              <input type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordChange} className={styles.input} placeholder="Ingrese su contraseña actual" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nueva Contraseña</label>
              <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className={styles.input} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Confirmar Contraseña</label>
              <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className={styles.input} placeholder="Repita la nueva contraseña" />
            </div>
          </div>
          <button className={styles.btnPrimary} onClick={handleUpdatePassword}><Lock size={16} />Actualizar Contraseña</button>
        </div>
      </div>
    </div>
  );

  const renderVehiculos = () => (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}><Car size={20} />Mis Vehículos</h3>
        <button className={styles.btnPrimary} onClick={() => setShowVehicleModal(true)}><Plus size={16} />Agregar Vehículo</button>
      </div>

      {vehiculos.length === 0 ? (
        <div className={styles.emptyState}>
          <Car size={48} />
          <p>No tienes vehículos registrados</p>
          <button className={styles.btnPrimary} onClick={() => setShowVehicleModal(true)}>Agregar tu Primer Vehículo</button>
        </div>
      ) : (
        <div className={styles.vehicleGrid}>
          {vehiculos.map(vehiculo => (
            <div key={vehiculo.id} className={styles.vehicleCard}>
              <div className={styles.vehicleHeader}>
                <Car size={24} />
                <h4>{vehiculo.marca} {vehiculo.modelo}</h4>
                <span className={styles.vehicleYear}>{vehiculo.anio}</span>
              </div>
              <div className={styles.vehicleBody}>
                <p><strong>Placa:</strong> {vehiculo.placa}</p>
                <p><strong>Color:</strong> {vehiculo.color}</p>
                <p><strong>Combustible:</strong> {vehiculo.tipo_combustible_nombre}</p>
                <p><strong>Kilometraje:</strong> {vehiculo.kilometraje} km</p>
              </div>
              <div className={styles.vehicleActions}>
                <button className={styles.btnSecondary} onClick={() => handleEditVehicle(vehiculo)}><Edit2 size={14} />Editar</button>
                <button className={styles.btnSecondary} onClick={() => handleViewHistorial(vehiculo)}><Eye size={14} />Historial</button>
                <button className={styles.btnDanger} onClick={() => handleDeleteVehicle(vehiculo)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCitas = () => {
    const citasFiltradas = citasFilter === 'todas'
      ? citas
      : citas.filter(c => {
          if (citasFilter === 'pendientes')  return c.estado_id === 1;
          if (citasFilter === 'confirmadas') return c.estado_id === 2;
          if (citasFilter === 'canceladas')  return c.estado_id === 3;
          if (citasFilter === 'completadas') return c.estado_id === 4;
          return true;
        });

    return (
      <div className={styles.tabContent}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}><Calendar size={20} />Mis Citas</h3>
          <div className={styles.filters}>
            {['todas','pendientes','confirmadas','completadas'].map(f => (
              <button key={f} className={citasFilter === f ? styles.filterActive : styles.filter} onClick={() => setCitasFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {citasFiltradas.length === 0 ? (
          <div className={styles.emptyState}><Calendar size={48} /><p>No tienes citas {citasFilter !== 'todas' ? citasFilter : ''}</p></div>
        ) : (
          <div className={styles.listContainer}>
            {citasFiltradas.map(cita => (
              <div key={cita.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  {getEstadoBadge(cita.estado_nombre)}
                  <span className={styles.cardDate}>{formatDate(cita.fecha_cita)} - {cita.hora_cita}</span>
                </div>
                <div className={styles.cardBody}>
                  <p><strong>Vehículo:</strong> {cita.marca_vehiculo} {cita.modelo_vehiculo}</p>
                  <p><strong>Motivo:</strong> {parseMotivo(cita.motivo)}</p>
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.btnSecondary} onClick={() => handleOpenCitaModal(cita)}>Ver Detalles</button>
                  {(cita.estado_id === 1 || cita.estado_id === 2) && (
                    <button className={styles.btnDanger} onClick={() => handleCancelCita(cita.id)}>Cancelar</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderOrdenes = () => {
    const ordenesFiltradas = ordenesFilter === 'todas'
      ? ordenes
      : ordenes.filter(o => {
          if (ordenesFilter === 'proceso')     return ['recepcionado','en_diagnostico','diagnosticado','en_reparacion'].includes(o.estado_nombre);
          if (ordenesFilter === 'completadas') return ['completado','entregado'].includes(o.estado_nombre);
          return true;
        });

    return (
      <div className={styles.tabContent}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}><FileText size={20} />Mis Órdenes de Trabajo</h3>
          <div className={styles.filters}>
            {[['todas','Todas'],['proceso','En Proceso'],['completadas','Completadas']].map(([val,label]) => (
              <button key={val} className={ordenesFilter === val ? styles.filterActive : styles.filter} onClick={() => setOrdenesFilter(val)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {ordenesFiltradas.length === 0 ? (
          <div className={styles.emptyState}><FileText size={48} /><p>No tienes órdenes de trabajo {ordenesFilter !== 'todas' ? ordenesFilter : ''}</p></div>
        ) : (
          <div className={styles.listContainer}>
            {ordenesFiltradas.map(orden => (
              <div key={orden.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>{orden.numero_orden}</span>
                  {getEstadoBadge(orden.estado_nombre)}
                </div>
                <div className={styles.cardBody}>
                  {orden.tipo_orden_id === 1 && (
                    <>
                      <p><strong>Vehículo:</strong> {orden.marca_vehiculo} {orden.modelo_vehiculo}</p>
                      <p><strong>Placa:</strong> {orden.placa_vehiculo}</p>
                    </>
                  )}
                  {orden.tipo_orden_id === 2 && (
                    <>
                      <p><strong>Tipo de Pieza:</strong> {orden.tipo_pieza}</p>
                      {orden.marca_pieza    && <p><strong>Marca:</strong> {orden.marca_pieza}</p>}
                      {orden.modelo_origen  && <p><strong>Modelo Origen:</strong> {orden.modelo_origen}</p>}
                    </>
                  )}
                  <p><strong>Fecha:</strong> {formatDate(orden.fecha_recepcion)}</p>
                  <p><strong>Costo:</strong> {formatCurrency(orden.costo_final || orden.costo_estimado)}</p>
                  {orden.descripcion_problema && <p><strong>Descripción:</strong> {orden.descripcion_problema}</p>}
                </div>

                {/* ── COTIZACIÓN DE LA ORDEN ── */}
                {renderCotizacionBox(orden)}

                <div className={styles.cardActions}>
                  <button className={styles.btnPrimary} onClick={() => handleOpenOrdenModal(orden)}>
                    <Eye size={14} />Ver Detalles
                  </button>
                  <button className={styles.btnSecondary}>
                    <PhoneCall size={14} />Contactar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar />
        <div className={styles.loading}><div className={styles.spinner}></div><p>Cargando perfil...</p></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <main className={styles.main}>
        {/* Header */}
        <section className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}><User size={40} /></div>
            <div>
              <h1 className={styles.headerTitle}>Mi Perfil</h1>
              <p className={styles.headerSubtitle}>Gestiona tu información personal y revisa tu historial de servicios</p>
            </div>
          </div>
        </section>

        {/* Alert */}
        {alert && (
          <div className={styles.alertContainer}>
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}

        {/* Tabs */}
        <div className={styles.tabs}>
          {[
            ['resumen',   'Resumen',         <BarChart3 size={18} />],
            ['datos',     'Datos Personales', <User size={18} />],
            ['vehiculos', 'Mis Vehículos',    <Car size={18} />],
            ['citas',     'Mis Citas',        <Calendar size={18} />],
            ['ordenes',   'Mis Órdenes',      <FileText size={18} />],
          ].map(([key, label, icon]) => (
            <button key={key} className={activeTab === key ? styles.tabActive : styles.tab} onClick={() => handleTabChange(key)}>
              {icon}{label}
            </button>
          ))}
        </div>

        <div className={styles.content}>{renderTabContent()}</div>
      </main>

      {/* Modal de Cita */}
      {showCitaModal && selectedCita && (
        <div className={styles.modalOverlay} onClick={handleCloseCitaModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Detalles de la Cita</h3>
              <button className={styles.modalClose} onClick={handleCloseCitaModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGroup}><label>Estado:</label><span>{getEstadoBadge(selectedCita.estado_nombre)}</span></div>
              <div className={styles.detailGroup}><label>Fecha:</label><span>{formatDate(selectedCita.fecha_cita)}</span></div>
              <div className={styles.detailGroup}><label>Hora:</label><span>{selectedCita.hora_cita}</span></div>
              <div className={styles.detailGroup}><label>Vehículo:</label><span>{selectedCita.marca_vehiculo} {selectedCita.modelo_vehiculo}</span></div>
              <div className={styles.detailGroup}><label>Motivo:</label><span>{parseMotivo(selectedCita.motivo)}</span></div>
              {selectedCita.detalles && <div className={styles.detailGroup}><label>Detalles:</label><p>{selectedCita.detalles}</p></div>}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={handleCloseCitaModal}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Orden — ahora con sección de cotización */}
      {showOrdenModal && selectedOrden && (
        <div className={styles.modalOverlay} onClick={handleCloseOrdenModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Detalles de la Orden</h3>
              <button className={styles.modalClose} onClick={handleCloseOrdenModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGroup}><label>Número de Orden:</label><span><strong>{selectedOrden.numero_orden}</strong></span></div>
              <div className={styles.detailGroup}><label>Estado:</label><span>{getEstadoBadge(selectedOrden.estado_nombre)}</span></div>

              {selectedOrden.tipo_orden_id === 1 && (
                <>
                  <div className={styles.detailGroup}><label>Vehículo:</label><span>{selectedOrden.marca_vehiculo} {selectedOrden.modelo_vehiculo}</span></div>
                  <div className={styles.detailGroup}><label>Placa:</label><span>{selectedOrden.placa_vehiculo}</span></div>
                </>
              )}
              {selectedOrden.tipo_orden_id === 2 && (
                <>
                  <div className={styles.detailGroup}><label>Tipo de Pieza:</label><span>{selectedOrden.tipo_pieza}</span></div>
                  {selectedOrden.marca_pieza   && <div className={styles.detailGroup}><label>Marca:</label><span>{selectedOrden.marca_pieza}</span></div>}
                  {selectedOrden.modelo_origen && <div className={styles.detailGroup}><label>Modelo Vehículo Origen:</label><span>{selectedOrden.modelo_origen}</span></div>}
                  {selectedOrden.numero_parte  && <div className={styles.detailGroup}><label>Número de Parte:</label><span>{selectedOrden.numero_parte}</span></div>}
                </>
              )}

              <div className={styles.detailGroup}><label>Fecha Recepción:</label><span>{formatDate(selectedOrden.fecha_recepcion)}</span></div>
              {selectedOrden.descripcion_problema && <div className={styles.detailGroup}><label>Descripción del Problema:</label><p>{selectedOrden.descripcion_problema}</p></div>}
              {selectedOrden.diagnostico_tecnico  && <div className={styles.detailGroup}><label>Diagnóstico Técnico:</label><p>{selectedOrden.diagnostico_tecnico}</p></div>}
              <div className={styles.detailGroup}><label>Costo Estimado:</label><span>{formatCurrency(selectedOrden.costo_estimado)}</span></div>
              {selectedOrden.costo_final > 0 && <div className={styles.detailGroup}><label>Costo Final:</label><span><strong>{formatCurrency(selectedOrden.costo_final)}</strong></span></div>}

              {/* ── SECCIÓN DE COTIZACIÓN EN MODAL ── */}
              {selectedOrden.numero_cotizacion && (
                <div className={styles.modalCotizacionSection}>
                  <h4 className={styles.modalCotizacionTitle}>
                    <Receipt size={16} />
                    Cotización
                  </h4>
                  <div className={styles.detailGroup}>
                    <label>N° Cotización:</label>
                    <span><strong>{selectedOrden.numero_cotizacion}</strong></span>
                  </div>
                  <div className={styles.detailGroup}>
                    <label>Estado:</label>
                    <span>{renderCotizacionBadge(selectedOrden.cotizacion_estado)}</span>
                  </div>
                  <div className={styles.detailGroup}>
                    <label>Total Cotizado:</label>
                    <span>
                      <strong style={{ color: '#1d4ed8', fontSize: '1rem' }}>
                        Bs. {parseFloat(selectedOrden.cotizacion_total || 0).toFixed(2)}
                      </strong>
                    </span>
                  </div>
                  {selectedOrden.cotizacion_valida_hasta && (
                    <div className={styles.detailGroup}>
                      <label>Válida hasta:</label>
                      <span>{new Date(selectedOrden.cotizacion_valida_hasta).toLocaleDateString('es-BO')}</span>
                    </div>
                  )}
              
                  {/* Acciones solo cuando está en estado enviada */}
                  {selectedOrden.cotizacion_estado === 'enviada' && (
                    <div className={styles.cotizacionAcciones} style={{ marginTop: '16px' }}>
                      <button
                        className={styles.btnAprobar}
                        onClick={() => { handleCloseOrdenModal(); handleAprobarCotizacion(selectedOrden); }}
                      >
                        <CheckCircle size={15} />
                        Aceptar cotización
                      </button>
                      <button
                        className={styles.btnRechazar}
                        onClick={() => { handleCloseOrdenModal(); handleRechazarCotizacion(selectedOrden); }}
                      >
                        <XCircle size={15} />
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={handleCloseOrdenModal}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vehículo */}
      {showVehicleModal && (
        <div className={styles.modalOverlay} onClick={handleCloseVehicleModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingVehicle ? 'Editar Vehículo' : 'Agregar Vehículo'}</h3>
              <button className={styles.modalClose} onClick={handleCloseVehicleModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                {[
                  ['marca','Marca*','text','Ej: Toyota'],
                  ['modelo','Modelo*','text','Ej: Corolla'],
                  ['anio','Año','number','Ej: 2020'],
                  ['placa','Placa*','text','Ej: ABC-1234'],
                  ['color','Color','text','Ej: Blanco'],
                  ['kilometraje','Kilometraje','number','Ej: 50000'],
                ].map(([field, label, type, placeholder]) => (
                  <div key={field} className={styles.formGroup}>
                    <label className={styles.label}>{label}</label>
                    <input type={type} value={vehicleFormData[field]} onChange={e => setVehicleFormData({...vehicleFormData, [field]: e.target.value})} className={styles.input} placeholder={placeholder} />
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={handleCloseVehicleModal}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleSaveVehicle}>{editingVehicle ? 'Actualizar' : 'Agregar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div className={styles.modalOverlay} onClick={handleCloseConfirmModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Confirmar Acción</h3>
              <button className={styles.modalClose} onClick={handleCloseConfirmModal}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.confirmMessage}><AlertCircle size={48} color="#F59E0B" /><p>{confirmMessage}</p></div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={handleCloseConfirmModal}>Cancelar</button>
              <button className={styles.btnDanger} onClick={handleConfirm}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Historial de Vehículo */}
      {showHistorialModal && (
        <div className={styles.modalOverlay} onClick={handleCloseHistorialModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Historial de {editingVehicle?.marca} {editingVehicle?.modelo}</h3>
              <button className={styles.modalClose} onClick={handleCloseHistorialModal}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              {!Array.isArray(historialVehiculo) || historialVehiculo.length === 0 ? (
                <div className={styles.emptyState}><FileText size={48} /><p>Este vehículo no tiene historial de órdenes de trabajo</p></div>
              ) : (
                <div className={styles.historialList}>
                  {historialVehiculo.map(orden => (
                    <div key={orden.id} className={styles.historialItem}>
                      <div className={styles.historialHeader}>
                        <span className={styles.ordenNumero}>{orden.numero_orden}</span>
                        <span className={`${styles.badge} ${styles[`badge${orden.estado_nombre?.replace(/\s+/g,'')}`]}`}>{orden.estado_nombre}</span>
                      </div>
                      <div className={styles.historialBody}>
                        <p><strong>Fecha:</strong> {formatDate(orden.fecha_recepcion)}</p>
                        <p><strong>Descripción:</strong> {orden.descripcion_problema}</p>
                        {orden.diagnostico_tecnico && <p><strong>Diagnóstico:</strong> {orden.diagnostico_tecnico}</p>}
                        {orden.costo_final > 0 && <p><strong>Costo:</strong> {formatCurrency(orden.costo_final)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={handleCloseHistorialModal}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MiPerfil;