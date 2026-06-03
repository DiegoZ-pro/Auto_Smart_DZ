// tests del modulo de vehiculos

jest.mock('../src/config/database', () => ({
  query: jest.fn(),
}));

const { query } = require('../src/config/database');
const vehiculosService = require('../src/services/vehiculosService');

const mockVehiculo = {
  id: 1,
  cliente_id: 5,
  marca: 'Toyota',
  modelo: 'Corolla',
  anio: 2020,
  placa: '910HDS',
  vin: '1HGBH41JXMN109186',
  color: 'Blanco',
  kilometraje: 45000,
  tipo_combustible_id: 1,
  tipo_combustible_nombre: 'Gasolina',
  observaciones: null,
  activo: true,
  nombre_cliente: 'Juan Pérez',
  telefono_cliente: '75123456',
  email_cliente: 'juan@example.com',
  fecha_creacion: '2026-01-01',
};

const mockVehiculoData = {
  cliente_id: 5,
  marca: 'Toyota',
  modelo: 'Corolla',
  anio: 2020,
  placa: '910HDS',
  color: 'Blanco',
  kilometraje: 45000,
  tipo_combustible_id: 1,
};

beforeEach(() => {
  jest.clearAllMocks();
});

// tests de getAllVehiculos
describe('vehiculosService.getAllVehiculos', () => {
  test('retorna todos los vehiculos sin filtros', async () => {
    query.mockResolvedValueOnce([mockVehiculo, { ...mockVehiculo, id: 2 }]);

    const result = await vehiculosService.getAllVehiculos();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  test('aplica filtro por cliente_id', async () => {
    query.mockResolvedValueOnce([mockVehiculo]);

    await vehiculosService.getAllVehiculos({ cliente_id: 5 });

    const sql = query.mock.calls[0][0];
    const params = query.mock.calls[0][1];
    expect(sql).toContain('cliente_id');
    expect(params).toContain(5);
  });

  test('aplica filtro por search', async () => {
    query.mockResolvedValueOnce([mockVehiculo]);

    await vehiculosService.getAllVehiculos({ search: 'Toyota' });

    const params = query.mock.calls[0][1];
    expect(params).toContain('%Toyota%');
  });

  test('aplica filtro por marca', async () => {
    query.mockResolvedValueOnce([mockVehiculo]);

    await vehiculosService.getAllVehiculos({ marca: 'Toyota' });

    const sql = query.mock.calls[0][0];
    expect(sql).toContain('v.marca = ?');
    expect(query.mock.calls[0][1]).toContain('Toyota');
  });

  test('retorna vacio si no hay vehiculos', async () => {
    query.mockResolvedValueOnce([]);

    const result = await vehiculosService.getAllVehiculos();

    expect(result).toEqual([]);
  });
});

// tests de getVehiculoById
describe('vehiculosService.getVehiculoById', () => {
  test('retorna el vehiculo correcto', async () => {
    query.mockResolvedValueOnce([mockVehiculo]);

    const result = await vehiculosService.getVehiculoById(1);

    expect(result.id).toBe(1);
    expect(result.placa).toBe('910HDS');
    expect(result.nombre_cliente).toBe('Juan Pérez');
  });

  test('lanza error si no existe', async () => {
    query.mockResolvedValueOnce([]);

    await expect(vehiculosService.getVehiculoById(999))
      .rejects.toThrow('Vehículo no encontrado');
  });
});

// tests de getVehiculoByPlaca
describe('vehiculosService.getVehiculoByPlaca', () => {
  test('retorna vehiculo por placa', async () => {
    query.mockResolvedValueOnce([mockVehiculo]);

    const result = await vehiculosService.getVehiculoByPlaca('910HDS');

    expect(result.placa).toBe('910HDS');
    expect(query.mock.calls[0][1]).toContain('910HDS');
  });

  test('retorna undefined si la placa no existe', async () => {
    query.mockResolvedValueOnce([]);

    const result = await vehiculosService.getVehiculoByPlaca('XXXX00');

    expect(result).toBeUndefined();
  });
});

// tests de createVehiculo
describe('vehiculosService.createVehiculo', () => {
  test('crea un vehiculo nuevo sin placa duplicada', async () => {
    query
      .mockResolvedValueOnce([])          // getVehiculoByPlaca → no existe
      .mockResolvedValueOnce({ insertId: 1 }) // INSERT
      .mockResolvedValueOnce([mockVehiculo]); // getVehiculoById

    const result = await vehiculosService.createVehiculo(mockVehiculoData);

    expect(result.id).toBe(1);
    expect(result.placa).toBe('910HDS');
  });

  test('lanza error si la placa ya existe', async () => {
    query.mockResolvedValueOnce([mockVehiculo]); // placa ya existe

    await expect(vehiculosService.createVehiculo(mockVehiculoData))
      .rejects.toThrow('Ya existe un vehículo con esa placa');
  });

  test('crea vehiculo sin placa sin verificar duplicado', async () => {
    query
      .mockResolvedValueOnce({ insertId: 2 })
      .mockResolvedValueOnce([{ ...mockVehiculo, placa: null }]);

    const result = await vehiculosService.createVehiculo({
      ...mockVehiculoData,
      placa: null,
    });

    expect(result.id).toBeDefined();
    expect(query).toHaveBeenCalledTimes(2); // no verifica placa
  });
});

// tests de updateVehiculo
describe('vehiculosService.updateVehiculo', () => {
  test('actualiza campos del vehiculo', async () => {
    query
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([{ ...mockVehiculo, color: 'Rojo', kilometraje: 50000 }]);

    const result = await vehiculosService.updateVehiculo(1, {
      color: 'Rojo',
      kilometraje: 50000,
    });

    expect(result.color).toBe('Rojo');
    expect(result.kilometraje).toBe(50000);
  });

  test('lanza error si no hay campos para actualizar', async () => {
    await expect(vehiculosService.updateVehiculo(1, {}))
      .rejects.toThrow('No hay campos para actualizar');
  });

  test('lanza error si la nueva placa pertenece a otro vehiculo', async () => {
    query.mockResolvedValueOnce([{ ...mockVehiculo, id: 99 }]); // placa de otro

    await expect(vehiculosService.updateVehiculo(1, { placa: '910HDS' }))
      .rejects.toThrow('Ya existe otro vehículo con esa placa');
  });

  test('permite actualizar con la misma placa del vehiculo', async () => {
    query
      .mockResolvedValueOnce([mockVehiculo]) // placa del mismo vehiculo
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([mockVehiculo]);

    const result = await vehiculosService.updateVehiculo(1, { placa: '910HDS' });

    expect(result.placa).toBe('910HDS');
  });
});

// tests de deleteVehiculo
describe('vehiculosService.deleteVehiculo', () => {
  test('marca el vehiculo como inactivo (soft delete)', async () => {
    query.mockResolvedValueOnce({ affectedRows: 1 });

    const result = await vehiculosService.deleteVehiculo(1);

    expect(result).toBe(true);
    expect(query).toHaveBeenCalledWith(
      'UPDATE vehiculos SET activo = FALSE WHERE id = ?',
      [1]
    );
  });
});

// tests de getHistorialVehiculo
describe('vehiculosService.getHistorialVehiculo', () => {
  test('retorna historial de ordenes del vehiculo', async () => {
    const mockOrdenes = [
      { id: 1, numero_orden: 'VEH-2026-000001', estado_nombre: 'completado' },
      { id: 2, numero_orden: 'VEH-2026-000002', estado_nombre: 'entregado' },
    ];
    query.mockResolvedValueOnce(mockOrdenes);

    const result = await vehiculosService.getHistorialVehiculo(1);

    expect(result.length).toBe(2);
    expect(query.mock.calls[0][1]).toContain(1);
  });

  test('retorna vacio si el vehiculo no tiene historial', async () => {
    query.mockResolvedValueOnce([]);

    const result = await vehiculosService.getHistorialVehiculo(99);

    expect(result).toEqual([]);
  });
});

// tests de searchVehiculos
describe('vehiculosService.searchVehiculos', () => {
  test('retorna vehiculos que coinciden', async () => {
    query.mockResolvedValueOnce([mockVehiculo]);

    const result = await vehiculosService.searchVehiculos('910HDS');

    expect(result.length).toBe(1);
    const params = query.mock.calls[0][1];
    expect(params).toContain('%910HDS%');
  });

  test('retorna vacio si no hay resultados', async () => {
    query.mockResolvedValueOnce([]);

    const result = await vehiculosService.searchVehiculos('ZZZNADA');

    expect(result).toEqual([]);
  });
});

// tests de getMarcas
describe('vehiculosService.getMarcas', () => {
  test('retorna lista de marcas unicas', async () => {
    query.mockResolvedValueOnce([
      { marca: 'Honda' },
      { marca: 'Toyota' },
      { marca: 'Volkswagen' },
    ]);

    const result = await vehiculosService.getMarcas();

    expect(result).toEqual(['Honda', 'Toyota', 'Volkswagen']);
  });

  test('retorna vacio si no hay vehiculos', async () => {
    query.mockResolvedValueOnce([]);

    const result = await vehiculosService.getMarcas();

    expect(result).toEqual([]);
  });
});
