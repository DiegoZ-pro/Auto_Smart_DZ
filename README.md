# AutoSmart — Sistema de Gestión de Talleres Automotrices

![Tests](https://img.shields.io/badge/tests-164%20passed-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-85%25-yellowgreen)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-blue)
![React](https://img.shields.io/badge/react-18-61DAFB)
![License](https://img.shields.io/badge/license-MIT-blue)

AutoSmart es una plataforma web full-stack para la gestión integral de un taller automotriz: desde que el cliente agenda una cita hasta que retira su vehículo reparado. Cubre recepción de vehículos, diagnóstico técnico, cotizaciones, órdenes de trabajo, seguimiento en tiempo real, KPIs del negocio y dos módulos de inteligencia artificial (detección visual de daños y un asistente conversacional) construidos sobre el propio flujo de datos del taller.

---

## ¿Qué resuelve?

Un taller automotriz típico coordina información dispersa entre WhatsApp, hojas de cálculo y papel: citas, diagnósticos, repuestos, cotizaciones y el estado de cada vehículo. AutoSmart centraliza todo ese flujo en un solo sistema con vistas diferenciadas por rol, trazabilidad completa de cada orden de trabajo y dos capas de IA que aceleran el diagnóstico y la atención al cliente.

## Funcionalidades principales

**Portal público y de clientes**
- Landing pública (inicio, quiénes somos, contacto, términos y condiciones)
- Registro/login con JWT y agendamiento de citas sin fricciones
- Portal de cliente: seguimiento de vehículos, órdenes de trabajo, cotizaciones y estado de sus citas

**Panel del taller (admin / mecánico)**
- **Recepción de vehículos y de laboratorio** — alta de órdenes de trabajo con datos del cliente, vehículo y problema reportado
- **Diagnóstico técnico y Kanban** — tablero de tareas por estado para mecánicos
- **Cotizaciones** — generación de presupuestos con exportación a PDF
- **Órdenes de trabajo** — listado, filtros y cambio de estado del ciclo completo de reparación
- **Control de citas** — confirmación, cancelación y cierre de citas agendadas por clientes
- **Gestión de usuarios** — CRUD de usuarios con roles (admin, mecánico, cliente)
- **KPIs del taller** — dashboard con métricas de órdenes e ingresos por período
- **Configuración del taller** — horarios, datos de contacto y reglas de agendamiento

**Módulos de Inteligencia Artificial**
- **Escaneo 3D / Diagnóstico con IA** — el técnico sube una foto de una pieza automotriz y un modelo **YOLOv8** entrenado a medida (mAP@50 = 90.9%) la clasifica como *en buen estado* o *defectuosa*, dibuja el bounding box sobre la imagen y devuelve una recomendación con nivel de severidad. Corre como microservicio independiente (FastAPI + Ultralytics) protegido con el mismo JWT del backend principal.
- **AutoBot (chatbot conversacional)** — asistente que responde en lenguaje natural usando un LLM local (Ollama / Llama 3.2). El contexto que recibe el modelo se arma dinámicamente según el rol de quien pregunta: un cliente ve sus propios vehículos, órdenes y citas; un mecánico ve sus órdenes asignadas priorizadas; un admin ve KPIs, mecánicos y órdenes activas del taller completo. El modelo nunca inventa datos que no estén en ese contexto.

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + React Router v6 + Vite + Axios |
| Backend | Node.js + Express (arquitectura en capas: routes → controllers → services) |
| Base de datos | MySQL (vía `mysql2`) |
| Autenticación | JWT (access + refresh token) con roles (`admin`, `mecanico`, `cliente`) |
| Microservicio de IA (visión) | Python + FastAPI + Ultralytics YOLOv8 + OpenCV |
| Chatbot IA | Ollama (LLM local, Llama 3.2) con contexto dinámico desde MySQL |
| Validación | Joi (backend) |
| Tests | Jest (backend, 164 tests) + Vitest / Testing Library (frontend) |
| CI | Jenkins (pipeline con tests y cobertura en paralelo para frontend y backend) |

---

## Estructura del proyecto

```
autosmart/
├── backend/            # API REST (Node.js + Express)
│   └── src/
│       ├── controllers/    # 12 controladores (auth, usuarios, ordenes, citas, chat, etc.)
│       ├── services/       # lógica de negocio y acceso a datos
│       ├── middlewares/    # autenticación JWT y autorización por rol
│       ├── routes/         # 12 módulos de rutas montados bajo /api
│       ├── validators/     # esquemas Joi
│       └── utils/          # respuestas HTTP estandarizadas, helpers JWT
│   └── tests/           # 164 tests Jest (85% de cobertura)
│
├── frontend/           # SPA (React 18 + Vite)
│   └── src/
│       ├── pages/
│       │   ├── public/      # Home, Login, Register, Quiénes Somos, Contacto...
│       │   ├── cliente/     # Agendar cita, Mi perfil
│       │   └── taller/      # Recepción, Diagnóstico, Kanban, Cotizaciones,
│       │                    # Órdenes, Usuarios, Citas, KPIs, Configuración, Escaneo 3D
│       ├── components/      # layout (Sidebar/Header), ChatBot IA, UI compartida
│       ├── services/        # un cliente Axios por recurso (uno a uno con las rutas del backend)
│       └── context/         # AuthContext (estado global de sesión)
│
├── autosmartIA/         # microservicio de visión (FastAPI + YOLOv8)
│   ├── main.py             # endpoint /predecir — detección de daños en piezas
│   └── best.pt              # pesos del modelo entrenado
│
└── Jenkinsfile           # pipeline CI (install + test + cobertura, frontend y backend en paralelo)
```

---

## Inicio rápido

### Backend
```bash
cd backend
cp .env.example .env   # configurar credenciales MySQL, JWT y Ollama
npm install
npm run dev             # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev             # http://localhost:5173
```

### Microservicio de IA (Escaneo 3D) — opcional
```bash
cd autosmartIA
python3.11 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Chatbot AutoBot — opcional
Requiere [Ollama](https://ollama.com) corriendo localmente:
```bash
ollama pull llama3.2
ollama serve
```

---

## Tests

```bash
cd backend
npm test               # Jest con cobertura
open coverage/lcov-report/index.html   # reporte HTML

cd frontend
npm test                # Vitest con cobertura
```

### Cobertura actual (backend)

| Módulo | Statements | Branches | Functions |
|---|---|---|---|
| middlewares | 97% | 92% | 100% |
| services | 84% | 70% | 97% |
| utils | 100% | 100% | 100% |
| **Total** | **85%** | **72%** | **97%** |

164 tests / 9 suites, ejecutados automáticamente en cada build de Jenkins.

---

## CI con Jenkins

El `Jenkinsfile` ejecuta, en cada push:

1. **Checkout** del repositorio
2. **Install** paralelo de dependencias (`backend/` y `frontend/`)
3. **Tests y cobertura** paralelos (Jest en backend, Vitest en frontend), publicando reportes JUnit y HTML

---

## Roles del sistema

| Rol | Acceso |
|---|---|
| `admin` | Acceso total: recepción, cotizaciones, órdenes, usuarios, citas, KPIs, configuración, diagnóstico IA |
| `mecanico` | Diagnóstico técnico, Kanban de tareas y Escaneo 3D |
| `cliente` | Agendar citas, ver sus vehículos, órdenes, cotizaciones y chatear con AutoBot |

---

## Licencia

MIT
