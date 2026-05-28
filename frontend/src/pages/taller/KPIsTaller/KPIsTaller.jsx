import { useState, useEffect, useCallback } from 'react'
import {
  BarChart3, RefreshCw, DollarSign, FileText,
  Users, Clock, CheckCircle, XCircle, Calendar,
  TrendingUp, CalendarCheck, AlertCircle, X
} from 'lucide-react'
import { kpisService } from '../../../services/kpisService'
import styles from './KPIsTaller.module.css'

const hoy = () => new Date().toISOString().split('T')[0]
const inicioMes = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
}
const fmt = (n, dec = 2) => isNaN(n) || n === null ? '0' : parseFloat(n).toFixed(dec)
const fmtBs = (n) => `Bs. ${fmt(n, 0)}`

const PERIODOS = [
  { label: 'Este mes',    value: 'mes' },
  { label: 'Últimos 7d', value: '7d' },
  { label: 'Últimos 30d',value: '30d' },
  { label: 'Este año',   value: 'anio' },
  { label: 'Personalizado', value: 'custom' },
]

const rangoDesde = (periodo) => {
  const d = new Date()
  if (periodo === 'mes')   return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
  if (periodo === '7d')    { d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] }
  if (periodo === '30d')   { d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0] }
  if (periodo === 'anio')  return new Date(d.getFullYear(), 0, 1).toISOString().split('T')[0]
  return inicioMes()
}

