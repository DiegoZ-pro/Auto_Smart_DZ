import { useState, useEffect, useCallback } from 'react'
import {
  Users, Search, RefreshCw, Plus, Edit2, Trash2,
  Shield, User, Wrench, Mail, Phone, Lock,
  AlertCircle, Check, X, AlertTriangle, Eye, EyeOff,
  ToggleLeft, ToggleRight
} from 'lucide-react'
import { usuariosService } from '../../../services/usuariosService'
import styles from './GestionUsuarios.module.css'

const ROLES = {
  1: { label: 'Cliente',       color: '#16a34a', bg: '#f0fdf4', icon: User    },
  2: { label: 'Mecánico',      color: '#ea580c', bg: '#fff7ed', icon: Wrench  },
  3: { label: 'Administrador', color: '#2563eb', bg: '#eff6ff', icon: Shield  },
}

const ESTADOS = {
  1: { label: 'Activo',    color: '#16a34a' },
  2: { label: 'Inactivo',  color: '#94a3b8' },
  3: { label: 'Bloqueado', color: '#dc2626' },
}

const esEmailTemporal = (email) => email?.includes('@autosmart.temp') || email?.includes('temp_')

const iniciales = (nombre) => {
  if (!nombre) return '?'
  const p = nombre.trim().split(' ')
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : nombre.slice(0, 2).toUpperCase()
}

const FORM_VACIO = {
  nombre_completo: '', email: '', telefono: '',
  rol_id: '1', nueva_password: '', confirmar_password: ''
}

