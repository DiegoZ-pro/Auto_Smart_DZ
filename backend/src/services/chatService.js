// Servicio del chatbot AutoBot — consulta la BD según el rol y llama a Ollama

const { query } = require('../config/database');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// Funciones que arman el contexto personalizado según el rol del usuario

const getClienteContext = async (userId) => {
  const rows = await query('SELECT id, nombre_completo FROM clientes WHERE usuario_id = ?', [userId]);
  if (!rows.length) return null;

  const cliente = rows[0];
  const clienteId = cliente.id;

  const vehiculos = await query(
    'SELECT marca, modelo, anio, placa FROM vehiculos WHERE cliente_id = ? LIMIT 10',
    [clienteId]
  );

  const ordenes = await query(
    `SELECT ot.numero_orden, eo.estado,
            ot.descripcion_problema, ot.fecha_recepcion, ot.fecha_entrega_estimada,
            ot.costo_estimado, ot.costo_final,
            v.marca as v_marca, v.modelo as v_modelo, v.placa as v_placa,
            ot.tipo_pieza, ot.marca_pieza
     FROM ordenes_trabajo ot
     INNER JOIN estados_orden eo ON ot.estado_id = eo.id_estado
     LEFT JOIN vehiculos v ON ot.vehiculo_id = v.id
     WHERE ot.cliente_id = ?
     ORDER BY ot.fecha_recepcion DESC
     LIMIT 5`,
    [clienteId]
  );

  const citas = await query(
    `SELECT ci.fecha_cita, ci.hora_cita, ci.marca_vehiculo, ci.modelo_vehiculo,
            ec.estado, ci.motivo
     FROM citas ci
     INNER JOIN estados_cita ec ON ci.estado_id = ec.id_estado
     WHERE ci.cliente_id = ?
     ORDER BY ci.fecha_cita DESC
     LIMIT 3`,
    [clienteId]
  );

  const cotizaciones = await query(
    `SELECT cot.id, ec.estado, cot.total, cot.fecha_creacion, ot.numero_orden
     FROM cotizaciones cot
     INNER JOIN estados_cotizacion ec ON cot.estado_id = ec.id_estado
     INNER JOIN ordenes_trabajo ot ON cot.orden_trabajo_id = ot.id
     WHERE ot.cliente_id = ?
     ORDER BY cot.fecha_creacion DESC
     LIMIT 3`,
    [clienteId]
  );

  return { cliente, vehiculos, ordenes, citas, cotizaciones };
};

const getMecanicoContext = async (userId) => {
  const usuarios = await query('SELECT nombre_completo FROM usuarios WHERE id = ?', [userId]);
  const usuario = usuarios[0] || { nombre_completo: 'Mecánico' };

  const ordenes = await query(
    `SELECT ot.numero_orden, eo.estado,
            ot.descripcion_problema, ot.tipo_pieza, ot.marca_pieza, ot.modelo_origen,
            ot.numero_parte, ot.fecha_recepcion, ot.fecha_entrega_estimada,
            p.prioridad,
            v.marca as v_marca, v.modelo as v_modelo, v.placa as v_placa, v.anio as v_anio,
            c.nombre_completo as cliente_nombre,
            ot.diagnostico_tecnico, ot.trabajo_realizado
     FROM ordenes_trabajo ot
     INNER JOIN estados_orden eo ON ot.estado_id = eo.id_estado
     INNER JOIN prioridades p ON ot.prioridad_id = p.id_prioridad
     INNER JOIN clientes c ON ot.cliente_id = c.id
     LEFT JOIN vehiculos v ON ot.vehiculo_id = v.id
     WHERE ot.mecanico_asignado_id = ?
       AND eo.estado NOT IN ('entregado', 'cancelado')
     ORDER BY p.nivel ASC, ot.fecha_recepcion ASC
     LIMIT 10`,
    [userId]
  );

  return { usuario, ordenes };
};

