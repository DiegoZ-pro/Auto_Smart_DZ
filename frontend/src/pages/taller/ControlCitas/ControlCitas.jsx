import { useState, useEffect, useCallback } from 'react'
import {
  Calendar, Search, RefreshCw, Filter, Check, X,
  Clock, CheckCircle, XCircle, User, Phone, Car,
  AlertCircle, ChevronDown, Eye, CalendarCheck
} from 'lucide-react'
import citasService from '../../../services/citasService'
import styles from './ControlCitas.module.css'

const ESTADOS = {
  1: { label: 'Pendiente',  color: '#ca8a04', bg: '#fefce8' },
  2: { label: 'Confirmada', color: '#2563eb', bg: '#eff6ff' },
  3: { label: 'Cancelada',  color: '#dc2626', bg: '#fef2f2' },
  4: { label: 'Completada', color: '#16a34a', bg: '#f0fdf4' },
}

const fmtFecha = (str) => {
  if (!str) return '—'
  // MySQL puede devolver fecha como ISO completo o como 'YYYY-MM-DD'
  const s = typeof str === 'string' ? str.slice(0, 10) : new Date(str).toISOString().slice(0, 10)
  const d = new Date(s + 'T12:00:00')
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
}

const fmtHora = (str) => {
  if (!str) return '—'
  const [h, m] = str.split(':')
  return `${h}:${m}`
}

const parseMotivoLabel = (motivo) => {
  if (!motivo) return '—'
  try {
    const arr = typeof motivo === 'string' ? JSON.parse(motivo) : motivo
    if (Array.isArray(arr)) return arr.join(', ')
  } catch {}
  return String(motivo)
}

