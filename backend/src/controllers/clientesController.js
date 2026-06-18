// Controlador de clientes

const clientesService = require('../services/clientesService');
const { success, error, notFound } = require('../utils/responses');

// GET /api/clientes — lista de clientes con búsqueda opcional
const getAllClientes = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
      empresa: req.query.empresa
    };

    const clientes = await clientesService.getAllClientes(filters);

    return success(res, clientes, 'Clientes obtenidos exitosamente');
  } catch (err) {
    next(err);
  }
};

// GET /api/clientes/search?q= — busca clientes por nombre, email o teléfono
const searchClientes = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return error(res, 'Término de búsqueda debe tener al menos 2 caracteres', 400);
    }

    const clientes = await clientesService.searchClientes(q);

    return success(res, clientes, 'Búsqueda completada');
  } catch (err) {
    next(err);
  }
};

// GET /api/clientes/:id — devuelve un cliente por su ID
const getClienteById = async (req, res, next) => {
  try {
    const clienteId = parseInt(req.params.id);

    const cliente = await clientesService.getClienteById(clienteId);

    return success(res, cliente, 'Cliente obtenido exitosamente');
  } catch (err) {
    if (err.message === 'Cliente no encontrado') {
      return notFound(res, err.message);
    }
    next(err);
  }
};

// GET /api/clientes/me — perfil del cliente que está logueado
const getMyProfile = async (req, res, next) => {
  try {
    const usuarioId = req.user.id;

    const cliente = await clientesService.getClienteByUsuarioId(usuarioId);

    if (!cliente) {
      return notFound(res, 'Cliente no encontrado');
    }

    return success(res, cliente, 'Perfil obtenido exitosamente');
  } catch (err) {
    next(err);
  }
};

// PUT /api/clientes/:id — actualiza datos del cliente
const updateCliente = async (req, res, next) => {
  try {
    const clienteId = parseInt(req.params.id);
    const data = req.body;

    const cliente = await clientesService.getClienteById(clienteId);

    // Un cliente solo puede actualizar su propio perfil
    if (req.user.rol === 'cliente' && cliente.usuario_id !== req.user.id) {
      return error(res, 'No tienes permisos para actualizar este cliente', 403);
    }

    const clienteActualizado = await clientesService.updateCliente(clienteId, data);

    return success(res, clienteActualizado, 'Cliente actualizado exitosamente');
  } catch (err) {
    if (err.message === 'Cliente no encontrado') {
      return notFound(res, err.message);
    }
    next(err);
  }
};

// GET /api/clientes/:id/vehiculos — vehículos registrados del cliente
const getVehiculosCliente = async (req, res, next) => {
  try {
    const clienteId = parseInt(req.params.id);

    const vehiculos = await clientesService.getVehiculosCliente(clienteId);

    return success(res, vehiculos, 'Vehículos obtenidos exitosamente');
  } catch (err) {
    next(err);
  }
};

// GET /api/clientes/:id/ordenes — historial de órdenes del cliente
const getOrdenesCliente = async (req, res, next) => {
  try {
    const clienteId = parseInt(req.params.id);

    const ordenes = await clientesService.getOrdenesCliente(clienteId);

    return success(res, ordenes, 'Órdenes obtenidas exitosamente');
  } catch (err) {
    next(err);
  }
};

// GET /api/clientes/:id/estadisticas — resumen de vehículos, órdenes y gasto del cliente
const getEstadisticasCliente = async (req, res, next) => {
  try {
    const clienteId = parseInt(req.params.id);

    const stats = await clientesService.getEstadisticasCliente(clienteId);

    return success(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllClientes,
  searchClientes,
  getClienteById,
  getMyProfile,
  updateCliente,
  getVehiculosCliente,
  getOrdenesCliente,
  getEstadisticasCliente
};