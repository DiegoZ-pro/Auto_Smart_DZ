import { useState, useEffect, useCallback } from 'react'
import {
  Wrench, Search, RefreshCw, AlertCircle, Check, X,
  Car, Package, User, Phone, Calendar, Clock,
  ChevronRight, Save, UserCheck, Flag,
  ClipboardList, History,
  ArrowRight
} from 'lucide-react'
import { diagnosticoService } from '../../../services/diagnosticoService'
import styles from './DiagnosticoTecnico.module.css'

// ─── colores por estado ────────────────────────────────────────────────────────

const ESTADO_COLORES = {
  recepcionado:        { bg: '#eff6ff', color: '#2563eb', label: 'Recepcionado' },
  en_diagnostico:      { bg: '#fefce8', color: '#ca8a04', label: 'En Diagnóstico' },
  diagnosticado:       { bg: '#f0fdf4', color: '#16a34a', label: 'Diagnosticado' },
  en_reparacion:       { bg: '#fff7ed', color: '#ea580c', label: 'En Reparación' },
  esperando_repuestos: { bg: '#fdf4ff', color: '#9333ea', label: 'Esp. Repuestos' },
  completado:          { bg: '#f0fdf4', color: '#15803d', label: 'Completado' },
  entregado:           { bg: '#f8fafc', color: '#475569', label: 'Entregado'  },
}

const PRIORIDAD_COLORES = {
  1: { color: '#dc2626', label: 'Alta'   },
  2: { color: '#f59e0b', label: 'Media'  },
  3: { color: '#22c55e', label: 'Baja'   },
}

// estados que se pueden asignar desde el diagnóstico
const ESTADOS_DISPONIBLES = [
  { id: 1, nombre: 'recepcionado'        },
  { id: 2, nombre: 'en_diagnostico'      },
  { id: 3, nombre: 'diagnosticado'       },
  { id: 4, nombre: 'en_reparacion'       },
  { id: 5, nombre: 'esperando_repuestos' },
  { id: 6, nombre: 'completado'          },
  { id: 7, nombre: 'entregado'           },
]

// ─────────────────────────────────────────────────────────────────────────────

