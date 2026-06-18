// Controlador de usuarios

const usuariosService = require('../services/usuariosService');
const { success, error, notFound } = require('../utils/responses');

// GET /api/usuarios — lista todos los usuarios con filtros opcionales
const getAllUsers = async (req, res, next) => {
  try {
    const filters = {
      rol_id: req.query.rol_id,
      estado_id: req.query.estado_id,
      search: req.query.search
    };

    const users = await usuariosService.getAllUsers(filters);

    return success(res, users, 'Usuarios obtenidos exitosamente');
  } catch (err) {
    next(err);
  }
};

// GET /api/usuarios/:id — devuelve un usuario por su ID
const getUserById = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await usuariosService.getUserById(userId);

    return success(res, user, 'Usuario obtenido exitosamente');
  } catch (err) {
    if (err.message === 'Usuario no encontrado') {
      return notFound(res, err.message);
    }
    next(err);
  }
};

// POST /api/usuarios — solo el admin puede crear mecánicos u otros admins
const createUser = async (req, res, next) => {
  try {
    const userData = req.body;
    const createdBy = req.user.id;

    const user = await usuariosService.createUser(userData, createdBy);

    return success(res, user, 'Usuario creado exitosamente', 201);
  } catch (err) {
    if (err.message === 'El email ya está registrado') {
      return error(res, err.message, 409);
    }
    next(err);
  }
};

// PUT /api/usuarios/:id — actualiza datos del usuario
const updateUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const updateData = req.body;

    const user = await usuariosService.updateUser(userId, updateData);

    return success(res, user, 'Usuario actualizado exitosamente');
  } catch (err) {
    if (err.message === 'Usuario no encontrado') {
      return notFound(res, err.message);
    }
    if (err.message === 'El email ya está registrado') {
      return error(res, err.message, 409);
    }
    next(err);
  }
};

// DELETE /api/usuarios/:id — desactiva el usuario (no lo borra realmente)
const deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    await usuariosService.deleteUser(userId);

    return success(res, null, 'Usuario desactivado exitosamente');
  } catch (err) {
    next(err);
  }
};

// PUT /api/usuarios/:id/estado — cambia el estado del usuario (activo, bloqueado, etc.)
const changeUserStatus = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { estado_id } = req.body;

    const user = await usuariosService.changeUserStatus(userId, estado_id);

    return success(res, user, 'Estado actualizado exitosamente');
  } catch (err) {
    next(err);
  }
};

// GET /api/usuarios/mecanicos — lista de mecánicos para asignar a órdenes
const getMecanicos = async (req, res, next) => {
  try {
    const users = await usuariosService.getAllUsers({ rol_id: 2 });
    return success(res, users, 'Mecánicos obtenidos exitosamente');
  } catch (err) {
    next(err);
  }
};

// GET /api/usuarios/stats — totales de usuarios por rol y estado
const getUserStats = async (req, res, next) => {
  try {
    const stats = await usuariosService.getUserStats();

    return success(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserStatus,
  getMecanicos,
  getUserStats
};