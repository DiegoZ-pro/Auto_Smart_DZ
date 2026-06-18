// Rutas de notificaciones

const express = require('express');
const router = express.Router();
const notificacionesController = require('../controllers/notificacionesController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/no-leidas', notificacionesController.getNoLeidas);
router.get('/contador', notificacionesController.contarNoLeidas);
router.get('/', notificacionesController.getNotificaciones);
router.put('/leer-todas', notificacionesController.marcarTodasComoLeidas);
router.delete('/limpiar-leidas', notificacionesController.deleteTodasLeidas);
router.put('/:id/leer', notificacionesController.marcarComoLeida);
router.delete('/:id', notificacionesController.deleteNotificacion);

module.exports = router;