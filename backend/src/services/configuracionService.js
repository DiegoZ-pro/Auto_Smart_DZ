// ============================================================================
// SERVICIO DE CONFIGURACIÓN DEL TALLER
// ============================================================================

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../../data/configuracion.json');

const DEFAULT_CONFIG = {
  nombre: 'AutoSmart Taller',
  slogan: 'Tu vehículo en las mejores manos',
  direccion: '',
  telefono: '',
  email: '',
  sitioWeb: '',
  descripcion: '',
  horarios: {
    lunes:     { activo: true,  apertura: '08:00', cierre: '18:00' },
    martes:    { activo: true,  apertura: '08:00', cierre: '18:00' },
    miercoles: { activo: true,  apertura: '08:00', cierre: '18:00' },
    jueves:    { activo: true,  apertura: '08:00', cierre: '18:00' },
    viernes:   { activo: true,  apertura: '08:00', cierre: '18:00' },
    sabado:    { activo: true,  apertura: '08:00', cierre: '13:00' },
    domingo:   { activo: false, apertura: '08:00', cierre: '13:00' },
  },
  maxCitasPorDia: 10,
  duracionCitaMinutos: 60,
};

const ensureDataDir = () => {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const getConfig = () => {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch {
    // si el archivo está corrupto devolver default
  }
  return DEFAULT_CONFIG;
};

const updateConfig = (newConfig) => {
  ensureDataDir();
  const merged = { ...DEFAULT_CONFIG, ...getConfig(), ...newConfig };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2));
  return merged;
};

module.exports = { getConfig, updateConfig };
