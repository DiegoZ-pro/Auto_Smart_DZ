// tests del modulo de clientes

jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  transaction: jest.fn(),
}));

const { query } = require('../src/config/database');
const clientesService = require('../src/services/clientesService');

const mockCliente = {
  id: 5,
  usuario_id: 10,
  nombre_completo: 'Juan Pérez',
  telefono: '75123456',
  email: 'juan@example.com',
  empresa: 'AutoSmart S.A.',
  nit_ci: '12345678',
  direccion: 'Av. Principal 123',
  ciudad: 'La Paz',
  notas: '',
  email_usuario: 'juan@example.com',
  telefono_usuario: '75123456',
  rol_nombre: 'cliente',
  estado_usuario: 'activo',
};

beforeEach(() => {
  jest.clearAllMocks();
});

// tests de getAllClientes
describe('clientesService.getAllClientes', () => {
  test('retorna lista de clientes sin filtros', async () => {
    query.mockResolvedValueOnce([mockCliente, { ...mockCliente, id: 6 }]);

    const result = await clientesService.getAllClientes();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(query).toHaveBeenCalledTimes(1);
  });

  test('aplica filtro de busqueda por nombre', async () => {
    query.mockResolvedValueOnce([mockCliente]);

    await clientesService.getAllClientes({ search: 'Juan' });

    const sql = query.mock.calls[0][0];
    const params = query.mock.calls[0][1];
    expect(sql).toContain('LIKE');
    expect(params).toContain('%Juan%');
  });

  test('aplica filtro por empresa', async () => {
    query.mockResolvedValueOnce([mockCliente]);

    await clientesService.getAllClientes({ empresa: 'AutoSmart' });

    const params = query.mock.calls[0][1];
    expect(params).toContain('%AutoSmart%');
  });

  test('retorna vacio si no hay clientes', async () => {
    query.mockResolvedValueOnce([]);

    const result = await clientesService.getAllClientes();

    expect(result).toEqual([]);
  });
});

// tests de getClienteById
describe('clientesService.getClienteById', () => {
  test('retorna el cliente correcto', async () => {
    query.mockResolvedValueOnce([mockCliente]);

    const result = await clientesService.getClienteById(5);

    expect(result.id).toBe(5);
    expect(result.nombre_completo).toBe('Juan Pérez');
  });

  test('lanza error si el cliente no existe', async () => {
    query.mockResolvedValueOnce([]);

    await expect(clientesService.getClienteById(999))
      .rejects.toThrow('Cliente no encontrado');
  });
});

// tests de getClienteByUsuarioId
describe('clientesService.getClienteByUsuarioId', () => {
  test('retorna cliente asociado al usuario', async () => {
    query.mockResolvedValueOnce([mockCliente]);

    const result = await clientesService.getClienteByUsuarioId(10);

    expect(result.usuario_id).toBe(10);
  });

  test('retorna undefined si no hay cliente para ese usuario', async () => {
    query.mockResolvedValueOnce([]);

    const result = await clientesService.getClienteByUsuarioId(999);

    expect(result).toBeUndefined();
  });
});

// tests de updateCliente
describe('clientesService.updateCliente', () => {
  test('actualiza campos y retorna cliente', async () => {
    query
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([{ ...mockCliente, nombre_completo: 'Juan Actualizado' }]);

    const result = await clientesService.updateCliente(5, { nombre_completo: 'Juan Actualizado' });

    expect(result.nombre_completo).toBe('Juan Actualizado');
    expect(query).toHaveBeenCalledTimes(2);
  });

  test('actualiza multiples campos', async () => {
    query
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([{ ...mockCliente, telefono: '79999999', ciudad: 'Cochabamba' }]);

    const result = await clientesService.updateCliente(5, {
      telefono: '79999999',
      ciudad: 'Cochabamba',
    });

    const sqlUpdate = query.mock.calls[0][0];
    expect(sqlUpdate).toContain('telefono');
    expect(sqlUpdate).toContain('ciudad');
  });

  test('lanza error si no hay campos para actualizar', async () => {
    await expect(clientesService.updateCliente(5, {}))
      .rejects.toThrow('No hay campos para actualizar');
  });
});

// tests de getVehiculosCliente
describe('clientesService.getVehiculosCliente', () => {
  test('retorna vehiculos del cliente', async () => {
    const mockVehiculos = [
      { id: 1, marca: 'Toyota', modelo: 'Corolla', placa: '910HDS' },
      { id: 2, marca: 'Honda', modelo: 'Civic', placa: '234ABC' },
    ];
    query.mockResolvedValueOnce(mockVehiculos);

    const result = await clientesService.getVehiculosCliente(5);

    expect(result.length).toBe(2);
    expect(query.mock.calls[0][1]).toContain(5);
  });

  test('retorna vacio si el cliente no tiene vehiculos', async () => {
    query.mockResolvedValueOnce([]);

    const result = await clientesService.getVehiculosCliente(99);

    expect(result).toEqual([]);
  });
});

// tests de getEstadisticasCliente
describe('clientesService.getEstadisticasCliente', () => {
  test('retorna estadisticas combinadas de dos consultas', async () => {
    query
      .mockResolvedValueOnce([{
        total_vehiculos: 3,
        total_ordenes: 10,
        ordenes_completadas: 7,
        ordenes_activas: 3,
        total_gastado: 1500.00,
      }])
      .mockResolvedValueOnce([{ citas_pendientes: 2 }]);

    const result = await clientesService.getEstadisticasCliente(5);

    expect(result.total_vehiculos).toBe(3);
    expect(result.total_ordenes).toBe(10);
    expect(result.citas_pendientes).toBe(2);
    expect(query).toHaveBeenCalledTimes(2);
  });

  test('retorna ceros si no hay datos', async () => {
    query
      .mockResolvedValueOnce([{
        total_vehiculos: 0,
        total_ordenes: 0,
        ordenes_completadas: 0,
        ordenes_activas: 0,
        total_gastado: 0,
      }])
      .mockResolvedValueOnce([{ citas_pendientes: 0 }]);

    const result = await clientesService.getEstadisticasCliente(99);

    expect(result.total_vehiculos).toBe(0);
    expect(result.citas_pendientes).toBe(0);
  });
});

// tests de searchClientes
describe('clientesService.searchClientes', () => {
  test('retorna clientes que coinciden con el termino', async () => {
    query.mockResolvedValueOnce([mockCliente]);

    const result = await clientesService.searchClientes('Juan');

    expect(result.length).toBe(1);
    const params = query.mock.calls[0][1];
    expect(params).toContain('%Juan%');
  });

  test('retorna vacio si no hay coincidencias', async () => {
    query.mockResolvedValueOnce([]);

    const result = await clientesService.searchClientes('XYZ_INEXISTENTE');

    expect(result).toEqual([]);
  });
});