const getAdminContext = async (userId) => {
  const usuarios = await query('SELECT nombre_completo FROM usuarios WHERE id = ?', [userId]);
  const usuario = usuarios[0] || { nombre_completo: 'Administrador' };

  const statsRows = await query(
    `SELECT
       COUNT(*) as total_ordenes,
       SUM(CASE WHEN eo.estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
       SUM(CASE WHEN eo.estado IN ('en_proceso','reparando','diagnostico') THEN 1 ELSE 0 END) as en_proceso,
       SUM(CASE WHEN eo.estado IN ('completado','entregado') THEN 1 ELSE 0 END) as completados,
       SUM(CASE WHEN eo.estado = 'cancelado' THEN 1 ELSE 0 END) as cancelados,
       COALESCE(SUM(ot.costo_final), 0) as ingresos_mes,
       COUNT(DISTINCT ot.cliente_id) as clientes_atendidos
     FROM ordenes_trabajo ot
     INNER JOIN estados_orden eo ON ot.estado_id = eo.id_estado
     WHERE ot.fecha_recepcion >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
  );
  const stats = statsRows[0] || {};

  const citasRows = await query(
    `SELECT
       COUNT(*) as total_citas,
       SUM(CASE WHEN ec.estado = 'pendiente' THEN 1 ELSE 0 END) as citas_pendientes
     FROM citas ci
     INNER JOIN estados_cita ec ON ci.estado_id = ec.id_estado
     WHERE ci.fecha_cita >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
  );
  const citasStats = citasRows[0] || {};

  const cotizacionesRows = await query(
    `SELECT
       COUNT(*) as total_cotizaciones,
       SUM(CASE WHEN ec.estado = 'pendiente' THEN 1 ELSE 0 END) as cotizaciones_pendientes,
       COALESCE(SUM(cot.total), 0) as valor_total
     FROM cotizaciones cot
     INNER JOIN estados_cotizacion ec ON cot.estado_id = ec.id_estado
     WHERE cot.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
  );
  const cotizacionesStats = cotizacionesRows[0] || {};

  const mecanicos = await query(
    `SELECT u.nombre_completo, COUNT(ot.id) as ordenes_activas
     FROM usuarios u
     INNER JOIN roles r ON u.rol_id = r.id_rol
     LEFT JOIN ordenes_trabajo ot ON ot.mecanico_asignado_id = u.id
       AND ot.estado_id NOT IN (
         SELECT id_estado FROM estados_orden WHERE estado IN ('entregado','cancelado')
       )
     WHERE r.rol = 'mecanico'
     GROUP BY u.id, u.nombre_completo
     ORDER BY ordenes_activas DESC`
  );

  // Lista de órdenes activas con todo el detalle para que el admin pueda consultarlas
  const ordenesActivas = await query(
    `SELECT ot.numero_orden, eo.estado, p.prioridad, p.nivel as prioridad_nivel,
            ot.descripcion_problema, ot.fecha_recepcion, ot.fecha_entrega_estimada,
            ot.costo_estimado, ot.costo_final,
            c.nombre_completo as cliente_nombre,
            v.marca as v_marca, v.modelo as v_modelo, v.placa as v_placa,
            ot.tipo_pieza, ot.marca_pieza,
            u.nombre_completo as mecanico_nombre
     FROM ordenes_trabajo ot
     INNER JOIN estados_orden eo ON ot.estado_id = eo.id_estado
     INNER JOIN prioridades p ON ot.prioridad_id = p.id_prioridad
     INNER JOIN clientes c ON ot.cliente_id = c.id
     LEFT JOIN vehiculos v ON ot.vehiculo_id = v.id
     LEFT JOIN usuarios u ON ot.mecanico_asignado_id = u.id
     WHERE eo.estado NOT IN ('entregado', 'cancelado')
     ORDER BY p.nivel ASC, ot.fecha_recepcion ASC
     LIMIT 15`
  );

  return { usuario, stats, citasStats, cotizacionesStats, mecanicos, ordenesActivas };
};

// Arma el system prompt con los datos del usuario para que el modelo tenga contexto

const fmt = (date) => date ? new Date(date).toLocaleDateString('es-ES') : 'Por definir';
const fmtMoney = (val) => val != null ? `Bs. ${Number(val).toFixed(2)}` : 'Por definir';

const buildSystemPrompt = (rol, nombre, context) => {
  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (rol === 'cliente' && context) {
    const { vehiculos, ordenes, citas, cotizaciones } = context;

    const vStr = vehiculos.length
      ? vehiculos.map(v => `• ${v.marca} ${v.modelo} ${v.anio || ''} — Placa: ${v.placa}`).join('\n')
      : 'Sin vehículos registrados.';

    const oStr = ordenes.length
      ? ordenes.map(o => {
          const vehiculo = o.v_placa ? `${o.v_marca} ${o.v_modelo} (${o.v_placa})` : (o.tipo_pieza || 'Pieza');
          const costo = o.costo_final ? fmtMoney(o.costo_final) : (o.costo_estimado ? `Est. ${fmtMoney(o.costo_estimado)}` : 'Por definir');
          return `• Orden ${o.numero_orden}: ${vehiculo} | Estado: ${o.estado} | Entrega estimada: ${fmt(o.fecha_entrega_estimada)} | Costo: ${costo}`;
        }).join('\n')
      : 'Sin órdenes de trabajo registradas.';

    const cStr = citas.length
      ? citas.map(c => `• ${fmt(c.fecha_cita)} ${c.hora_cita}: ${c.marca_vehiculo} ${c.modelo_vehiculo} | Estado: ${c.estado}`).join('\n')
      : 'Sin citas registradas.';

    const cotStr = cotizaciones.length
      ? cotizaciones.map(c => `• Orden ${c.numero_orden}: ${fmtMoney(c.total)} | Estado: ${c.estado}`).join('\n')
      : 'Sin cotizaciones.';

    return `Eres AutoBot, asistente virtual de AutoSmart Taller Automotriz. Hoy es ${today}.
Atiendes al cliente: ${nombre}

DATOS DEL CLIENTE EN EL SISTEMA:

Vehículos: ${vStr}

Órdenes de trabajo: ${oStr}

Citas: ${cStr}

Cotizaciones: ${cotStr}

INSTRUCCIONES:
- Usa los datos anteriores para responder preguntas sobre vehículos, órdenes, citas y costos.
- Si una sección dice "Sin..." es porque no hay registros — díselo al cliente amablemente.
- No inventes datos (números de orden, fechas, costos) que no estén en la lista.
- Sé empático, claro y conciso. Responde en español.`;
  }

  if (rol === 'mecanico' && context) {
    const { ordenes } = context;
    const oStr = ordenes.length
      ? ordenes.map(o => {
          const vehiculo = o.v_placa ? `${o.v_marca} ${o.v_modelo} ${o.v_anio || ''} (${o.v_placa})` : `Pieza: ${o.tipo_pieza || 'N/A'} ${o.marca_pieza || ''}`;
          return `• Orden ${o.numero_orden} [PRIORIDAD: ${o.prioridad.toUpperCase()}]: ${vehiculo} | Estado: ${o.estado} | Cliente: ${o.cliente_nombre} | Problema: ${o.descripcion_problema}`;
        }).join('\n')
      : '[VACÍO — No hay órdenes asignadas en este momento]';

    return `Eres AutoBot, asistente técnico de AutoSmart. Hoy es ${today}.
Asistes al mecánico: ${nombre}

ÓRDENES ASIGNADAS EN EL SISTEMA:
${oStr}

INSTRUCCIONES:
- Para preguntas sobre tareas, órdenes o vehículos: usa los datos anteriores. Si dice "[VACÍO...]", informa que no hay órdenes asignadas actualmente.
- No inventes números de orden, clientes ni fechas que no aparezcan en la lista.
- Para preguntas técnicas de mecánica (frenos, motor, dirección, suspensión, rodamientos, etc.): responde con tu conocimiento técnico, ya que no requieren datos del sistema.
- Responde en español con precisión técnica.`;
  }

  if (rol === 'admin' && context) {
    const { stats, citasStats, cotizacionesStats, mecanicos, ordenesActivas } = context;

    const mStr = mecanicos.length
      ? mecanicos.map(m => `• ${m.nombre_completo}: ${m.ordenes_activas} órdenes activas`).join('\n')
      : 'Sin mecánicos registrados.';

    const oActivasStr = ordenesActivas.length
      ? ordenesActivas.map(o => {
          const vehiculo = o.v_placa
            ? `${o.v_marca} ${o.v_modelo} (${o.v_placa})`
            : (o.tipo_pieza ? `Pieza: ${o.tipo_pieza} ${o.marca_pieza || ''}` : 'Sin vehículo');
          const mecanico = o.mecanico_nombre || 'Sin asignar';
          const entrega = fmt(o.fecha_entrega_estimada);
          const costo = o.costo_final ? fmtMoney(o.costo_final) : (o.costo_estimado ? `Est. ${fmtMoney(o.costo_estimado)}` : 'Por definir');
          return `• ${o.numero_orden} [${o.prioridad.toUpperCase()}] — ${vehiculo} | Estado: ${o.estado} | Cliente: ${o.cliente_nombre} | Mecánico: ${mecanico} | Entrega: ${entrega} | Costo: ${costo} | Problema: ${o.descripcion_problema}`;
        }).join('\n')
      : 'No hay órdenes activas en este momento.';

    return `Eres AutoBot, asistente ejecutivo de AutoSmart. Hoy es ${today}.
Asistes al administrador: ${nombre}

RESUMEN DEL TALLER — ÚLTIMOS 30 DÍAS:
• Órdenes: ${stats.total_ordenes} total | ${stats.pendientes} pendientes | ${stats.en_proceso} en proceso | ${stats.completados} completadas | ${stats.cancelados} canceladas
• Clientes atendidos: ${stats.clientes_atendidos} | Ingresos: ${fmtMoney(stats.ingresos_mes)}

CITAS (próximos 7 días): ${citasStats.total_citas} total | ${citasStats.citas_pendientes} sin confirmar

COTIZACIONES (mes actual): ${cotizacionesStats.total_cotizaciones} total | ${cotizacionesStats.cotizaciones_pendientes} pendientes de aprobación | Valor: ${fmtMoney(cotizacionesStats.valor_total)}

MECÁNICOS:
${mStr}

ÓRDENES ACTIVAS (detalle):
${oActivasStr}

INSTRUCCIONES:
- Responde usando los datos anteriores. Puedes calcular porcentajes, comparar, identificar urgencias y dar recomendaciones.
- Para preguntas sobre órdenes específicas, usa la lista "ÓRDENES ACTIVAS". Si no hay datos, díselo.
- No inventes órdenes, montos ni clientes que no aparezcan en las listas.
- Responde en español de forma ejecutiva, directa y útil.`;
  }

  return `Eres AutoBot, el asistente de AutoSmart. Responde siempre en español. IMPORTANTE: No inventes datos del sistema — si no tienes información específica, dilo claramente.`;
};

// Función principal que orquesta el contexto y llama al modelo de Ollama

const chat = async (userId, rol, message, history = []) => {
  let context = null;
  let nombre = 'Usuario';

  try {
    if (rol === 'cliente') {
      context = await getClienteContext(userId);
      if (context) nombre = context.cliente.nombre_completo;
    } else if (rol === 'mecanico') {
      context = await getMecanicoContext(userId);
      nombre = context.usuario.nombre_completo;
    } else if (rol === 'admin') {
      context = await getAdminContext(userId);
      nombre = context.usuario.nombre_completo;
    }
  } catch (dbErr) {
    console.error('[chatService] DB context error:', dbErr.message);
  }

  const systemPrompt = buildSystemPrompt(rol, nombre, context);

  // Muestra en consola un preview del prompt para debug
  console.log(`\n[AutoBot] rol=${rol} usuario=${nombre}`);
  console.log('[AutoBot] System prompt preview:\n' + systemPrompt.slice(0, 400) + '...\n');

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10),
    { role: 'user', content: message }
  ];

  let response;
  try {
    response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: { temperature: 0.35, num_predict: 600 }
      }),
      signal: AbortSignal.timeout(90000)
    });
  } catch (fetchErr) {
    if (fetchErr.name === 'TimeoutError' || fetchErr.name === 'AbortError') {
      throw new Error('El asistente tardó demasiado. Intenta con una pregunta más corta.');
    }
    if (fetchErr.code === 'ECONNREFUSED' || fetchErr.message?.includes('fetch failed')) {
      throw new Error('El servicio de IA (Ollama) no está disponible. Asegúrate de que Ollama esté ejecutándose en localhost:11434.');
    }
    throw fetchErr;
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    throw new Error(`Ollama respondió con error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.message?.content || 'No pude generar una respuesta en este momento.';
};

module.exports = { chat };
