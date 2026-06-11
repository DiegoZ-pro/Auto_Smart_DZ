import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@context/AuthContext';

vi.mock('@services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

import { authService } from '@services/authService';

const TestConsumer = () => {
  const { user, isAuthenticated, isAdmin, isMecanico, isCliente } = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="isAdmin">{String(isAdmin)}</span>
      <span data-testid="isMecanico">{String(isMecanico)}</span>
      <span data-testid="isCliente">{String(isCliente)}</span>
      {user && <span data-testid="nombre">{user.nombreCompleto}</span>}
    </div>
  );
};

const renderWithProvider = () =>
  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('estado inicial', () => {
    it('no está autenticado si localStorage está vacío', async () => {
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId('authenticated').textContent).toBe('false')
      );
    });

    it('carga el usuario desde localStorage si existe token y user', async () => {
      const storedUser = {
        id: 1,
        email: 'admin@test.com',
        nombre_completo: 'Admin User',
        rol: 'admin',
      };
      localStorage.setItem('autosmart_access_token', 'fake-token');
      localStorage.setItem('autosmart_user', JSON.stringify(storedUser));

      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId('authenticated').textContent).toBe('true')
      );
      expect(screen.getByTestId('nombre').textContent).toBe('Admin User');
    });
  });

  describe('normalización de usuario (snake_case → camelCase)', () => {
    it('convierte nombre_completo a nombreCompleto al cargar desde localStorage', async () => {
      localStorage.setItem('autosmart_access_token', 'token');
      localStorage.setItem(
        'autosmart_user',
        JSON.stringify({ id: 2, email: 'x@x.com', nombre_completo: 'Juan Pérez', rol: 'cliente' })
      );
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId('nombre').textContent).toBe('Juan Pérez')
      );
    });
  });

  describe('roles derivados', () => {
    const setUser = (rol) => {
      localStorage.setItem('autosmart_access_token', 'token');
      localStorage.setItem(
        'autosmart_user',
        JSON.stringify({ id: 1, email: 'u@u.com', nombre_completo: 'User', rol })
      );
    };

    it('isAdmin=true para rol admin', async () => {
      setUser('admin');
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId('isAdmin').textContent).toBe('true')
      );
      expect(screen.getByTestId('isMecanico').textContent).toBe('false');
      expect(screen.getByTestId('isCliente').textContent).toBe('false');
    });

    it('isMecanico=true para rol mecanico', async () => {
      setUser('mecanico');
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId('isMecanico').textContent).toBe('true')
      );
    });

    it('isCliente=true para rol cliente', async () => {
      setUser('cliente');
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId('isCliente').textContent).toBe('true')
      );
    });
  });

  describe('login', () => {
    const LoginBtn = () => {
      const { login, user, error } = useAuth();
      return (
        <div>
          {user && <span data-testid="user-email">{user.email}</span>}
          {error && <span data-testid="error">{error}</span>}
          <button onClick={() => login('a@b.com', '123456')}>Login</button>
        </div>
      );
    };

    it('guarda el usuario y tokens al hacer login exitoso', async () => {
      authService.login.mockResolvedValue({
        data: {
          user: { id: 1, email: 'a@b.com', nombre_completo: 'Test', rol: 'admin' },
          tokens: { accessToken: 'acc', refreshToken: 'ref' },
        },
      });

      render(
        <AuthProvider>
          <LoginBtn />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByRole('button').click();
      });

      await waitFor(() =>
        expect(screen.getByTestId('user-email').textContent).toBe('a@b.com')
      );
      expect(localStorage.getItem('autosmart_access_token')).toBe('acc');
    });

    it('devuelve error cuando las credenciales son incorrectas (401)', async () => {
      authService.login.mockRejectedValue({
        response: { status: 401, data: {} },
      });

      render(
        <AuthProvider>
          <LoginBtn />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByRole('button').click();
      });

      await waitFor(() =>
        expect(screen.getByTestId('error')).toBeInTheDocument()
      );
      expect(screen.getByTestId('error').textContent).toMatch(/credenciales/i);
    });
  });

  describe('logout', () => {
    it('limpia el estado y localStorage al hacer logout', async () => {
      localStorage.setItem('autosmart_access_token', 'token');
      localStorage.setItem(
        'autosmart_user',
        JSON.stringify({ id: 1, email: 'u@u.com', nombre_completo: 'U', rol: 'admin' })
      );
      authService.logout.mockResolvedValue({});

      const LogoutBtn = () => {
        const { logout, isAuthenticated } = useAuth();
        return (
          <div>
            <span data-testid="auth">{String(isAuthenticated)}</span>
            <button onClick={logout}>Logout</button>
          </div>
        );
      };

      render(
        <AuthProvider>
          <LogoutBtn />
        </AuthProvider>
      );

      await waitFor(() =>
        expect(screen.getByTestId('auth').textContent).toBe('true')
      );

      await act(async () => {
        screen.getByRole('button').click();
      });

      await waitFor(() =>
        expect(screen.getByTestId('auth').textContent).toBe('false')
      );
      expect(localStorage.getItem('autosmart_access_token')).toBeNull();
    });
  });

  describe('useAuth fuera de AuthProvider', () => {
    it('lanza error si se usa fuera del provider', () => {
      const Bare = () => {
        useAuth();
        return null;
      };
      expect(() => render(<Bare />)).toThrow(
        'useAuth debe ser usado dentro de AuthProvider'
      );
    });
  });
});
