// Middlewares de autenticación y autorización

const { verifyAccessToken } = require('../utils/jwt');
const { unauthorized, forbidden } = require('../utils/responses');

// Verifica que el request incluya un JWT válido
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Token no proporcionado');
    }

    // Quita el prefijo "Bearer " para quedarse solo con el token
    const token = authHeader.substring(7);

    const decoded = verifyAccessToken(token);

    // Guarda los datos del usuario en el request para que los usen los controladores
    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol
    };

    next();
  } catch (error) {
    if (error.message === 'Token expirado') {
      return unauthorized(res, 'Token expirado');
    }
    return unauthorized(res, 'Token inválido');
  }
};

// Comprueba que el usuario tenga uno de los roles permitidos
// Uso: authorize(['admin', 'mecanico'])
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorized(res, 'Usuario no autenticado');
    }

    // Acepta tanto string como array para mayor comodidad
    if (typeof roles === 'string') {
      roles = [roles];
    }

    if (!roles.includes(req.user.rol)) {
      return forbidden(res, 'No tienes permisos para realizar esta acción');
    }

    next();
  };
};

// Solo pasa si el usuario es administrador
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.rol !== 'admin') {
    return forbidden(res, 'Se requieren permisos de administrador');
  }
  next();
};

// Pasa si el usuario es admin o mecánico
const isAdminOrMechanic = (req, res, next) => {
  if (!req.user || !['admin', 'mecanico'].includes(req.user.rol)) {
    return forbidden(res, 'Se requieren permisos de administrador o mecánico');
  }
  next();
};

// Pasa si el usuario está accediendo a sus propios datos o si es admin
const isSelfOrAdmin = (req, res, next) => {
  const userId = parseInt(req.params.id);
  
  if (req.user.id !== userId && req.user.rol !== 'admin') {
    return forbidden(res, 'No tienes permisos para acceder a este recurso');
  }
  
  next();
};

module.exports = {
  authenticate,
  authorize,
  isAdmin,
  isAdminOrMechanic,
  isSelfOrAdmin
};