export default function GestionUsuarios() {
  const [usuarios,  setUsuarios]  = useState([])
  const [stats,     setStats]     = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [exito,     setExito]     = useState('')

  // filtros
  const [busqueda,   setBusqueda]   = useState('')
  const [filtroRol,  setFiltroRol]  = useState('')
  const [filtroEst,  setFiltroEst]  = useState('')

  // modal crear
  const [showCrear,   setShowCrear]   = useState(false)
  const [formCrear,   setFormCrear]   = useState(FORM_VACIO)
  const [guardando,   setGuardando]   = useState(false)
  const [verPass,     setVerPass]     = useState(false)

  // modal editar
  const [showEditar,  setShowEditar]  = useState(false)
  const [usuarioEdit, setUsuarioEdit] = useState(null)
  const [formEdit,    setFormEdit]    = useState(FORM_VACIO)
  const [actualizando, setActualizando] = useState(false)
  const [verPassEdit, setVerPassEdit] = useState(false)

  // modal confirmar eliminar
  const [showConfirm, setShowConfirm] = useState(false)
  const [usuarioDel,  setUsuarioDel]  = useState(null)
  const [eliminando,  setEliminando]  = useState(false)

  // ─── carga ──────────────────────────────────────────────────────────────────

  const cargar = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const filters = {}
      if (busqueda)  filters.search   = busqueda
      if (filtroRol) filters.rol_id   = filtroRol
      if (filtroEst) filters.estado_id = filtroEst

      const [resU, resS] = await Promise.all([
        usuariosService.getAll(filters),
        usuariosService.getStats(),
      ])
      setUsuarios(resU.data || [])
      setStats(resS.data || null)
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios')
    } finally { setLoading(false) }
  }, [busqueda, filtroRol, filtroEst])

  useEffect(() => { cargar() }, [cargar])

  const mostrarExito = (msg) => { setExito(msg); setTimeout(() => setExito(''), 3500) }

  // ─── crear ──────────────────────────────────────────────────────────────────

  const abrirCrear = () => { setFormCrear(FORM_VACIO); setVerPass(false); setShowCrear(true) }
  const cerrarCrear = () => { setShowCrear(false); setError('') }

  const handleCrear = async () => {
    const { nombre_completo, email, rol_id, nueva_password, confirmar_password } = formCrear
    if (!nombre_completo.trim()) { setError('El nombre es requerido'); return }
    if (!email.trim())           { setError('El email es requerido'); return }
    if (!nueva_password)         { setError('La contraseña es requerida'); return }
    if (nueva_password.length < 6) { setError('Mínimo 6 caracteres'); return }
    if (nueva_password !== confirmar_password) { setError('Las contraseñas no coinciden'); return }

    setGuardando(true); setError('')
    try {
      await usuariosService.create({
        nombreCompleto: nombre_completo.trim(),
        email:          email.trim(),
        telefono:       formCrear.telefono.trim() || undefined,
        rol_id:         parseInt(rol_id),
        password:       nueva_password,
      })
      mostrarExito('Usuario creado correctamente')
      cerrarCrear()
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al crear usuario')
    } finally { setGuardando(false) }
  }

  // ─── editar ─────────────────────────────────────────────────────────────────

  const abrirEditar = (usuario) => {
    setUsuarioEdit(usuario)
    setFormEdit({
      nombre_completo:   usuario.nombre_completo || '',
      email:             usuario.email           || '',
      telefono:          usuario.telefono        || '',
      rol_id:            String(usuario.rol_id)  || '1',
      nueva_password:    '',
      confirmar_password: '',
    })
    setVerPassEdit(false)
    setError('')
    setShowEditar(true)
  }

  const cerrarEditar = () => { setShowEditar(false); setUsuarioEdit(null); setError('') }

  const handleEditar = async () => {
    const { nombre_completo, email, telefono, rol_id, nueva_password, confirmar_password } = formEdit
    if (!nombre_completo.trim()) { setError('El nombre es requerido'); return }
    if (!email.trim())           { setError('El email es requerido'); return }
    if (nueva_password && nueva_password.length < 6) { setError('Mínimo 6 caracteres para la contraseña'); return }
    if (nueva_password && nueva_password !== confirmar_password) { setError('Las contraseñas no coinciden'); return }

    setActualizando(true); setError('')
    try {
      const payload = {
        nombreCompleto: nombre_completo.trim(),
        email:          email.trim(),
        telefono:       telefono.trim() || undefined,
        rol_id:         parseInt(rol_id),
      }
      if (nueva_password) payload.nueva_password = nueva_password

      await usuariosService.update(usuarioEdit.id, payload)
      mostrarExito('Usuario actualizado correctamente')
      cerrarEditar()
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al actualizar usuario')
    } finally { setActualizando(false) }
  }

  // ─── eliminar ────────────────────────────────────────────────────────────────

  const abrirEliminar = (usuario) => { setUsuarioDel(usuario); setShowConfirm(true) }
  const cerrarEliminar = () => { setShowConfirm(false); setUsuarioDel(null) }

  const handleEliminar = async () => {
    if (!usuarioDel) return
    setEliminando(true)
    try {
      await usuariosService.eliminar(usuarioDel.id)
      mostrarExito('Usuario desactivado correctamente')
      cerrarEliminar()
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al eliminar usuario')
      cerrarEliminar()
    } finally { setEliminando(false) }
  }

  // ─── cambiar estado ──────────────────────────────────────────────────────────

  const toggleEstado = async (usuario) => {
    const nuevoEstado = usuario.estado_id === 1 ? 2 : 1
    try {
      await usuariosService.cambiarEstado(usuario.id, nuevoEstado)
      mostrarExito(`Usuario ${nuevoEstado === 1 ? 'activado' : 'desactivado'}`)
      await cargar()
    } catch (err) {
      setError(err.message || 'Error al cambiar estado')
    }
  }

  // ─── render ──────────────────────────────────────────────────────────────────

  const emailsTemp = usuarios.filter(u => esEmailTemporal(u.email)).length

  return (
    <div className={styles.wrapper}>

      <h1 className={styles.pageTitle}>Gestión de Usuarios</h1>
      <p className={styles.pageSubtitle}>Administra usuarios, roles y credenciales de acceso al sistema.</p>

      {/* alertas */}
      {error && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <AlertCircle size={15} /> {error}
          <button onClick={() => setError('')}><X size={13} /></button>
        </div>
      )}
      {exito && <div className={`${styles.alert} ${styles.alertSuccess}`}><Check size={15} /> {exito}</div>}

      {/* aviso emails temporales */}
      {emailsTemp > 0 && (
        <div className={styles.alertWarn}>
          <AlertTriangle size={15} />
          <span>
            <strong>{emailsTemp} cliente{emailsTemp > 1 ? 's' : ''}</strong> con email temporal.
            Edítalos para asignarles un email y contraseña real.
          </span>
        </div>
      )}

      {/* stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#eff6ff', color: '#2563eb' }}><Users size={20} /></div>
          <div><div className={styles.statVal}>{stats?.total_usuarios || usuarios.length}</div><div className={styles.statLabel}>Total usuarios</div></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}><User size={20} /></div>
          <div><div className={styles.statVal}>{stats?.total_clientes || usuarios.filter(u => u.rol_id === 1).length}</div><div className={styles.statLabel}>Clientes</div></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fff7ed', color: '#ea580c' }}><Wrench size={20} /></div>
          <div><div className={styles.statVal}>{stats?.total_mecanicos || usuarios.filter(u => u.rol_id === 2).length}</div><div className={styles.statLabel}>Mecánicos</div></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fef2f2', color: '#dc2626' }}><AlertTriangle size={20} /></div>
          <div><div className={styles.statVal}>{emailsTemp}</div><div className={styles.statLabel}>Emails temporales</div></div>
        </div>
      </div>

      {/* toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <Search size={15} className={styles.searchIcon} />
            <input type="text" placeholder="Buscar por nombre, email o teléfono..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className={styles.searchInput} />
          </div>
          <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)} className={styles.select}>
            <option value="">Todos los roles</option>
            <option value="1">Cliente</option>
            <option value="2">Mecánico</option>
            <option value="3">Administrador</option>
          </select>
          <select value={filtroEst} onChange={e => setFiltroEst(e.target.value)} className={styles.select}>
            <option value="">Todos los estados</option>
            <option value="1">Activo</option>
            <option value="2">Inactivo</option>
            <option value="3">Bloqueado</option>
          </select>
          <button className={styles.btnRefresh} onClick={cargar} title="Actualizar"><RefreshCw size={14} /></button>
        </div>
        <button className={styles.btnPrimary} onClick={abrirCrear}>
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      {/* tabla */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.emptyState}><RefreshCw size={28} className={styles.spin} /><p>Cargando usuarios...</p></div>
        ) : usuarios.length === 0 ? (
          <div className={styles.emptyState}><Users size={40} /><p>No hay usuarios con los filtros seleccionados</p></div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => {
                    const rol    = ROLES[u.rol_id]
                    const estado = ESTADOS[u.estado_id] || ESTADOS[1]
                    const temp   = esEmailTemporal(u.email)
                    const RolIcon = rol?.icon || User

                    return (
                      <tr key={u.id} className={temp ? styles.rowTemp : ''}>
                        {/* avatar + nombre */}
                        <td>
                          <div className={styles.userCell}>
                            <div className={styles.avatar} style={{ background: rol?.bg, color: rol?.color }}>
                              {iniciales(u.nombre_completo)}
                            </div>
                            <div>
                              <span className={styles.userName}>{u.nombre_completo}</span>
                              {temp && <span className={styles.tempBadge}><AlertTriangle size={10} /> email temporal</span>}
                            </div>
                          </div>
                        </td>

                        {/* email */}
                        <td className={temp ? styles.emailTemp : styles.emailNormal}>
                          <Mail size={12} /> {u.email}
                        </td>

                        {/* teléfono */}
                        <td className={styles.tdPhone}>
                          {u.telefono ? <><Phone size={12} /> {u.telefono}</> : <span className={styles.sinDato}>—</span>}
                        </td>

                        {/* rol */}
                        <td>
                          <span className={styles.rolBadge} style={{ background: rol?.bg, color: rol?.color }}>
                            <RolIcon size={11} /> {rol?.label || 'Desconocido'}
                          </span>
                        </td>

                        {/* estado */}
                        <td>
                          <span className={styles.estadoBadge} style={{ color: estado.color }}>
                            <span className={styles.estadoDot} style={{ background: estado.color }} />
                            {estado.label}
                          </span>
                        </td>

                        {/* fecha */}
                        <td className={styles.tdFecha}>
                          {u.fecha_creacion
                            ? new Date(u.fecha_creacion).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>

                        {/* acciones */}
                        <td>
                          <div className={styles.acciones}>
                            <button
                              className={styles.btnEdit}
                              title="Editar usuario"
                              onClick={() => abrirEditar(u)}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className={u.estado_id === 1 ? styles.btnToggleOff : styles.btnToggleOn}
                              title={u.estado_id === 1 ? 'Desactivar' : 'Activar'}
                              onClick={() => toggleEstado(u)}
                            >
                              {u.estado_id === 1 ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                            </button>
                            <button
                              className={styles.btnDel}
                              title="Eliminar usuario"
                              onClick={() => abrirEliminar(u)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className={styles.tableFooter}>
              Total: <strong>{usuarios.length}</strong> usuario{usuarios.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>

      {/* ── MODAL CREAR ─────────────────────────────────────────────────────── */}
      {showCrear && (
        <div className={styles.overlay} onClick={cerrarCrear}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}><Plus size={18} /> Nuevo Usuario</h2>
              <button className={styles.modalClose} onClick={cerrarCrear}><X size={18} /></button>
            </div>

            {error && <div className={`${styles.alert} ${styles.alertError}`} style={{ margin: '0 24px' }}><AlertCircle size={14} /> {error}<button onClick={() => setError('')}><X size={12} /></button></div>}

            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}><User size={13} /> Nombre Completo*</label>
                  <input type="text" value={formCrear.nombre_completo} onChange={e => setFormCrear({...formCrear, nombre_completo: e.target.value})} className={styles.input} placeholder="Ej: Juan Pérez" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}><Mail size={13} /> Email*</label>
                  <input type="email" value={formCrear.email} onChange={e => setFormCrear({...formCrear, email: e.target.value})} className={styles.input} placeholder="correo@ejemplo.com" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}><Phone size={13} /> Teléfono</label>
                  <input type="tel" value={formCrear.telefono} onChange={e => setFormCrear({...formCrear, telefono: e.target.value})} className={styles.input} placeholder="Ej: 75123456" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}><Shield size={13} /> Rol*</label>
                  <select value={formCrear.rol_id} onChange={e => setFormCrear({...formCrear, rol_id: e.target.value})} className={styles.select2}>
                    <option value="1">Cliente</option>
                    <option value="2">Mecánico</option>
                    <option value="3">Administrador</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}><Lock size={13} /> Contraseña*</label>
                  <div className={styles.passWrapper}>
                    <input type={verPass ? 'text' : 'password'} value={formCrear.nueva_password} onChange={e => setFormCrear({...formCrear, nueva_password: e.target.value})} className={styles.input} placeholder="Mínimo 6 caracteres" />
                    <button type="button" className={styles.btnVerPass} onClick={() => setVerPass(p => !p)}>
                      {verPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}><Lock size={13} /> Confirmar Contraseña*</label>
                  <input type={verPass ? 'text' : 'password'} value={formCrear.confirmar_password} onChange={e => setFormCrear({...formCrear, confirmar_password: e.target.value})} className={styles.input} placeholder="Repita la contraseña" />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={cerrarCrear}>Cancelar</button>
              <button className={styles.btnGuardar} onClick={handleCrear} disabled={guardando}>
                <Plus size={15} /> {guardando ? 'Creando...' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EDITAR ────────────────────────────────────────────────────── */}
      {showEditar && usuarioEdit && (
        <div className={styles.overlay} onClick={cerrarEditar}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}><Edit2 size={18} /> Editar Usuario</h2>
                {esEmailTemporal(usuarioEdit.email) && (
                  <div className={styles.tempWarning}>
                    <AlertTriangle size={13} /> Este usuario tiene email temporal — actualiza sus credenciales
                  </div>
                )}
              </div>
              <button className={styles.modalClose} onClick={cerrarEditar}><X size={18} /></button>
            </div>

            {error && <div className={`${styles.alert} ${styles.alertError}`} style={{ margin: '0 24px' }}><AlertCircle size={14} /> {error}<button onClick={() => setError('')}><X size={12} /></button></div>}

            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}><User size={13} /> Nombre Completo*</label>
                  <input type="text" value={formEdit.nombre_completo} onChange={e => setFormEdit({...formEdit, nombre_completo: e.target.value})} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}><Mail size={13} /> Email*</label>
                  <input type="email" value={formEdit.email} onChange={e => setFormEdit({...formEdit, email: e.target.value})} className={`${styles.input} ${esEmailTemporal(formEdit.email) ? styles.inputTemporal : ''}`} />
                  {esEmailTemporal(formEdit.email) && <span className={styles.inputHint}>Reemplaza el email temporal por uno real</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}><Phone size={13} /> Teléfono</label>
                  <input type="tel" value={formEdit.telefono} onChange={e => setFormEdit({...formEdit, telefono: e.target.value})} className={styles.input} placeholder="Ej: 75123456" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}><Shield size={13} /> Rol*</label>
                  <select value={formEdit.rol_id} onChange={e => setFormEdit({...formEdit, rol_id: e.target.value})} className={styles.select2}>
                    <option value="1">Cliente</option>
                    <option value="2">Mecánico</option>
                    <option value="3">Administrador</option>
                  </select>
                </div>
              </div>

              {/* sección contraseña */}
              <div className={styles.passSection}>
                <h4 className={styles.passSectionTitle}>
                  <Lock size={14} /> Cambiar Contraseña
                  <span className={styles.passSectionHint}>(opcional — dejar en blanco para no cambiar)</span>
                </h4>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nueva Contraseña</label>
                    <div className={styles.passWrapper}>
                      <input type={verPassEdit ? 'text' : 'password'} value={formEdit.nueva_password} onChange={e => setFormEdit({...formEdit, nueva_password: e.target.value})} className={styles.input} placeholder="Mínimo 6 caracteres" />
                      <button type="button" className={styles.btnVerPass} onClick={() => setVerPassEdit(p => !p)}>
                        {verPassEdit ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Confirmar Contraseña</label>
                    <input type={verPassEdit ? 'text' : 'password'} value={formEdit.confirmar_password} onChange={e => setFormEdit({...formEdit, confirmar_password: e.target.value})} className={styles.input} placeholder="Repita la nueva contraseña" />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={cerrarEditar}>Cancelar</button>
              <button className={styles.btnGuardar} onClick={handleEditar} disabled={actualizando}>
                <Check size={15} /> {actualizando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRMAR ELIMINAR ─────────────────────────────────────────── */}
      {showConfirm && usuarioDel && (
        <div className={styles.overlay} onClick={cerrarEliminar}>
          <div className={styles.modalSm} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}><AlertTriangle size={18} color="#f59e0b" /> Confirmar acción</h2>
              <button className={styles.modalClose} onClick={cerrarEliminar}><X size={18} /></button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.confirmText}>
                ¿Deseas desactivar al usuario <strong>{usuarioDel.nombre_completo}</strong>?
                El usuario no podrá iniciar sesión pero sus datos se conservarán.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancelar} onClick={cerrarEliminar}>Cancelar</button>
              <button className={styles.btnDanger} onClick={handleEliminar} disabled={eliminando}>
                <Trash2 size={14} /> {eliminando ? 'Desactivando...' : 'Desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}