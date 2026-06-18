// Rutas de usuarios (todas requieren autenticación, la mayoría solo admin)

const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { authenticate, isAdmin, isAdminOrMechanic } = require('../middlewares/auth');
const {
  validateCreateUser,
  validateUpdateUser,
  validateChangeStatus
} = require('../validators/usuarios.validator');

router.use(authenticate);

router.get('/stats', isAdmin, usuariosController.getUserStats);
router.get('/mecanicos', isAdminOrMechanic, usuariosController.getMecanicos);
router.get('/', isAdmin, usuariosController.getAllUsers);
router.get('/:id', isAdmin, usuariosController.getUserById);
router.post('/', isAdmin, validateCreateUser, usuariosController.createUser);
router.put('/:id', isAdmin, validateUpdateUser, usuariosController.updateUser);
router.delete('/:id', isAdmin, usuariosController.deleteUser);
router.put('/:id/estado', isAdmin, validateChangeStatus, usuariosController.changeUserStatus);

module.exports = router;