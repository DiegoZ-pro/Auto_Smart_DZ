// ============================================================================
// SERVICIO DE ÓRDENES DE TRABAJO
// Conexión con backend /api/ordenes
// ============================================================================

import api from './api';

/**
 * Obtener todas las órdenes con filtros opcionales
 */
const getAll = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.tipo_orden_id) params.append('tipo_orden_id', filters.tipo_orden_id);
    if (filters.estado_id) params.append('estado_id', filters.estado_id);
    if (filters.cliente_id) params.append('cliente_id', filters.cliente_id);
    if (filters.mecanico_id) params.append('mecanico_id', filters.mecanico_id);
    if (filters.search) params.append('search', filters.search);
    if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);

    const queryString = params.toString();
    const url = queryString ? `/ordenes?${queryString}` : '/ordenes';

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('[ordenesService] getAll failed:', error.message);
    throw error.response?.data || { success: false, message: 'Error al obtener órdenes' };
  }
};

/**
 * Obtener orden por ID
 */
const getById = async (ordenId) => {
  try {
    const response = await api.get(`/ordenes/${ordenId}`);
    return response.data;
  } catch (error) {
    console.error('[ordenesService] getById failed:', error.message);
    throw error.response?.data || { success: false, message: 'Error al obtener orden' };
  }
};

/**
 * Crear nueva orden
 */
const create = async (ordenData) => {
  try {
    const response = await api.post('/ordenes', ordenData);
    return response.data;
  } catch (error) {
    console.error('[ordenesService] create failed:', error.message);
    throw error.response?.data || { success: false, message: 'Error al crear orden' };
  }
};

/**
 * Actualizar orden
 */
const update = async (ordenId, ordenData) => {
  try {
    const response = await api.put(`/ordenes/${ordenId}`, ordenData);
    return response.data;
  } catch (error) {
    console.error('[ordenesService] update failed:', error.message);
    throw error.response?.data || { success: false, message: 'Error al actualizar orden' };
  }
};

/**
 * Cambiar estado de orden
 */
const cambiarEstado = async (ordenId, estadoId) => {
  try {
    const response = await api.put(`/ordenes/${ordenId}/estado`, { estado_id: estadoId });
    return response.data;
  } catch (error) {
    console.error('[ordenesService] cambiarEstado failed:', error.message);
    throw error.response?.data || { success: false, message: 'Error al cambiar estado' };
  }
};

/**
 * Asignar mecánico a orden
 */
const asignarMecanico = async (ordenId, mecanicoId) => {
  try {
    const response = await api.put(`/ordenes/${ordenId}/asignar-mecanico`, { mecanico_id: mecanicoId });
    return response.data;
  } catch (error) {
    console.error('[ordenesService] asignarMecanico failed:', error.message);
    throw error.response?.data || { success: false, message: 'Error al asignar mecánico' };
  }
};

/**
 * Obtener historial de estados de una orden
 */
const getHistorial = async (ordenId) => {
  try {
    const response = await api.get(`/ordenes/${ordenId}/historial`);
    return response.data;
  } catch (error) {
    console.error('[ordenesService] getHistorial failed:', error.message);
    throw error.response?.data || { success: false, message: 'Error al obtener historial' };
  }
};

/**
 * Obtener órdenes para Kanban
 */
const getKanban = async (tipoOrdenId) => {
  try {
    const params = tipoOrdenId ? `?tipo_orden_id=${tipoOrdenId}` : '';
    const response = await api.get(`/ordenes/kanban${params}`);
    return response.data;
  } catch (error) {
    console.error('[ordenesService] getKanban failed:', error.message);
    throw error.response?.data || { success: false, message: 'Error al obtener órdenes Kanban' };
  }
};

/**
 * Obtener estadísticas de órdenes
 */
const getEstadisticas = async (fechaInicio, fechaFin) => {
  try {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);

    const queryString = params.toString();
    const url = queryString ? `/ordenes/estadisticas?${queryString}` : '/ordenes/estadisticas';

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('[ordenesService] getEstadisticas failed:', error.message);
    throw error.response?.data || { success: false, message: 'Error al obtener estadísticas' };
  }
};

export const ordenesService = {
  getAll,
  getById,
  create,
  update,
  cambiarEstado,
  asignarMecanico,
  getHistorial,
  getKanban,
  getEstadisticas
};