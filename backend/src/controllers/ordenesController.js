// Controlador de órdenes de trabajo

const ordenesService = require('../services/ordenesService');
const { success, error, notFound } = require('../utils/responses');

// GET /api/ordenes — lista órdenes con filtros opcionales
const getAllOrdenes = async (req, res, next) => {
  try {
    const filters = {
      tipo_orden_id: req.query.tipo_orden_id,
      estado_id: req.query.estado_id,
      cliente_id: req.query.cliente_id,
      mecanico_id: req.query.mecanico_id,
      search: req.query.search,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta
    };

    const ordenes = await ordenesService.getAllOrdenes(filters);

    return success(res, ordenes, 'Órdenes obtenidas exitosamente');
  } catch (err) {
    next(err);
  }
};

// GET /api/ordenes/kanban — órdenes agrupadas por estado para el tablero Kanban
const getOrdenesKanban = async (req, res, next) => {
  try {
    const tipoOrdenId = req.query.tipo_orden_id || 1;

    const kanban = await ordenesService.getOrdenesKanban(parseInt(tipoOrdenId));

    return success(res, kanban, 'Órdenes Kanban obtenidas exitosamente');
  } catch (err) {
    next(err);
  }
};

// GET /api/ordenes/estadisticas — resumen de órdenes e ingresos en un período
const getEstadisticas = async (req, res, next) => {
  try {
    const fechaInicio = req.query.fecha_inicio || new Date(new Date().setDate(1)).toISOString().split('T')[0];
    const fechaFin = req.query.fecha_fin || new Date().toISOString().split('T')[0];

    const stats = await ordenesService.getEstadisticas(fechaInicio, fechaFin);

    return success(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (err) {
    next(err);
  }
};

// GET /api/ordenes/:id — devuelve una orden con toda su información
const getOrdenById = async (req, res, next) => {
  try {
    const ordenId = parseInt(req.params.id);

    const orden = await ordenesService.getOrdenById(ordenId);

    return success(res, orden, 'Orden obtenida exitosamente');
  } catch (err) {
    if (err.message === 'Orden no encontrada') {
      return notFound(res, err.message);
    }
    next(err);
  }
};

// POST /api/ordenes — crea una nueva orden, puede crear cliente y vehículo si no existen
const createOrden = async (req, res, next) => {
  try {
    const ordenData = req.body;
    const userId = req.user.id;

    const ordenId = await ordenesService.createOrden(ordenData, userId);

    const orden = await ordenesService.getOrdenById(ordenId);

    return success(res, orden, 'Orden creada exitosamente', 201);
  } catch (err) {
    next(err);
  }
};

// PUT /api/ordenes/:id — actualiza los datos de una orden existente
const updateOrden = async (req, res, next) => {
  try {
    const ordenId = parseInt(req.params.id);
    const ordenData = req.body;
    const userId = req.user.id;

    const orden = await ordenesService.updateOrden(ordenId, ordenData, userId);

    return success(res, orden, 'Orden actualizada exitosamente');
  } catch (err) {
    if (err.message === 'Orden no encontrada') {
      return notFound(res, err.message);
    }
    next(err);
  }
};

// PUT /api/ordenes/:id/estado — cambia el estado de la orden (se usa en el Kanban)
const cambiarEstado = async (req, res, next) => {
  try {
    const ordenId = parseInt(req.params.id);
    const { estado_id } = req.body;
    const userId = req.user.id;

    if (!estado_id) {
      return error(res, 'El estado_id es requerido', 400);
    }

    const orden = await ordenesService.cambiarEstado(ordenId, estado_id, userId);

    return success(res, orden, 'Estado actualizado exitosamente');
  } catch (err) {
    if (err.message === 'Orden no encontrada') {
      return notFound(res, err.message);
    }
    next(err);
  }
};

// PUT /api/ordenes/:id/asignar-mecanico — asigna un mecánico a la orden
const asignarMecanico = async (req, res, next) => {
  try {
    const ordenId = parseInt(req.params.id);
    const { mecanico_id } = req.body;
    const userId = req.user.id;

    if (!mecanico_id) {
      return error(res, 'El mecanico_id es requerido', 400);
    }

    const orden = await ordenesService.asignarMecanico(ordenId, mecanico_id, userId);

    return success(res, orden, 'Mecánico asignado exitosamente');
  } catch (err) {
    if (err.message === 'Orden no encontrada') {
      return notFound(res, err.message);
    }
    next(err);
  }
};

// GET /api/ordenes/:id/historial — cambios de estado de la orden
const getHistorialEstados = async (req, res, next) => {
  try {
    const ordenId = parseInt(req.params.id);

    const historial = await ordenesService.getHistorialEstados(ordenId);

    return success(res, historial, 'Historial obtenido exitosamente');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllOrdenes,
  getOrdenesKanban,
  getEstadisticas,
  getOrdenById,
  createOrden,
  updateOrden,
  cambiarEstado,
  asignarMecanico,
  getHistorialEstados
};