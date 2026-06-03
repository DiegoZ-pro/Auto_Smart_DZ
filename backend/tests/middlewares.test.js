// tests de middlewares de autorizacion

jest.mock('../src/utils/jwt', () => ({
  verifyAccessToken: jest.fn(),
}));

const { verifyAccessToken } = require('../src/utils/jwt');
const { authorize, isAdmin, isAdminOrMechanic, isSelfOrAdmin } = require('../src/middlewares/auth');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

// tests de authorize
describe('Middleware authorize', () => {
  test('permite pasar si el rol esta en la lista', () => {
    const req = { user: { id: 1, email: 'a@a.com', rol: 'admin' } };
    const res = mockRes();
    const next = jest.fn();

    authorize(['admin', 'mecanico'])(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('rechaza si el rol no esta en la lista', () => {
    const req = { user: { id: 1, email: 'a@a.com', rol: 'cliente' } };
    const res = mockRes();
    const next = jest.fn();

    authorize(['admin', 'mecanico'])(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('acepta rol como string en lugar de array', () => {
    const req = { user: { id: 1, email: 'a@a.com', rol: 'admin' } };
    const res = mockRes();
    const next = jest.fn();

    authorize('admin')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('rechaza si req.user no esta definido', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    authorize(['admin'])(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// tests de isAdmin
describe('Middleware isAdmin', () => {
  test('permite pasar al usuario admin', () => {
    const req = { user: { id: 1, rol: 'admin' } };
    const res = mockRes();
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('rechaza al usuario con rol mecanico', () => {
    const req = { user: { id: 2, rol: 'mecanico' } };
    const res = mockRes();
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('rechaza al usuario con rol cliente', () => {
    const req = { user: { id: 3, rol: 'cliente' } };
    const res = mockRes();
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('rechaza si req.user no existe', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// tests de isAdminOrMechanic
describe('Middleware isAdminOrMechanic', () => {
  test('permite pasar al admin', () => {
    const req = { user: { id: 1, rol: 'admin' } };
    const res = mockRes();
    const next = jest.fn();

    isAdminOrMechanic(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('permite pasar al mecanico', () => {
    const req = { user: { id: 2, rol: 'mecanico' } };
    const res = mockRes();
    const next = jest.fn();

    isAdminOrMechanic(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('rechaza al cliente', () => {
    const req = { user: { id: 3, rol: 'cliente' } };
    const res = mockRes();
    const next = jest.fn();

    isAdminOrMechanic(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('rechaza si req.user no existe', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    isAdminOrMechanic(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// tests de isSelfOrAdmin
describe('Middleware isSelfOrAdmin', () => {
  test('permite al usuario acceder a su propio recurso', () => {
    const req = {
      user: { id: 5, rol: 'cliente' },
      params: { id: '5' },
    };
    const res = mockRes();
    const next = jest.fn();

    isSelfOrAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('permite al admin acceder a cualquier recurso', () => {
    const req = {
      user: { id: 1, rol: 'admin' },
      params: { id: '99' },
    };
    const res = mockRes();
    const next = jest.fn();

    isSelfOrAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('rechaza al cliente que intenta acceder al recurso de otro', () => {
    const req = {
      user: { id: 5, rol: 'cliente' },
      params: { id: '10' },
    };
    const res = mockRes();
    const next = jest.fn();

    isSelfOrAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('rechaza al mecanico que intenta acceder al recurso de otro', () => {
    const req = {
      user: { id: 2, rol: 'mecanico' },
      params: { id: '7' },
    };
    const res = mockRes();
    const next = jest.fn();

    isSelfOrAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
