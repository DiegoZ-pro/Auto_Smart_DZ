import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '@/routes/PrivateRoute';

vi.mock('@context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@context/AuthContext';

const renderRoute = (allowedRoles = []) =>
  render(
    <MemoryRouter initialEntries={['/protegido']}>
      <Routes>
        <Route path="/login" element={<div>Página Login</div>} />
        <Route path="/" element={<div>Página Inicio</div>} />
        <Route path="/taller/diagnostico-tecnico" element={<div>Diagnóstico Técnico</div>} />
        <Route
          path="/protegido"
          element={
            <PrivateRoute allowedRoles={allowedRoles}>
              <div>Contenido protegido</div>
            </PrivateRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe('PrivateRoute', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra spinner mientras loading=true', () => {
    useAuth.mockReturnValue({ user: null, loading: true });
    const { container } = renderRoute();
    expect(container.querySelector('[style]')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('redirige a /login cuando no hay usuario autenticado', () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    renderRoute();
    expect(screen.getByText('Página Login')).toBeInTheDocument();
  });

  it('muestra el contenido cuando el usuario está autenticado y no hay roles restringidos', () => {
    useAuth.mockReturnValue({ user: { rol: 'admin' }, loading: false });
    renderRoute([]);
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('muestra el contenido cuando el rol del usuario está en allowedRoles', () => {
    useAuth.mockReturnValue({ user: { rol: 'admin' }, loading: false });
    renderRoute(['admin']);
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('redirige cliente a "/" cuando no tiene el rol permitido', () => {
    useAuth.mockReturnValue({ user: { rol: 'cliente' }, loading: false });
    renderRoute(['admin']);
    expect(screen.getByText('Página Inicio')).toBeInTheDocument();
  });

  it('redirige mecánico a /taller/diagnostico-tecnico cuando no tiene el rol permitido', () => {
    useAuth.mockReturnValue({ user: { rol: 'mecanico' }, loading: false });
    renderRoute(['admin']);
    expect(screen.getByText('Diagnóstico Técnico')).toBeInTheDocument();
  });
});
