// Controlador de notificaciones

const notificacionesService = require('../services/notificacionesService');
const { success } = require('../utils/responses');

// GET /api/notificaciones — notificaciones del usuario autenticado
const getNotificaciones = async (req, res, next) => {
  try {
    const usuarioId = req.user.id;
    const filters = {
      leida: req.query.leida !== undefined ? req.query.leida === 'true' : undefined,
      limit: req.query.limit
    };

    const notificaciones = await notificacionesService.getNotificacionesByUsuario(usuarioId, filters);

    return success(res, notificaciones, 'Notificaciones obtenidas exitosamente');
  } catch (err) {
    next(err);
  }
};

// GET /api/notificaciones/no-leidas — solo las que aún no se leyeron
const getNoLeidas = async (req, res, next) => {
  try {
    const usuarioId = req.user.id;

    const notificaciones = await notificacionesService.getNotificacionesNoLeidas(usuarioId);

    return success(res, notificaciones, 'Notificaciones no leídas obtenidas');
  } catch (err) {
    next(err);
  }
};

// GET /api/notificaciones/contador — cuántas no leídas hay (para el badge)
const contarNoLeidas = async (req, res, next) => {
  try {
    const usuarioId = req.user.id;

    const total = await notificacionesService.contarNoLeidas(usuarioId);

    return success(res, { total }, 'Contador obtenido exitosamente');
  } catch (err) {
    next(err);
  }
};

// PUT /api/notificaciones/:id/leer — marca una notificación como leída
const marcarComoLeida = async (req, res, next) => {
  try {
    const notificacionId = parseInt(req.params.id);

    await notificacionesService.marcarComoLeida(notificacionId);

    return success(res, null, 'Notificación marcada como leída');
  } catch (err) {
    next(err);
  }
};

// PUT /api/notificaciones/leer-todas — marca todas como leídas de una vez
const marcarTodasComoLeidas = async (req, res, next) => {
  try {
    const usuarioId = req.user.id;

    await notificacionesService.marcarTodasComoLeidas(usuarioId);

    return success(res, null, 'Todas las notificaciones marcadas como leídas');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/notificaciones/:id — elimina una notificación
const deleteNotificacion = async (req, res, next) => {
  try {
    const notificacionId = parseInt(req.params.id);

    await notificacionesService.deleteNotificacion(notificacionId);

    return success(res, null, 'Notificación eliminada exitosamente');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/notificaciones/limpiar-leidas — limpia todas las ya leídas
const deleteTodasLeidas = async (req, res, next) => {
  try {
    const usuarioId = req.user.id;

    await notificacionesService.deleteTodasLeidas(usuarioId);

    return success(res, null, 'Notificaciones leídas eliminadas');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotificaciones,
  getNoLeidas,
  contarNoLeidas,
  marcarComoLeida,
  marcarTodasComoLeidas,
  deleteNotificacion,
  deleteTodasLeidas
};