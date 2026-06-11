import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Alert from '@components/common/Alert/Alert';

describe('Alert', () => {
  it('no renderiza nada cuando message es undefined', () => {
    const { container } = render(<Alert />);
    expect(container.firstChild).toBeNull();
  });

  it('no renderiza nada cuando message es string vacío', () => {
    const { container } = render(<Alert message="" />);
    expect(container.firstChild).toBeNull();
  });

  it('muestra el mensaje cuando se pasa', () => {
    render(<Alert message="Operación exitosa" />);
    expect(screen.getByText('Operación exitosa')).toBeInTheDocument();
  });

  it('muestra el title cuando se pasa', () => {
    render(<Alert message="Detalle" title="Error crítico" />);
    expect(screen.getByText('Error crítico')).toBeInTheDocument();
  });

  it('no muestra title si no se pasa', () => {
    render(<Alert message="Solo mensaje" />);
    expect(screen.queryByText('Error crítico')).not.toBeInTheDocument();
  });

  it('renderiza sin botón cerrar cuando onClose no se pasa', () => {
    render(<Alert message="Info" />);
    expect(screen.queryByRole('button', { name: /cerrar/i })).not.toBeInTheDocument();
  });

  it('renderiza botón cerrar cuando onClose se pasa', () => {
    render(<Alert message="Info" onClose={() => {}} />);
    expect(screen.getByRole('button', { name: /cerrar alerta/i })).toBeInTheDocument();
  });

  it('llama a onClose al hacer click en cerrar', () => {
    const handleClose = vi.fn();
    render(<Alert message="Info" onClose={handleClose} />);
    fireEvent.click(screen.getByRole('button', { name: /cerrar alerta/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it.each(['success', 'error', 'warning', 'info'])(
    'acepta type="%s" sin lanzar error',
    (type) => {
      render(<Alert type={type} message="Mensaje de prueba" />);
      expect(screen.getByText('Mensaje de prueba')).toBeInTheDocument();
    }
  );
});
