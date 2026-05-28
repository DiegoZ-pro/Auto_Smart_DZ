// ============================================================================
// SERVICIO DE CITAS - API CALLS
// ============================================================================

import api from './api';

/**
 * Obtener horarios disponibles para una fecha específica
 * GET /api/citas/horarios-disponibles?fecha=YYYY-MM-DD
 */
export const getHorariosDisponibles = async (fecha) => {
  const response = await api.get('/citas/horarios-disponibles', {
    params: { fecha }
  });
  return response.data;
};

/**
 * Crear nueva cita
 * POST /api/citas
 */
export const crearCita = async (citaData) => {
  const response = await api.post('/citas', citaData);
  return response.data;
};

/**
 * Obtener citas del cliente autenticado
 * GET /api/citas/cliente/:clienteId
 */
export const getCitasByCliente = async (clienteId) => {
  const response = await api.get(`/citas/cliente/${clienteId}`);
  return response.data;
};

/**
 * Obtener todas las citas (con filtros opcionales)
 * GET /api/citas
 */
export const getAllCitas = async (filters = {}) => {
  const response = await api.get('/citas', { params: filters });
  return response.data;
};

/**
 * Obtener cita por ID
 * GET /api/citas/:id
 */
export const getCitaById = async (citaId) => {
  const response = await api.get(`/citas/${citaId}`);
  return response.data;
};

/**
 * Actualizar cita
 * PUT /api/citas/:id
 */
export const updateCita = async (citaId, citaData) => {
  const response = await api.put(`/citas/${citaId}`, citaData);
  return response.data;
};

/**
 * Cancelar cita
 * PUT /api/citas/:id/cancelar
 */
export const cancelarCita = async (citaId) => {
  const response = await api.put(`/citas/${citaId}/cancelar`);
  return response.data;
};

/**
 * Confirmar cita (Admin/Mecánico)
 * PUT /api/citas/:id/confirmar
 */
export const confirmarCita = async (citaId) => {
  const response = await api.put(`/citas/${citaId}/confirmar`);
  return response.data;
};

/**
 * Completar cita (Admin/Mecánico)
 * PUT /api/citas/:id/completar
 */
export const completarCita = async (citaId) => {
  const response = await api.put(`/citas/${citaId}/completar`);
  return response.data;
};

const citasService = {
  getHorariosDisponibles,
  crearCita,
  getCitasByCliente,
  getAllCitas,
  getCitaById,
  updateCita,
  cancelarCita,
  confirmarCita,
  completarCita
};

export default citasService;