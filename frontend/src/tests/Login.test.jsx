import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '@pages/public/Login/Login';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin, loading: false }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderLogin = () => {
  const result = render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
  const submitForm = () => fireEvent.submit(result.container.querySelector('form'));
  return { ...result, submitForm };
};

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el título y los campos del formulario', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ejemplo@correo.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('muestra error cuando el email está vacío al enviar', async () => {
    const { submitForm } = renderLogin();
    submitForm();
    await waitFor(() =>
      expect(screen.getByText('El correo electrónico es requerido')).toBeInTheDocument()
    );
  });

  it('muestra error cuando el formato de email no es válido', async () => {
    const { submitForm } = renderLogin();
    fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
      target: { name: 'email', value: 'correo-sin-arroba' },
    });
    submitForm();
    await waitFor(() =>
      expect(screen.getByText('El correo electrónico no es válido')).toBeInTheDocument()
    );
  });

  it('muestra error cuando la contraseña está vacía al enviar', async () => {
    const { submitForm } = renderLogin();
    fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
      target: { name: 'email', value: 'admin@test.com' },
    });
    submitForm();
    await waitFor(() =>
      expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument()
    );
  });

  it('llama a login con las credenciales ingresadas', async () => {
    mockLogin.mockResolvedValueOnce({ success: true, user: { rol: 'admin' } });
    const { submitForm } = renderLogin();
    fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
      target: { name: 'email', value: 'admin@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { name: 'password', value: 'password123' },
    });
    submitForm();
    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith('admin@test.com', 'password123')
    );
  });

  it('redirige a /taller/kpis cuando el rol es admin', async () => {
    mockLogin.mockResolvedValueOnce({ success: true, user: { rol: 'admin' } });
    const { submitForm } = renderLogin();
    fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
      target: { name: 'email', value: 'admin@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { name: 'password', value: 'password123' },
    });
    submitForm();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/taller/kpis'));
  });

  it('redirige a /taller/diagnostico-tecnico cuando el rol es mecanico', async () => {
    mockLogin.mockResolvedValueOnce({ success: true, user: { rol: 'mecanico' } });
    const { submitForm } = renderLogin();
    fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
      target: { name: 'email', value: 'mec@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { name: 'password', value: 'password123' },
    });
    submitForm();
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/taller/diagnostico-tecnico')
    );
  });

  it('redirige a / cuando el rol es cliente', async () => {
    mockLogin.mockResolvedValueOnce({ success: true, user: { rol: 'cliente' } });
    const { submitForm } = renderLogin();
    fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
      target: { name: 'email', value: 'cli@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { name: 'password', value: 'password123' },
    });
    submitForm();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('muestra alerta de error cuando el login falla', async () => {
    mockLogin.mockResolvedValueOnce({ success: false, error: 'Credenciales inválidas' });
    const { submitForm } = renderLogin();
    fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
      target: { name: 'email', value: 'bad@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { name: 'password', value: 'claveincorrecta' },
    });
    submitForm();
    await waitFor(() =>
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument()
    );
  });

  it('muestra mensaje genérico si el error de login no trae mensaje', async () => {
    mockLogin.mockResolvedValueOnce({ success: false });
    const { submitForm } = renderLogin();
    fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
      target: { name: 'email', value: 'bad@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { name: 'password', value: 'clave' },
    });
    submitForm();
    await waitFor(() =>
      expect(
        screen.getByText('Error al iniciar sesión. Intenta nuevamente.')
      ).toBeInTheDocument()
    );
  });
});
