import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@components/common/Button/Button';

describe('Button', () => {
  it('renderiza el texto del hijo', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
  });

  it('usa type="button" por defecto', () => {
    render(<Button>OK</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('acepta type="submit"', () => {
    render(<Button type="submit">Enviar</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('queda deshabilitado cuando disabled=true', () => {
    render(<Button disabled>Bloqueado</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('queda deshabilitado y muestra spinner cuando loading=true', () => {
    render(<Button loading>Cargando</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn.querySelector('span')).toBeInTheDocument();
  });

  it('llama a onClick al hacer click', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('no llama a onClick cuando está deshabilitado', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Bloqueado</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('aplica className extra recibida por props', () => {
    render(<Button className="mi-clase">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('mi-clase');
  });

  it('renderiza ícono cuando se pasa la prop icon', () => {
    const FakeIcon = (props) => <svg data-testid="icon" {...props} />;
    render(<Button icon={FakeIcon}>Con ícono</Button>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('no renderiza ícono cuando loading=true aunque se pase icon', () => {
    const FakeIcon = (props) => <svg data-testid="icon" {...props} />;
    render(<Button icon={FakeIcon} loading>Cargando</Button>);
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
  });
});
