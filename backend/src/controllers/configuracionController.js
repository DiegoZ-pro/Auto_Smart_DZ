// ============================================================================
// CONTROLADOR DE CONFIGURACIÓN DEL TALLER
// ============================================================================

const configuracionService = require('../services/configuracionService');
const { success, error } = require('../utils/responses');

const getConfig = (req, res, next) => {
  try {
    const config = configuracionService.getConfig();
    return success(res, config, 'Configuración obtenida');
  } catch (err) {
    next(err);
  }
};

const updateConfig = (req, res, next) => {
  try {
    const updated = configuracionService.updateConfig(req.body);
    return success(res, updated, 'Configuración actualizada');
  } catch (err) {
    next(err);
  }
};

module.exports = { getConfig, updateConfig };
