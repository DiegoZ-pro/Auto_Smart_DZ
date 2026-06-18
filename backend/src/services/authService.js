// Lógica de autenticación: registro, login, tokens y contraseñas

const bcrypt = require('bcryptjs');
const { query, transaction } = require('../config/database');
const { generateTokens } = require('../utils/jwt');

// Registra un nuevo cliente y devuelve sus tokens
const register = async (email, password, nombreCompleto, telefono) => {
  // Verifica que el email no esté en uso
  const existingUser = await query(
    'SELECT id FROM usuarios WHERE email = ?',
    [email]
  );

  if (existingUser.length > 0) {
    throw new Error('El email ya está registrado');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Obtiene el id del rol cliente para asignarlo al nuevo usuario
  const [roleResult] = await query(
    'SELECT id_rol FROM roles WHERE rol = ?',
    ['cliente']
  );

  if (!roleResult) {
    throw new Error('Error al obtener rol de cliente');
  }

  const result = await transaction(async (connection) => {
    const [userResult] = await connection.execute(
      `INSERT INTO usuarios (email, password_hash, nombre_completo, telefono, rol_id, estado_id) 
       VALUES (?, ?, ?, ?, ?, 1)`,
      [email, passwordHash, nombreCompleto, telefono, roleResult.id_rol]
    );

    const userId = userResult.insertId;

    // El trigger de MySQL crea el registro en clientes automáticamente,
    // pero hay que actualizar el teléfono y email que no se pasan en el trigger
    await connection.execute(
      `UPDATE clientes SET telefono = ?, email = ? WHERE usuario_id = ?`,
      [telefono, email, userId]
    );

    return userId;
  });

  const tokens = generateTokens(result, email, 'cliente');

  // Guarda el refresh token en BD para poder validarlo después
  await query(
    'UPDATE usuarios SET refresh_token = ? WHERE id = ?',
    [tokens.refreshToken, result]
  );

  // Devuelve los datos del usuario recién creado
  const [user] = await query(
    `SELECT u.id, u.email, u.nombre_completo, u.telefono, r.rol
     FROM usuarios u
     INNER JOIN roles r ON u.rol_id = r.id_rol
     WHERE u.id = ?`,
    [result]
  );

  return {
    user,
    tokens
  };
};

// Verifica credenciales y devuelve los tokens si son correctas
const login = async (email, password) => {
  const [user] = await query(
    `SELECT u.*, r.rol, eu.estado
     FROM usuarios u
     INNER JOIN roles r ON u.rol_id = r.id_rol
     INNER JOIN estados_usuario eu ON u.estado_id = eu.id_estado
     WHERE u.email = ?`,
    [email]
  );

  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  // No se puede loguear si está bloqueado o inactivo
  if (user.estado === 'bloqueado') {
    throw new Error('Usuario bloqueado. Contacte al administrador');
  }

  if (user.estado === 'inactivo') {
    throw new Error('Usuario inactivo. Contacte al administrador');
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    throw new Error('Credenciales inválidas');
  }

  const tokens = generateTokens(user.id, user.email, user.rol);

  // Actualiza el refresh token y la fecha del último acceso
  await query(
    'UPDATE usuarios SET refresh_token = ?, ultimo_acceso = NOW() WHERE id = ?',
    [tokens.refreshToken, user.id]
  );

  // No se deben devolver datos sensibles al frontend
  delete user.password_hash;
  delete user.refresh_token;

  return {
    user,
    tokens
  };
};

// Genera un nuevo par de tokens usando el refresh token almacenado en BD
const refreshToken = async (refreshToken) => {
  const [user] = await query(
    `SELECT u.id, u.email, r.rol, eu.estado
     FROM usuarios u
     INNER JOIN roles r ON u.rol_id = r.id_rol
     INNER JOIN estados_usuario eu ON u.estado_id = eu.id_estado
     WHERE u.refresh_token = ?`,
    [refreshToken]
  );

  if (!user) {
    throw new Error('Refresh token inválido');
  }

  // No renueva el token si el usuario fue bloqueado o desactivado
  if (user.estado !== 'activo') {
    throw new Error('Usuario no activo');
  }

  const tokens = generateTokens(user.id, user.email, user.rol);

  // Reemplaza el refresh token viejo
  await query(
    'UPDATE usuarios SET refresh_token = ? WHERE id = ?',
    [tokens.refreshToken, user.id]
  );

  return tokens;
};

// Invalida el refresh token del usuario para cerrar la sesión
const logout = async (userId) => {
  await query(
    'UPDATE usuarios SET refresh_token = NULL WHERE id = ?',
    [userId]
  );

  return true;
};

// Verifica la contraseña actual y la reemplaza si es correcta
const changePassword = async (userId, oldPassword, newPassword) => {
  const [user] = await query(
    'SELECT password_hash FROM usuarios WHERE id = ?',
    [userId]
  );

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const isValidPassword = await bcrypt.compare(oldPassword, user.password_hash);

  if (!isValidPassword) {
    throw new Error('Contraseña actual incorrecta');
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  await query(
    'UPDATE usuarios SET password_hash = ? WHERE id = ?',
    [newPasswordHash, userId]
  );

  return true;
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  changePassword
};