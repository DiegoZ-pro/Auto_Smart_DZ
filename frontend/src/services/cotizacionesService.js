// ============================================================================
// SERVICIO DE COTIZACIONES
// Conexión con backend /api/cotizaciones
// ============================================================================

import api from './api';

/**
 * Obtener todas las cotizaciones con filtros opcionales
 */
const getAll = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.search)     params.append('search', filters.search);
    if (filters.estado_id)  params.append('estado_id', filters.estado_id);
    if (filters.cliente_id) params.append('cliente_id', filters.cliente_id);

    const queryString = params.toString();
    const url = queryString ? `/cotizaciones?${queryString}` : '/cotizaciones';

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('[cotizacionesService] getAll failed:', error.message);
    throw error.response?.data || { success: false, message: 'Error al obtener cotizaciones' };
  }
};

/**
 * Obtener cotización por ID
 */
const getById = async (id) => {
  try {
    const response = await api.get(`/cotizaciones/${id}`);
    return response.data;
  } catch (error) {
    console.error('[cotizacionesService] getById failed:', error.message);
    throw error.response?.data || { success: false, message: 'Error al obtener cotización' };
  }
};

/**
 * Obtener cotizaciones de una orden
 */
const getByOrden = async (ordenId) => {
  try {
    const response = await api.get(`/cotizaciones/orden/${ordenId}`);
    return response.data;
  } catch (error) {
    console.error('[cotizacionesService] getByOrden failed:', error.message);
    throw error.response?.data || { success: false, message: 'Error al obtener cotizaciones de la orden' };
  }
};

/**
 * Crear nueva cotización
 */
const create = async (cotizacionData) => {
  try {
    const response = await api.post('/cotizaciones', cotizacionData);
    return response.data;
  } catch (error) {
    console.error('[cotizacionesService] create failed:', error.message);
    throw error.response?.data || { success: false, message: 'Error al crear cotización' };
  }
};

/**
 * Actualizar cotización existente
 */
const update = async (id, cotizacionData) => {
  try {
    const response = await api.put(`/cotizaciones/${id}`, cotizacionData);
    return response.data;
  } catch (error) {
    console.error('[cotizacionesService] update failed:', error.message);
    throw error.response?.data || { success: false, message: 'Error al actualizar cotización' };
  }
};

/**
 * Marcar cotización como enviada
 */
const enviar = async (id) => {
  try {
    const response = await api.post(`/cotizaciones/${id}/enviar`);
    return response.data;
  } catch (error) {
    console.error('[cotizacionesService] enviar failed:', error.message);
    throw error.response?.data || { success: false, message: 'Error al enviar cotización' };
  }
};

/**
 * Aprobar cotización
 */
const aprobar = async (id) => {
  try {
    const response = await api.post(`/cotizaciones/${id}/aprobar`);
    return response.data;
  } catch (error) {
    console.error('[cotizacionesService] aprobar failed:', error.message);
    throw error.response?.data || { success: false, message: 'Error al aprobar cotización' };
  }
};

/**
 * Rechazar cotización
 */
const rechazar = async (id) => {
  try {
    const response = await api.post(`/cotizaciones/${id}/rechazar`);
    return response.data;
  } catch (error) {
    console.error('[cotizacionesService] rechazar failed:', error.message);
    throw error.response?.data || { success: false, message: 'Error al rechazar cotización' };
  }
};

/**
 * Obtener todas las órdenes (para el selector al crear cotización)
 */
const getOrdenes = async () => {
  try {
    const response = await api.get('/ordenes');
    return response.data;
  } catch (error) {
    console.error('[cotizacionesService] getOrdenes failed:', error.message);
    throw error.response?.data || { success: false, message: 'Error al obtener órdenes' };
  }
};

export const cotizacionesService = {
  getAll,
  getById,
  getByOrden,
  create,
  update,
  enviar,
  aprobar,
  rechazar,
  getOrdenes,
};