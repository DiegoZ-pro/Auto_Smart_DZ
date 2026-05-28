import { useState, useEffect } from 'react'
import {
  Settings, Building2, Clock, Save, RefreshCw,
  Phone, Mail, Globe, MapPin, AlertCircle, Check, X
} from 'lucide-react'
import { configuracionTallerService } from '../../../services/configuracionTallerService'
import styles from './ConfiguracionTaller.module.css'

const DIAS = [
  { key: 'lunes',     label: 'Lunes'     },
  { key: 'martes',    label: 'Martes'    },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves',    label: 'Jueves'    },
  { key: 'viernes',   label: 'Viernes'   },
  { key: 'sabado',    label: 'Sábado'    },
  { key: 'domingo',   label: 'Domingo'   },
]

const TABS = [
  { id: 'info',      label: 'Información General', icon: Building2 },
  { id: 'horarios',  label: 'Horarios de Atención', icon: Clock },
  { id: 'citas',     label: 'Config. de Citas',     icon: Settings },
]

const DEFAULT_HORARIOS = {
  lunes:     { activo: true,  apertura: '08:00', cierre: '18:00' },
  martes:    { activo: true,  apertura: '08:00', cierre: '18:00' },
  miercoles: { activo: true,  apertura: '08:00', cierre: '18:00' },
  jueves:    { activo: true,  apertura: '08:00', cierre: '18:00' },
  viernes:   { activo: true,  apertura: '08:00', cierre: '18:00' },
  sabado:    { activo: true,  apertura: '08:00', cierre: '13:00' },
  domingo:   { activo: false, apertura: '08:00', cierre: '13:00' },
}

