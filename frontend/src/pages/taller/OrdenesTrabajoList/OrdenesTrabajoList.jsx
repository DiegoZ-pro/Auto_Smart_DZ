import { useState, useEffect, useCallback } from 'react'
import {
  Search, RefreshCw, Filter, Eye, FileText, Car, Wrench,
  User, Calendar, DollarSign, AlertCircle, Check, X,
  Clock, CheckCircle, ArrowRight, UserCheck, ChevronDown
} from 'lucide-react'
import { ordenesListService } from '../../../services/ordenesListService'
import styles from './OrdenesTrabajoList.module.css'

const ESTADOS = {
  recepcionado:        { label: 'Recepcionado',      color: '#2563eb', bg: '#eff6ff' },
  en_diagnostico:      { label: 'En Diagnóstico',    color: '#ca8a04', bg: '#fefce8' },
  diagnosticado:       { label: 'Diagnosticado',     color: '#16a34a', bg: '#f0fdf4' },
  en_reparacion:       { label: 'En Reparación',     color: '#ea580c', bg: '#fff7ed' },
  esperando_repuestos: { label: 'Esp. Repuestos',    color: '#9333ea', bg: '#fdf4ff' },
  pruebas_finales:     { label: 'Pruebas Finales',   color: '#0891b2', bg: '#ecfeff' },
  listo_entrega:       { label: 'Listo Entrega',     color: '#15803d', bg: '#f0fdf4' },
  entregado:           { label: 'Entregado',         color: '#475569', bg: '#f8fafc' },
  cancelado:           { label: 'Cancelado',         color: '#dc2626', bg: '#fef2f2' },
}

const PRIO = {
  1: { color: '#dc2626', label: 'Alta'   },
  2: { color: '#f59e0b', label: 'Media'  },
  3: { color: '#22c55e', label: 'Baja'   },
  4: { color: '#7c3aed', label: 'Urgente'},
}

const fmtFecha = (str) => str
  ? new Date(str).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—'

const fmtBs = (n) => n > 0 ? `Bs. ${parseFloat(n).toFixed(2)}` : '—'

