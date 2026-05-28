# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutoSmart is a workshop management system (Sistema de Gestión de Talleres Automotrices) with a React frontend and Node.js/Express backend, backed by MySQL.

## Commands

### Backend (`/backend`)
```bash
npm run dev       # Start with nodemon (development)
npm start         # Start without hot-reload (production)
npm test          # Run Jest tests with coverage
```

### Frontend (`/frontend`)
```bash
npm run dev       # Start Vite dev server on port 5173
npm run build     # Production build to dist/
npm run lint      # ESLint
npm run preview   # Serve dist/ locally
```

Backend runs on port **5000** (set in `backend/.env`). Frontend dev server on port **5173**.

### Running a single test file
```bash
cd backend && npx jest tests/auth.test.js
```

## Architecture

### Monorepo structure
Two independent git repositories under `autosmart/`: `frontend/` and `backend/`. Each has its own `node_modules`, `package.json`, and `.env`.

### Backend (`backend/src/`)
Layered Express architecture:
- `routes/` → `controllers/` → `services/` → `config/database.js` (MySQL via `mysql2`)
- `middlewares/auth.js` — JWT authentication (`authenticate`) and role-based authorization (`authorize`, `isAdmin`, `isAdminOrMechanic`, `isSelfOrAdmin`)
- `utils/responses.js` — standardized JSON response helpers used throughout controllers: `success`, `error`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `validationError`
- `utils/jwt.js` — `generateTokens` / `verifyAccessToken`
- `validators/` — Joi schemas for request validation

All API responses follow `{ success: bool, message: string, data?: any }`.

### Frontend (`frontend/src/`)
React 18 + React Router v6 + Axios:
- `context/AuthContext.jsx` — global auth state; exposes `useAuth()` hook with `user`, `login`, `logout`, `register`, `updateUser`, `isAdmin`, `isMecanico`, `isCliente`
- `services/api.js` — Axios instance with JWT interceptor (auto-attaches `Authorization: Bearer`, handles 401 → token refresh → retry)
- `services/` — one file per resource (`citasService`, `ordenesService`, etc.), all using the shared `api` instance
- `routes/AppRoutes.jsx` — route tree; `PrivateRoute` wraps role-protected pages
- Pages are organized by user role: `pages/public/`, `pages/cliente/`, `pages/taller/`
- `components/layout/MainLayout/` — shell used by all `/taller/*` routes; wraps `Sidebar` + `Header`

### Roles
Three roles: `admin`, `mecanico`, `cliente`. Admin-only routes are under `/taller/*` (most pages). Both admin and mecánico access `/taller/diagnostico-tecnico` and `/taller/kanban`.

### CSS
CSS Modules (`.module.css` per component). Global design tokens are in `frontend/src/styles/variables.css` (prefix `--color-`, `--spacing-`, `--radius-`, `--shadow-`, `--font-`). Global resets/utilities in `styles/reset.css` and `styles/utilities.css`.

### Vite path aliases
`@` → `src/`, `@components`, `@pages`, `@services`, `@hooks`, `@utils`, `@context`, `@assets`, `@styles`.

## Environment Setup

Copy `backend/.env.example` to `backend/.env` and fill in MySQL credentials. Frontend env vars are prefixed `VITE_`; `VITE_API_URL` defaults to `http://localhost:5000/api`.

## Key conventions

- Backend tests mock `../src/config/database` (`query`, `transaction`) and `../src/utils/jwt`. Tests live in `backend/tests/`.
- `AuthContext` normalizes backend snake_case fields (`nombre_completo`, `avatar_url`) to camelCase on every login/register/update. Always store/read user as camelCase in frontend.
- `localStorage` keys: `autosmart_access_token`, `autosmart_refresh_token`, `autosmart_user`.
