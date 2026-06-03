// tests del modulo de usuarios

const bcrypt = require('bcryptjs');

jest.mock('bcryptjs');
jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  transaction: jest.fn(),
}));

const { query } = require('../src/config/database');
const usuariosService = require('../src/services/usuariosService');

const mockUser = {
  id: 1,
  email: 'juan@example.com',
  nombre_completo: 'Juan Pérez',
  telefono: '75123456',
  avatar_url: null,
  ultimo_acceso: null,
  fecha_creacion: '2026-01-01',
  fecha_actualizacion: '2026-01-01',
  rol_nombre: 'cliente',
  rol_id: 3,
  estado_nombre: 'activo',
  estado_id: 1,
};

beforeEach(() => {
  jest.clearAllMocks();
});

// tests de getAllUsers
describe('usuariosService.getAllUsers', () => {
  test('retorna todos los usuarios sin filtros', async () => {
    query.mockResolvedValueOnce([mockUser, { ...mockUser, id: 2 }]);

    const result = await usuariosService.getAllUsers();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  test('aplica filtro por rol_id', async () => {
    query.mockResolvedValueOnce([mockUser]);

    await usuariosService.getAllUsers({ rol_id: 3 });

    const sql = query.mock.calls[0][0];
    const params = query.mock.calls[0][1];
    expect(sql).toContain('rol_id');
    expect(params).toContain(3);
  });

  test('aplica filtro por estado_id', async () => {
    query.mockResolvedValueOnce([mockUser]);

    await usuariosService.getAllUsers({ estado_id: 1 });

    const sql = query.mock.calls[0][0];
    expect(sql).toContain('estado_id');
    expect(query.mock.calls[0][1]).toContain(1);
  });

  test('aplica filtro de busqueda por nombre o email', async () => {
    query.mockResolvedValueOnce([mockUser]);

    await usuariosService.getAllUsers({ search: 'Juan' });

    const params = query.mock.calls[0][1];
    expect(params).toContain('%Juan%');
  });

  test('retorna vacio si no hay usuarios', async () => {
    query.mockResolvedValueOnce([]);

    const result = await usuariosService.getAllUsers();

    expect(result).toEqual([]);
  });
});

// tests de getUserById
describe('usuariosService.getUserById', () => {
  test('retorna el usuario correcto', async () => {
    query.mockResolvedValueOnce([mockUser]);

    const result = await usuariosService.getUserById(1);

    expect(result.id).toBe(1);
    expect(result.email).toBe('juan@example.com');
    expect(result.rol_nombre).toBe('cliente');
  });

  test('lanza error si el usuario no existe', async () => {
    query.mockResolvedValueOnce([]);

    await expect(usuariosService.getUserById(999))
      .rejects.toThrow('Usuario no encontrado');
  });
});

// tests de createUser
describe('usuariosService.createUser', () => {
  test('crea usuario correctamente', async () => {
    bcrypt.hash.mockResolvedValueOnce('$2a$10$hashdetest');
    query
      .mockResolvedValueOnce([])        // email no existe
      .mockResolvedValueOnce({ insertId: 10 }) // INSERT
      .mockResolvedValueOnce([{ ...mockUser, id: 10 }]); // getUserById

    const result = await usuariosService.createUser({
      email: 'nuevo@example.com',
      password: 'pass123',
      nombreCompleto: 'Nuevo Usuario',
      telefono: '71234567',
      rol_id: 3,
    }, 1);

    expect(bcrypt.hash).toHaveBeenCalledWith('pass123', 10);
    expect(result.id).toBe(10);
  });

  test('lanza error si el email ya esta registrado', async () => {
    query.mockResolvedValueOnce([{ id: 5 }]); // email duplicado

    await expect(usuariosService.createUser({
      email: 'juan@example.com',
      password: 'pass',
      nombreCompleto: 'Juan',
      telefono: '75000000',
      rol_id: 3,
    }, 1)).rejects.toThrow('El email ya está registrado');
  });
});

// tests de updateUser
describe('usuariosService.updateUser', () => {
  test('actualiza nombre y telefono', async () => {
    query
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([{ ...mockUser, nombre_completo: 'Actualizado', telefono: '79999999' }]);

    const result = await usuariosService.updateUser(1, {
      nombreCompleto: 'Actualizado',
      telefono: '79999999',
    });

    expect(result.nombre_completo).toBe('Actualizado');
  });

  test('lanza error si el nuevo email pertenece a otro usuario', async () => {
    query.mockResolvedValueOnce([{ id: 99 }]); // email de otro usuario

    await expect(usuariosService.updateUser(1, { email: 'otro@example.com' }))
      .rejects.toThrow('El email ya está registrado');
  });

  test('lanza error si no hay campos para actualizar', async () => {
    await expect(usuariosService.updateUser(1, {}))
      .rejects.toThrow('No hay campos para actualizar');
  });

  test('hashea la nueva contraseña al actualizar', async () => {
    bcrypt.hash.mockResolvedValueOnce('$2a$10$newhash');
    query
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([mockUser]);

    await usuariosService.updateUser(1, { nueva_password: 'nuevaPass123' });

    expect(bcrypt.hash).toHaveBeenCalledWith('nuevaPass123', 10);
  });
});

// tests de deleteUser
describe('usuariosService.deleteUser', () => {
  test('cambia el estado del usuario a inactivo', async () => {
    query
      .mockResolvedValueOnce([{ id_estado: 2 }]) // estado inactivo
      .mockResolvedValueOnce({ affectedRows: 1 }); // UPDATE

    const result = await usuariosService.deleteUser(1);

    expect(result).toBe(true);
    expect(query).toHaveBeenCalledTimes(2);
    const updateCall = query.mock.calls[1];
    expect(updateCall[0]).toContain('UPDATE usuarios SET estado_id');
    expect(updateCall[1]).toContain(1);
  });

  test('lanza error si el estado inactivo no existe en catalogo', async () => {
    query.mockResolvedValueOnce([]); // estado inactivo no encontrado

    await expect(usuariosService.deleteUser(1))
      .rejects.toThrow('Estado inactivo no encontrado');
  });
});

// tests de changeUserStatus
describe('usuariosService.changeUserStatus', () => {
  test('cambia el estado y retorna usuario actualizado', async () => {
    query
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce([{ ...mockUser, estado_id: 3, estado_nombre: 'bloqueado' }]);

    const result = await usuariosService.changeUserStatus(1, 3);

    expect(result.estado_id).toBe(3);
    expect(result.estado_nombre).toBe('bloqueado');
    expect(query).toHaveBeenCalledTimes(2);
  });
});

// tests de getUserStats
describe('usuariosService.getUserStats', () => {
  test('retorna estadisticas de usuarios', async () => {
    query.mockResolvedValueOnce([{
      total_usuarios: 50,
      total_clientes: 40,
      total_mecanicos: 5,
      total_admins: 5,
      usuarios_activos: 45,
      usuarios_inactivos: 3,
      usuarios_bloqueados: 2,
    }]);

    const result = await usuariosService.getUserStats();

    expect(result.total_usuarios).toBe(50);
    expect(result.total_clientes).toBe(40);
    expect(result.usuarios_activos).toBe(45);
    expect(query).toHaveBeenCalledTimes(1);
  });
});
