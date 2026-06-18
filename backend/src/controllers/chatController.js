// Controlador del chat con AutoBot IA

const { chat } = require('../services/chatService');
const { success } = require('../utils/responses');

const sendMessage = async (req, res) => {
  const { message, history } = req.body;
  const { id: userId, rol } = req.user;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ success: false, message: 'El mensaje no puede estar vacío' });
  }

  if (message.trim().length > 2000) {
    return res.status(400).json({ success: false, message: 'Mensaje demasiado largo (máximo 2000 caracteres)' });
  }

  const sanitizedHistory = Array.isArray(history)
    ? history
        .filter(m => m && typeof m.role === 'string' && typeof m.content === 'string')
        .map(m => ({ role: m.role, content: m.content }))
    : [];

  try {
    const reply = await chat(userId, rol, message.trim(), sanitizedHistory);
    return success(res, { reply }, 'Respuesta generada');
  } catch (err) {
    console.error('[chatController]', err.message);
    return res.status(503).json({
      success: false,
      message: err.message || 'Error al procesar el mensaje'
    });
  }
};

module.exports = { sendMessage };