export default function DiagnosticoTecnico() {
  // lista de órdenes
  const [ordenes, setOrdenes]         = useState([])
  const [loading, setLoading]         = useState(false)
  const [busqueda, setBusqueda]       = useState('')
  const [filtroTipo, setFiltroTipo]   = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  // orden seleccionada
  const [ordenActiva, setOrdenActiva] = useState(null)
  const [loadingOrden, setLoadingOrden] = useState(false)
  const [historial, setHistorial]     = useState([])
  const [mecanicos, setMecanicos]     = useState([])
  const [guardando, setGuardando]     = useState(false)

  // alertas
  const [error, setError]   = useState('')
  const [exito, setExito]   = useState('')

  // formulario de diagnóstico
  const [form, setForm] = useState({
    diagnostico_tecnico:    '',
    estado_id:              '',
    mecanico_asignado_id:   '',
    prioridad_id:           '',
    fecha_entrega_estimada: '',
    hora_entrega_estimada:  '',
    observaciones:          '',
  })

  // ─── carga inicial ──────────────────────────────────────────────────────────

  const cargarOrdenes = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const filters = {}
      if (busqueda)     filters.search        = busqueda
      if (filtroTipo)   filters.tipo_orden_id = filtroTipo
      if (filtroEstado) filters.estado_id     = filtroEstado
      const res = await diagnosticoService.getOrdenesParaDiagnostico(filters)
      setOrdenes(res.data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar órdenes')
    } finally {
      setLoading(false)
    }
  }, [busqueda, filtroTipo, filtroEstado])

  const cargarMecanicos = useCallback(async () => {
    try {
      const res = await diagnosticoService.getMecanicos()
      setMecanicos(res.data || [])
    } catch (_) {}
  }, [])

  useEffect(() => { cargarOrdenes() }, [cargarOrdenes])
  useEffect(() => { cargarMecanicos() }, [cargarMecanicos])

  // ─── abrir orden ────────────────────────────────────────────────────────────

  const handleSeleccionarOrden = async (orden) => {
    setLoadingOrden(true)
    setError('')
    try {
      const [resOrden, resHist] = await Promise.all([
        diagnosticoService.getOrdenById(orden.id),
        diagnosticoService.getHistorial(orden.id),
      ])
      const o = resOrden.data
      setOrdenActiva(o)
      setHistorial(resHist.data || [])
      setForm({
        diagnostico_tecnico:    o.diagnostico_tecnico    || '',
        estado_id:              o.estado_id              || '',
        mecanico_asignado_id:   o.mecanico_asignado_id   || '',
        prioridad_id:           o.prioridad_id           || '',
        fecha_entrega_estimada: o.fecha_entrega_estimada ? o.fecha_entrega_estimada.split('T')[0] : '',
        hora_entrega_estimada:  o.hora_entrega_estimada  || '',
        observaciones:          o.observaciones          || '',
      })
    } catch (err) {
      setError(err.message || 'Error al cargar la orden')
    } finally {
      setLoadingOrden(false)
    }
  }

  // ─── guardar diagnóstico ────────────────────────────────────────────────────

  const handleGuardar = async () => {
    if (!ordenActiva) return
    setGuardando(true)
    setError('')
    try {
      const payload = {
        diagnostico_tecnico:    form.diagnostico_tecnico    || undefined,
        estado_id:              form.estado_id              ? parseInt(form.estado_id) : undefined,
        mecanico_asignado_id:   form.mecanico_asignado_id   ? parseInt(form.mecanico_asignado_id) : undefined,
        prioridad_id:           form.prioridad_id           ? parseInt(form.prioridad_id) : undefined,
        fecha_entrega_estimada: form.fecha_entrega_estimada || undefined,
        hora_entrega_estimada:  form.hora_entrega_estimada  || undefined,
        observaciones:          form.observaciones          || undefined,
      }
      const res = await diagnosticoService.guardarDiagnostico(ordenActiva.id, payload)
      const updated = res.data
      setOrdenActiva(updated)

      // recargar historial
      const resHist = await diagnosticoService.getHistorial(ordenActiva.id)
      setHistorial(resHist.data || [])

      setExito('Diagnóstico guardado correctamente')
      setTimeout(() => setExito(''), 3000)

      // refrescar lista
      await cargarOrdenes()
    } catch (err) {
      setError(err.message || 'Error al guardar diagnóstico')
    } finally {
      setGuardando(false)
    }
  }

  // ─── helpers ────────────────────────────────────────────────────────────────

  const mostrarExito = (msg) => { setExito(msg); setTimeout(() => setExito(''), 3000) }

  const fmtFecha = (str) => {
    if (!str) return '—'
    return new Date(str).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const fmtFechaCorta = (str) => {
    if (!str) return '—'
    return new Date(str).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })
  }

  const getEstadoBadge = (nombre) => {
    const cfg = ESTADO_COLORES[nombre] || { bg: '#f1f5f9', color: '#475569', label: nombre }
    return (
      <span className={styles.badge} style={{ background: cfg.bg, color: cfg.color }}>
        {cfg.label}
      </span>
    )
  }

  const getPrioridadDot = (nivel) => {
    const cfg = PRIORIDAD_COLORES[nivel] || PRIORIDAD_COLORES[2]
    return <span className={styles.prioridadDot} style={{ background: cfg.color }} title={cfg.label} />
  }

  const etiquetaOrden = (o) => {
    if (o.tipo_orden_id === 1) return `${o.marca_vehiculo || ''} ${o.modelo_vehiculo || ''} · ${o.placa_vehiculo || ''}`.trim()
    return [o.tipo_pieza, o.marca_pieza].filter(Boolean).join(' · ') || '—'
  }

  // ─── render ──────────────────────────────────────────────────────────────────

  return (
    <div className={styles.wrapper}>

      {/* título de página */}
      <h1 className={styles.pageTitle}>Diagnóstico Técnico</h1>
      <p className={styles.pageSubtitle}>
        Registra diagnósticos, asigna mecánicos y actualiza el estado de las órdenes de trabajo.
      </p>

      {/* alertas globales */}
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

      {/* layout principal: lista + panel */}
      <div className={styles.layout}>

        {/* ── PANEL IZQUIERDO — lista de órdenes ── */}
        <div className={styles.panelLista}>

          {/* filtros */}
          <div className={styles.listaHeader}>
            <div className={styles.searchBox}>
              <Search size={14} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar orden, cliente, placa..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filtrosRow}>
              <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className={styles.select}>
                <option value="">Todos</option>
                <option value="1">Vehículo</option>
                <option value="2">Laboratorio</option>
              </select>
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className={styles.select}>
                <option value="">Todos los estados</option>
                {ESTADOS_DISPONIBLES.map(e => (
                  <option key={e.id} value={e.id}>{ESTADO_COLORES[e.nombre]?.label || e.nombre}</option>
                ))}
              </select>
              <button className={styles.btnRefresh} onClick={cargarOrdenes} title="Actualizar">
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* lista */}
          <div className={styles.lista}>
            {loading ? (
              <div className={styles.listaEmpty}>
                <RefreshCw size={28} className={styles.spin} />
                <p>Cargando órdenes...</p>
              </div>
            ) : ordenes.length === 0 ? (
              <div className={styles.listaEmpty}>
                <ClipboardList size={36} />
                <p>No hay órdenes disponibles</p>
              </div>
            ) : (
              ordenes.map((orden) => {
                const activa = ordenActiva?.id === orden.id
                return (
                  <div
                    key={orden.id}
                    className={`${styles.ordenItem} ${activa ? styles.ordenItemActiva : ''}`}
                    onClick={() => handleSeleccionarOrden(orden)}
                  >
                    <div className={styles.ordenItemTop}>
                      <div className={styles.ordenItemLeft}>
                        {getPrioridadDot(orden.prioridad_nivel)}
                        <span className={styles.ordenNum}>{orden.numero_orden}</span>
                        <span className={orden.tipo_orden_id === 2 ? styles.tipoBadgeLab : styles.tipoBadgeVeh}>
                          {orden.tipo_orden_id === 2 ? 'Lab' : 'Veh'}
                        </span>
                      </div>
                      <ChevronRight size={14} className={styles.chevron} />
                    </div>

                    <p className={styles.ordenCliente}>
                      <User size={12} /> {orden.nombre_cliente}
                    </p>
                    <p className={styles.ordenSujeto}>
                      {orden.tipo_orden_id === 1 ? <Car size={12} /> : <Package size={12} />}
                      {etiquetaOrden(orden)}
                    </p>

                    <div className={styles.ordenItemBottom}>
                      {getEstadoBadge(orden.estado_nombre)}
                      <span className={styles.ordenFecha}>{fmtFechaCorta(orden.fecha_recepcion)}</span>
                    </div>

                    {orden.mecanico_nombre && (
                      <p className={styles.ordenMecanico}>
                        <UserCheck size={11} /> {orden.mecanico_nombre}
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── PANEL DERECHO — diagnóstico ── */}
        <div className={styles.panelDiagnostico}>
          {!ordenActiva ? (
            <div className={styles.panelVacio}>
              <div className={styles.panelVacioIcon}>
                <Wrench size={48} />
              </div>
              <h3>Selecciona una orden</h3>
              <p>Haz clic en una orden de la lista para registrar o editar su diagnóstico técnico.</p>
            </div>
          ) : loadingOrden ? (
            <div className={styles.panelVacio}>
              <RefreshCw size={32} className={styles.spin} />
              <p>Cargando diagnóstico...</p>
            </div>
          ) : (
            <div className={styles.diagnosticoContent}>

              {/* encabezado de la orden */}
              <div className={styles.diagHeader}>
                <div className={styles.diagHeaderLeft}>
                  <div className={styles.diagOrdenNum}>{ordenActiva.numero_orden}</div>
                  <div className={styles.diagOrdenInfo}>
                    <span>{ordenActiva.nombre_cliente}</span>
                    {ordenActiva.telefono_cliente && (
                      <span><Phone size={11} /> {ordenActiva.telefono_cliente}</span>
                    )}
                  </div>
                </div>
                <div className={styles.diagHeaderRight}>
                  {getEstadoBadge(ordenActiva.estado_nombre)}
                  <span className={styles.diagFechaRecep}>
                    <Calendar size={11} /> {fmtFecha(ordenActiva.fecha_recepcion)}
                  </span>
                </div>
              </div>

              {/* info del sujeto */}
              <div className={styles.infoSujeto}>
                {ordenActiva.tipo_orden_id === 1 ? (
                  <>
                    <div className={styles.infoSujetoItem}>
                      <span className={styles.infoSujetoLabel}>VEHÍCULO</span>
                      <span className={styles.infoSujetoVal}>
                        {ordenActiva.marca_vehiculo} {ordenActiva.modelo_vehiculo} {ordenActiva.anio_vehiculo || ''}
                      </span>
                    </div>
                    <div className={styles.infoSujetoItem}>
                      <span className={styles.infoSujetoLabel}>PLACA</span>
                      <span className={styles.infoSujetoVal}>{ordenActiva.placa_vehiculo || '—'}</span>
                    </div>
                    {ordenActiva.vin_vehiculo && (
                      <div className={styles.infoSujetoItem}>
                        <span className={styles.infoSujetoLabel}>VIN</span>
                        <span className={styles.infoSujetoVal}>{ordenActiva.vin_vehiculo}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className={styles.infoSujetoItem}>
                      <span className={styles.infoSujetoLabel}>PIEZA</span>
                      <span className={styles.infoSujetoVal}>{ordenActiva.tipo_pieza || '—'}</span>
                    </div>
                    {ordenActiva.marca_pieza && (
                      <div className={styles.infoSujetoItem}>
                        <span className={styles.infoSujetoLabel}>MARCA</span>
                        <span className={styles.infoSujetoVal}>{ordenActiva.marca_pieza}</span>
                      </div>
                    )}
                    {ordenActiva.modelo_origen && (
                      <div className={styles.infoSujetoItem}>
                        <span className={styles.infoSujetoLabel}>MODELO ORIGEN</span>
                        <span className={styles.infoSujetoVal}>{ordenActiva.modelo_origen}</span>
                      </div>
                    )}
                    {ordenActiva.numero_parte && (
                      <div className={styles.infoSujetoItem}>
                        <span className={styles.infoSujetoLabel}>N° PARTE</span>
                        <span className={styles.infoSujetoVal}>{ordenActiva.numero_parte}</span>
                      </div>
                    )}
                  </>
                )}
                <div className={styles.infoSujetoItem}>
                  <span className={styles.infoSujetoLabel}>PROBLEMA</span>
                  <span className={styles.infoSujetoVal}>{ordenActiva.descripcion_problema || '—'}</span>
                </div>
              </div>

              {/* formulario de diagnóstico */}
              <div className={styles.formGrid}>

                {/* diagnóstico técnico */}
                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>
                    <ClipboardList size={14} />
                    Diagnóstico Técnico
                  </label>
                  <textarea
                    value={form.diagnostico_tecnico}
                    onChange={(e) => setForm({ ...form, diagnostico_tecnico: e.target.value })}
                    className={styles.textarea}
                    rows={5}
                    placeholder="Describe el diagnóstico técnico detallado de la falla o condición encontrada..."
                  />
                </div>

                {/* estado */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <ArrowRight size={14} />
                    Estado
                  </label>
                  <select
                    value={form.estado_id}
                    onChange={(e) => setForm({ ...form, estado_id: e.target.value })}
                    className={styles.select2}
                  >
                    <option value="">Sin cambio</option>
                    {ESTADOS_DISPONIBLES.map(e => (
                      <option key={e.id} value={e.id}>
                        {ESTADO_COLORES[e.nombre]?.label || e.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* mecánico */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <UserCheck size={14} />
                    Mecánico Asignado
                  </label>
                  <select
                    value={form.mecanico_asignado_id}
                    onChange={(e) => setForm({ ...form, mecanico_asignado_id: e.target.value })}
                    className={styles.select2}
                  >
                    <option value="">Sin asignar</option>
                    {mecanicos.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre_completo}</option>
                    ))}
                  </select>
                </div>

                {/* prioridad */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <Flag size={14} />
                    Prioridad
                  </label>
                  <select
                    value={form.prioridad_id}
                    onChange={(e) => setForm({ ...form, prioridad_id: e.target.value })}
                    className={styles.select2}
                  >
                    <option value="">Sin cambio</option>
                    <option value="1">Alta</option>
                    <option value="2">Media</option>
                    <option value="3">Baja</option>
                  </select>
                </div>

                {/* fecha entrega estimada */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <Calendar size={14} />
                    Fecha Est. Entrega
                  </label>
                  <input
                    type="date"
                    value={form.fecha_entrega_estimada}
                    onChange={(e) => setForm({ ...form, fecha_entrega_estimada: e.target.value })}
                    className={styles.input}
                  />
                </div>

                {/* hora entrega estimada */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <Clock size={14} />
                    Hora Est. Entrega
                  </label>
                  <input
                    type="time"
                    value={form.hora_entrega_estimada}
                    onChange={(e) => setForm({ ...form, hora_entrega_estimada: e.target.value })}
                    className={styles.input}
                  />
                </div>

                {/* observaciones */}
                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>Observaciones</label>
                  <textarea
                    value={form.observaciones}
                    onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                    className={styles.textarea}
                    rows={2}
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>

              {/* botón guardar */}
              <div className={styles.formActions}>
                <button
                  className={styles.btnGuardar}
                  onClick={handleGuardar}
                  disabled={guardando}
                >
                  <Save size={16} />
                  {guardando ? 'Guardando...' : 'Guardar Diagnóstico'}
                </button>
              </div>

              {/* historial de estados */}
              {historial.length > 0 && (
                <div className={styles.historialSection}>
                  <h4 className={styles.historialTitle}>
                    <History size={15} />
                    Historial de Estados
                  </h4>
                  <div className={styles.timeline}>
                    {historial.map((h, i) => (
                      <div key={h.id || i} className={styles.timelineItem}>
                        <div className={styles.timelineDot} />
                        <div className={styles.timelineContent}>
                          <div className={styles.timelineEstados}>
                            {h.estado_anterior_nombre && (
                              <>
                                <span className={styles.timelineEstadoOld}>
                                  {ESTADO_COLORES[h.estado_anterior_nombre]?.label || h.estado_anterior_nombre}
                                </span>
                                <ArrowRight size={11} className={styles.timelineArrow} />
                              </>
                            )}
                            <span className={styles.timelineEstadoNew}>
                              {ESTADO_COLORES[h.estado_nuevo_nombre]?.label || h.estado_nuevo_nombre}
                            </span>
                          </div>
                          <span className={styles.timelineMeta}>
                            {h.cambiado_por_nombre || 'Sistema'} · {fmtFecha(h.fecha_cambio)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}