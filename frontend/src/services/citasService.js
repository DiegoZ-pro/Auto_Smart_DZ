// Servicio de citas del frontend

import api from './api';

// GET /api/citas/horarios-disponibles?fecha=YYYY-MM-DD
export const getHorariosDisponibles = async (fecha) => {
  const response = await api.get('/citas/horarios-disponibles', {
    params: { fecha }
  });
  return response.data;
};

// POST /api/citas
export const crearCita = async (citaData) => {
  const response = await api.post('/citas', citaData);
  return response.data;
};

// GET /api/citas/cliente/:clienteId
export const getCitasByCliente = async (clienteId) => {
  const response = await api.get(`/citas/cliente/${clienteId}`);
  return response.data;
};

// GET /api/citas con filtros opcionales
export const getAllCitas = async (filters = {}) => {
  const response = await api.get('/citas', { params: filters });
  return response.data;
};

// GET /api/citas/:id
export const getCitaById = async (citaId) => {
  const response = await api.get(`/citas/${citaId}`);
  return response.data;
};

// PUT /api/citas/:id
export const updateCita = async (citaId, citaData) => {
  const response = await api.put(`/citas/${citaId}`, citaData);
  return response.data;
};

// PUT /api/citas/:id/cancelar
export const cancelarCita = async (citaId) => {
  const response = await api.put(`/citas/${citaId}/cancelar`);
  return response.data;
};

// PUT /api/citas/:id/confirmar (solo admin/mecánico)
export const confirmarCita = async (citaId) => {
  const response = await api.put(`/citas/${citaId}/confirmar`);
  return response.data;
};

// PUT /api/citas/:id/completar (solo admin/mecánico)
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