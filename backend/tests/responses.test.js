// tests de utilidades de respuestas HTTP

const responses = require('../src/utils/responses');

// mock de objeto res de Express
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('responses.success', () => {
  test('retorna status 200 con data y mensaje por defecto', () => {
    const res = mockRes();

    responses.success(res, { id: 1 });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Operación exitosa',
      data: { id: 1 },
    });
  });

  test('acepta mensaje y statusCode personalizados', () => {
    const res = mockRes();

    responses.success(res, [1, 2, 3], 'Creado correctamente', 201);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Creado correctamente',
      data: [1, 2, 3],
    });
  });

  test('acepta data null', () => {
    const res = mockRes();

    responses.success(res, null);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: null })
    );
  });
});

describe('responses.error', () => {
  test('retorna status 500 con mensaje de error por defecto', () => {
    const res = mockRes();

    responses.error(res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error en la operación',
    });
  });

  test('acepta mensaje y statusCode personalizados', () => {
    const res = mockRes();

    responses.error(res, 'Error de base de datos', 503);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Error de base de datos' })
    );
  });

  test('incluye campo errors cuando se proporciona', () => {
    const res = mockRes();
    const errores = ['Campo requerido', 'Formato inválido'];

    responses.error(res, 'Validation failed', 400, errores);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ errors: errores })
    );
  });

  test('no incluye campo errors cuando es null', () => {
    const res = mockRes();

    responses.error(res, 'Error', 500, null);

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg).not.toHaveProperty('errors');
  });
});

describe('responses.validationError', () => {
  test('retorna status 400 con errores de validacion', () => {
    const res = mockRes();
    const errores = { email: 'Email inválido', password: 'Muy corta' };

    responses.validationError(res, errores);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error de validación',
      errors: errores,
    });
  });
});

describe('responses.unauthorized', () => {
  test('retorna status 401 con mensaje por defecto', () => {
    const res = mockRes();

    responses.unauthorized(res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No autorizado',
    });
  });

  test('acepta mensaje personalizado', () => {
    const res = mockRes();

    responses.unauthorized(res, 'Token expirado');

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Token expirado' })
    );
  });
});

describe('responses.forbidden', () => {
  test('retorna status 403 con mensaje por defecto', () => {
    const res = mockRes();

    responses.forbidden(res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Acceso prohibido',
    });
  });

  test('acepta mensaje personalizado', () => {
    const res = mockRes();

    responses.forbidden(res, 'Solo administradores');

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Solo administradores' })
    );
  });
});

describe('responses.notFound', () => {
  test('retorna status 404 con mensaje por defecto', () => {
    const res = mockRes();

    responses.notFound(res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Recurso no encontrado',
    });
  });

  test('acepta mensaje personalizado', () => {
    const res = mockRes();

    responses.notFound(res, 'Usuario no encontrado');

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Usuario no encontrado' })
    );
  });
});

describe('responses.conflict', () => {
  test('retorna status 409 con mensaje por defecto', () => {
    const res = mockRes();

    responses.conflict(res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Conflicto en la operación',
    });
  });

  test('acepta mensaje personalizado', () => {
    const res = mockRes();

    responses.conflict(res, 'El email ya existe');

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'El email ya existe' })
    );
  });
});