export default function KPIsTaller() {
  const [data,         setData]         = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [periodo,      setPeriodo]      = useState('mes')
  const [fechaDesde,   setFechaDesde]   = useState(inicioMes())
  const [fechaHasta,   setFechaHasta]   = useState(hoy())

  const cargar = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const desde = periodo === 'custom' ? fechaDesde : rangoDesde(periodo)
      const hasta = periodo === 'custom' ? fechaHasta : hoy()
      const kpis = await kpisService.getKPIs(desde, hasta)
      setData(kpis)
    } catch (err) {
      setError(err.message || 'Error al cargar KPIs')
    } finally {
      setLoading(false)
    }
  }, [periodo, fechaDesde, fechaHasta])

  useEffect(() => { cargar() }, [cargar])

  const ord = data?.ordenes || {}
  const cit = data?.citas   || {}

  const pctCompletadas = ord.total_ordenes > 0
    ? Math.round((ord.ordenes_completadas / ord.total_ordenes) * 100)
    : 0

  const pctCitasAtendidas = (parseInt(cit.total_citas) || 0) > 0
    ? Math.round(((parseInt(cit.citas_completadas) || 0) / parseInt(cit.total_citas)) * 100)
    : 0

  // Datos para barras de estados órdenes
  const barItems = [
    { label: 'Completadas',  val: parseInt(ord.ordenes_completadas) || 0, color: '#16a34a' },
    { label: 'En proceso',   val: parseInt(ord.ordenes_en_proceso)  || 0, color: '#2563eb' },
    { label: 'Pendientes',   val: parseInt(ord.ordenes_pendientes)  || 0, color: '#ca8a04' },
    { label: 'Canceladas',   val: parseInt(ord.ordenes_canceladas)  || 0, color: '#dc2626' },
  ]
  const maxBar = Math.max(...barItems.map(b => b.val), 1)

  const barCitas = [
    { label: 'Confirmadas',  val: parseInt(cit.citas_confirmadas)  || 0, color: '#2563eb' },
    { label: 'Completadas',  val: parseInt(cit.citas_completadas)  || 0, color: '#16a34a' },
    { label: 'Pendientes',   val: parseInt(cit.citas_pendientes)   || 0, color: '#ca8a04' },
    { label: 'Canceladas',   val: parseInt(cit.citas_canceladas)   || 0, color: '#dc2626' },
  ]
  const maxBarCitas = Math.max(...barCitas.map(b => b.val), 1)

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>KPIs del Taller</h1>
          <p className={styles.pageSubtitle}>Indicadores clave de rendimiento y estadísticas operativas.</p>
        </div>
        <button className={styles.btnRefresh} onClick={cargar} title="Actualizar">
          <RefreshCw size={15} className={loading ? styles.spin : ''} />
        </button>
      </div>

      {error && (
        <div className={styles.alertError}>
          <AlertCircle size={15} /> {error}
          <button onClick={() => setError('')}><X size={13} /></button>
        </div>
      )}

      {/* selector de período */}
      <div className={styles.periodoBar}>
        {PERIODOS.map(p => (
          <button
            key={p.value}
            className={`${styles.periodoBtn} ${periodo === p.value ? styles.periodoBtnActive : ''}`}
            onClick={() => setPeriodo(p.value)}
          >
            {p.label}
          </button>
        ))}
        {periodo === 'custom' && (
          <div className={styles.customDates}>
            <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} className={styles.inputFecha} />
            <span>–</span>
            <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} className={styles.inputFecha} />
          </div>
        )}
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <RefreshCw size={32} className={styles.spin} />
          <p>Cargando indicadores...</p>
        </div>
      ) : (
        <>
          {/* ── KPI Cards principales ─────────────────────────────────── */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ background: '#eff6ff', color: '#2563eb' }}>
                <FileText size={22} />
              </div>
              <div className={styles.kpiContent}>
                <div className={styles.kpiVal}>{ord.total_ordenes || 0}</div>
                <div className={styles.kpiLabel}>Órdenes Totales</div>
              </div>
              <div className={styles.kpiTrend} style={{ color: '#2563eb' }}>
                <TrendingUp size={16} />
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <DollarSign size={22} />
              </div>
              <div className={styles.kpiContent}>
                <div className={styles.kpiVal}>{fmtBs(ord.ingresos_totales)}</div>
                <div className={styles.kpiLabel}>Ingresos Totales</div>
              </div>
              <div className={styles.kpiTrend} style={{ color: '#16a34a' }}>
                <TrendingUp size={16} />
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ background: '#fff7ed', color: '#ea580c' }}>
                <Users size={22} />
              </div>
              <div className={styles.kpiContent}>
                <div className={styles.kpiVal}>{ord.total_clientes || 0}</div>
                <div className={styles.kpiLabel}>Clientes Atendidos</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ background: '#fdf4ff', color: '#9333ea' }}>
                <DollarSign size={22} />
              </div>
              <div className={styles.kpiContent}>
                <div className={styles.kpiVal}>{fmtBs(ord.ticket_promedio)}</div>
                <div className={styles.kpiLabel}>Ticket Promedio</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ background: '#ecfeff', color: '#0891b2' }}>
                <Clock size={22} />
              </div>
              <div className={styles.kpiContent}>
                <div className={styles.kpiVal}>{fmt(ord.tiempo_promedio_dias, 1)} días</div>
                <div className={styles.kpiLabel}>Tiempo Promedio</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <CheckCircle size={22} />
              </div>
              <div className={styles.kpiContent}>
                <div className={styles.kpiVal}>{pctCompletadas}%</div>
                <div className={styles.kpiLabel}>Tasa de Completado</div>
                <div className={styles.miniBar}>
                  <div className={styles.miniBarFill} style={{ width: `${pctCompletadas}%`, background: '#16a34a' }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Sección distribuciones ───────────────────────────────── */}
          <div className={styles.chartsRow}>
            {/* Órdenes por estado */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <BarChart3 size={16} />
                <h3>Distribución de Órdenes</h3>
              </div>
              <div className={styles.bars}>
                {barItems.map(item => (
                  <div key={item.label} className={styles.barItem}>
                    <div className={styles.barLabelRow}>
                      <span className={styles.barLabel}>{item.label}</span>
                      <span className={styles.barCount} style={{ color: item.color }}>{item.val}</span>
                    </div>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${Math.round((item.val / maxBar) * 100)}%`, background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Citas por estado */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <Calendar size={16} />
                <h3>Distribución de Citas</h3>
              </div>
              <div className={styles.bars}>
                {barCitas.map(item => (
                  <div key={item.label} className={styles.barItem}>
                    <div className={styles.barLabelRow}>
                      <span className={styles.barLabel}>{item.label}</span>
                      <span className={styles.barCount} style={{ color: item.color }}>{item.val}</span>
                    </div>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${Math.round((item.val / maxBarCitas) * 100)}%`, background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Resumen de Citas ──────────────────────────────────────── */}
          <div className={styles.citasSection}>
            <div className={styles.sectionHeader}>
              <CalendarCheck size={16} />
              <h3>Resumen de Citas</h3>
            </div>
            <div className={styles.citasGrid}>
              <div className={styles.citasStat}>
                <div className={styles.citasStatVal}>{cit.total_citas || 0}</div>
                <div className={styles.citasStatLabel}>Total</div>
              </div>
              <div className={styles.citasStat}>
                <div className={styles.citasStatVal} style={{ color: '#ca8a04' }}>{cit.citas_pendientes || 0}</div>
                <div className={styles.citasStatLabel}>Pendientes</div>
              </div>
              <div className={styles.citasStat}>
                <div className={styles.citasStatVal} style={{ color: '#2563eb' }}>{cit.citas_confirmadas || 0}</div>
                <div className={styles.citasStatLabel}>Confirmadas</div>
              </div>
              <div className={styles.citasStat}>
                <div className={styles.citasStatVal} style={{ color: '#16a34a' }}>{cit.citas_completadas || 0}</div>
                <div className={styles.citasStatLabel}>Completadas</div>
              </div>
              <div className={styles.citasStat}>
                <div className={styles.citasStatVal} style={{ color: '#dc2626' }}>{cit.citas_canceladas || 0}</div>
                <div className={styles.citasStatLabel}>Canceladas</div>
              </div>
              <div className={styles.citasStat}>
                <div className={styles.citasStatVal} style={{ color: '#0891b2' }}>{pctCitasAtendidas}%</div>
                <div className={styles.citasStatLabel}>Tasa Atención</div>
              </div>
            </div>
          </div>

          {/* ── Resumen detallado de órdenes ──────────────────────────── */}
          <div className={styles.resumenSection}>
            <div className={styles.sectionHeader}>
              <FileText size={16} />
              <h3>Resumen de Órdenes</h3>
            </div>
            <div className={styles.resumenGrid}>
              <div className={styles.resumenItem}>
                <CheckCircle size={18} style={{ color: '#16a34a' }} />
                <div>
                  <div className={styles.resumenVal}>{ord.ordenes_completadas || 0}</div>
                  <div className={styles.resumenLabel}>Completadas</div>
                </div>
              </div>
              <div className={styles.resumenItem}>
                <Clock size={18} style={{ color: '#2563eb' }} />
                <div>
                  <div className={styles.resumenVal}>{ord.ordenes_en_proceso || 0}</div>
                  <div className={styles.resumenLabel}>En Proceso</div>
                </div>
              </div>
              <div className={styles.resumenItem}>
                <AlertCircle size={18} style={{ color: '#ca8a04' }} />
                <div>
                  <div className={styles.resumenVal}>{ord.ordenes_pendientes || 0}</div>
                  <div className={styles.resumenLabel}>Pendientes</div>
                </div>
              </div>
              <div className={styles.resumenItem}>
                <XCircle size={18} style={{ color: '#dc2626' }} />
                <div>
                  <div className={styles.resumenVal}>{ord.ordenes_canceladas || 0}</div>
                  <div className={styles.resumenLabel}>Canceladas</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
