// Servicio de órdenes de trabajo — puede crear clientes y vehículos si no existen

const { query, transaction } = require('../config/database');
const bcrypt = require('bcryptjs');

// Lista todas las órdenes con filtros opcionales
const getAllOrdenes = async (filters = {}) => {
  let sql = `
    SELECT ot.*,
           tor.tipo as tipo_orden_nombre,
           eo.estado as estado_nombre,
           eo.orden_visualizacion,
           p.prioridad as prioridad_nombre,
           p.nivel as prioridad_nivel,
           c.nombre_completo as nombre_cliente,
           c.telefono as telefono_cliente,
           c.email as email_cliente,
           u.nombre_completo as mecanico_nombre,
           u.telefono as telefono_mecanico,
           v.marca as marca_vehiculo,
           v.modelo as modelo_vehiculo,
           v.placa as placa_vehiculo,
           v.anio as anio_vehiculo
    FROM ordenes_trabajo ot
    INNER JOIN tipos_orden tor ON ot.tipo_orden_id = tor.id_tipo
    INNER JOIN estados_orden eo ON ot.estado_id = eo.id_estado
    INNER JOIN prioridades p ON ot.prioridad_id = p.id_prioridad
    INNER JOIN clientes c ON ot.cliente_id = c.id
    LEFT JOIN usuarios u ON ot.mecanico_asignado_id = u.id
    LEFT JOIN vehiculos v ON ot.vehiculo_id = v.id
    WHERE 1=1
  `;

  const params = [];

  if (filters.tipo_orden_id) {
    sql += ' AND ot.tipo_orden_id = ?';
    params.push(filters.tipo_orden_id);
  }

  if (filters.estado_id) {
    sql += ' AND ot.estado_id = ?';
    params.push(filters.estado_id);
  }

  if (filters.cliente_id) {
    sql += ' AND ot.cliente_id = ?';
    params.push(filters.cliente_id);
  }

  if (filters.mecanico_id) {
    sql += ' AND ot.mecanico_asignado_id = ?';
    params.push(filters.mecanico_id);
  }

  if (filters.search) {
    sql += ` AND (ot.numero_orden LIKE ? 
                  OR c.nombre_completo LIKE ? 
                  OR v.placa LIKE ? 
                  OR ot.tipo_pieza LIKE ?)`;
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (filters.fecha_desde) {
    sql += ' AND ot.fecha_recepcion >= ?';
    params.push(filters.fecha_desde);
  }

  if (filters.fecha_hasta) {
    sql += ' AND ot.fecha_recepcion <= ?';
    params.push(filters.fecha_hasta);
  }

  sql += ' ORDER BY ot.fecha_recepcion DESC, eo.orden_visualizacion ASC';

  const ordenes = await query(sql, params);
  return ordenes;
};

// Devuelve una orden con datos completos del cliente, vehículo y mecánico
const getOrdenById = async (ordenId) => {
  const [orden] = await query(
    `SELECT ot.*,
            tor.tipo as tipo_orden_nombre,
            eo.estado as estado_nombre,
            p.prioridad as prioridad_nombre,
            c.nombre_completo as nombre_cliente,
            c.telefono as telefono_cliente,
            c.email as email_cliente,
            c.empresa as empresa_cliente,
            c.direccion as direccion_cliente,
            u.nombre_completo as mecanico_nombre,
            u.telefono as telefono_mecanico,
            v.marca as marca_vehiculo,
            v.modelo as modelo_vehiculo,
            v.placa as placa_vehiculo,
            v.anio as anio_vehiculo,
            v.vin as vin_vehiculo,
            tc.combustible as tipo_combustible
     FROM ordenes_trabajo ot
     INNER JOIN tipos_orden tor ON ot.tipo_orden_id = tor.id_tipo
     INNER JOIN estados_orden eo ON ot.estado_id = eo.id_estado
     INNER JOIN prioridades p ON ot.prioridad_id = p.id_prioridad
     INNER JOIN clientes c ON ot.cliente_id = c.id
     LEFT JOIN usuarios u ON ot.mecanico_asignado_id = u.id
     LEFT JOIN vehiculos v ON ot.vehiculo_id = v.id
     LEFT JOIN tipos_combustible tc ON v.tipo_combustible_id = tc.id_combustible
     WHERE ot.id = ?`,
    [ordenId]
  );

  if (!orden) {
    throw new Error('Orden no encontrada');
  }

  return orden;
};

// Crea una orden dentro de una transacción — puede crear el cliente y vehículo si no existen
const createOrden = async (ordenData, userId) => {
  const {
    tipo_orden_id,
    cliente_id = null,              // ← Default null
    cliente,
    vehiculo_id = null,             // ← Default null
    vehiculo,
    tipo_pieza = null,              // ← Default null
    marca_pieza = null,             // ← Default null
    modelo_origen = null,           // ← Default null
    numero_parte = null,            // ← Default null
    descripcion_problema,
    observaciones = null,           // ← Default null
    fecha_recepcion,
    hora_recepcion,
    fecha_diagnostico = null,       // ← Default null
    hora_diagnostico = null,        // ← Default null
    fecha_entrega_estimada = null,  // ← Default null
    hora_entrega_estimada = null,   // ← Default null
    estado_id = 1,                  // ← Default 1
    mecanico_asignado_id = null,    // ← Default null
    prioridad_id = 2,               // ← Default 2
    costo_estimado = 0              // ← Default 0
  } = ordenData;

  return await transaction(async (connection) => {
    let finalClienteId = cliente_id;
    let finalVehiculoId = vehiculo_id;

    // Paso 1: si no viene cliente_id pero sí datos del cliente, lo crea o busca uno existente
    if (!finalClienteId && cliente) {
      // Evita crear duplicados si ya existe alguien con ese teléfono
      if (cliente.telefono) {
        const [existingByPhone] = await connection.execute(
          'SELECT c.id FROM clientes c WHERE c.telefono = ? LIMIT 1',
          [cliente.telefono]
        );
        if (existingByPhone.length > 0) {
          finalClienteId = existingByPhone[0].id;
          console.log(`[createOrden] Client with phone ${cliente.telefono} already exists, reusing id=${finalClienteId}`);
        }
      }
    }

    if (!finalClienteId && cliente) {
      console.log(`[createOrden] Creating new client: ${cliente.nombreCompleto}`);

      const [roleResult] = await connection.execute(
        'SELECT id_rol FROM roles WHERE rol = ?',
        ['cliente']
      );

      if (!roleResult || roleResult.length === 0) {
        throw new Error('No se encontró el rol de cliente en la base de datos');
      }

      const rolClienteId = roleResult[0].id_rol;

      const tempPassword = Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      // Crea el usuario con contraseña temporal (el trigger crea el registro en clientes)
      const [userResult] = await connection.execute(
        `INSERT INTO usuarios (email, password_hash, nombre_completo, telefono, rol_id, estado_id) 
         VALUES (?, ?, ?, ?, ?, 1)`,
        [
          cliente.email || `temp_${Date.now()}@autosmart.com`,
          passwordHash,
          cliente.nombreCompleto,
          cliente.telefono,
          rolClienteId  // ← Usar la variable correcta
        ]
      );

      const nuevoUsuarioId = userResult.insertId;

      // El trigger de MySQL ya creó el registro en clientes, solo actualizamos teléfono y email
      await connection.execute(
        `UPDATE clientes SET telefono = ?, email = ? WHERE usuario_id = ?`,
        [cliente.telefono, cliente.email || null, nuevoUsuarioId]
      );

      // Busca el ID del cliente recién creado por el trigger
      const [clienteCreado] = await connection.execute(
        'SELECT id FROM clientes WHERE usuario_id = ?',
        [nuevoUsuarioId]
      );

      finalClienteId = clienteCreado[0].id;
      console.log(`[createOrden] New client created with id=${finalClienteId}`);
    }

    // Paso 2: si no viene vehiculo_id pero sí datos del vehículo, lo crea
    if (!finalVehiculoId && vehiculo) {
      console.log(`[createOrden] Creating new vehicle: placa=${vehiculo.placa}`);

      const vehiculoClienteId = vehiculo.cliente_id || finalClienteId;

      if (!vehiculoClienteId) {
        throw new Error('No se puede crear vehículo sin cliente asociado');
      }

      const [vehiculoResult] = await connection.execute(
        `INSERT INTO vehiculos (cliente_id, marca, modelo, anio, placa, vin) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          vehiculoClienteId,
          vehiculo.marca,
          vehiculo.modelo,
          vehiculo.anio || null,
          vehiculo.placa,
          vehiculo.vin || null
        ]
      );

      finalVehiculoId = vehiculoResult.insertId;
      console.log(`[createOrden] New vehicle created with id=${finalVehiculoId}, client=${vehiculoClienteId}`);
    }

    // Paso 3: crea la orden con el cliente y vehículo ya resueltos
    const [tipoOrden] = await connection.execute(
      'SELECT tipo FROM tipos_orden WHERE id_tipo = ?',
      [tipo_orden_id]
    );

    const prefijo = tipoOrden[0].tipo === 'vehiculo' ? 'VEH' : 'LAB';
    const year = new Date().getFullYear();

    // Cuenta las órdenes existentes para generar el correlativo
    const [count] = await connection.execute(
      `SELECT COUNT(*) as total FROM ordenes_trabajo 
       WHERE numero_orden LIKE ? AND YEAR(fecha_recepcion) = ?`,
      [`${prefijo}-${year}-%`, year]
    );

    const contador = count[0].total + 1;
    const numero_orden = `${prefijo}-${year}-${String(contador).padStart(6, '0')}`;

    // Inserta la orden con todos sus campos
    const [result] = await connection.execute(
      `INSERT INTO ordenes_trabajo (
        numero_orden, tipo_orden_id, cliente_id, vehiculo_id,
        tipo_pieza, marca_pieza, modelo_origen, numero_parte,
        descripcion_problema, observaciones,
        fecha_recepcion, hora_recepcion,
        fecha_diagnostico, hora_diagnostico,
        fecha_entrega_estimada, hora_entrega_estimada,
        estado_id, mecanico_asignado_id, prioridad_id,
        costo_estimado, creado_por
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numero_orden,
        tipo_orden_id,
        finalClienteId,
        finalVehiculoId ?? null,
        tipo_pieza ?? null,
        marca_pieza ?? null,
        modelo_origen ?? null,
        numero_parte ?? null,
        descripcion_problema,
        observaciones ?? null,
        fecha_recepcion ?? new Date().toISOString().split('T')[0],
        hora_recepcion ?? new Date().toTimeString().slice(0, 8),
        fecha_diagnostico ?? null,
        hora_diagnostico ?? null,
        fecha_entrega_estimada ?? null,
        hora_entrega_estimada ?? null,
        estado_id ?? 1,
        mecanico_asignado_id ?? null,
        prioridad_id ?? 2,
        costo_estimado ?? 0,
        userId
      ]
    );

    console.log(`[createOrden] Order created: ${numero_orden} | client=${finalClienteId} | vehicle=${finalVehiculoId ?? null}`);

    return result.insertId;
  });
};

// Actualiza los campos que vengan en ordenData (build dinámico del SET)
const updateOrden = async (ordenId, ordenData, userId) => {
  const {
    descripcion_problema,
    observaciones,
    fecha_diagnostico,
    hora_diagnostico,
    fecha_entrega_estimada,
    hora_entrega_estimada,
    fecha_entrega_real,
    estado_id,
    mecanico_asignado_id,
    prioridad_id,
    diagnostico_tecnico,
    trabajo_realizado,
    costo_estimado,
    costo_final
  } = ordenData;

  const updates = [];
  const params = [];

  if (descripcion_problema !== undefined) {
    updates.push('descripcion_problema = ?');
    params.push(descripcion_problema);
  }

  if (observaciones !== undefined) {
    updates.push('observaciones = ?');
    params.push(observaciones);
  }

  if (fecha_diagnostico !== undefined) {
    updates.push('fecha_diagnostico = ?');
    params.push(fecha_diagnostico);
  }

  if (hora_diagnostico !== undefined) {
    updates.push('hora_diagnostico = ?');
    params.push(hora_diagnostico);
  }

  if (fecha_entrega_estimada !== undefined) {
    updates.push('fecha_entrega_estimada = ?');
    params.push(fecha_entrega_estimada);
  }

  if (hora_entrega_estimada !== undefined) {
    updates.push('hora_entrega_estimada = ?');
    params.push(hora_entrega_estimada);
  }

  if (fecha_entrega_real !== undefined) {
    updates.push('fecha_entrega_real = ?');
    params.push(fecha_entrega_real);
  }

  if (estado_id !== undefined) {
    updates.push('estado_id = ?');
    params.push(estado_id);
  }

  if (mecanico_asignado_id !== undefined) {
    updates.push('mecanico_asignado_id = ?');
    params.push(mecanico_asignado_id);
  }

  if (prioridad_id !== undefined) {
    updates.push('prioridad_id = ?');
    params.push(prioridad_id);
  }

  if (diagnostico_tecnico !== undefined) {
    updates.push('diagnostico_tecnico = ?');
    params.push(diagnostico_tecnico);
  }

  if (trabajo_realizado !== undefined) {
    updates.push('trabajo_realizado = ?');
    params.push(trabajo_realizado);
  }

  if (costo_estimado !== undefined) {
    updates.push('costo_estimado = ?');
    params.push(costo_estimado);
  }

  if (costo_final !== undefined) {
    updates.push('costo_final = ?');
    params.push(costo_final);
  }

  if (updates.length === 0) {
    throw new Error('No hay campos para actualizar');
  }

  updates.push('actualizado_por = ?');
  params.push(userId);

  params.push(ordenId);

  await query(
    `UPDATE ordenes_trabajo SET ${updates.join(', ')} WHERE id = ?`,
    params
  );

  return await getOrdenById(ordenId);
};

// Cambia el estado de la orden y guarda el cambio en el historial
const cambiarEstado = async (ordenId, nuevoEstadoId, userId) => {
  const orden = await getOrdenById(ordenId);

  await query(
    'UPDATE ordenes_trabajo SET estado_id = ?, actualizado_por = ? WHERE id = ?',
    [nuevoEstadoId, userId, ordenId]
  );

  // Guarda el cambio de estado en el historial para trazabilidad
  await query(
    `INSERT INTO historial_estados (orden_trabajo_id, estado_anterior_id, estado_nuevo_id, cambiado_por)
     VALUES (?, ?, ?, ?)`,
    [ordenId, orden.estado_id, nuevoEstadoId, userId]
  );

  return await getOrdenById(ordenId);
};

// Asigna o reasigna un mecánico a la orden
const asignarMecanico = async (ordenId, mecanicoId, userId) => {
  await query(
    'UPDATE ordenes_trabajo SET mecanico_asignado_id = ?, actualizado_por = ? WHERE id = ?',
    [mecanicoId, userId, ordenId]
  );

  return await getOrdenById(ordenId);
};

// Historial de todos los cambios de estado de una orden
const getHistorialEstados = async (ordenId) => {
  const historial = await query(
    `SELECT he.*,
            ea.estado as estado_anterior_nombre,
            en.estado as estado_nuevo_nombre,
            u.nombre_completo as cambiado_por_nombre
     FROM historial_estados he
     LEFT JOIN estados_orden ea ON he.estado_anterior_id = ea.id_estado
     INNER JOIN estados_orden en ON he.estado_nuevo_id = en.id_estado
     LEFT JOIN usuarios u ON he.cambiado_por = u.id
     WHERE he.orden_trabajo_id = ?
     ORDER BY he.fecha_cambio DESC`,
    [ordenId]
  );

  return historial;
};

// Agrupa las órdenes por estado_id para el tablero Kanban
const getOrdenesKanban = async (tipoOrdenId) => {
  const ordenes = await getAllOrdenes({ tipo_orden_id: tipoOrdenId });

  const kanban = {};
  ordenes.forEach(orden => {
    const estadoId = orden.estado_id;
    if (!kanban[estadoId]) {
      kanban[estadoId] = [];
    }
    kanban[estadoId].push(orden);
  });

  return kanban;
};

// Estadísticas de órdenes en un rango de fechas (ingresos, tickets, tiempos)
const getEstadisticas = async (fechaInicio, fechaFin) => {
  const [stats] = await query(
    `SELECT 
      COUNT(*) as total_ordenes,
      COUNT(DISTINCT cliente_id) as total_clientes,
      SUM(CASE WHEN eo.estado IN ('completado', 'entregado') THEN 1 ELSE 0 END) as ordenes_completadas,
      SUM(CASE WHEN eo.estado = 'pendiente' THEN 1 ELSE 0 END) as ordenes_pendientes,
      SUM(CASE WHEN eo.estado IN ('en_proceso', 'reparando') THEN 1 ELSE 0 END) as ordenes_en_proceso,
      SUM(CASE WHEN eo.estado = 'cancelado' THEN 1 ELSE 0 END) as ordenes_canceladas,
      SUM(COALESCE(costo_final, 0)) as ingresos_totales,
      AVG(COALESCE(costo_final, 0)) as ticket_promedio,
      AVG(DATEDIFF(COALESCE(fecha_entrega_real, NOW()), fecha_recepcion)) as tiempo_promedio_dias
     FROM ordenes_trabajo ot
     INNER JOIN estados_orden eo ON ot.estado_id = eo.id_estado
     WHERE ot.fecha_recepcion BETWEEN ? AND ?`,
    [fechaInicio, fechaFin]
  );

  return stats;
};

module.exports = {
  getAllOrdenes,
  getOrdenById,
  createOrden,
  updateOrden,
  cambiarEstado,
  asignarMecanico,
  getHistorialEstados,
  getOrdenesKanban,
  getEstadisticas
};