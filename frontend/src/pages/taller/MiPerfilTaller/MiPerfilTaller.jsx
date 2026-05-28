import { useState, useEffect } from 'react';
import {
  User, Key, FileText, Phone, Mail, Camera, Save,
  CheckCircle, Clock, AlertCircle, Search, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { ordenesService } from '../../../services/ordenesService';
import { authService } from '../../../services/authService';
import Alert from '../../../components/common/Alert/Alert';
import styles from './MiPerfilTaller.module.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ESTADOS_EN_PROCESO  = ['en_diagnostico', 'en_reparacion', 'esperando_repuestos'];
const ESTADOS_COMPLETADAS = ['completado', 'entregado'];
const ESTADO_COLORES = {
  recepcionado:        '#2563eb',
  en_diagnostico:      '#ca8a04',
  diagnosticado:       '#16a34a',
  en_reparacion:       '#ea580c',
  esperando_repuestos: '#9333ea',
  completado:          '#15803d',
  entregado:           '#475569',
  cancelado:           '#dc2626',
};

const iniciales = (nombre) => {
  if (!nombre) return 'U';
  const p = nombre.trim().split(' ');
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : nombre.slice(0, 2).toUpperCase();
};

const fmtFecha = (str) => {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Tab: Resumen ─────────────────────────────────────────────────────────────

function ResumenTab() {
  const { user } = useAuth();
  const [loading, setLoading]   = useState(true);
  const [stats, setStats]       = useState({ total: 0, enProceso: 0, completadas: 0, recepcionadas: 0 });

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const filters = user.rol === 'mecanico' ? { mecanico_id: user.id } : {};
        const res = await ordenesService.getAll(filters);
        if (cancelled) return;
        if (res.success && res.data) {
          const o = res.data;
          setStats({
            total:        o.length,
            enProceso:    o.filter(x => ESTADOS_EN_PROCESO.includes(x.estado_nombre)).length,
            completadas:  o.filter(x => ESTADOS_COMPLETADAS.includes(x.estado_nombre)).length,
            recepcionadas: o.filter(x => x.estado_nombre === 'recepcionado').length,
          });
        }
      } catch (e) {
        console.error('Error al obtener estadísticas:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchStats();
    return () => { cancelled = true; };
  }, [user.id, user.rol]);

  const cards = [
    { title: 'Total Órdenes',  value: stats.total,        icon: FileText,    color: '#2563eb', bg: '#eff6ff' },
    { title: 'En Proceso',     value: stats.enProceso,    icon: Clock,       color: '#ca8a04', bg: '#fefce8' },
    { title: 'Completadas',    value: stats.completadas,  icon: CheckCircle, color: '#15803d', bg: '#f0fdf4' },
    { title: 'Recepcionadas',  value: stats.recepcionadas,icon: AlertCircle, color: '#dc2626', bg: '#fef2f2' },
  ];

  if (loading) {
    return (
      <div className={styles.loading}>
        <RefreshCw size={28} className={styles.spin} />
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabHeader}>
        <h2 className={styles.tabTitle}>
          {user.rol === 'mecanico' ? 'Mis Estadísticas' : 'Resumen General'}
        </h2>
        <p className={styles.tabSubtitle}>
          {user.rol === 'mecanico'
            ? 'Vista general de tus órdenes de trabajo asignadas'
            : 'Vista general de todas las órdenes del taller'}
        </p>
      </div>

      <div className={styles.statsGrid}>
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className={styles.statCard}>
              <div className={styles.iconContainer} style={{ backgroundColor: c.bg }}>
                <Icon size={24} style={{ color: c.color }} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>{c.title}</p>
                <p className={styles.statValue}>{c.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.infoCard}>
        <h3 className={styles.infoTitle}>Información de la Cuenta</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Nombre:</span>
            <span className={styles.infoValue}>{user.nombreCompleto || '—'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email:</span>
            <span className={styles.infoValue}>{user.email || '—'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Teléfono:</span>
            <span className={styles.infoValue}>{user.telefono || 'No registrado'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Rol:</span>
            <span className={styles.rolBadge}>
              {user.rol === 'admin' ? 'Administrador' : 'Mecánico'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Datos Personales ────────────────────────────────────────────────────

function DatosPersonalesTab() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    nombreCompleto: user.nombreCompleto || '',
    telefono:       user.telefono       || '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '', newPassword: '', confirmPassword: ''
  });

  const [alert,         setAlert]         = useState({ show: false, type: '', message: '' });
  const [passwordAlert, setPasswordAlert] = useState({ show: false, type: '', message: '' });
  const [loading,         setLoading]         = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!alert.show) return;
    const t = setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
    return () => clearTimeout(t);
  }, [alert.show]);

  useEffect(() => {
    if (!passwordAlert.show) return;
    const t = setTimeout(() => setPasswordAlert({ show: false, type: '', message: '' }), 5000);
    return () => clearTimeout(t);
  }, [passwordAlert.show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ show: false, type: '', message: '' });
    try {
      const res = await authService.updateProfile({
        nombreCompleto: formData.nombreCompleto.trim(),
        telefono:       formData.telefono.trim() || null,
      });
      updateUser(res.data);
      setAlert({ show: true, type: 'success', message: 'Datos personales actualizados correctamente' });
    } catch (err) {
      setAlert({ show: true, type: 'error', message: err.message || 'Error al actualizar datos personales' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordAlert({ show: true, type: 'error', message: 'Todos los campos son requeridos' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordAlert({ show: true, type: 'error', message: 'Las contraseñas no coinciden' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordAlert({ show: true, type: 'error', message: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setPasswordLoading(true);
    setPasswordAlert({ show: false, type: '', message: '' });
    try {
      await authService.changePassword(oldPassword, newPassword);
      setPasswordAlert({ show: true, type: 'success', message: 'Contraseña actualizada correctamente' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordAlert({ show: true, type: 'error', message: err.message || 'Error al cambiar la contraseña' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className={styles.tabContainer}>

      {/* DATOS PERSONALES */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <User size={20} />
          <h2 className={styles.sectionTitle}>Información Personal</h2>
        </div>

        {alert.show && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ show: false, type: '', message: '' })}
          />
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>{iniciales(user.nombreCompleto)}</div>
            <button type="button" className={styles.avatarBtn}>
              <Camera size={18} /> Cambiar Foto
            </button>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}><User size={16} /> Nombre Completo*</label>
            <input
              type="text"
              value={formData.nombreCompleto}
              onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
              className={styles.input}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}><Phone size={16} /> Teléfono</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className={styles.input}
              placeholder="Ej: 75123456"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}><Mail size={16} /> Correo Electrónico</label>
            <input
              type="email"
              value={user.email}
              className={`${styles.input} ${styles.disabled}`}
              disabled
            />
            <p className={styles.hint}>El correo electrónico no se puede modificar desde aquí</p>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading
              ? <><div className={styles.spinner} /> Guardando...</>
              : <><Save size={18} /> Guardar Cambios</>}
          </button>
        </form>
      </div>

      {/* CAMBIAR CONTRASEÑA */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Key size={20} />
          <h2 className={styles.sectionTitle}>Cambiar Contraseña</h2>
        </div>

        {passwordAlert.show && (
          <Alert
            type={passwordAlert.type}
            message={passwordAlert.message}
            onClose={() => setPasswordAlert({ show: false, type: '', message: '' })}
          />
        )}

        <form onSubmit={handlePasswordSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}><Key size={16} /> Contraseña Actual*</label>
            <input
              type="password"
              value={passwordData.oldPassword}
              onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
              className={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}><Key size={16} /> Nueva Contraseña*</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className={styles.input}
              placeholder="••••••••"
              required
            />
            <p className={styles.hint}>Mínimo 6 caracteres</p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}><Key size={16} /> Confirmar Nueva Contraseña*</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={passwordLoading}>
            {passwordLoading
              ? <><div className={styles.spinner} /> Cambiando...</>
              : <><Key size={18} /> Cambiar Contraseña</>}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Tab: Órdenes Asignadas ───────────────────────────────────────────────────

function OrdenesAsignadasTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ordenes, setOrdenes] = useState([]);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchOrdenes = async () => {
      try {
        const filters = user.rol === 'mecanico' ? { mecanico_id: user.id } : {};
        const res = await ordenesService.getAll(filters);
        if (cancelled) return;
        if (res.success && res.data) setOrdenes(res.data);
      } catch (e) {
        console.error('Error al obtener órdenes:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchOrdenes();
    return () => { cancelled = true; };
  }, [user.id, user.rol]);

  const filtradas = ordenes.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.numero_orden?.toLowerCase().includes(q) ||
      o.nombre_cliente?.toLowerCase().includes(q) ||
      o.placa_vehiculo?.toLowerCase().includes(q)
    );
  });

  const getColor = (estado) => ESTADO_COLORES[estado?.toLowerCase()] || '#6b7280';

  if (loading) {
    return (
      <div className={styles.loading}>
        <RefreshCw size={28} className={styles.spin} />
        <p>Cargando órdenes...</p>
      </div>
    );
  }

  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabHeader}>
        <div>
          <h2 className={styles.tabTitle}>
            {user.rol === 'mecanico' ? 'Mis Órdenes Asignadas' : 'Todas las Órdenes'}
          </h2>
          <p className={styles.tabSubtitle}>
            {user.rol === 'mecanico'
              ? 'Órdenes de trabajo asignadas a ti'
              : 'Todas las órdenes de trabajo del taller'}
          </p>
        </div>
        <span className={styles.totalBadge}>Total: {filtradas.length}</span>
      </div>

      <div className={styles.searchBar}>
        <Search size={20} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Buscar por N° orden, cliente o placa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {filtradas.length === 0 ? (
        <div className={styles.empty}>
          <FileText size={48} />
          <p className={styles.emptyTitle}>No hay órdenes</p>
          <p className={styles.emptyText}>
            {search
              ? 'No se encontraron órdenes con ese criterio'
              : user.rol === 'mecanico'
                ? 'No tienes órdenes asignadas aún'
                : 'No hay órdenes registradas en el sistema'}
          </p>
        </div>
      ) : (
        <div className={styles.ordenesGrid}>
          {filtradas.map((orden) => (
            <div key={orden.id} className={styles.ordenCard}>
              <div className={styles.ordenHeader}>
                <div className={styles.ordenNumber}>
                  <FileText size={18} /> {orden.numero_orden}
                </div>
                <span
                  className={styles.estadoBadge}
                  style={{
                    backgroundColor: `${getColor(orden.estado_nombre)}20`,
                    color: getColor(orden.estado_nombre),
                  }}
                >
                  {orden.estado_nombre?.replace(/_/g, ' ')}
                </span>
              </div>

              <div className={styles.ordenContent}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Cliente:</span>
                  <span className={styles.infoValue}>{orden.nombre_cliente || '—'}</span>
                </div>
                {orden.placa_vehiculo && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Vehículo:</span>
                    <span className={styles.infoValue}>
                      {[orden.marca_vehiculo, orden.modelo_vehiculo, orden.placa_vehiculo].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                )}
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Recepción:</span>
                  <span className={styles.infoValue}>{fmtFecha(orden.fecha_recepcion)}</span>
                </div>
                {orden.mecanico_nombre && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Mecánico:</span>
                    <span className={styles.infoValue}>{orden.mecanico_nombre}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const MiPerfilTaller = () => {
  const [activeTab, setActiveTab] = useState('resumen');

  const tabs = [
    { id: 'resumen',           label: 'Resumen',           icon: User     },
    { id: 'datos-personales',  label: 'Datos Personales',  icon: Key      },
    { id: 'ordenes-asignadas', label: 'Órdenes Asignadas', icon: FileText },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mi Perfil</h1>
          <p className={styles.subtitle}>Gestiona tu información personal y revisa tu actividad</p>
        </div>
      </div>

      <div className={styles.tabs}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`${styles.tab} ${activeTab === id ? styles.active : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'resumen'           && <ResumenTab />}
        {activeTab === 'datos-personales'  && <DatosPersonalesTab />}
        {activeTab === 'ordenes-asignadas' && <OrdenesAsignadasTab />}
      </div>
    </div>
  );
};

export default MiPerfilTaller;
