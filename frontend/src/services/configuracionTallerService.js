import api from './api'

const getConfig = async () => {
  const res = await api.get('/configuracion')
  return res.data
}

const updateConfig = async (data) => {
  const res = await api.put('/configuracion', data)
  return res.data
}

export const configuracionTallerService = { getConfig, updateConfig }
