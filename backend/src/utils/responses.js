// Respuestas HTTP estandarizadas para toda la API

// Respuesta cuando todo salió bien
const success = (res, data, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// Respuesta de error con código HTTP configurable
const error = (res, message = 'Error en la operación', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Cuando los datos del request no pasan la validación
const validationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Error de validación',
    errors
  });
};

// El usuario no está autenticado o el token es inválido
const unauthorized = (res, message = 'No autorizado') => {
  return res.status(401).json({
    success: false,
    message
  });
};

// El usuario está autenticado pero no tiene permisos
const forbidden = (res, message = 'Acceso prohibido') => {
  return res.status(403).json({
    success: false,
    message
  });
};

// El recurso solicitado no existe
const notFound = (res, message = 'Recurso no encontrado') => {
  return res.status(404).json({
    success: false,
    message
  });
};

// Conflicto, por ejemplo cuando ya existe un registro con el mismo email o placa
const conflict = (res, message = 'Conflicto en la operación') => {
  return res.status(409).json({
    success: false,
    message
  });
};

module.exports = {
  success,
  error,
  validationError,
  unauthorized,
  forbidden,
  notFound,
  conflict
};