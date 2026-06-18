// Chatbot flotante AutoBot IA

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { sendChatMessage } from '@services/chatService';
import styles from './ChatBot.module.css';

// Iconos SVG definidos inline para no depender de una librería externa

const IconBot = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z"/>
  </svg>
);

const IconRefresh = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
  </svg>
);

const IconClose = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const IconSend = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);

const IconChat = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
  </svg>
);

// Mensaje de bienvenida personalizado según el rol

const WELCOME = {
  cliente: '¡Hola! Soy AutoBot. Puedo ayudarte con el estado de tus vehículos, órdenes de trabajo y citas. ¿En qué te ayudo?',
  mecanico: '¡Hola! Soy AutoBot. Puedo consultarte sobre tus órdenes asignadas y darte asistencia técnica automotriz. ¿Qué necesitas?',
  admin: '¡Hola! Soy AutoBot. Puedo darte resúmenes del taller, KPIs y análisis de operaciones. ¿Qué necesitas saber?'
};

// Componente principal del chatbot

const ChatBot = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !initialized && user) {
      const welcome = WELCOME[user.rol] || WELCOME.cliente;
      setMessages([{ role: 'assistant', content: welcome, isWelcome: true }]);
      setInitialized(true);
    }
  }, [isOpen, initialized, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isAuthenticated || !user) return null;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const fullHistory = [...messages.filter(m => !m.isWelcome), userMsg];
      const history = fullHistory
        .slice(0, -1)
        .slice(-10)
        .map(({ role, content }) => ({ role, content }));

      const { reply } = await sendChatMessage(text, history);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const isTimeout = err.message?.toLowerCase().includes('timeout') || err.code === 'ECONNABORTED';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: isTimeout
          ? 'La respuesta tardó demasiado. El modelo puede estar cargando, intenta de nuevo en unos segundos.'
          : (err.message || 'Lo siento, ocurrió un error. Intenta nuevamente.')
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleToggle = () => setIsOpen(prev => !prev);

  const handleClear = () => {
    if (user) {
      const welcome = WELCOME[user.rol] || WELCOME.cliente;
      setMessages([{ role: 'assistant', content: welcome, isWelcome: true }]);
    }
  };

  return (
    <div className={styles.container}>
      {isOpen && (
        <div className={styles.panel} role="dialog" aria-label="AutoBot asistente IA">
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <div className={styles.botIconHeader}>
                <IconBot size={18} />
              </div>
              <div>
                <span className={styles.title}>AutoBot</span>
                <span className={styles.subtitle}>Asistente IA · {user.rol}</span>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.iconBtn}
                onClick={handleClear}
                title="Nueva conversación"
                aria-label="Nueva conversación"
              >
                <IconRefresh />
              </button>
              <button
                className={styles.iconBtn}
                onClick={handleToggle}
                title="Cerrar"
                aria-label="Cerrar chat"
              >
                <IconClose size={16} />
              </button>
            </div>
          </div>

          <div className={styles.messages} role="log" aria-live="polite">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`${styles.message} ${msg.role === 'user' ? styles.user : styles.bot}`}
              >
                {msg.role === 'assistant' && (
                  <div className={styles.botAvatar}>
                    <IconBot size={13} />
                  </div>
                )}
                <div className={styles.bubble}>{msg.content}</div>
              </div>
            ))}

            {loading && (
              <div className={`${styles.message} ${styles.bot}`}>
                <div className={styles.botAvatar}>
                  <IconBot size={13} />
                </div>
                <div className={`${styles.bubble} ${styles.typing}`}>
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <textarea
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta... (Enter para enviar)"
              rows={2}
              disabled={loading}
              maxLength={2000}
              aria-label="Mensaje para AutoBot"
            />
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={!input.trim() || loading}
              aria-label="Enviar mensaje"
            >
              <IconSend />
            </button>
          </div>
        </div>
      )}

      <button
        className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`}
        onClick={handleToggle}
        aria-label={isOpen ? 'Cerrar AutoBot' : 'Abrir AutoBot asistente IA'}
        title={isOpen ? 'Cerrar chat' : 'AutoBot — Asistente IA'}
      >
        {isOpen ? <IconClose size={20} /> : <IconChat />}
      </button>
    </div>
  );
};

export default ChatBot;
