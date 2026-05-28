// ============================================================================
// VALIDADORES DE FORMULARIOS
// ============================================================================

/**
 * Valida formato de email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida longitud mínima de contraseña
 */
export const isValidPassword = (password, minLength = 6) => {
  return password && password.length >= minLength;
};

/**
 * Valida formato de teléfono (mínimo 7 dígitos)
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^\d{7,20}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Valida que un campo no esté vacío
 */
export const isRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

/**
 * Valida longitud de texto
 */
export const hasMinLength = (value, minLength) => {
  return value && value.length >= minLength;
};

export const hasMaxLength = (value, maxLength) => {
  return value && value.length <= maxLength;
};

/**
 * Valida que las contraseñas coincidan
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Validador de formulario de login
 */
export const validateLoginForm = (email, password) => {
  const errors = {};

  if (!isRequired(email)) {
    errors.email = 'El correo electrónico es requerido';
  } else if (!isValidEmail(email)) {
    errors.email = 'El correo electrónico no es válido';
  }

  if (!isRequired(password)) {
    errors.password = 'La contraseña es requerida';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validador de formulario de registro
 */
export const validateRegisterForm = (data) => {
  const errors = {};

  // Nombre completo
  if (!isRequired(data.nombreCompleto)) {
    errors.nombreCompleto = 'El nombre completo es requerido';
  } else if (!hasMinLength(data.nombreCompleto, 3)) {
    errors.nombreCompleto = 'El nombre debe tener al menos 3 caracteres';
  }

  // Email
  if (!isRequired(data.email)) {
    errors.email = 'El correo electrónico es requerido';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'El correo electrónico no es válido';
  }

  // Teléfono
  if (!isRequired(data.telefono)) {
    errors.telefono = 'El teléfono es requerido';
  } else if (!isValidPhone(data.telefono)) {
    errors.telefono = 'El teléfono debe tener entre 7 y 20 dígitos';
  }

  // Contraseña
  if (!isRequired(data.password)) {
    errors.password = 'La contraseña es requerida';
  } else if (!isValidPassword(data.password, 6)) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  // Confirmar contraseña
  if (!isRequired(data.confirmPassword)) {
    errors.confirmPassword = 'Debes confirmar tu contraseña';
  } else if (!passwordsMatch(data.password, data.confirmPassword)) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};