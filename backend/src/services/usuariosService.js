// Servicio de usuarios

const bcrypt = require('bcryptjs');
const { query, transaction } = require('../config/database');

// Lista usuarios con filtros opcionales por rol, estado o búsqueda
const getAllUsers = async (filters = {}) => {
  let sql = `
    SELECT u.id, u.email, u.nombre_completo, u.telefono, u.avatar_url,
           u.ultimo_acceso, u.fecha_creacion, u.fecha_actualizacion,
           r.rol as rol_nombre, r.id_rol as rol_id,
           eu.estado as estado_nombre, eu.id_estado as estado_id
    FROM usuarios u
    INNER JOIN roles r ON u.rol_id = r.id_rol
    INNER JOIN estados_usuario eu ON u.estado_id = eu.id_estado
    WHERE 1=1
  `;

  const params = [];

  if (filters.rol_id) {
    sql += ' AND u.rol_id = ?';
    params.push(filters.rol_id);
  }

  if (filters.estado_id) {
    sql += ' AND u.estado_id = ?';
    params.push(filters.estado_id);
  }

  if (filters.search) {
    sql += ' AND (u.nombre_completo LIKE ? OR u.email LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  sql += ' ORDER BY u.fecha_creacion DESC';

  const users = await query(sql, params);
  return users;
};

// Devuelve un usuario por su ID con datos de rol y estado
const getUserById = async (userId) => {
  const [user] = await query(
    `SELECT u.id, u.email, u.nombre_completo, u.telefono, u.avatar_url,
            u.ultimo_acceso, u.fecha_creacion, u.fecha_actualizacion,
            r.rol as rol_nombre, r.id_rol as rol_id,
            eu.estado as estado_nombre, eu.id_estado as estado_id
     FROM usuarios u
     INNER JOIN roles r ON u.rol_id = r.id_rol
     INNER JOIN estados_usuario eu ON u.estado_id = eu.id_estado
     WHERE u.id = ?`,
    [userId]
  );

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return user;
};

// Crea un usuario nuevo — solo el admin puede llamar esto
const createUser = async (userData, createdBy) => {
  const { email, password, nombreCompleto, telefono, rol_id } = userData;

  const [existingUser] = await query(
    'SELECT id FROM usuarios WHERE email = ?',
    [email]
  );

  if (existingUser) {
    throw new Error('El email ya está registrado');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO usuarios (email, password_hash, nombre_completo, telefono, rol_id, estado_id)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [email, passwordHash, nombreCompleto, telefono, rol_id]
  );

  const userId = result.insertId;

  // Si es rol cliente, el trigger de MySQL crea el registro en clientes automáticamente
  return await getUserById(userId);
};

// Actualiza los campos del usuario que vengan en updateData
const updateUser = async (userId, updateData) => {
  const { nombreCompleto, email, telefono, rol_id, estado_id, avatar_url, nueva_password } = updateData;

  const updates = [];
  const params = [];

  if (nombreCompleto !== undefined) {
    updates.push('nombre_completo = ?');
    params.push(nombreCompleto);
  }

  if (email !== undefined) {
    const [existingUser] = await query(
      'SELECT id FROM usuarios WHERE email = ? AND id != ?',
      [email, userId]
    );
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }
    updates.push('email = ?');
    params.push(email);
  }

  if (telefono !== undefined) {
    updates.push('telefono = ?');
    params.push(telefono);
  }

  if (rol_id !== undefined) {
    updates.push('rol_id = ?');
    params.push(rol_id);
  }

  if (estado_id !== undefined) {
    updates.push('estado_id = ?');
    params.push(estado_id);
  }

  if (avatar_url !== undefined) {
    updates.push('avatar_url = ?');
    params.push(avatar_url);
  }

  if (nueva_password) {
    const passwordHash = await bcrypt.hash(nueva_password, 10);
    updates.push('password_hash = ?');
    params.push(passwordHash);
  }

  if (updates.length === 0) {
    throw new Error('No hay campos para actualizar');
  }

  params.push(userId);

  await query(
    `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
    params
  );

  return await getUserById(userId);
};

// Desactiva al usuario cambiando su estado a "inactivo" (no lo borra)
const deleteUser = async (userId) => {
  const [estadoInactivo] = await query(
    'SELECT id_estado FROM estados_usuario WHERE estado = ?',
    ['inactivo']
  );

  if (!estadoInactivo) {
    throw new Error('Estado inactivo no encontrado');
  }

  await query(
    'UPDATE usuarios SET estado_id = ? WHERE id = ?',
    [estadoInactivo.id_estado, userId]
  );

  return true;
};

// Cambia el estado del usuario (activo, inactivo, bloqueado)
const changeUserStatus = async (userId, estadoId) => {
  await query(
    'UPDATE usuarios SET estado_id = ? WHERE id = ?',
    [estadoId, userId]
  );

  return await getUserById(userId);
};

// Totales de usuarios por rol y estado
const getUserStats = async () => {
  const [stats] = await query(`
    SELECT 
      COUNT(*) as total_usuarios,
      SUM(CASE WHEN r.rol = 'cliente' THEN 1 ELSE 0 END) as total_clientes,
      SUM(CASE WHEN r.rol = 'mecanico' THEN 1 ELSE 0 END) as total_mecanicos,
      SUM(CASE WHEN r.rol = 'admin' THEN 1 ELSE 0 END) as total_admins,
      SUM(CASE WHEN eu.estado = 'activo' THEN 1 ELSE 0 END) as usuarios_activos,
      SUM(CASE WHEN eu.estado = 'inactivo' THEN 1 ELSE 0 END) as usuarios_inactivos,
      SUM(CASE WHEN eu.estado = 'bloqueado' THEN 1 ELSE 0 END) as usuarios_bloqueados
    FROM usuarios u
    INNER JOIN roles r ON u.rol_id = r.id_rol
    INNER JOIN estados_usuario eu ON u.estado_id = eu.id_estado
  `);

  return stats;
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserStatus,
  getUserStats
};