import api from './api'

const getAll = async (filters = {}) => {
  const p = new URLSearchParams()
  if (filters.search)   p.append('search',   filters.search)
  if (filters.rol_id)   p.append('rol_id',   filters.rol_id)
  if (filters.estado_id) p.append('estado_id', filters.estado_id)
  const qs = p.toString()
  const res = await api.get(qs ? `/usuarios?${qs}` : '/usuarios')
  return res.data
}

const getById = async (id) => {
  const res = await api.get(`/usuarios/${id}`)
  return res.data
}

const getStats = async () => {
  const res = await api.get('/usuarios/stats')
  return res.data
}

const create = async (data) => {
  const res = await api.post('/usuarios', data)
  return res.data
}

const update = async (id, data) => {
  const res = await api.put(`/usuarios/${id}`, data)
  return res.data
}

const cambiarEstado = async (id, estado_id) => {
  const res = await api.put(`/usuarios/${id}/estado`, { estado_id })
  return res.data
}

const eliminar = async (id) => {
  const res = await api.delete(`/usuarios/${id}`)
  return res.data
}

export const usuariosService = { getAll, getById, getStats, create, update, cambiarEstado, eliminar }