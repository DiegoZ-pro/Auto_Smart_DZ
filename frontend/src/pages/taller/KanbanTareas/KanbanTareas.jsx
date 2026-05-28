import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Car, Wrench, Search, RefreshCw, User, UserCheck,
  AlertCircle, Check, X, Flag
} from 'lucide-react'
import { ordenesListService } from '../../../services/ordenesListService'
import styles from './KanbanTareas.module.css'

// columnas visibles en el kanban y su configuración visual
const COLUMNAS = [
  { estado_id: 1,  nombre: 'recepcionado',        label: 'Recepcionado',      color: '#2563eb' },
  { estado_id: 2,  nombre: 'en_diagnostico',       label: 'En Diagnóstico',    color: '#ca8a04' },
  { estado_id: 3,  nombre: 'diagnosticado',        label: 'Diagnosticado',     color: '#16a34a' },
  { estado_id: 4,  nombre: 'en_reparacion',        label: 'En Reparación',     color: '#ea580c' },
  { estado_id: 5,  nombre: 'esperando_repuestos',  label: 'Esp. Repuestos',    color: '#9333ea' },
  { estado_id: 6,  nombre: 'pruebas_finales',      label: 'Pruebas Finales',   color: '#0891b2' },
  { estado_id: 7,  nombre: 'listo_entrega',        label: 'Listo Entrega',     color: '#15803d' },
  { estado_id: 8,  nombre: 'entregado',            label: 'Entregado',         color: '#475569' },
]

const PRIO = {
  1: '#dc2626',
  2: '#f59e0b',
  3: '#22c55e',
  4: '#7c3aed',
}

const fmtFechaCorta = (str) => str
  ? new Date(str).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })
  : '—'

