// tests del modulo de citas — cobertura extendida

// mocks
jest.mock('../src/config/database', () => ({
  query: jest.fn(),
}));

const { query } = require('../src/config/database');
const citasService = require('../src/services/citasService');

// datos de prueba
const mockCita = {
  id: 1,
  cliente_id: 5,
  nombre_cliente: 'Juan Pérez',
  telefono_cliente: '75123456',
  email_cliente: 'juan@example.com',
  marca_vehiculo: 'Toyota',
  modelo_vehiculo: 'Corolla 2020',
  motivo: JSON.stringify(['Revisión de Frenos']),
  detalles: 'Revisión preventiva',
  fecha_cita: '2026-05-10',
  hora_cita: '09:00:00',
  estado_id: 1,
  estado_nombre: 'pendiente',
};

const mockCitaData = {
  nombre_cliente: 'Juan Pérez',
  telefono_cliente: '75123456',
  email_cliente: 'juan@example.com',
  marca_vehiculo: 'Toyota',
  modelo_vehiculo: 'Corolla 2020',
  motivo: ['Revisión de Frenos'],
  detalles: 'Revisión preventiva',
  fecha_cita: '2026-05-10',
  hora_cita: '09:00:00',
};

beforeEach(() => {
  jest.clearAllMocks();
});

// tests de crear cita
describe('citasService.createCita', () => {
  test('crea cita cuando el horario esta libre', async () => {
    query
      .mockResolvedValueOnce([{ id: 5 }]) // busca cliente por usuario
      .mockResolvedValueOnce([{ total: 0 }]) // horario libre
      .mockResolvedValueOnce({ insertId: 1 }); // inserta cita

    const citaId = await citasService.createCita(mockCitaData, 10);

    expect(citaId).toBe(1);

    // verifica que se busco el cliente
    expect(query).toHaveBeenNthCalledWith(
      1,
      'SELECT id FROM clientes WHERE usuario_id = ?',
      [10]
    );
  });

  test('falla si no hay cliente asociado', async () => {
    query.mockResolvedValueOnce([]); // no hay cliente

    await expect(citasService.createCita(mockCitaData, 99))
      .rejects.toThrow('No se encontró el cliente asociado al usuario');
  });

  test('falla si el horario ya esta ocupado', async () => {
    query
      .mockResolvedValueOnce([{ id: 5 }]) // cliente encontrado
      .mockResolvedValueOnce([{ total: 1 }]); // horario ocupado

    await expect(citasService.createCita(mockCitaData, 10))
      .rejects.toThrow('Ya existe una cita en este horario');
  });
});

// tests de obtener cita por id
describe('citasService.getCitaById', () => {
  test('retorna cita y parsea motivo', async () => {
    query.mockResolvedValueOnce([mockCita]);

    const result = await citasService.getCitaById(1);

    expect(result).toBeDefined();
    expect(result.id).toBe(1);
    // el motivo debe convertirse a array
    expect(Array.isArray(result.motivo)).toBe(true);
    expect(result.motivo).toContain('Revisión de Frenos');
  });

  test('lanza error si no existe', async () => {
    query.mockResolvedValueOnce([]);

    await expect(citasService.getCitaById(999))
      .rejects.toThrow('Cita no encontrada');
  });
});

// tests de disponibilidad
describe('citasService.verificarDisponibilidad (via getHorariosDisponibles)', () => {
  test('retorna todos los horarios si no hay citas', async () => {
    query.mockResolvedValueOnce([]); // sin ocupados

    const horarios = await citasService.getHorariosDisponibles('2026-05-10');

    expect(Array.isArray(horarios)).toBe(true);
    expect(horarios.length).toBe(10);
    expect(horarios).toContain('09:00:00');
  });

  test('excluye horarios ocupados', async () => {
    query.mockResolvedValueOnce([
      { hora_cita: '09:00:00' },
      { hora_cita: '14:00:00' },
    ]);

    const horarios = await citasService.getHorariosDisponibles('2026-05-10');

    expect(horarios).not.toContain('09:00:00');
    expect(horarios).not.toContain('14:00:00');
    expect(horarios.length).toBe(8);
  });

  test('retorna vacio si todo esta lleno', async () => {
    const todosOcupados = [
      '08:00:00', '09:00:00', '10:00:00', '11:00:00', '12:00:00',
      '13:00:00', '14:00:00', '15:00:00', '16:00:00', '17:00:00',
    ].map(hora_cita => ({ hora_cita }));

    query.mockResolvedValueOnce(todosOcupados);

    const horarios = await citasService.getHorariosDisponibles('2026-05-10');

    expect(horarios.length).toBe(0);
  });
});