export default function ControlCitas() {
  const [citas,         setCitas]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [exito,         setExito]         = useState('')
  const [busqueda,      setBusqueda]      = useState('')
  const [filtroEstado,  setFiltroEstado]  = useState('')
  const [fechaDesde,    setFechaDesde]    = useState('')
  const [fechaHasta,    setFechaHasta]    = useState('')
  const [mostrarFiltros,setMostrarFiltros]= useState(false)
  const [citaSel,       setCitaSel]       = useState(null)
  const [accionLoading, setAccionLoading] = useState(false)

  const cargarCitas = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const filters = {}
      if (filtroEstado) filters.estado_id = filtroEstado
      if (fechaDesde)   filters.fecha_desde = fechaDesde
      if (fechaHasta)   filters.fecha_hasta = fechaHasta
      const res = await citasService.getAllCitas(filters)
      setCitas(res.data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar citas')
    } finally {
      setLoading(false)
    }
  }, [filtroEstado, fechaDesde, fechaHasta])

  useEffect(() => { cargarCitas() }, [cargarCitas])

  const citasFiltradas = busqueda
    ? citas.filter(c =>
        c.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.telefono_cliente?.includes(busqueda) ||
        `${c.marca_vehiculo} ${c.modelo_vehiculo}`.toLowerCase().includes(busqueda.toLowerCase())
      )
    : citas

  const stats = {
    pendientes:  citas.filter(c => c.estado_id === 1).length,
    confirmadas: citas.filter(c => c.estado_id === 2).length,
    completadas: citas.filter(c => c.estado_id === 4).length,
    canceladas:  citas.filter(c => c.estado_id === 3).length,
  }

  const handleAccion = async (citaId, accion) => {
    setAccionLoading(true)
    try {
      if (accion === 'confirmar') await citasService.confirmarCita(citaId)
      if (accion === 'cancelar')  await citasService.cancelarCita(citaId)
      if (accion === 'completar') await citasService.completarCita(citaId)
      const msgs = { confirmar: 'confirmada', cancelar: 'cancelada', completar: 'marcada como completada' }
      setExito(`Cita ${msgs[accion]} exitosamente`)
      setTimeout(() => setExito(''), 3000)
      setCitaSel(null)
      await cargarCitas()
    } catch (err) {
      setError(err.message || `Error al ${accion} cita`)
    } finally {
      setAccionLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.pageTitle}>Control de Citas</h1>
      <p className={styles.pageSubtitle}>Gestiona y da seguimiento a las citas programadas por los clientes.</p>

      {error && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <AlertCircle size={15} /> {error}
          <button onClick={() => setError('')}><X size={13} /></button>
        </div>
      )}
      {exito && (
        <div className={`${styles.alert} ${styles.alertSuccess}`}>
          <Check size={15} /> {exito}
        </div>
      )}

      {/* stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fefce8', color: '#ca8a04' }}><Clock size={20} /></div>
          <div><div className={styles.statVal}>{stats.pendientes}</div><div className={styles.statLabel}>Pendientes</div></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#eff6ff', color: '#2563eb' }}><CalendarCheck size={20} /></div>
          <div><div className={styles.statVal}>{stats.confirmadas}</div><div className={styles.statLabel}>Confirmadas</div></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}><CheckCircle size={20} /></div>
          <div><div className={styles.statVal}>{stats.completadas}</div><div className={styles.statLabel}>Completadas</div></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fef2f2', color: '#dc2626' }}><XCircle size={20} /></div>
          <div><div className={styles.statVal}>{stats.canceladas}</div><div className={styles.statLabel}>Canceladas</div></div>
        </div>
      </div>

      {/* filtros */}
      <div className={styles.filtersCard}>
        <div className={styles.filtersRow}>
          <div className={styles.searchBox}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar cliente, teléfono, vehículo..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className={styles.select}>
            <option value="">Todos los estados</option>
            {Object.entries(ESTADOS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button className={styles.btnFiltrosExt} onClick={() => setMostrarFiltros(p => !p)}>
            <Filter size={14} /> Fecha <ChevronDown size={12} />
          </button>
          <button className={styles.btnRefresh} onClick={cargarCitas} title="Actualizar">
            <RefreshCw size={14} />
          </button>
        </div>
        {mostrarFiltros && (
          <div className={styles.filtrosExtra}>
            <label className={styles.fechaLabel}>Desde:</label>
            <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} className={styles.inputFecha} />
            <label className={styles.fechaLabel}>Hasta:</label>
            <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} className={styles.inputFecha} />
            <button className={styles.btnLimpiar} onClick={() => { setFechaDesde(''); setFechaHasta('') }}>
              <X size={12} /> Limpiar
            </button>
          </div>
        )}
      </div>

      {/* tabla */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.emptyState}><RefreshCw size={28} className={styles.spin} /><p>Cargando citas...</p></div>
        ) : citasFiltradas.length === 0 ? (
          <div className={styles.emptyState}><Calendar size={40} /><p>No hay citas con los filtros seleccionados</p></div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Fecha / Hora</th>
                  <th>Vehículo</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citasFiltradas.map(cita => {
                  const est = ESTADOS[cita.estado_id] || { label: cita.estado_nombre, color: '#64748b', bg: '#f8fafc' }
                  return (
                    <tr key={cita.id}>
                      <td>
                        <div className={styles.clienteInfo}>
                          <span className={styles.clienteNombre}>{cita.nombre_cliente}</span>
                          {cita.telefono_cliente && (
                            <span className={styles.clienteTel}><Phone size={11} /> {cita.telefono_cliente}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={styles.fechaInfo}>
                          <span className={styles.fechaVal}>{fmtFecha(cita.fecha_cita)}</span>
                          <span className={styles.horaVal}><Clock size={11} /> {fmtHora(cita.hora_cita)}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.vehiculoInfo}>
                          {cita.marca_vehiculo
                            ? <><Car size={12} /> {cita.marca_vehiculo} {cita.modelo_vehiculo}</>
                            : <span className={styles.sinDato}>—</span>}
                        </div>
                      </td>
                      <td>
                        <span className={styles.motivoText}>{parseMotivoLabel(cita.motivo)}</span>
                      </td>
                      <td>
                        <span className={styles.estadoBadge} style={{ background: est.bg, color: est.color }}>
                          {est.label}
                        </span>
                      </td>
                      <td>
                        <div className={styles.acciones}>
                          <button className={styles.btnVer} onClick={() => setCitaSel(cita)} title="Ver detalles">
                            <Eye size={14} />
                          </button>
                          {cita.estado_id === 1 && (
                            <button className={styles.btnConfirmar}
                              onClick={() => handleAccion(cita.id, 'confirmar')} title="Confirmar">
                              <Check size={14} />
                            </button>
                          )}
                          {cita.estado_id === 2 && (
                            <button className={styles.btnCompletar}
                              onClick={() => handleAccion(cita.id, 'completar')} title="Completar">
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {(cita.estado_id === 1 || cita.estado_id === 2) && (
                            <button className={styles.btnCancelar}
                              onClick={() => handleAccion(cita.id, 'cancelar')} title="Cancelar">
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && citasFiltradas.length > 0 && (
          <div className={styles.tableFooter}>
            Mostrando {citasFiltradas.length} cita{citasFiltradas.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* modal detalle */}
      {citaSel && (
        <div className={styles.overlay} onClick={() => setCitaSel(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Detalle de Cita</h2>
              <button className={styles.modalClose} onClick={() => setCitaSel(null)}><X size={20} /></button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}><User size={14} /> Cliente</h3>
                <div className={styles.modalGrid}>
                  <div className={styles.modalField}><span className={styles.modalLabel}>Nombre</span><span>{citaSel.nombre_cliente}</span></div>
                  <div className={styles.modalField}><span className={styles.modalLabel}>Teléfono</span><span>{citaSel.telefono_cliente || '—'}</span></div>
                  <div className={styles.modalField}><span className={styles.modalLabel}>Email</span><span>{citaSel.email_cliente || '—'}</span></div>
                </div>
              </div>

              <div className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}><Calendar size={14} /> Información de la Cita</h3>
                <div className={styles.modalGrid}>
                  <div className={styles.modalField}><span className={styles.modalLabel}>Fecha</span><span>{fmtFecha(citaSel.fecha_cita)}</span></div>
                  <div className={styles.modalField}><span className={styles.modalLabel}>Hora</span><span>{fmtHora(citaSel.hora_cita)}</span></div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Estado</span>
                    <span className={styles.estadoBadge} style={{ background: ESTADOS[citaSel.estado_id]?.bg, color: ESTADOS[citaSel.estado_id]?.color }}>
                      {ESTADOS[citaSel.estado_id]?.label}
                    </span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Vehículo</span>
                    <span>{citaSel.marca_vehiculo ? `${citaSel.marca_vehiculo} ${citaSel.modelo_vehiculo}` : '—'}</span>
                  </div>
                </div>
                <div className={styles.modalField} style={{ marginTop: 12 }}>
                  <span className={styles.modalLabel}>Motivo</span>
                  <span>{parseMotivoLabel(citaSel.motivo)}</span>
                </div>
                {citaSel.detalles && (
                  <div className={styles.textBlock}>
                    <span className={styles.modalLabel}>Detalles adicionales</span>
                    <p>{citaSel.detalles}</p>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              {citaSel.estado_id === 1 && (
                <button className={styles.btnConfirmarModal} disabled={accionLoading}
                  onClick={() => handleAccion(citaSel.id, 'confirmar')}>
                  <Check size={15} /> {accionLoading ? 'Procesando...' : 'Confirmar Cita'}
                </button>
              )}
              {citaSel.estado_id === 2 && (
                <button className={styles.btnCompletarModal} disabled={accionLoading}
                  onClick={() => handleAccion(citaSel.id, 'completar')}>
                  <CheckCircle size={15} /> {accionLoading ? 'Procesando...' : 'Marcar Completada'}
                </button>
              )}
              {(citaSel.estado_id === 1 || citaSel.estado_id === 2) && (
                <button className={styles.btnCancelarModal} disabled={accionLoading}
                  onClick={() => handleAccion(citaSel.id, 'cancelar')}>
                  <X size={15} /> {accionLoading ? 'Procesando...' : 'Cancelar Cita'}
                </button>
              )}
              <button className={styles.btnCerrar} onClick={() => setCitaSel(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
