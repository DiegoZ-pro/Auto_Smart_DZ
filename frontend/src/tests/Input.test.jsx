import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '@components/common/Input/Input';

describe('Input', () => {
  it('renderiza el input', () => {
    render(<Input name="email" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('muestra el label cuando se pasa', () => {
    render(<Input name="email" label="Correo electrónico" />);
    expect(screen.getByText('Correo electrónico')).toBeInTheDocument();
  });

  it('no muestra label si no se pasa', () => {
    render(<Input name="email" />);
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('muestra asterisco cuando required=true', () => {
    render(<Input name="email" label="Email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('muestra mensaje de error cuando se pasa error', () => {
    render(<Input name="email" error="El email es requerido" />);
    expect(screen.getByText('El email es requerido')).toBeInTheDocument();
  });

  it('no muestra mensaje de error cuando no hay error', () => {
    render(<Input name="email" />);
    expect(screen.queryByText(/requerido/i)).not.toBeInTheDocument();
  });

  it('queda deshabilitado cuando disabled=true', () => {
    render(<Input name="email" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('llama a onChange al escribir', () => {
    const handleChange = vi.fn();
    render(<Input name="email" value="" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a@b.com' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('llama a onBlur al salir del campo', () => {
    const handleBlur = vi.fn();
    render(<Input name="email" onBlur={handleBlur} />);
    fireEvent.blur(screen.getByRole('textbox'));
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('usa type="text" por defecto', () => {
    render(<Input name="nombre" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
  });

  it('acepta type="password"', () => {
    render(<Input name="pass" type="password" />);
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument();
  });

  it('muestra el placeholder', () => {
    render(<Input name="email" placeholder="Ingresa tu email" />);
    expect(screen.getByPlaceholderText('Ingresa tu email')).toBeInTheDocument();
  });
});
