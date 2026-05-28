import api from './api'

const buildQS = (fechaInicio, fechaFin) => {
  if (!fechaInicio) return ''
  return `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
}

const getKPIs = async (fechaInicio, fechaFin) => {
  const qs = buildQS(fechaInicio, fechaFin)
  const [ordRes, citasRes] = await Promise.all([
    api.get(`/ordenes/estadisticas${qs}`),
    api.get(`/citas/estadisticas${qs}`),
  ])
  return {
    ordenes: ordRes.data.data || {},
    citas: citasRes.data.data || {},
  }
}

export const kpisService = { getKPIs }
