// Servicio del módulo de diagnóstico técnico — reutiliza los endpoints de órdenes

import api from './api';

// Trae las órdenes relevantes para diagnóstico con filtros opcionales
const getOrdenesParaDiagnostico = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.search)       params.append('search', filters.search);
    if (filters.tipo_orden_id) params.append('tipo_orden_id', filters.tipo_orden_id);
    if (filters.estado_id)    params.append('estado_id', filters.estado_id);
    if (filters.mecanico_id)  params.append('mecanico_id', filters.mecanico_id);

    const queryString = params.toString();
    const url = queryString ? `/ordenes?${queryString}` : '/ordenes';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error al obtener órdenes' };
  }
};

// Devuelve la orden completa con diagnóstico, trabajo realizado y más
const getOrdenById = async (id) => {
  try {
    const response = await api.get(`/ordenes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error al obtener la orden' };
  }
};

// Guarda el diagnóstico técnico y los campos relacionados de la orden
const guardarDiagnostico = async (ordenId, data) => {
  try {
    const response = await api.put(`/ordenes/${ordenId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error al guardar diagnóstico' };
  }
};

// Cambia el estado de la orden
const cambiarEstado = async (ordenId, estadoId) => {
  try {
    const response = await api.put(`/ordenes/${ordenId}/estado`, { estado_id: estadoId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error al cambiar estado' };
  }
};

// Asigna un mecánico a la orden
const asignarMecanico = async (ordenId, mecanicoId) => {
  try {
    const response = await api.put(`/ordenes/${ordenId}/asignar-mecanico`, { mecanico_id: mecanicoId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error al asignar mecánico' };
  }
};

// Historial de cambios de estado de una orden
const getHistorial = async (ordenId) => {
  try {
    const response = await api.get(`/ordenes/${ordenId}/historial`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error al obtener historial' };
  }
};

// Trae los usuarios con rol mecánico para asignar a órdenes
const getMecanicos = async () => {
  try {
    const response = await api.get('/usuarios/mecanicos');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error al obtener mecánicos' };
  }
};

// Trae los estados de orden del catálogo
const getEstadosOrden = async () => {
  try {
    const response = await api.get('/catalogos/estados-orden');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error al obtener estados' };
  }
};

export const diagnosticoService = {
  getOrdenesParaDiagnostico,
  getOrdenById,
  guardarDiagnostico,
  cambiarEstado,
  asignarMecanico,
  getHistorial,
  getMecanicos,
  getEstadosOrden,
};