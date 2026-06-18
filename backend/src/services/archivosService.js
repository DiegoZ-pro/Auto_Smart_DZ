// Servicio para gestionar archivos adjuntos a órdenes de trabajo

const { query } = require('../config/database');
const { deleteFile, getFileUrl } = require('../config/multer');

// Guarda los metadatos del archivo en la BD
const saveArchivo = async (archivoData) => {
  const {
    orden_trabajo_id,
    nombre_archivo,
    ruta_archivo,
    tipo_archivo,
    tamano_bytes,
    descripcion,
    subido_por
  } = archivoData;

  const result = await query(
    `INSERT INTO archivos (
      orden_trabajo_id, nombre_archivo, ruta_archivo, 
      tipo_archivo, tamano_bytes, descripcion, subido_por
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      orden_trabajo_id,
      nombre_archivo,
      ruta_archivo,
      tipo_archivo,
      tamano_bytes,
      descripcion || null,
      subido_por
    ]
  );

  return result.insertId;
};

// Devuelve los archivos de una orden con su URL pública
const getArchivosByOrden = async (ordenTrabajoId) => {
  const archivos = await query(
    `SELECT a.*, u.nombre_completo as subido_por_nombre
     FROM archivos a
     LEFT JOIN usuarios u ON a.subido_por = u.id
     WHERE a.orden_trabajo_id = ?
     ORDER BY a.fecha_subida DESC`,
    [ordenTrabajoId]
  );

  // Agrega la URL pública a cada archivo para que el frontend pueda acceder
  return archivos.map(archivo => ({
    ...archivo,
    url: getFileUrl(archivo.ruta_archivo)
  }));
};

// Busca un archivo por ID y le agrega su URL
const getArchivoById = async (archivoId) => {
  const [archivo] = await query(
    `SELECT a.*, u.nombre_completo as subido_por_nombre
     FROM archivos a
     LEFT JOIN usuarios u ON a.subido_por = u.id
     WHERE a.id = ?`,
    [archivoId]
  );

  if (!archivo) {
    throw new Error('Archivo no encontrado');
  }

  archivo.url = getFileUrl(archivo.ruta_archivo);

  return archivo;
};

// Borra el archivo del disco y también su registro en la BD
const deleteArchivo = async (archivoId) => {
  const archivo = await getArchivoById(archivoId);

  const deleted = deleteFile(archivo.ruta_archivo);

  await query('DELETE FROM archivos WHERE id = ?', [archivoId]);

  return deleted;
};

// Actualiza la descripción del archivo
const updateDescripcion = async (archivoId, descripcion) => {
  await query(
    'UPDATE archivos SET descripcion = ? WHERE id = ?',
    [descripcion, archivoId]
  );

  return await getArchivoById(archivoId);
};

// Devuelve totales de archivos y espacio en MB
const getEstadisticas = async () => {
  const [stats] = await query(`
    SELECT 
      COUNT(*) as total_archivos,
      SUM(tamano_bytes) as espacio_total,
      COUNT(DISTINCT orden_trabajo_id) as ordenes_con_archivos,
      AVG(tamano_bytes) as tamano_promedio
    FROM archivos
  `);

  return {
    ...stats,
    espacio_total_mb: (stats.espacio_total / (1024 * 1024)).toFixed(2),
    tamano_promedio_kb: (stats.tamano_promedio / 1024).toFixed(2)
  };
};

module.exports = {
  saveArchivo,
  getArchivosByOrden,
  getArchivoById,
  deleteArchivo,
  updateDescripcion,
  getEstadisticas
};