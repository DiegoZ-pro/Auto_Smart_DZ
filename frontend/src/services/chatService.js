// Llama al endpoint del chatbot con timeout largo porque Ollama puede tardar

import api from './api';

export const sendChatMessage = async (message, history = []) => {
  const response = await api.post('/chat/message', { message, history }, { timeout: 120000 });
  return response.data.data;
};
