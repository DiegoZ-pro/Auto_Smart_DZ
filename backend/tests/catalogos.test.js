// tests del modulo de catalogos

jest.mock('../src/config/database', () => ({
  query: jest.fn(),
}));

const { query } = require('../src/config/database');
const catalogosService = require('../src/services/catalogosService');

beforeEach(() => {
  jest.clearAllMocks();
});

// tests de catalogos individuales
describe('catalogosService — catalogos individuales', () => {
  test('getRoles retorna lista de roles', async () => {
    const mockRoles = [
      { id_rol: 1, rol: 'cliente' },
      { id_rol: 2, rol: 'mecanico' },
      { id_rol: 3, rol: 'admin' },
    ];
    query.mockResolvedValueOnce(mockRoles);

    const result = await catalogosService.getRoles();

    expect(result).toEqual(mockRoles);
    expect(query).toHaveBeenCalledWith('SELECT * FROM roles ORDER BY id_rol');
  });

  test('getEstadosUsuario retorna estados de usuario', async () => {
    const mockEstados = [
      { id_estado: 1, estado: 'activo' },
      { id_estado: 2, estado: 'inactivo' },
      { id_estado: 3, estado: 'bloqueado' },
    ];
    query.mockResolvedValueOnce(mockEstados);

    const result = await catalogosService.getEstadosUsuario();

    expect(result).toEqual(mockEstados);
    expect(query).toHaveBeenCalledWith('SELECT * FROM estados_usuario ORDER BY id_estado');
  });

  test('getTiposCombustible retorna tipos de combustible', async () => {
    const mockTipos = [
      { id_combustible: 1, combustible: 'Gasolina' },
      { id_combustible: 2, combustible: 'Diesel' },
      { id_combustible: 3, combustible: 'Gas Natural' },
    ];
    query.mockResolvedValueOnce(mockTipos);

    const result = await catalogosService.getTiposCombustible();

    expect(result).toEqual(mockTipos);
  });

  test('getTiposOrden retorna tipos de orden', async () => {
    const mockTipos = [
      { id_tipo: 1, tipo: 'vehiculo' },
      { id_tipo: 2, tipo: 'laboratorio' },
    ];
    query.mockResolvedValueOnce(mockTipos);

    const result = await catalogosService.getTiposOrden();

    expect(result).toEqual(mockTipos);
  });

  test('getEstadosOrden retorna estados de orden ordenados', async () => {
    const mockEstados = [
      { id_estado: 1, estado: 'recepcionado', orden_visualizacion: 1 },
      { id_estado: 2, estado: 'en_diagnostico', orden_visualizacion: 2 },
      { id_estado: 3, estado: 'completado', orden_visualizacion: 3 },
    ];
    query.mockResolvedValueOnce(mockEstados);

    const result = await catalogosService.getEstadosOrden();

    expect(result.length).toBe(3);
    expect(result[0].estado).toBe('recepcionado');
  });

  test('getPrioridades retorna prioridades', async () => {
    const mockPrioridades = [
      { id_prioridad: 1, prioridad: 'baja', nivel: 1 },
      { id_prioridad: 2, prioridad: 'media', nivel: 2 },
      { id_prioridad: 3, prioridad: 'alta', nivel: 3 },
      { id_prioridad: 4, prioridad: 'urgente', nivel: 4 },
    ];
    query.mockResolvedValueOnce(mockPrioridades);

    const result = await catalogosService.getPrioridades();

    expect(result.length).toBe(4);
    expect(result[3].prioridad).toBe('urgente');
  });

  test('getEstadosCotizacion retorna estados de cotizacion', async () => {
    const mockEstados = [
      { id_estado: 1, estado: 'borrador' },
      { id_estado: 2, estado: 'enviada' },
      { id_estado: 3, estado: 'aprobada' },
    ];
    query.mockResolvedValueOnce(mockEstados);

    const result = await catalogosService.getEstadosCotizacion();

    expect(result).toEqual(mockEstados);
  });

  test('getTiposNotificacion retorna tipos de notificacion', async () => {
    const mockTipos = [
      { id_tipo: 1, tipo: 'cita_confirmada' },
      { id_tipo: 2, tipo: 'orden_actualizada' },
    ];
    query.mockResolvedValueOnce(mockTipos);

    const result = await catalogosService.getTiposNotificacion();

    expect(result).toEqual(mockTipos);
  });

  test('getEstadosCita retorna estados de cita', async () => {
    const mockEstados = [
      { id_estado: 1, estado: 'pendiente' },
      { id_estado: 2, estado: 'confirmada' },
      { id_estado: 3, estado: 'cancelada' },
      { id_estado: 4, estado: 'completada' },
    ];
    query.mockResolvedValueOnce(mockEstados);

    const result = await catalogosService.getEstadosCita();

    expect(result).toEqual(mockEstados);
  });
});

// tests de getAllCatalogos
describe('catalogosService.getAllCatalogos', () => {
  test('retorna todos los catalogos en paralelo', async () => {
    // getAllCatalogos usa Promise.all con 9 queries
    const mockData = [
      [{ id_rol: 1, rol: 'cliente' }],          // roles
      [{ id_estado: 1, estado: 'activo' }],      // estadosUsuario
      [{ id_combustible: 1, combustible: 'Gas' }], // tiposCombustible
      [{ id_tipo: 1, tipo: 'vehiculo' }],        // tiposOrden
      [{ id_estado: 1, estado: 'recepcionado' }], // estadosOrden
      [{ id_prioridad: 1, prioridad: 'baja' }],  // prioridades
      [{ id_estado: 1, estado: 'borrador' }],    // estadosCotizacion
      [{ id_tipo: 1, tipo: 'cita_confirmada' }], // tiposNotificacion
      [{ id_estado: 1, estado: 'pendiente' }],   // estadosCita
    ];

    mockData.forEach(data => query.mockResolvedValueOnce(data));

    const result = await catalogosService.getAllCatalogos();

    expect(result).toHaveProperty('roles');
    expect(result).toHaveProperty('estadosUsuario');
    expect(result).toHaveProperty('tiposCombustible');
    expect(result).toHaveProperty('tiposOrden');
    expect(result).toHaveProperty('estadosOrden');
    expect(result).toHaveProperty('prioridades');
    expect(result).toHaveProperty('estadosCotizacion');
    expect(result).toHaveProperty('tiposNotificacion');
    expect(result).toHaveProperty('estadosCita');
    expect(query).toHaveBeenCalledTimes(9);
  });

  test('el resultado contiene arrays en cada propiedad', async () => {
    const mockData = Array(9).fill([{ id: 1 }]);
    mockData.forEach(data => query.mockResolvedValueOnce(data));

    const result = await catalogosService.getAllCatalogos();

    Object.values(result).forEach(val => {
      expect(Array.isArray(val)).toBe(true);
    });
  });
});
