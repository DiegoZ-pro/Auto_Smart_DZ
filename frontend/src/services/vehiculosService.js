// ============================================================================
// SERVICIO DE VEHÍCULOS
// ============================================================================

import api from './api';

const vehiculosService = {
  // Obtener vehículos por cliente (NUEVO - para búsqueda)
  getByCliente: async (clienteId) => {
    try {
      const response = await api.get(`/clientes/${clienteId}/vehiculos`);
      return response.data;
    } catch (error) {
      console.error('[vehiculosService] getByCliente failed:', error.message);
      throw error.response?.data || { success: false, message: 'Error al obtener vehículos' };
    }
  },

  // Obtener todos los vehículos
  getAllVehiculos: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.cliente_id) params.append('cliente_id', filters.cliente_id);
    if (filters.search) params.append('search', filters.search);
    if (filters.marca) params.append('marca', filters.marca);
    
    const queryString = params.toString();
    return api.get(`/vehiculos${queryString ? `?${queryString}` : ''}`);
  },

  // Buscar vehículos
  searchVehiculos: async (searchTerm) => {
    return api.get(`/vehiculos/search?q=${searchTerm}`);
  },

  // Obtener marcas únicas
  getMarcas: async () => {
    return api.get('/vehiculos/marcas');
  },

  // Obtener vehículo por ID
  getVehiculoById: async (id) => {
    return api.get(`/vehiculos/${id}`);
  },

  // Buscar vehículo por placa
  getVehiculoByPlaca: async (placa) => {
    return api.get(`/vehiculos/placa/${placa}`);
  },

  // Crear vehículo
  createVehiculo: async (vehiculoData) => {
    return api.post('/vehiculos', vehiculoData);
  },

  // Actualizar vehículo
  updateVehiculo: async (id, vehiculoData) => {
    return api.put(`/vehiculos/${id}`, vehiculoData);
  },

  // Eliminar vehículo
  deleteVehiculo: async (id) => {
    return api.delete(`/vehiculos/${id}`);
  },

  // Obtener historial de órdenes de un vehículo
  getHistorialVehiculo: async (id) => {
    return api.get(`/vehiculos/${id}/historial`);
  }
};

export default vehiculosService;