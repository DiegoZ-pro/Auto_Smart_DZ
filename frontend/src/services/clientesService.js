// ============================================================================
// SERVICIO DE CLIENTES
// ============================================================================

import api from './api';

const clientesService = {
  /**
   * Obtener todos los clientes con filtros (NUEVO - para búsqueda)
   */
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

  /**
   * Obtener datos del cliente autenticado (nuevo endpoint)
   */
  getMyProfile: async () => {
    const response = await api.get('/clientes/me');
    return response.data;
  },

  /**
   * Obtener todos los clientes (usado para obtener datos del cliente actual)
   */
  getAllClientes: async () => {
    const response = await api.get('/clientes');
    return response.data;
  },

  /**
   * Obtener cliente por ID
   */
  getClienteById: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  /**
   * Actualizar datos del cliente
   */
  updateCliente: async (id, data) => {
    const response = await api.put(`/clientes/${id}`, data);
    return response.data;
  },

  /**
   * Obtener vehículos de un cliente
   */
  getVehiculosCliente: async (id) => {
    const response = await api.get(`/clientes/${id}/vehiculos`);
    return response.data;
  },

  /**
   * Obtener órdenes de trabajo de un cliente
   */
  getOrdenesCliente: async (id) => {
    const response = await api.get(`/clientes/${id}/ordenes`);
    return response.data;
  },

  /**
   * Obtener estadísticas de un cliente
   */
  getEstadisticasCliente: async (id) => {
    const response = await api.get(`/clientes/${id}/estadisticas`);
    return response.data;
  },

  /**
   * Buscar clientes
   */
  searchClientes: async (query) => {
    const response = await api.get(`/clientes/search?q=${query}`);
    return response.data;
  }
};

export default clientesService;