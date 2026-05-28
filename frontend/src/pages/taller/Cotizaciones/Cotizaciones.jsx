import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, Edit, MessageCircle, Download,
  X, Trash2, Package, Calendar,
  Car, Wrench, Check, AlertCircle, RefreshCw, FileText,
  Info, User, ClipboardList, ChevronRight
} from 'lucide-react'
import { cotizacionesService } from '../../../services/cotizacionesService'
import styles from './Cotizaciones.module.css'

const TERMINOS_DEFAULT = `TÉRMINOS Y CONDICIONES:

1. Esta cotización tiene validez de 15 días calendario desde la fecha de emisión.
2. Los precios están expresados en Bolivianos (Bs.)
3. Los precios incluyen mano de obra y repuestos especificados.
4. Cualquier trabajo adicional será cotizado por separado.
5. El pago puede realizarse en efectivo, transferencia bancaria o tarjeta.
6. Se requiere un anticipo del 50% para iniciar los trabajos.
7. El tiempo de entrega puede variar según disponibilidad de repuestos.`

const ESTADOS_CONFIG = {
  borrador:  { label: 'Borrador',  color: '#6b7280' },
  enviada:   { label: 'Enviada',   color: '#3b82f6' },
  aprobada:  { label: 'Aprobada',  color: '#10b981' },
  rechazada: { label: 'Rechazada', color: '#ef4444' },
  vencida:   { label: 'Vencida',   color: '#f59e0b' },
}

const ORDEN_ESTADO_COLOR = {
  recepcionado:        '#2563eb',
  en_diagnostico:      '#ca8a04',
  diagnosticado:       '#16a34a',
  en_reparacion:       '#ea580c',
  esperando_repuestos: '#9333ea',
  completado:          '#15803d',
  entregado:           '#475569',
}

// ─── PDF ──────────────────────────────────────────────────────────────────────