export default function ConfiguracionTaller() {
  const [tab,       setTab]       = useState('info')
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [exito,     setExito]     = useState('')

  const [form, setForm] = useState({
    nombre:     '',
    slogan:     '',
    direccion:  '',
    telefono:   '',
    email:      '',
    sitioWeb:   '',
    descripcion: '',
    horarios:   DEFAULT_HORARIOS,
    maxCitasPorDia:       10,
    duracionCitaMinutos:  60,
  })

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      try {
        const res = await configuracionTallerService.getConfig()
        if (res.data) {
          setForm(prev => ({
            ...prev,
            ...res.data,
            horarios: { ...DEFAULT_HORARIOS, ...(res.data.horarios || {}) },
          }))
        }
      } catch (err) {
        setError('Error al cargar configuración: ' + (err.message || ''))
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleHorario = (dia, field, value) => {
    setForm(prev => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [dia]: { ...prev.horarios[dia], [field]: value },
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await configuracionTallerService.updateConfig(form)
      setExito('Configuración guardada exitosamente')
      setTimeout(() => setExito(''), 4000)
    } catch (err) {
      setError('Error al guardar: ' + (err.message || ''))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loadingState}>
          <RefreshCw size={30} className={styles.spin} />
          <p>Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Configuración del Taller</h1>
          <p className={styles.pageSubtitle}>Gestiona la información y ajustes operativos del taller.</p>
        </div>
        <button className={styles.btnSave} onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

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

      {/* tabs */}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Información General ─────────────────────────────────── */}
      {tab === 'info' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Building2 size={16} /> Datos del Taller
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.label}>Nombre del Taller *</label>
              <input
                className={styles.input}
                value={form.nombre}
                onChange={e => handleChange('nombre', e.target.value)}
                placeholder="AutoSmart Taller"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Slogan</label>
              <input
                className={styles.input}
                value={form.slogan}
                onChange={e => handleChange('slogan', e.target.value)}
                placeholder="Tu vehículo en las mejores manos"
              />
            </div>
            <div className={`${styles.formField} ${styles.fullWidth}`}>
              <label className={styles.label}><MapPin size={13} /> Dirección</label>
              <input
                className={styles.input}
                value={form.direccion}
                onChange={e => handleChange('direccion', e.target.value)}
                placeholder="Av. Principal #123, Ciudad"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.label}><Phone size={13} /> Teléfono</label>
              <input
                className={styles.input}
                value={form.telefono}
                onChange={e => handleChange('telefono', e.target.value)}
                placeholder="+591 7xxxxxxx"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.label}><Mail size={13} /> Email</label>
              <input
                className={styles.input}
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="taller@autosmart.com"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.label}><Globe size={13} /> Sitio Web</label>
              <input
                className={styles.input}
                value={form.sitioWeb}
                onChange={e => handleChange('sitioWeb', e.target.value)}
                placeholder="www.autosmart.com"
              />
            </div>
            <div className={`${styles.formField} ${styles.fullWidth}`}>
              <label className={styles.label}>Descripción</label>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                value={form.descripcion}
                onChange={e => handleChange('descripcion', e.target.value)}
                placeholder="Breve descripción del taller y los servicios que ofrece..."
                rows={3}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Horarios ────────────────────────────────────────────── */}
      {tab === 'horarios' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Clock size={16} /> Horarios de Atención
          </div>
          <p className={styles.sectionDesc}>
            Define los días y horarios en que el taller atiende clientes.
          </p>
          <div className={styles.horariosTable}>
            <div className={styles.horariosHeader}>
              <span>Día</span>
              <span>Activo</span>
              <span>Apertura</span>
              <span>Cierre</span>
            </div>
            {DIAS.map(dia => {
              const h = form.horarios[dia.key] || { activo: false, apertura: '08:00', cierre: '18:00' }
              return (
                <div key={dia.key} className={`${styles.horariosRow} ${!h.activo ? styles.horariosRowInactive : ''}`}>
                  <span className={styles.diaLabel}>{dia.label}</span>
                  <div className={styles.toggleWrap}>
                    <button
                      className={`${styles.toggleBtn} ${h.activo ? styles.toggleBtnOn : styles.toggleBtnOff}`}
                      onClick={() => handleHorario(dia.key, 'activo', !h.activo)}
                    >
                      <div className={styles.toggleThumb} />
                    </button>
                    <span className={styles.toggleLabel}>{h.activo ? 'Abierto' : 'Cerrado'}</span>
                  </div>
                  <input
                    type="time"
                    className={`${styles.timeInput} ${!h.activo ? styles.timeInputDisabled : ''}`}
                    value={h.apertura}
                    disabled={!h.activo}
                    onChange={e => handleHorario(dia.key, 'apertura', e.target.value)}
                  />
                  <input
                    type="time"
                    className={`${styles.timeInput} ${!h.activo ? styles.timeInputDisabled : ''}`}
                    value={h.cierre}
                    disabled={!h.activo}
                    onChange={e => handleHorario(dia.key, 'cierre', e.target.value)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Tab: Configuración de Citas ──────────────────────────────── */}
      {tab === 'citas' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Settings size={16} /> Configuración de Citas
          </div>
          <p className={styles.sectionDesc}>
            Ajusta la capacidad y duración de las citas del taller.
          </p>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.label}>Máximo de Citas por Día</label>
              <input
                className={styles.input}
                type="number"
                min="1"
                max="50"
                value={form.maxCitasPorDia}
                onChange={e => handleChange('maxCitasPorDia', parseInt(e.target.value) || 1)}
              />
              <span className={styles.inputHint}>Número máximo de citas que pueden agendarse en un día.</span>
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Duración por Cita (minutos)</label>
              <input
                className={styles.input}
                type="number"
                min="15"
                max="240"
                step="15"
                value={form.duracionCitaMinutos}
                onChange={e => handleChange('duracionCitaMinutos', parseInt(e.target.value) || 60)}
              />
              <span className={styles.inputHint}>Tiempo estimado de cada cita. Actualmente: cada hora (bloques de 60 min).</span>
            </div>
          </div>

          <div className={styles.infoBox}>
            <AlertCircle size={16} />
            <div>
              <strong>Horarios de citas disponibles</strong>
              <p>
                Las citas se generan automáticamente según los horarios configurados en la pestaña de horarios.
                Los clientes podrán seleccionar los slots disponibles al agendar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* botón guardar inferior */}
      <div className={styles.saveRow}>
        <button className={styles.btnSave} onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