// tests de cambios de estado
describe('citasService - cambios de estado', () => {
  const citaBase = { ...mockCita };

  test('confirmar cita cambia a estado 2', async () => {
    query
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([{ ...citaBase, estado_id: 2, estado_nombre: 'confirmada' }]);

    const result = await citasService.confirmarCita(1);

    expect(query).toHaveBeenNthCalledWith(
      1,
      'UPDATE citas SET estado_id = ? WHERE id = ?',
      [2, 1]
    );
    expect(result.estado_id).toBe(2);
  });

  test('cancelar cita cambia a estado 3', async () => {
    query
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([{ ...citaBase, estado_id: 3, estado_nombre: 'cancelada' }]);

    const result = await citasService.cancelarCita(1);

    expect(query).toHaveBeenNthCalledWith(
      1,
      'UPDATE citas SET estado_id = ? WHERE id = ?',
      [3, 1]
    );
    expect(result.estado_id).toBe(3);
  });

  test('completar cita cambia a estado 4', async () => {
    query
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([{ ...citaBase, estado_id: 4, estado_nombre: 'completada' }]);

    const result = await citasService.completarCita(1);

    expect(query).toHaveBeenNthCalledWith(
      1,
      'UPDATE citas SET estado_id = ? WHERE id = ?',
      [4, 1]
    );
    expect(result.estado_id).toBe(4);
  });
});

// tests de citas por cliente
describe('citasService.getCitasByCliente', () => {
  test('retorna lista de citas', async () => {
    query.mockResolvedValueOnce([mockCita, { ...mockCita, id: 2 }]);

    const result = await citasService.getCitasByCliente(5);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0].cliente_id).toBe(5);
  });

  test('retorna vacio si no hay citas', async () => {
    query.mockResolvedValueOnce([]);

    const result = await citasService.getCitasByCliente(99);

    expect(result).toEqual([]);
  });
});

// tests de getAllCitas
describe('citasService.getAllCitas', () => {
  test('retorna todas las citas sin filtros', async () => {
    query.mockResolvedValueOnce([mockCita, { ...mockCita, id: 2 }]);

    const result = await citasService.getAllCitas();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  test('filtra por estado_id', async () => {
    query.mockResolvedValueOnce([mockCita]);

    await citasService.getAllCitas({ estado_id: 1 });

    const sql = query.mock.calls[0][0];
    const params = query.mock.calls[0][1];
    expect(sql).toContain('estado_id');
    expect(params).toContain(1);
  });

  test('filtra por cliente_id', async () => {
    query.mockResolvedValueOnce([mockCita]);

    await citasService.getAllCitas({ cliente_id: 5 });

    const sql = query.mock.calls[0][0];
    expect(sql).toContain('cliente_id');
    expect(query.mock.calls[0][1]).toContain(5);
  });

  test('filtra por fecha exacta', async () => {
    query.mockResolvedValueOnce([mockCita]);

    await citasService.getAllCitas({ fecha: '2026-05-10' });

    const sql = query.mock.calls[0][0];
    expect(sql).toContain('fecha_cita = ?');
    expect(query.mock.calls[0][1]).toContain('2026-05-10');
  });

  test('filtra por rango fecha_desde y fecha_hasta', async () => {
    query.mockResolvedValueOnce([mockCita]);

    await citasService.getAllCitas({ fecha_desde: '2026-05-01', fecha_hasta: '2026-05-31' });

    const sql = query.mock.calls[0][0];
    expect(sql).toContain('>=');
    expect(sql).toContain('<=');
    expect(query.mock.calls[0][1]).toContain('2026-05-01');
    expect(query.mock.calls[0][1]).toContain('2026-05-31');
  });

  test('retorna vacio si no hay citas', async () => {
    query.mockResolvedValueOnce([]);

    const result = await citasService.getAllCitas({ estado_id: 99 });

    expect(result).toEqual([]);
  });
});

// tests de updateCita
describe('citasService.updateCita', () => {
  test('actualiza nombre y telefono del cliente en la cita', async () => {
    query
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([{ ...mockCita, nombre_cliente: 'Nuevo Nombre' }]);

    const result = await citasService.updateCita(1, {
      nombre_cliente: 'Nuevo Nombre',
      telefono_cliente: '79999999',
    });

    const sql = query.mock.calls[0][0];
    expect(sql).toContain('nombre_cliente');
    expect(result.nombre_cliente).toBe('Nuevo Nombre');
  });

  test('actualiza motivo como JSON', async () => {
    query
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([{ ...mockCita, motivo: JSON.stringify(['Cambio de aceite']) }]);

    await citasService.updateCita(1, { motivo: ['Cambio de aceite'] });

    const params = query.mock.calls[0][1];
    expect(params).toContain(JSON.stringify(['Cambio de aceite']));
  });

  test('actualiza estado_id de la cita', async () => {
    query
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([{ ...mockCita, estado_id: 2 }]);

    const result = await citasService.updateCita(1, { estado_id: 2 });

    expect(result.estado_id).toBe(2);
  });

  test('lanza error si no hay campos para actualizar', async () => {
    await expect(citasService.updateCita(1, {}))
      .rejects.toThrow('No hay campos para actualizar');
  });
});

// tests de getEstadisticas de citas
describe('citasService.getEstadisticas', () => {
  test('retorna estadisticas entre dos fechas', async () => {
    query.mockResolvedValueOnce([{
      total_citas: 30,
      citas_pendientes: 5,
      citas_confirmadas: 10,
      citas_canceladas: 3,
      citas_completadas: 12,
    }]);

    const result = await citasService.getEstadisticas('2026-05-01', '2026-05-31');

    expect(result.total_citas).toBe(30);
    expect(result.citas_completadas).toBe(12);
    expect(query.mock.calls[0][1]).toContain('2026-05-01');
    expect(query.mock.calls[0][1]).toContain('2026-05-31');
  });
});