// Servicio de notificaciones

const { query } = require('../config/database');

// Crea una nueva notificación para un usuario
const createNotificacion = async (notificacionData) => {
  const {
    usuario_id,
    titulo,
    mensaje,
    tipo_id,
    orden_trabajo_id
  } = notificacionData;

  const result = await query(
    `INSERT INTO notificaciones (
      usuario_id, titulo, mensaje, tipo_id, orden_trabajo_id
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      usuario_id,
      titulo,
      mensaje,
      tipo_id || 1, // por defecto es tipo "info"
      orden_trabajo_id || null
    ]
  );

  return result.insertId;
};

// Notificaciones de un usuario con filtro opcional por estado de lectura
const getNotificacionesByUsuario = async (usuarioId, filters = {}) => {
  let sql = `
    SELECT n.*, 
           tn.tipo as tipo_nombre,
           tn.color as tipo_color,
           tn.icono as tipo_icono,
           ot.numero_orden
    FROM notificaciones n
    INNER JOIN tipos_notificacion tn ON n.tipo_id = tn.id_tipo
    LEFT JOIN ordenes_trabajo ot ON n.orden_trabajo_id = ot.id
    WHERE n.usuario_id = ?
  `;

  const params = [usuarioId];

  // Permite filtrar solo las leídas o solo las no leídas
  if (filters.leida !== undefined) {
    sql += ' AND n.leida = ?';
    params.push(filters.leida);
  }

  sql += ' ORDER BY n.fecha_creacion DESC';

  // Limita la cantidad si se pasa el parámetro
  if (filters.limit) {
    sql += ' LIMIT ?';
    params.push(parseInt(filters.limit));
  }

  const notificaciones = await query(sql, params);
  return notificaciones;
};

// Atajo para traer solo las no leídas
const getNotificacionesNoLeidas = async (usuarioId) => {
  return await getNotificacionesByUsuario(usuarioId, { leida: false });
};

// Devuelve el número de notificaciones sin leer (para el badge del header)
const contarNoLeidas = async (usuarioId) => {
  const [result] = await query(
    'SELECT COUNT(*) as total FROM notificaciones WHERE usuario_id = ? AND leida = FALSE',
    [usuarioId]
  );

  return result.total;
};

// Marca una notificación específica como leída
const marcarComoLeida = async (notificacionId) => {
  await query(
    'UPDATE notificaciones SET leida = TRUE WHERE id = ?',
    [notificacionId]
  );

  return true;
};

// Marca todas las no leídas como leídas de una vez
const marcarTodasComoLeidas = async (usuarioId) => {
  await query(
    'UPDATE notificaciones SET leida = TRUE WHERE usuario_id = ? AND leida = FALSE',
    [usuarioId]
  );

  return true;
};

// Borra una notificación por su ID
const deleteNotificacion = async (notificacionId) => {
  await query('DELETE FROM notificaciones WHERE id = ?', [notificacionId]);
  return true;
};

// Limpia todas las notificaciones leídas de un usuario
const deleteTodasLeidas = async (usuarioId) => {
  await query(
    'DELETE FROM notificaciones WHERE usuario_id = ? AND leida = TRUE',
    [usuarioId]
  );

  return true;
};

// Notifica al cliente cuando su orden cambia de estado
const notificarCambioEstado = async (ordenId, nuevoEstadoId, estadoNombre) => {
  const [orden] = await query(
    `SELECT ot.cliente_id, ot.numero_orden, c.usuario_id
     FROM ordenes_trabajo ot
     INNER JOIN clientes c ON ot.cliente_id = c.id
     WHERE ot.id = ?`,
    [ordenId]
  );

  if (!orden) return false;

  // Mensaje personalizado según el nuevo estado
  const mensajes = {
    1: 'Su orden ha sido recepcionada y está pendiente de diagnóstico',
    2: 'Estamos realizando el diagnóstico de su orden',
    3: 'Su orden está en revisión de laboratorio',
    4: 'Diagnóstico completado. Pronto recibirá una cotización',
    5: 'Estamos esperando la llegada de repuestos para su orden',
    6: 'Su orden está siendo reparada',
    7: 'Su orden está en pruebas y calibración final',
    8: 'Trabajo completado. Realizando pruebas finales',
    9: 'Su orden está lista para ser retirada',
    10: 'Su orden ha sido entregada. ¡Gracias por su confianza!',
    11: 'Su orden ha sido cancelada'
  };

  const mensaje = mensajes[nuevoEstadoId] || 'Estado de su orden actualizado';

  await createNotificacion({
    usuario_id: orden.usuario_id,
    titulo: `Actualización de orden ${orden.numero_orden}`,
    mensaje: mensaje,
    tipo_id: nuevoEstadoId === 11 ? 4 : (nuevoEstadoId === 10 ? 2 : 1), // 4=error si cancelado, 2=éxito si entregado, 1=info el resto
    orden_trabajo_id: ordenId
  });

  return true;
};

// Notifica al cliente cuando se genera una cotización para su orden
const notificarNuevaCotizacion = async (cotizacionId) => {
  const [cotizacion] = await query(
    `SELECT cot.numero_cotizacion, ot.numero_orden, ot.cliente_id, c.usuario_id
     FROM cotizaciones cot
     INNER JOIN ordenes_trabajo ot ON cot.orden_trabajo_id = ot.id
     INNER JOIN clientes c ON ot.cliente_id = c.id
     WHERE cot.id = ?`,
    [cotizacionId]
  );

  if (!cotizacion) return false;

  await createNotificacion({
    usuario_id: cotizacion.usuario_id,
    titulo: `Nueva cotización ${cotizacion.numero_cotizacion}`,
    mensaje: `Se ha generado una cotización para su orden ${cotizacion.numero_orden}`,
    tipo_id: 1, // info
    orden_trabajo_id: null
  });

  return true;
};

module.exports = {
  createNotificacion,
  getNotificacionesByUsuario,
  getNotificacionesNoLeidas,
  contarNoLeidas,
  marcarComoLeida,
  marcarTodasComoLeidas,
  deleteNotificacion,
  deleteTodasLeidas,
  notificarCambioEstado,
  notificarNuevaCotizacion
};