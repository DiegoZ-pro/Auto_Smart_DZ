// Funciones para leer los catálogos de la BD (roles, estados, prioridades, etc.)

const { query } = require('../config/database');

// Devuelve todos los roles del sistema
const getRoles = async () => {
  return await query('SELECT * FROM roles ORDER BY id_rol');
};

const getEstadosUsuario = async () => {
  return await query('SELECT * FROM estados_usuario ORDER BY id_estado');
};

const getTiposCombustible = async () => {
  return await query('SELECT * FROM tipos_combustible ORDER BY id_combustible');
};

const getTiposOrden = async () => {
  return await query('SELECT * FROM tipos_orden ORDER BY id_tipo');
};

const getEstadosOrden = async () => {
  return await query('SELECT * FROM estados_orden ORDER BY orden_visualizacion');
};

const getPrioridades = async () => {
  return await query('SELECT * FROM prioridades ORDER BY nivel');
};

const getEstadosCotizacion = async () => {
  return await query('SELECT * FROM estados_cotizacion ORDER BY id_estado');
};

const getTiposNotificacion = async () => {
  return await query('SELECT * FROM tipos_notificacion ORDER BY id_tipo');
};

const getEstadosCita = async () => {
  return await query('SELECT * FROM estados_cita ORDER BY id_estado');
};

// Trae todos los catálogos en paralelo para no hacer 9 requests separados
const getAllCatalogos = async () => {
  const [
    roles,
    estadosUsuario,
    tiposCombustible,
    tiposOrden,
    estadosOrden,
    prioridades,
    estadosCotizacion,
    tiposNotificacion,
    estadosCita
  ] = await Promise.all([
    getRoles(),
    getEstadosUsuario(),
    getTiposCombustible(),
    getTiposOrden(),
    getEstadosOrden(),
    getPrioridades(),
    getEstadosCotizacion(),
    getTiposNotificacion(),
    getEstadosCita()
  ]);

  return {
    roles,
    estadosUsuario,
    tiposCombustible,
    tiposOrden,
    estadosOrden,
    prioridades,
    estadosCotizacion,
    tiposNotificacion,
    estadosCita
  };
};

module.exports = {
  getRoles,
  getEstadosUsuario,
  getTiposCombustible,
  getTiposOrden,
  getEstadosOrden,
  getPrioridades,
  getEstadosCotizacion,
  getTiposNotificacion,
  getEstadosCita,
  getAllCatalogos
};