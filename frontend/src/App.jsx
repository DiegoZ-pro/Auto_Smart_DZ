// Componente raíz de la aplicación

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import ChatBot from './components/common/ChatBot/ChatBot';
import './styles/index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ChatBot />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;