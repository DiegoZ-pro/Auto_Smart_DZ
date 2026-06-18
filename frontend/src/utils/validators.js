// Funciones de validación de formularios del frontend

// Verifica que el email tenga un formato válido
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Verifica que la contraseña tenga al menos minLength caracteres
export const isValidPassword = (password, minLength = 6) => {
  return password && password.length >= minLength;
};

// Solo acepta números, entre 7 y 20 dígitos
export const isValidPhone = (phone) => {
  const phoneRegex = /^\d{7,20}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Verifica que el campo no esté vacío o sea null/undefined
export const isRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const hasMinLength = (value, minLength) => {
  return value && value.length >= minLength;
};

export const hasMaxLength = (value, maxLength) => {
  return value && value.length <= maxLength;
};

// Compara las dos contraseñas para el formulario de registro
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

// Valida el formulario de login y devuelve los errores encontrados
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

// Valida todos los campos del formulario de registro
export const validateRegisterForm = (data) => {
  const errors = {};

  if (!isRequired(data.nombreCompleto)) {
    errors.nombreCompleto = 'El nombre completo es requerido';
  } else if (!hasMinLength(data.nombreCompleto, 3)) {
    errors.nombreCompleto = 'El nombre debe tener al menos 3 caracteres';
  }

  if (!isRequired(data.email)) {
    errors.email = 'El correo electrónico es requerido';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'El correo electrónico no es válido';
  }

  if (!isRequired(data.telefono)) {
    errors.telefono = 'El teléfono es requerido';
  } else if (!isValidPhone(data.telefono)) {
    errors.telefono = 'El teléfono debe tener entre 7 y 20 dígitos';
  }

  if (!isRequired(data.password)) {
    errors.password = 'La contraseña es requerida';
  } else if (!isValidPassword(data.password, 6)) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

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