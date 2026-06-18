// Configuración de multer para subir archivos

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Si la carpeta de uploads no existe la crea
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Define dónde se guardan los archivos y cómo se llaman
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Nombre único para evitar colisiones: timestamp + número aleatorio
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
  }
});

// Solo acepta los tipos de archivo que queremos
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'video/mp4',
    'video/quicktime' // .mov
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes, PDFs, documentos y videos.'), false);
  }
};

// Instancia principal de multer con sus opciones
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB por defecto
  }
});

// Para subir un solo archivo
const uploadSingle = upload.single('file');

// Para subir varios archivos a la vez (máximo 10)
const uploadMultiple = upload.array('files', 10);

// Borra el archivo del disco si existe
const deleteFile = (filePath) => {
  try {
    const fullPath = path.join(uploadsDir, path.basename(filePath));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return false;
  }
};

// Devuelve la URL pública con la que se puede acceder al archivo
const getFileUrl = (filename) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${filename}`;
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  deleteFile,
  getFileUrl,
  uploadsDir
};