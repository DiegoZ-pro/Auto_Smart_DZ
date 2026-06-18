// Rutas de configuración del taller

const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');
const { authenticate, isAdminOrMechanic } = require('../middlewares/auth');

router.get('/', authenticate, configuracionController.getConfig);
router.put('/', authenticate, isAdminOrMechanic, configuracionController.updateConfig);

module.exports = router;