export default function KanbanTareas() {
  const [tipoOrden, setTipoOrden]   = useState(1)   // 1=OT, 2=OR
  const [kanban,    setKanban]      = useState({})   // { estado_id: [ordenes] }
  const [loading,   setLoading]     = useState(true)
  const [busqueda,  setBusqueda]    = useState('')
  const [error,     setError]       = useState('')
  const [exito,     setExito]       = useState('')

  // drag & drop
  const dragging    = useRef(null)  // { ordenId, fromEstadoId }
  const [dragOver,  setDragOver]    = useState(null) // estadoId de la columna bajo el cursor

  // ─── carga ─────────────────────────────────────────────────────────────────

  const cargar = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await ordenesListService.getKanban(tipoOrden)
      setKanban(res.data || {})
    } catch (err) {
      setError(err.message || 'Error al cargar el kanban')
    } finally { setLoading(false) }
  }, [tipoOrden])

  useEffect(() => { cargar() }, [cargar])

  // ─── búsqueda local ────────────────────────────────────────────────────────

  const filtrarOrdenes = (ordenes) => {
    if (!busqueda) return ordenes
    const q = busqueda.toLowerCase()
    return ordenes.filter(o =>
      o.numero_orden?.toLowerCase().includes(q) ||
      o.nombre_cliente?.toLowerCase().includes(q) ||
      o.placa_vehiculo?.toLowerCase().includes(q) ||
      o.tipo_pieza?.toLowerCase().includes(q)
    )
  }

  // ─── drag & drop ──────────────────────────────────────────────────────────

  const handleDragStart = (e, orden, fromEstadoId) => {
    dragging.current = { orden, fromEstadoId }
    e.dataTransfer.effectAllowed = 'move'
    // mini delay para que el ghost se vea bien
    setTimeout(() => e.target.classList.add(styles.dragging), 0)
  }

  const handleDragEnd = (e) => {
    e.target.classList.remove(styles.dragging)
    setDragOver(null)
  }

  const handleDragOver = (e, estadoId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOver !== estadoId) setDragOver(estadoId)
  }

  const handleDrop = async (e, toColumna) => {
    e.preventDefault()
    setDragOver(null)
    if (!dragging.current) return
    const { orden, fromEstadoId } = dragging.current
    dragging.current = null
    if (fromEstadoId === toColumna.estado_id) return

    // optimistic update
    setKanban(prev => {
      const next = { ...prev }
      // quitar de origen
      next[fromEstadoId] = (next[fromEstadoId] || []).filter(o => o.id !== orden.id)
      // agregar a destino
      next[toColumna.estado_id] = [
        { ...orden, estado_id: toColumna.estado_id, estado_nombre: toColumna.nombre },
        ...(next[toColumna.estado_id] || [])
      ]
      return next
    })

    try {
      await ordenesListService.cambiarEstado(orden.id, toColumna.estado_id)
      setExito(`${orden.numero_orden} → ${toColumna.label}`)
      setTimeout(() => setExito(''), 2500)
    } catch (err) {
      setError(err.message || 'Error al mover la orden')
      cargar() // revertir
    }
  }

  // ─── render ────────────────────────────────────────────────────────────────

  const totalVisible = Object.values(kanban).reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0)

  return (
    <div className={styles.wrapper}>

      <h1 className={styles.pageTitle}>Kanban de Tareas</h1>
      <p className={styles.pageSubtitle}>
        Arrastra las órdenes entre columnas para actualizar su estado. {totalVisible > 0 && `${totalVisible} órdenes activas.`}
      </p>

      {error && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <AlertCircle size={14} /> {error}
          <button onClick={() => setError('')}><X size={12} /></button>
        </div>
      )}
      {exito && (
        <div className={`${styles.alert} ${styles.alertSuccess}`}>
          <Check size={14} /> {exito}
        </div>
      )}

      {/* toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toggleGroup}>
          <button
            className={tipoOrden === 1 ? styles.toggleActive : styles.toggle}
            onClick={() => setTipoOrden(1)}
          >
            <Car size={15} /> Taller (OT)
          </button>
          <button
            className={tipoOrden === 2 ? styles.toggleActive : styles.toggle}
            onClick={() => setTipoOrden(2)}
          >
            <Wrench size={15} /> Laboratorio (OR)
          </button>
        </div>

        <div className={styles.toolbarRight}>
          <div className={styles.searchBox}>
            <Search size={13} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar OT/OR, cliente..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button className={styles.btnRefresh} onClick={cargar} title="Actualizar">
            <RefreshCw size={14} className={loading ? styles.spin : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* tablero */}
      {loading ? (
        <div className={styles.loadingBoard}>
          <RefreshCw size={32} className={styles.spin} />
          <p>Cargando tablero...</p>
        </div>
      ) : (
        <div className={styles.board}>
          {COLUMNAS.map(col => {
            const todasOrdenes = kanban[col.estado_id] || []
            const ordenes      = filtrarOrdenes(todasOrdenes)
            const isOver       = dragOver === col.estado_id

            return (
              <div
                key={col.estado_id}
                className={`${styles.column} ${isOver ? styles.columnOver : ''}`}
                onDragOver={e => handleDragOver(e, col.estado_id)}
                onDrop={e => handleDrop(e, col)}
                onDragLeave={() => setDragOver(null)}
              >
                {/* header de columna */}
                <div className={styles.colHeader} style={{ borderTop: `3px solid ${col.color}` }}>
                  <span className={styles.colLabel}>{col.label}</span>
                  <span className={styles.colCount} style={{ background: col.color + '22', color: col.color }}>
                    {todasOrdenes.length}
                  </span>
                </div>

                {/* tarjetas */}
                <div className={styles.cards}>
                  {ordenes.length === 0 ? (
                    <div className={styles.emptyCol}>
                      {busqueda ? 'Sin coincidencias' : 'No hay órdenes en esta etapa.'}
                    </div>
                  ) : ordenes.map(orden => {
                    const prioColor = PRIO[orden.prioridad_nivel] || PRIO[2]
                    const esLab     = orden.tipo_orden_id === 2
                    const sujeto    = esLab
                      ? [orden.tipo_pieza, orden.marca_pieza].filter(Boolean).join(' ')
                      : `${orden.marca_vehiculo || ''} ${orden.modelo_vehiculo || ''}`.trim()

                    return (
                      <div
                        key={orden.id}
                        className={styles.card}
                        draggable
                        onDragStart={e => handleDragStart(e, orden, col.estado_id)}
                        onDragEnd={handleDragEnd}
                      >
                        {/* fila superior */}
                        <div className={styles.cardTop}>
                          <div className={styles.cardTopLeft}>
                            <span className={styles.prioDot} style={{ background: prioColor }} title={`Prioridad ${orden.prioridad_nombre}`} />
                            <span className={styles.cardNum}>{orden.numero_orden}</span>
                          </div>
                          <span className={esLab ? styles.badgeLab : styles.badgeVeh}>
                            {esLab ? 'Lab' : 'Veh'}
                          </span>
                        </div>

                        {/* cliente */}
                        <p className={styles.cardCliente}>
                          <User size={11} /> {orden.nombre_cliente}
                        </p>

                        {/* vehículo/pieza */}
                        {sujeto && (
                          <p className={styles.cardSujeto}>
                            {esLab ? <Wrench size={11} /> : <Car size={11} />}
                            {sujeto}
                            {!esLab && orden.placa_vehiculo && ` · ${orden.placa_vehiculo}`}
                          </p>
                        )}

                        {/* fila inferior */}
                        <div className={styles.cardBottom}>
                          {orden.mecanico_nombre ? (
                            <span className={styles.cardMecanico}>
                              <UserCheck size={11} /> {orden.mecanico_nombre.split(' ')[0]}
                            </span>
                          ) : (
                            <span className={styles.sinMecanico}>Sin asignar</span>
                          )}
                          <span className={styles.cardFecha}>
                            {fmtFechaCorta(orden.fecha_recepcion)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className={styles.dragHint}>Arrastra una tarjeta a otra columna para cambiar su estado.</p>
    </div>
  )
}