const generarReporteHTML = (cot) => {
  const fecha = (str) => str ? new Date(str).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'
  const bs    = (n)   => `Bs. ${parseFloat(n || 0).toFixed(2)}`
  const items = Array.isArray(cot.items_cotizacion) ? cot.items_cotizacion : []
  const esLab = cot.tipo_orden_nombre === 'laboratorio'
  const sujeto = esLab
    ? [cot.tipo_pieza, cot.marca_pieza, cot.modelo_origen, cot.numero_parte].filter(Boolean).join(' · ') || '—'
    : [cot.marca_vehiculo, cot.modelo_vehiculo, cot.anio_vehiculo, cot.placa_vehiculo ? `· ${cot.placa_vehiculo}` : ''].filter(Boolean).join(' ') || '—'
  const filas = items.map((it, i) => `
    <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'}">
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">${it.descripcion}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;">${it.cantidad}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right;">${bs(it.precio_unitario)}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">${bs(it.cantidad * it.precio_unitario)}</td>
    </tr>`).join('')
  const ec = ESTADOS_CONFIG[cot.estado_nombre] || ESTADOS_CONFIG.borrador
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>Cotización ${cot.numero_cotizacion}</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;background:#fff}
  .page{max-width:800px;margin:0 auto;padding:40px 48px}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:28px;border-bottom:3px solid #1d4ed8;margin-bottom:32px}
  .logo h1{font-size:2rem;font-weight:800;color:#1d4ed8}.logo h1 span{color:#ef4444}.logo p{font-size:.8rem;color:#64748b;margin-top:4px}
  .ci{text-align:right}.ci h2{font-size:1.4rem;font-weight:700}.ci .num{font-size:.9rem;font-family:monospace;color:#3b82f6;font-weight:700;margin-top:4px}
  .ci .dt{font-size:.75rem;color:#64748b;margin-top:4px}
  .badge{display:inline-block;padding:4px 14px;border-radius:20px;font-size:.75rem;font-weight:700;text-transform:uppercase;margin-top:8px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px}
  .box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px}
  .box h3{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-bottom:10px}
  .row{margin-bottom:8px}.lbl{display:block;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8}
  .val{display:block;font-size:.875rem;font-weight:600;color:#1e293b}
  .st{font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin-bottom:12px}
  table{width:100%;border-collapse:collapse;font-size:.875rem;margin-bottom:28px}
  thead tr{background:#1d4ed8}thead th{padding:12px 14px;text-align:left;font-size:.7rem;font-weight:700;text-transform:uppercase;color:#fff}
  thead th:not(:first-child){text-align:right}thead th:nth-child(2){text-align:center}
  .cw{display:flex;justify-content:flex-end;margin-bottom:28px}
  .cb{width:300px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden}
  .cr{display:flex;justify-content:space-between;padding:10px 16px;font-size:.875rem;border-bottom:1px solid #f1f5f9;color:#374151}
  .ct{display:flex;justify-content:space-between;padding:14px 16px;font-size:1rem;font-weight:700;color:#1d4ed8;background:#eff6ff}
  .vb{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:24px;font-size:.875rem;color:#92400e}
  .tb{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:28px}
  .tb h3{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin-bottom:8px}
  .tb pre{font-family:inherit;font-size:.78rem;color:#374151;white-space:pre-wrap;line-height:1.7}
  .ft{margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center}
  .fm{text-align:center}.fl{width:180px;border-top:1px solid #94a3b8;margin-bottom:6px}.fm p{font-size:.75rem;color:#64748b}
  .gen{font-size:.7rem;color:#94a3b8;text-align:center}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{padding:20px 28px}}</style></head>
  <body><div class="page">
  <div class="hdr"><div class="logo"><h1>AUTO<span>SMART</span></h1><p>Sistema de Gestión de Taller Automotriz</p></div>
  <div class="ci"><h2>COTIZACIÓN</h2><div class="num">${cot.numero_cotizacion}</div><div class="dt">Emitida: ${fecha(cot.fecha_creacion)}</div>
  <span class="badge" style="background:${ec.color}22;color:${ec.color}">${ec.label}</span></div></div>
  <div class="grid">
  <div class="box"><h3>Datos del Cliente</h3>
  <div class="row"><span class="lbl">Nombre</span><span class="val">${cot.nombre_cliente || '—'}</span></div>
  <div class="row"><span class="lbl">Teléfono</span><span class="val">${cot.telefono_cliente || '—'}</span></div>
  ${cot.email_cliente ? `<div class="row"><span class="lbl">Email</span><span class="val">${cot.email_cliente}</span></div>` : ''}</div>
  <div class="box"><h3>Datos de la Orden</h3>
  <div class="row"><span class="lbl">N° Orden</span><span class="val">${cot.numero_orden || '—'}</span></div>
  <div class="row"><span class="lbl">Tipo</span><span class="val">${esLab ? 'Laboratorio' : 'Vehículo'}</span></div>
  <div class="row"><span class="lbl">${esLab ? 'Pieza' : 'Vehículo'}</span><span class="val">${sujeto}</span></div>
  ${cot.descripcion_problema ? `<div class="row"><span class="lbl">Problema</span><span class="val">${cot.descripcion_problema}</span></div>` : ''}
  ${cot.diagnostico_tecnico  ? `<div class="row"><span class="lbl">Diagnóstico</span><span class="val">${cot.diagnostico_tecnico}</span></div>` : ''}</div></div>
  <p class="st">Detalle de Ítems</p>
  <table><thead><tr><th style="width:50%">Descripción</th><th style="width:12%;text-align:center">Cant.</th><th style="width:19%">Precio Unit.</th><th style="width:19%">Subtotal</th></tr></thead>
  <tbody>${filas || `<tr><td colspan="4" style="padding:20px;text-align:center;color:#94a3b8">Sin ítems registrados</td></tr>`}</tbody></table>
  <div class="cw"><div class="cb">
  <div class="cr"><span>Subtotal Ítems</span><span>${bs(cot.subtotal)}</span></div>
  <div class="cr"><span>Mano de Obra</span><span>${bs(cot.mano_obra)}</span></div>
  ${parseFloat(cot.descuento || 0) > 0 ? `<div class="cr"><span>Descuento</span><span>- ${bs(cot.descuento)}</span></div>` : ''}
  <div class="ct"><span>TOTAL</span><span>${bs(cot.total)}</span></div></div></div>
  ${cot.valida_hasta ? `<div class="vb">Cotización válida hasta el <strong>${fecha(cot.valida_hasta)}</strong>. Pasada esta fecha los precios pueden variar.</div>` : ''}
  ${cot.terminos_condiciones ? `<div class="tb"><h3>Términos y Condiciones</h3><pre>${cot.terminos_condiciones}</pre></div>` : ''}
  <div class="ft">
  <div class="fm"><div class="fl"></div><p>Firma y sello del taller</p></div>
  <div class="gen">Generado por AutoSmart<br/>${new Date().toLocaleDateString('es-BO')}</div>
  <div class="fm"><div class="fl"></div><p>Firma del cliente</p></div></div>
  </div></body></html>`
}

const imprimirConIframe = (html) => {
  const prev = document.getElementById('__cot_print_frame__')
  if (prev) document.body.removeChild(prev)
  const iframe = document.createElement('iframe')
  iframe.id = '__cot_print_frame__'
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;'
  document.body.appendChild(iframe)
  const doc = iframe.contentDocument || iframe.contentWindow.document
  doc.open(); doc.write(html); doc.close()
  iframe.onload = () => {
    iframe.contentWindow.focus(); iframe.contentWindow.print()
    setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe) }, 2000)
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([])
  const [ordenes, setOrdenes]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [exito, setExito]               = useState('')
  const [info, setInfo]                 = useState('')

  // filtros panel izquierdo
  const [busquedaOrden, setBusquedaOrden]         = useState('')
  const [filtroTipoOrden, setFiltroTipoOrden]     = useState('')
  const [filtroEstadoOrden, setFiltroEstadoOrden] = useState('')

  // orden y cotización activas
  const [ordenSeleccionada, setOrdenSeleccionada]   = useState(null)
  const [cotizacionEditando, setCotizacionEditando] = useState(null)
  const [loadingCot, setLoadingCot]                 = useState(false)

  // formulario
  const [items, setItems]         = useState([])
  const [itemTemp, setItemTemp]   = useState({ descripcion: '', cantidad: 1, precio_unitario: '' })
  const [manoObra, setManoObra]   = useState('')
  const [validaHasta, setValidaHasta] = useState('')
  const [terminos, setTerminos]   = useState(TERMINOS_DEFAULT)
  const [guardando, setGuardando] = useState(false)

  // ─── carga inicial — ambas en paralelo ────────────────────────────────────

  const cargarTodo = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [resCot, resOrd] = await Promise.all([
        cotizacionesService.getAll(),
        cotizacionesService.getOrdenes(),
      ])
      setCotizaciones(resCot.data || [])
      setOrdenes(resOrd.data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar datos')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { cargarTodo() }, [cargarTodo])

  // ─── helpers ──────────────────────────────────────────────────────────────

  const subtotal    = items.reduce((acc, it) => acc + parseFloat(it.cantidad) * parseFloat(it.precio_unitario), 0)
  const manoObraNum = parseFloat(manoObra) || 0
  const total       = subtotal + manoObraNum

  const mostrarExito = (msg) => { setExito(msg); setTimeout(() => setExito(''), 3500) }
  const mostrarInfo  = (msg) => { setInfo(msg);  setTimeout(() => setInfo(''),  6000) }

  // mapa cotización más reciente por orden
  const cotizacionPorOrden = {}
  cotizaciones.forEach(c => {
    if (!cotizacionPorOrden[c.orden_trabajo_id]) cotizacionPorOrden[c.orden_trabajo_id] = c
  })

  const ordenesFiltradas = ordenes.filter(o => {
    const matchTipo   = !filtroTipoOrden   || String(o.tipo_orden_id) === filtroTipoOrden
    const matchEstado = !filtroEstadoOrden || o.estado_nombre === filtroEstadoOrden
    const matchBusq   = !busquedaOrden ||
      o.numero_orden?.toLowerCase().includes(busquedaOrden.toLowerCase()) ||
      o.nombre_cliente?.toLowerCase().includes(busquedaOrden.toLowerCase()) ||
      o.placa_vehiculo?.toLowerCase().includes(busquedaOrden.toLowerCase()) ||
      o.tipo_pieza?.toLowerCase().includes(busquedaOrden.toLowerCase())
    return matchTipo && matchEstado && matchBusq
  })

  const etiquetaOrden = (o) => {
    if (o.tipo_orden_id === 1)
      return `${o.marca_vehiculo || ''} ${o.modelo_vehiculo || ''} ${o.placa_vehiculo ? '· ' + o.placa_vehiculo : ''}`.trim()
    return [o.tipo_pieza, o.marca_pieza].filter(Boolean).join(' · ') || '—'
  }

  // ─── seleccionar orden — carga cotización existente si tiene ──────────────

  const handleSeleccionarOrden = async (orden) => {
    if (ordenSeleccionada?.id === orden.id) return   // ya seleccionada
    setLoadingCot(true)
    setError('')
    setOrdenSeleccionada(orden)

    const cotExist = cotizacionPorOrden[orden.id]
    if (cotExist) {
      // cargar cotización existente para editar
      try {
        const res  = await cotizacionesService.getById(cotExist.id)
        const full = res.data
        setCotizacionEditando(full)
        setItems(full.items_cotizacion || [])
        setManoObra(full.mano_obra?.toString() || '')
        setValidaHasta(full.valida_hasta ? full.valida_hasta.split('T')[0] : '')
        setTerminos(full.terminos_condiciones || TERMINOS_DEFAULT)
        // también enriquecer la orden seleccionada con campos extra
        setOrdenSeleccionada(prev => ({
          ...prev,
          descripcion_problema: full.descripcion_problema,
          diagnostico_tecnico:  full.diagnostico_tecnico,
        }))
      } catch (err) {
        setError(err.message || 'Error al cargar cotización')
        resetFormulario()
      }
    } else {
      // orden sin cotización — formulario en blanco
      setCotizacionEditando(null)
      resetFormulario()
    }
    setLoadingCot(false)
  }

  const resetFormulario = () => {
    setItems([])
    setItemTemp({ descripcion: '', cantidad: 1, precio_unitario: '' })
    setManoObra('')
    setValidaHasta('')
    setTerminos(TERMINOS_DEFAULT)
  }

  // ─── ítems ────────────────────────────────────────────────────────────────

  const handleAgregarItem = () => {
    if (!itemTemp.descripcion.trim() || !itemTemp.precio_unitario) return
    setItems(prev => [...prev, {
      descripcion:     itemTemp.descripcion.trim(),
      cantidad:        parseFloat(itemTemp.cantidad) || 1,
      precio_unitario: parseFloat(itemTemp.precio_unitario) || 0,
    }])
    setItemTemp({ descripcion: '', cantidad: 1, precio_unitario: '' })
  }

  const handleEliminarItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx))

  // ─── guardar ──────────────────────────────────────────────────────────────

  const handleGuardar = async () => {
    if (!ordenSeleccionada) { setError('Selecciona una orden de la lista'); return }
    if (items.length === 0)  { setError('Agrega al menos un ítem'); return }
    setGuardando(true); setError('')
    try {
      const payload = {
        orden_trabajo_id: ordenSeleccionada.id,
        items_cotizacion: items,
        mano_obra:        manoObraNum,
        descuento:        0,
        impuestos:        0,
        valida_hasta:     validaHasta || null,
        terminos_condiciones: terminos,
      }
      if (cotizacionEditando) {
        await cotizacionesService.update(cotizacionEditando.id, payload)
        mostrarExito('Cotización actualizada correctamente')
      } else {
        await cotizacionesService.create(payload)
        mostrarExito('Cotización creada correctamente')
      }
      await cargarTodo()
      // deseleccionar para que el usuario pueda elegir otra orden
      setOrdenSeleccionada(null)
      setCotizacionEditando(null)
      resetFormulario()
    } catch (err) {
      setError(err.message || 'Error al guardar cotización')
    } finally { setGuardando(false) }
  }

  // ─── whatsapp ─────────────────────────────────────────────────────────────

  const handleWhatsApp = async (cotId, telefono) => {
    try {
      const res  = await cotizacionesService.getById(cotId)
      const full = res.data
      const tel  = (full.telefono_cliente || telefono || '').replace(/\D/g, '')
      if (!tel) { setError('El cliente no tiene teléfono registrado'); return }
      const esLab = full.tipo_orden_nombre === 'laboratorio'
      const sujeto = esLab
        ? [full.tipo_pieza, full.marca_pieza].filter(Boolean).join(' ') || '—'
        : [full.marca_vehiculo, full.modelo_vehiculo, full.placa_vehiculo].filter(Boolean).join(' ') || '—'
      const it = Array.isArray(full.items_cotizacion) ? full.items_cotizacion : []
      const det = it.map(i => `  • ${i.descripcion}: ${i.cantidad} x Bs.${parseFloat(i.precio_unitario).toFixed(2)} = Bs.${(i.cantidad * i.precio_unitario).toFixed(2)}`).join('\n')
      const msg =
`Estimado/a *${full.nombre_cliente}*, esta es su cotización de *AutoSmart*

*N° Cotización:* ${full.numero_cotizacion}
*Orden:* ${full.numero_orden}
*${esLab ? 'Pieza' : 'Vehículo'}:* ${sujeto}

*Detalle:*
${det || '  Sin ítems'}

Subtotal: Bs. ${parseFloat(full.subtotal || 0).toFixed(2)}
Mano de obra: Bs. ${parseFloat(full.mano_obra || 0).toFixed(2)}
*TOTAL: Bs. ${parseFloat(full.total || 0).toFixed(2)}*
${full.valida_hasta ? `Válida hasta: ${new Date(full.valida_hasta).toLocaleDateString('es-BO')}` : ''}

Para aprobar o consultar comuníquese con nosotros. ¡Gracias por confiar en AutoSmart!`
      if (full.estado_nombre === 'borrador') {
        await cotizacionesService.enviar(cotId)
        await cargarTodo()
      }
      window.open(`https://wa.me/${tel.startsWith('591') ? tel : '591' + tel}?text=${encodeURIComponent(msg)}`, '_blank')
      mostrarInfo('Cotización marcada como enviada. WhatsApp abierto — solo presiona "Enviar".')
    } catch (err) { setError(err.message || 'Error al preparar el mensaje') }
  }

  const handleDescargar = async (cotId) => {
    try {
      const res = await cotizacionesService.getById(cotId)
      imprimirConIframe(generarReporteHTML(res.data))
    } catch (err) { setError(err.message || 'Error al generar el reporte') }
  }

  // ─── render ───────────────────────────────────────────────────────────────

  return (
    <div className={styles.wrapper}>

      <h1 className={styles.pageTitle}>Gestión de Cotizaciones</h1>
      <p className={styles.pageSubtitle}>
        Selecciona una orden para crear o editar su cotización. Las órdenes con cotización existente se cargan automáticamente.
      </p>

      {/* alertas */}
      {error && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}
      {exito && <div className={`${styles.alert} ${styles.alertSuccess}`}><Check size={16} /> {exito}</div>}
      {info  && (
        <div className={`${styles.alert} ${styles.alertInfo}`}>
          <Info size={16} /> {info}
          <button onClick={() => setInfo('')}><X size={14} /></button>
        </div>
      )}

      {/* ── SPLIT PANEL ─────────────────────────────────────────────────────── */}
      <div className={styles.editorLayout}>

        {/* panel izquierdo: órdenes */}
        <div className={styles.editorPanelLista}>

          <div className={styles.editorListaHeader}>
            {/* búsqueda */}
            <div className={styles.editorSearchBox}>
              <Search size={13} className={styles.editorSearchIcon} />
              <input
                type="text"
                placeholder="Buscar orden, cliente, placa..."
                value={busquedaOrden}
                onChange={e => setBusquedaOrden(e.target.value)}
                className={styles.editorSearchInput}
              />
            </div>
            {/* dropdowns + refresh — igual a la imagen */}
            <div className={styles.editorDropdownRow}>
              <select
                value={filtroTipoOrden}
                onChange={e => setFiltroTipoOrden(e.target.value)}
                className={styles.editorSelect}
              >
                <option value="">Todos</option>
                <option value="1">Vehículo</option>
                <option value="2">Laboratorio</option>
              </select>
              <select
                value={filtroEstadoOrden}
                onChange={e => setFiltroEstadoOrden(e.target.value)}
                className={styles.editorSelect}
              >
                <option value="">Todos los estados</option>
                <option value="recepcionado">Recepcionado</option>
                <option value="en_diagnostico">En diagnóstico</option>
                <option value="diagnosticado">Diagnosticado</option>
                <option value="en_reparacion">En reparación</option>
                <option value="esperando_repuestos">Esp. repuestos</option>
                <option value="completado">Completado</option>
                <option value="entregado">Entregado</option>
              </select>
              <button className={styles.btnRefreshSm} onClick={cargarTodo} title="Actualizar">
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          <div className={styles.editorLista}>
            {loading ? (
              <div className={styles.editorListaEmpty}><RefreshCw size={24} className={styles.spin} /><p>Cargando...</p></div>
            ) : ordenesFiltradas.length === 0 ? (
              <div className={styles.editorListaEmpty}><Package size={28} /><p>No hay órdenes disponibles</p></div>
            ) : ordenesFiltradas.map(orden => {
              const activa      = ordenSeleccionada?.id === orden.id
              const cotExist    = cotizacionPorOrden[orden.id]
              const estadoColor = ORDEN_ESTADO_COLOR[orden.estado_nombre] || '#64748b'
              const prioColor   = orden.prioridad_nivel === 3 ? '#dc2626' : orden.prioridad_nivel === 2 ? '#f59e0b' : '#22c55e'
              const fechaCorta  = orden.fecha_recepcion
                ? new Date(orden.fecha_recepcion).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })
                : '—'
              return (
                <div
                  key={orden.id}
                  className={`${styles.editorOrdenItem} ${activa ? styles.editorOrdenItemActiva : ''}`}
                  onClick={() => handleSeleccionarOrden(orden)}
                >
                  {/* fila 1: punto prioridad + número + tipo badge + flecha */}
                  <div className={styles.editorOrdenTop}>
                    <div className={styles.editorOrdenTopLeft}>
                      <span className={styles.prioridadDot} style={{ background: prioColor }} />
                      <span className={styles.editorOrdenNum}>{orden.numero_orden}</span>
                      <span className={orden.tipo_orden_id === 2 ? styles.tipoBadgeLab : styles.tipoBadgeVeh}>
                        {orden.tipo_orden_id === 2 ? 'Lab' : 'Veh'}
                      </span>
                    </div>
                    <ChevronRight size={13} className={styles.chevron} />
                  </div>
                  {/* fila 2: cliente */}
                  <p className={styles.editorOrdenCliente}><User size={11} /> {orden.nombre_cliente}</p>
                  {/* fila 3: vehículo/pieza */}
                  <p className={styles.editorOrdenSujeto}>
                    {orden.tipo_orden_id === 1 ? <Car size={11} /> : <Wrench size={11} />}
                    {etiquetaOrden(orden)}
                  </p>
                  {/* fila 4: estado + fecha (igual a la imagen) */}
                  <div className={styles.editorOrdenBottom}>
                    <span className={styles.editorEstadoBadge} style={{ background: estadoColor + '18', color: estadoColor }}>
                      {orden.estado_nombre}
                    </span>
                    <span className={styles.editorOrdenFecha}>{fechaCorta}</span>
                  </div>
                  {/* cotización existente */}
                  {cotExist && (
                    <>
                      <div className={styles.cotExistente}>
                        <FileText size={11} />
                        <span>{cotExist.numero_cotizacion}</span>
                        <span className={styles.cotExistenteBadge} style={{
                          background: (ESTADOS_CONFIG[cotExist.estado_nombre] || ESTADOS_CONFIG.borrador).color + '22',
                          color:      (ESTADOS_CONFIG[cotExist.estado_nombre] || ESTADOS_CONFIG.borrador).color,
                        }}>
                          {(ESTADOS_CONFIG[cotExist.estado_nombre] || ESTADOS_CONFIG.borrador).label}
                        </span>
                      </div>
                      <div className={styles.cardAcciones} onClick={e => e.stopPropagation()}>
                        <button className={styles.btnCardSend} title="Enviar por WhatsApp"
                          onClick={() => handleWhatsApp(cotExist.id, orden.telefono_cliente)}>
                          <MessageCircle size={12} /> Enviar
                        </button>
                        <button className={styles.btnCardDown} title="Descargar PDF"
                          onClick={() => handleDescargar(cotExist.id)}>
                          <Download size={12} /> PDF
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* panel derecho: formulario */}
        <div className={styles.editorPanelForm}>
          {!ordenSeleccionada ? (
            <div className={styles.editorFormVacio}>
              <div className={styles.editorFormVacioIcon}><FileText size={40} /></div>
              <h3>Selecciona una orden</h3>
              <p>Las órdenes con badge verde ya tienen cotización, se cargará automáticamente para editar. Las demás abrirán un formulario en blanco.</p>
            </div>
          ) : loadingCot ? (
            <div className={styles.editorFormVacio}>
              <RefreshCw size={28} className={styles.spin} />
              <p>Cargando cotización...</p>
            </div>
          ) : (
            <div className={styles.editorFormContent}>

              {/* encabezado del panel */}
              <div className={styles.formPanelHeader}>
                <div>
                  <h2 className={styles.formPanelTitle}>
                    {cotizacionEditando ? 'Editar Cotización' : 'Nueva Cotización'}
                  </h2>
                  {cotizacionEditando && (
                    <span className={styles.formPanelCotNum}>{cotizacionEditando.numero_cotizacion}</span>
                  )}
                </div>
                {/* acciones rápidas si ya tiene cotización */}
                {cotizacionEditando && (
                  <div className={styles.formPanelAcciones}>
                    <button className={styles.btnIconSend} title="Enviar por WhatsApp"
                      onClick={() => handleWhatsApp(cotizacionEditando.id, ordenSeleccionada.telefono_cliente)}>
                      <MessageCircle size={14} />
                    </button>
                    <button className={styles.btnIconDown} title="Descargar PDF"
                      onClick={() => handleDescargar(cotizacionEditando.id)}>
                      <Download size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* info de la orden */}
              <div className={styles.infoOrden}>
                <h3 className={styles.infoOrdenTitle}>Información de la Orden</h3>
                <div className={styles.infoOrdenGrid}>
                  <div className={styles.infoItem}><span className={styles.infoLabel}>N° ORDEN:</span><span className={styles.infoValor}>{ordenSeleccionada.numero_orden}</span></div>
                  <div className={styles.infoItem}><span className={styles.infoLabel}>CLIENTE:</span><span className={styles.infoValor}>{ordenSeleccionada.nombre_cliente}</span></div>
                  <div className={styles.infoItem}><span className={styles.infoLabel}>TELÉFONO:</span><span className={styles.infoValor}>{ordenSeleccionada.telefono_cliente || '—'}</span></div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>{ordenSeleccionada.tipo_orden_id === 2 ? 'PIEZA:' : 'VEHÍCULO:'}</span>
                    <span className={styles.infoValor}>
                      {ordenSeleccionada.tipo_orden_id === 2
                        ? [ordenSeleccionada.tipo_pieza, ordenSeleccionada.marca_pieza].filter(Boolean).join(' · ')
                        : `${ordenSeleccionada.marca_vehiculo || ''} ${ordenSeleccionada.modelo_vehiculo || ''} ${ordenSeleccionada.placa_vehiculo ? '- ' + ordenSeleccionada.placa_vehiculo : ''}`.trim()}
                    </span>
                  </div>
                </div>
                {ordenSeleccionada.descripcion_problema && (
                  <div className={styles.infoProblema}>
                    <span className={styles.infoProblemaLabel}><ClipboardList size={12} /> PROBLEMA REPORTADO</span>
                    <p className={styles.infoProblemaTexto}>{ordenSeleccionada.descripcion_problema}</p>
                  </div>
                )}
                {ordenSeleccionada.diagnostico_tecnico && (
                  <div className={styles.infoDiagnostico}>
                    <span className={styles.infoDiagnosticoLabel}><Wrench size={12} /> DIAGNÓSTICO TÉCNICO</span>
                    <p className={styles.infoDiagnosticoTexto}>{ordenSeleccionada.diagnostico_tecnico}</p>
                  </div>
                )}
              </div>

              {/* ítems */}
              <div className={styles.seccion}>
                <h3 className={styles.seccionTitle}>Ítems de la Cotización</h3>
                <div className={styles.itemInputRow}>
                  <input type="text" placeholder="Descripción del ítem (ej: Cambio de frenos)" value={itemTemp.descripcion} onChange={e => setItemTemp({ ...itemTemp, descripcion: e.target.value })} className={styles.inputDescripcion} onKeyDown={e => e.key === 'Enter' && handleAgregarItem()} />
                  <input type="number" placeholder="Cant." min="1" value={itemTemp.cantidad} onChange={e => setItemTemp({ ...itemTemp, cantidad: e.target.value })} className={styles.inputCantidad} />
                  <input type="number" placeholder="Precio Bs." min="0" step="0.01" value={itemTemp.precio_unitario} onChange={e => setItemTemp({ ...itemTemp, precio_unitario: e.target.value })} className={styles.inputPrecio} onKeyDown={e => e.key === 'Enter' && handleAgregarItem()} />
                  <button className={styles.btnAgregar} onClick={handleAgregarItem}><Plus size={15} /> Agregar</button>
                </div>
                {items.length === 0 ? (
                  <div className={styles.itemsVacio}><Package size={26} /><p>No hay ítems agregados</p></div>
                ) : (
                  <table className={styles.itemsTable}>
                    <thead><tr><th>Descripción</th><th>Cantidad</th><th>Precio Unit.</th><th>Subtotal</th><th></th></tr></thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.descripcion}</td>
                          <td>{item.cantidad}</td>
                          <td>Bs. {parseFloat(item.precio_unitario).toFixed(2)}</td>
                          <td>Bs. {(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                          <td><button className={styles.btnEliminar} onClick={() => handleEliminarItem(idx)}><Trash2 size={13} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* costos */}
              <div className={styles.seccion}>
                <h3 className={styles.seccionTitle}>Costos</h3>
                <div className={styles.costosBox}>
                  <div className={styles.manoObraRow}>
                    <label className={styles.manoObraLabel}>Mano de Obra (Bs.):</label>
                    <input type="number" placeholder="Ej: 200.00" min="0" step="0.01" value={manoObra} onChange={e => setManoObra(e.target.value)} className={styles.inputManoObra} />
                  </div>
                  <div className={styles.resumenCostos}>
                    <div className={styles.costoRow}><span>Subtotal Ítems:</span><span>Bs. {subtotal.toFixed(2)}</span></div>
                    <div className={styles.costoRow}><span>Mano de Obra:</span><span>Bs. {manoObraNum.toFixed(2)}</span></div>
                    <div className={styles.costoRowTotal}><span>TOTAL:</span><span>Bs. {total.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>

              {/* validez */}
              <div className={styles.seccion}>
                <h3 className={styles.seccionTitle}>Validez de la Cotización</h3>
                <input type="date" value={validaHasta} onChange={e => setValidaHasta(e.target.value)} className={styles.inputFecha} />
              </div>

              {/* términos */}
              <div className={styles.seccion}>
                <h3 className={styles.seccionTitle}>Términos y Condiciones</h3>
                <textarea value={terminos} onChange={e => setTerminos(e.target.value)} className={styles.textareaTerminos} rows={5} />
              </div>

              {/* guardar */}
              <div className={styles.formFooter}>
                <button className={styles.btnGuardar} onClick={handleGuardar} disabled={guardando}>
                  <Check size={16} /> {guardando ? 'Guardando...' : cotizacionEditando ? 'Actualizar Cotización' : 'Crear Cotización'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}