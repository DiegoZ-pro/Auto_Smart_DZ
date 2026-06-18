// Rutas de autenticación

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateChangePassword,
  validateUpdateProfile
} = require('../validators/auth.validator');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', validateRefreshToken, authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, validateChangePassword, authController.changePassword);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, validateUpdateProfile, authController.updateProfile);

module.exports = router;