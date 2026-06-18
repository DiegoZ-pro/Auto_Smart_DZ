// Servicio de clientes del frontend

import api from './api';

const clientesService = {
  // Lista todos los clientes con búsqueda opcional
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      
      const queryString = params.toString();
      const url = queryString ? `/clientes?${queryString}` : '/clientes';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('[clientesService] getAll failed:', error.message);
      throw error.response?.data || { success: false, message: 'Error al obtener clientes' };
    }
  },

  // Perfil del cliente autenticado
  getMyProfile: async () => {
    const response = await api.get('/clientes/me');
    return response.data;
  },

  getAllClientes: async () => {
    const response = await api.get('/clientes');
    return response.data;
  },

  getClienteById: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  updateCliente: async (id, data) => {
    const response = await api.put(`/clientes/${id}`, data);
    return response.data;
  },

  getVehiculosCliente: async (id) => {
    const response = await api.get(`/clientes/${id}/vehiculos`);
    return response.data;
  },

  getOrdenesCliente: async (id) => {
    const response = await api.get(`/clientes/${id}/ordenes`);
    return response.data;
  },

  getEstadisticasCliente: async (id) => {
    const response = await api.get(`/clientes/${id}/estadisticas`);
    return response.data;
  },

  searchClientes: async (query) => {
    const response = await api.get(`/clientes/search?q=${query}`);
    return response.data;
  }
};

export default clientesService;