export default function OrdenesTrabajoList() {
  const [ordenes,    setOrdenes]    = useState([])
  const [stats,      setStats]      = useState(null)
  const [mecanicos,  setMecanicos]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [exito,      setExito]      = useState('')

  // filtros
  const [busqueda,    setBusqueda]    = useState('')
  const [filtroTipo,  setFiltroTipo]  = useState('')
  const [filtroEst,   setFiltroEst]   = useState('')
  const [filtroPrio,  setFiltroPrio]  = useState('')
  const [fechaDesde,  setFechaDesde]  = useState('')
  const [fechaHasta,  setFechaHasta]  = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  // modal detalle
  const [modalOrden,    setModalOrden]    = useState(null)
  const [historial,     setHistorial]     = useState([])
  const [loadingModal,  setLoadingModal]  = useState(false)
  const [nuevoEstado,   setNuevoEstado]   = useState('')
  const [cambiandoEst,  setCambiandoEst]  = useState(false)

  // ─── carga ──────────────────────────────────────────────────────────────────

  const cargarTodo = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const filters = {}
      if (busqueda)   filters.search       = busqueda
      if (filtroTipo) filters.tipo_orden_id = filtroTipo
      if (filtroEst)  filters.estado_id    = filtroEst
      if (fechaDesde) filters.fecha_desde  = fechaDesde
      if (fechaHasta) filters.fecha_hasta  = fechaHasta

      const [resOrd, resStats, resMec] = await Promise.all([
        ordenesListService.getAll(filters),
        ordenesListService.getEstadisticas(fechaDesde, fechaHasta),
        ordenesListService.getMecanicos(),
      ])
      setOrdenes(resOrd.data || [])
      setStats(resStats.data || null)
      setMecanicos(resMec.data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar órdenes')
    } finally { setLoading(false) }
  }, [busqueda, filtroTipo, filtroEst, fechaDesde, fechaHasta])

  useEffect(() => { cargarTodo() }, [cargarTodo])

  // filtro de prioridad local
  const ordenesFiltradas = filtroPrio
    ? ordenes.filter(o => String(o.prioridad_nivel) === filtroPrio)
    : ordenes

  // ─── modal ────────────────────────────────────────────────────────────────

  const abrirModal = async (orden) => {
    setLoadingModal(true); setModalOrden(orden); setNuevoEstado('')
    try {
      const [resOrd, resHist] = await Promise.all([
        ordenesListService.getById(orden.id),
        ordenesListService.getHistorial(orden.id),
      ])
      setModalOrden(resOrd.data)
      setHistorial(resHist.data || [])
    } catch (_) {}
    setLoadingModal(false)
  }

  const cerrarModal = () => { setModalOrden(null); setHistorial([]) }

  const handleCambiarEstado = async () => {
    if (!nuevoEstado || !modalOrden) return
    setCambiandoEst(true)
    try {
      await ordenesListService.cambiarEstado(modalOrden.id, parseInt(nuevoEstado))
      setExito('Estado actualizado correctamente')
      setTimeout(() => setExito(''), 3000)
      cerrarModal()
      await cargarTodo()
    } catch (err) {
      setError(err.message || 'Error al cambiar estado')
    } finally { setCambiandoEst(false) }
  }

  // ─── render ──────────────────────────────────────────────────────────────

  return (
    <div className={styles.wrapper}>

      <h1 className={styles.pageTitle}>Órdenes de Trabajo</h1>
      <p className={styles.pageSubtitle}>Gestión y seguimiento de todas las órdenes del taller.</p>

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

      {/* ── stats ────────────────────────────────────────────────────────── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#eff6ff', color: '#2563eb' }}><FileText size={20} /></div>
          <div><div className={styles.statVal}>{ordenes.length}</div><div className={styles.statLabel}>Total órdenes</div></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fff7ed', color: '#ea580c' }}><Clock size={20} /></div>
          <div>
            <div className={styles.statVal}>
              {ordenes.filter(o => !['completado','entregado','cancelado'].includes(o.estado_nombre)).length}
            </div>
            <div className={styles.statLabel}>En proceso</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}><CheckCircle size={20} /></div>
          <div>
            <div className={styles.statVal}>
              {ordenes.filter(o => ['completado','entregado'].includes(o.estado_nombre)).length}
            </div>
            <div className={styles.statLabel}>Completadas</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fdf4ff', color: '#9333ea' }}><DollarSign size={20} /></div>
          <div>
            <div className={styles.statVal}>
              Bs. {ordenes.reduce((s, o) => s + parseFloat(o.costo_final || 0), 0).toFixed(0)}
            </div>
            <div className={styles.statLabel}>Ingresos totales</div>
          </div>
        </div>
      </div>

      {/* ── barra de filtros ─────────────────────────────────────────────── */}
      <div className={styles.filtersCard}>
        <div className={styles.filtersRow}>
          <div className={styles.searchBox}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por N° orden, cliente, placa..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className={styles.select}>
            <option value="">Todos los tipos</option>
            <option value="1">Vehículo (OT)</option>
            <option value="2">Laboratorio (OR)</option>
          </select>
          <select value={filtroEst} onChange={e => setFiltroEst(e.target.value)} className={styles.select}>
            <option value="">Todos los estados</option>
            {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={filtroPrio} onChange={e => setFiltroPrio(e.target.value)} className={styles.select}>
            <option value="">Prioridad</option>
            {Object.entries(PRIO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button
            className={styles.btnFiltrosExt}
            onClick={() => setMostrarFiltros(p => !p)}
            title="Filtros de fecha"
          >
            <Filter size={14} /> Fecha <ChevronDown size={12} />
          </button>
          <button className={styles.btnRefresh} onClick={cargarTodo} title="Actualizar">
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

      {/* ── tabla ─────────────────────────────────────────────────────────── */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.emptyState}><RefreshCw size={28} className={styles.spin} /><p>Cargando órdenes...</p></div>
        ) : ordenesFiltradas.length === 0 ? (
          <div className={styles.emptyState}><FileText size={40} /><p>No hay órdenes con los filtros seleccionados</p></div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>N° Orden</th>
                  <th>Tipo</th>
                  <th>Cliente</th>
                  <th>Vehículo / Pieza</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Mecánico</th>
                  <th>Recepción</th>
                  <th>Costo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenesFiltradas.map(o => {
                  const est  = ESTADOS[o.estado_nombre] || { label: o.estado_nombre, color: '#64748b', bg: '#f8fafc' }
                  const prio = PRIO[o.prioridad_nivel]  || PRIO[2]
                  return (
                    <tr key={o.id}>
                      <td className={styles.numOrden}>{o.numero_orden}</td>
                      <td>
                        <span className={o.tipo_orden_id === 2 ? styles.badgeLab : styles.badgeVeh}>
                          {o.tipo_orden_id === 2 ? 'Lab' : 'Veh'}
                        </span>
                      </td>
                      <td className={styles.tdCliente}>
                        <span className={styles.clienteNombre}>{o.nombre_cliente}</span>
                        {o.telefono_cliente && <span className={styles.clienteTel}>{o.telefono_cliente}</span>}
                      </td>
                      <td className={styles.tdSujeto}>
                        {o.tipo_orden_id === 1
                          ? `${o.marca_vehiculo || ''} ${o.modelo_vehiculo || ''} ${o.placa_vehiculo ? '· ' + o.placa_vehiculo : ''}`.trim() || '—'
                          : [o.tipo_pieza, o.marca_pieza].filter(Boolean).join(' · ') || '—'}
                      </td>
                      <td>
                        <span className={styles.estadoBadge} style={{ background: est.bg, color: est.color }}>
                          {est.label}
                        </span>
                      </td>
                      <td>
                        <div className={styles.prioBadge}>
                          <span className={styles.prioDot} style={{ background: prio.color }} />
                          {prio.label}
                        </div>
                      </td>
                      <td className={styles.tdMecanico}>
                        {o.mecanico_nombre
                          ? <><UserCheck size={12} /> {o.mecanico_nombre}</>
                          : <span className={styles.sinAsignar}>Sin asignar</span>}
                      </td>
                      <td className={styles.tdFecha}>{fmtFecha(o.fecha_recepcion)}</td>
                      <td className={styles.tdCosto}>
                        {o.costo_final > 0
                          ? <span className={styles.costoFinal}>{fmtBs(o.costo_final)}</span>
                          : o.costo_estimado > 0
                            ? <span className={styles.costoEst}>{fmtBs(o.costo_estimado)} est.</span>
                            : '—'}
                      </td>
                      <td>
                        <button className={styles.btnVer} onClick={() => abrirModal(o)} title="Ver detalles">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && ordenesFiltradas.length > 0 && (
          <div className={styles.tableFooter}>
            Mostrando {ordenesFiltradas.length} orden{ordenesFiltradas.length !== 1 ? 'es' : ''}
          </div>
        )}
      </div>

      {/* ── MODAL DETALLE ─────────────────────────────────────────────────── */}
      {modalOrden && (
        <div className={styles.overlay} onClick={cerrarModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>

            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalOrdenNum}>{modalOrden.numero_orden}</h2>
                <div className={styles.modalMeta}>
                  <span className={styles.badgeVeh} style={{ background: modalOrden.tipo_orden_id === 2 ? '#fff7ed' : '#eff6ff', color: modalOrden.tipo_orden_id === 2 ? '#c2410c' : '#1d4ed8' }}>
                    {modalOrden.tipo_orden_id === 2 ? 'Laboratorio' : 'Vehículo'}
                  </span>
                  {(() => { const e = ESTADOS[modalOrden.estado_nombre]; return e ? <span className={styles.estadoBadge} style={{ background: e.bg, color: e.color }}>{e.label}</span> : null })()}
                </div>
              </div>
              <button className={styles.modalClose} onClick={cerrarModal}><X size={20} /></button>
            </div>

            {loadingModal ? (
              <div className={styles.emptyState}><RefreshCw size={24} className={styles.spin} /><p>Cargando...</p></div>
            ) : (
              <div className={styles.modalBody}>

                {/* datos del cliente */}
                <div className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}><User size={14} /> Datos del Cliente</h3>
                  <div className={styles.modalGrid}>
                    <div className={styles.modalField}><span className={styles.modalLabel}>Nombre</span><span>{modalOrden.nombre_cliente}</span></div>
                    <div className={styles.modalField}><span className={styles.modalLabel}>Teléfono</span><span>{modalOrden.telefono_cliente || '—'}</span></div>
                    <div className={styles.modalField}><span className={styles.modalLabel}>Email</span><span>{modalOrden.email_cliente || '—'}</span></div>
                    {modalOrden.empresa_cliente && <div className={styles.modalField}><span className={styles.modalLabel}>Empresa</span><span>{modalOrden.empresa_cliente}</span></div>}
                  </div>
                </div>

                {/* vehículo o pieza */}
                <div className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>
                    {modalOrden.tipo_orden_id === 1 ? <><Car size={14} /> Vehículo</> : <><Wrench size={14} /> Pieza</>}
                  </h3>
                  <div className={styles.modalGrid}>
                    {modalOrden.tipo_orden_id === 1 ? (
                      <>
                        <div className={styles.modalField}><span className={styles.modalLabel}>Marca / Modelo</span><span>{modalOrden.marca_vehiculo} {modalOrden.modelo_vehiculo}</span></div>
                        <div className={styles.modalField}><span className={styles.modalLabel}>Placa</span><span>{modalOrden.placa_vehiculo || '—'}</span></div>
                        <div className={styles.modalField}><span className={styles.modalLabel}>Año</span><span>{modalOrden.anio_vehiculo || '—'}</span></div>
                        {modalOrden.vin_vehiculo && <div className={styles.modalField}><span className={styles.modalLabel}>VIN</span><span>{modalOrden.vin_vehiculo}</span></div>}
                        {modalOrden.tipo_combustible && <div className={styles.modalField}><span className={styles.modalLabel}>Combustible</span><span>{modalOrden.tipo_combustible}</span></div>}
                      </>
                    ) : (
                      <>
                        <div className={styles.modalField}><span className={styles.modalLabel}>Tipo de Pieza</span><span>{modalOrden.tipo_pieza || '—'}</span></div>
                        <div className={styles.modalField}><span className={styles.modalLabel}>Marca</span><span>{modalOrden.marca_pieza || '—'}</span></div>
                        <div className={styles.modalField}><span className={styles.modalLabel}>Modelo Origen</span><span>{modalOrden.modelo_origen || '—'}</span></div>
                        {modalOrden.numero_parte && <div className={styles.modalField}><span className={styles.modalLabel}>N° Parte</span><span>{modalOrden.numero_parte}</span></div>}
                      </>
                    )}
                  </div>
                </div>

                {/* diagnóstico y gestión */}
                <div className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}><FileText size={14} /> Diagnóstico y Gestión</h3>
                  <div className={styles.modalGrid}>
                    <div className={styles.modalField}><span className={styles.modalLabel}>Mecánico</span><span>{modalOrden.mecanico_nombre || 'Sin asignar'}</span></div>
                    <div className={styles.modalField}><span className={styles.modalLabel}>Prioridad</span>
                      <span style={{ color: PRIO[modalOrden.prioridad_nivel]?.color, fontWeight: 700 }}>
                        {PRIO[modalOrden.prioridad_nivel]?.label || '—'}
                      </span>
                    </div>
                    <div className={styles.modalField}><span className={styles.modalLabel}>F. Recepción</span><span>{fmtFecha(modalOrden.fecha_recepcion)}</span></div>
                    {modalOrden.fecha_entrega_estimada && <div className={styles.modalField}><span className={styles.modalLabel}>Entrega Est.</span><span>{fmtFecha(modalOrden.fecha_entrega_estimada)}</span></div>}
                    <div className={styles.modalField}><span className={styles.modalLabel}>Costo Estimado</span><span>{fmtBs(modalOrden.costo_estimado)}</span></div>
                    {modalOrden.costo_final > 0 && <div className={styles.modalField}><span className={styles.modalLabel}>Costo Final</span><span className={styles.costoFinal}>{fmtBs(modalOrden.costo_final)}</span></div>}
                  </div>
                  {modalOrden.descripcion_problema && (
                    <div className={styles.textBlock}>
                      <span className={styles.modalLabel}>Problema reportado</span>
                      <p>{modalOrden.descripcion_problema}</p>
                    </div>
                  )}
                  {modalOrden.diagnostico_tecnico && (
                    <div className={styles.textBlock} style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                      <span className={styles.modalLabel}>Diagnóstico técnico</span>
                      <p>{modalOrden.diagnostico_tecnico}</p>
                    </div>
                  )}
                </div>

                {/* cambiar estado */}
                <div className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}><ArrowRight size={14} /> Cambiar Estado</h3>
                  <div className={styles.cambiarEstadoRow}>
                    <select value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)} className={styles.select}>
                      <option value="">Seleccionar nuevo estado...</option>
                      {Object.entries(ESTADOS).map(([k, v]) => (
                        <option key={k} value={k} disabled={k === modalOrden.estado_nombre}>{v.label}</option>
                      ))}
                    </select>
                    <button
                      className={styles.btnCambiarEst}
                      onClick={handleCambiarEstado}
                      disabled={!nuevoEstado || cambiandoEst}
                    >
                      <Check size={14} /> {cambiandoEst ? 'Cambiando...' : 'Aplicar'}
                    </button>
                  </div>
                </div>

                {/* historial */}
                {historial.length > 0 && (
                  <div className={styles.modalSection}>
                    <h3 className={styles.modalSectionTitle}><Clock size={14} /> Historial de Estados</h3>
                    <div className={styles.timeline}>
                      {historial.map((h, i) => (
                        <div key={h.id || i} className={styles.timelineItem}>
                          <div className={styles.timelineDot} />
                          <div>
                            <div className={styles.timelineEstados}>
                              {h.estado_anterior_nombre && (
                                <><span className={styles.estAnterior}>{ESTADOS[h.estado_anterior_nombre]?.label || h.estado_anterior_nombre}</span><ArrowRight size={10} /></>
                              )}
                              <span className={styles.estNuevo}>{ESTADOS[h.estado_nuevo_nombre]?.label || h.estado_nuevo_nombre}</span>
                            </div>
                            <span className={styles.timelineMeta}>{h.cambiado_por_nombre || 'Sistema'} · {fmtFecha(h.fecha_cambio)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            <div className={styles.modalFooter}>
              <button className={styles.btnCerrar} onClick={cerrarModal}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}