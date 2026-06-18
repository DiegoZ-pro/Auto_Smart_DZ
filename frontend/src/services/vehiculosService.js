// Servicio de vehículos del frontend

import api from './api';

const vehiculosService = {
  // Trae los vehículos de un cliente específico
  getByCliente: async (clienteId) => {
    try {
      const response = await api.get(`/clientes/${clienteId}/vehiculos`);
      return response.data;
    } catch (error) {
      console.error('[vehiculosService] getByCliente failed:', error.message);
      throw error.response?.data || { success: false, message: 'Error al obtener vehículos' };
    }
  },

  // Lista todos los vehículos con filtros opcionales
  getAllVehiculos: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.cliente_id) params.append('cliente_id', filters.cliente_id);
    if (filters.search) params.append('search', filters.search);
    if (filters.marca) params.append('marca', filters.marca);
    
    const queryString = params.toString();
    return api.get(`/vehiculos${queryString ? `?${queryString}` : ''}`);
  },

  searchVehiculos: async (searchTerm) => {
    return api.get(`/vehiculos/search?q=${searchTerm}`);
  },

  getMarcas: async () => {
    return api.get('/vehiculos/marcas');
  },

  getVehiculoById: async (id) => {
    return api.get(`/vehiculos/${id}`);
  },

  getVehiculoByPlaca: async (placa) => {
    return api.get(`/vehiculos/placa/${placa}`);
  },

  createVehiculo: async (vehiculoData) => {
    return api.post('/vehiculos', vehiculoData);
  },

  updateVehiculo: async (id, vehiculoData) => {
    return api.put(`/vehiculos/${id}`, vehiculoData);
  },

  deleteVehiculo: async (id) => {
    return api.delete(`/vehiculos/${id}`);
  },

  getHistorialVehiculo: async (id) => {
    return api.get(`/vehiculos/${id}/historial`);
  }
};

export default vehiculosService;