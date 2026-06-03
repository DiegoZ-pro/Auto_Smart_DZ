# AutoSmart — Sistema de Gestión de Talleres Automotrices

[![Build Status](http://localhost:8080/buildStatus/icon?job=autosmart-tests)](http://localhost:8080/job/autosmart-tests/)
![Tests](https://img.shields.io/badge/tests-164%20passed-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-85%25-yellowgreen)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

Sistema web para la gestión integral de talleres automotrices: citas, órdenes de trabajo, clientes, vehículos y cotizaciones.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + React Router v6 + Vite |
| Backend | Node.js + Express |
| Base de datos | MySQL |
| Tests | Jest + jest-junit |
| CI | Jenkins |

---

## Estructura del proyecto

```
autosmart/
├── backend/          # API REST (Node.js + Express)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── validators/
│   │   └── utils/
│   └── tests/        # 164 tests (Jest)
├── frontend/         # SPA (React 18)
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       └── context/
└── Jenkinsfile       # Pipeline CI
```

---

## Inicio rápido

### Backend
```bash
cd backend
cp .env.example .env   # configurar credenciales MySQL
npm install
npm run dev            # puerto 5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev            # puerto 5173
```

---

## Tests

```bash
cd backend
npm test               # ejecutar tests con cobertura
open coverage/lcov-report/index.html   # ver reporte HTML
```

### Cobertura actual

| Módulo | Statements | Branches | Functions |
|---|---|---|---|
| middlewares | 97% | 92% | 100% |
| services | 84% | 70% | 97% |
| utils | 100% | 100% | 100% |
| **Total** | **85%** | **73%** | **97%** |

---

## CI con Jenkins

El pipeline (`Jenkinsfile`) ejecuta automáticamente:

1. **Checkout** — clona el repositorio
2. **Install** — `npm install` en `backend/`
3. **Tests y Cobertura** — Jest con reporte JUnit y HTML

Los resultados se publican en `http://localhost:8080/job/autosmart-tests/`.

---

## Roles del sistema

| Rol | Acceso |
|---|---|
| `admin` | Acceso total |
| `mecanico` | Diagnóstico técnico y Kanban |
| `cliente` | Citas, vehículos y seguimiento de órdenes |
