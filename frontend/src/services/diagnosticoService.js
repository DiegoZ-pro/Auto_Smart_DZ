// ============================================================================
// SERVICIO DE DIAGNÓSTICO TÉCNICO
// Usa el mismo patrón que ordenesService.js (import api from './api')
// Endpoints reusados: PUT /api/ordenes/:id, GET /api/ordenes, etc.
// ============================================================================

import api from './api';

/**
 * Obtener órdenes para diagnóstico
 * Filtra por estados relevantes: recepcionado (1), en_diagnostico (2)
 */
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

/**
 * Obtener orden completa por ID (incluye diagnostico_tecnico, trabajo_realizado, etc.)
 */
const getOrdenById = async (id) => {
  try {
    const response = await api.get(`/ordenes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error al obtener la orden' };
  }
};

/**
 * Guardar diagnóstico técnico de una orden
 * Campos: diagnostico_tecnico, trabajo_realizado, estado_id,
 *         mecanico_asignado_id, prioridad_id, costo_estimado,
 *         fecha_entrega_estimada, hora_entrega_estimada
 */
const guardarDiagnostico = async (ordenId, data) => {
  try {
    const response = await api.put(`/ordenes/${ordenId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error al guardar diagnóstico' };
  }
};

/**
 * Cambiar estado de una orden
 */
const cambiarEstado = async (ordenId, estadoId) => {
  try {
    const response = await api.put(`/ordenes/${ordenId}/estado`, { estado_id: estadoId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error al cambiar estado' };
  }
};

/**
 * Asignar mecánico a una orden
 */
const asignarMecanico = async (ordenId, mecanicoId) => {
  try {
    const response = await api.put(`/ordenes/${ordenId}/asignar-mecanico`, { mecanico_id: mecanicoId });
    return response.data;
  } catch (error) {
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
    throw error.response?.data || { success: false, message: 'Error al obtener historial' };
  }
};

/**
 * Obtener mecánicos disponibles (usuarios con rol mecanico)
 */
const getMecanicos = async () => {
  try {
    const response = await api.get('/usuarios/mecanicos');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error al obtener mecánicos' };
  }
};

/**
 * Obtener estados de orden del catálogo
 */
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