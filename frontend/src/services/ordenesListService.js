import api from './api'

const buildQuery = (filters) => {
  const p = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => { if (v) p.append(k, v) })
  return p.toString()
}

const getAll = async (filters = {}) => {
  const qs = buildQuery(filters)
  const res = await api.get(qs ? `/ordenes?${qs}` : '/ordenes')
  return res.data
}

const getById = async (id) => {
  const res = await api.get(`/ordenes/${id}`)
  return res.data
}

const getEstadisticas = async (fechaInicio, fechaFin) => {
  const qs = buildQuery({ fecha_inicio: fechaInicio, fecha_fin: fechaFin })
  const res = await api.get(qs ? `/ordenes/estadisticas?${qs}` : '/ordenes/estadisticas')
  return res.data
}

const getKanban = async (tipoOrdenId = 1) => {
  const res = await api.get(`/ordenes/kanban?tipo_orden_id=${tipoOrdenId}`)
  return res.data
}

const cambiarEstado = async (id, estadoId) => {
  const res = await api.put(`/ordenes/${id}/estado`, { estado_id: estadoId })
  return res.data
}

const asignarMecanico = async (id, mecanicoId) => {
  const res = await api.put(`/ordenes/${id}/asignar-mecanico`, { mecanico_id: mecanicoId })
  return res.data
}

const getHistorial = async (id) => {
  const res = await api.get(`/ordenes/${id}/historial`)
  return res.data
}

const getMecanicos = async () => {
  const res = await api.get('/usuarios?rol_id=2')
  return res.data
}

export const ordenesListService = {
  getAll, getById, getEstadisticas, getKanban,
  cambiarEstado, asignarMecanico, getHistorial, getMecanicos
}