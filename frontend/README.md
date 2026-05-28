# 🚗 AutoSmart - Sistema de Gestión de Talleres Automotrices

Sistema completo de gestión para talleres automotrices con gestión de órdenes de trabajo, cotizaciones, vehículos, clientes y más.

## 🚀 Características

- ✅ **Autenticación JWT** - Login y registro de usuarios
- ✅ **Roles y Permisos** - Admin, Mecánico, Cliente
- ✅ **Gestión de Órdenes** - Vehículos y laboratorio
- ✅ **Cotizaciones** - Creación y seguimiento
- ✅ **Kanban** - Gestión visual de órdenes
- ✅ **Gestión de Usuarios** - CRUD completo
- ✅ **Notificaciones** - Sistema de alertas en tiempo real
- ✅ **Citas** - Agendamiento de servicios

## 🛠️ Tecnologías

- **React 18.3** - Framework principal
- **Vite 5.0** - Build tool
- **React Router DOM 6** - Navegación
- **Axios** - Cliente HTTP
- **CSS Modules** - Estilos encapsulados
- **Lucide React** - Iconos

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone [url-del-repo]
cd autosmart-frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con la URL de tu backend:
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Estructura del Proyecto

```
autosmart-frontend/
├── public/                 # Archivos estáticos
├── src/
│   ├── assets/            # Imágenes, iconos, fuentes
│   ├── components/        # Componentes reutilizables
│   │   ├── common/       # Botones, Inputs, etc.
│   │   ├── layout/       # Navbar, Footer, Sidebar
│   │   ├── forms/        # Formularios específicos
│   │   └── features/     # Componentes de funcionalidades
│   ├── pages/            # Páginas de la aplicación
│   │   ├── public/       # Páginas públicas
│   │   ├── cliente/      # Páginas de cliente
│   │   └── taller/       # Páginas de taller
│   ├── context/          # React Context (Auth, etc.)
│   ├── hooks/            # Custom hooks
│   ├── services/         # Servicios de API
│   ├── routes/           # Configuración de rutas
│   ├── utils/            # Utilidades
│   ├── styles/           # Estilos globales
│   ├── config/           # Configuración
│   ├── App.jsx           # Componente principal
│   └── main.jsx          # Punto de entrada
├── .env.example          # Variables de entorno ejemplo
├── package.json          # Dependencias
└── vite.config.js        # Configuración de Vite
```

## 👥 Roles de Usuario

### 🔴 Admin
- Acceso completo al sistema
- Gestión de usuarios
- Configuración del taller
- Todas las funcionalidades

### 🟠 Mecánico
- Ver órdenes asignadas
- Actualizar estado de órdenes
- Crear cotizaciones
- Diagnóstico técnico

### 🟢 Cliente
- Ver sus vehículos
- Ver sus órdenes
- Agendar citas
- Aprobar/rechazar cotizaciones

## 🔐 Autenticación

El sistema usa **JWT (JSON Web Tokens)** con:
- Access Token (24h)
- Refresh Token (7 días)
- Renovación automática de tokens

## 📱 Rutas Principales

### Públicas
- `/` - Página de inicio
- `/login` - Iniciar sesión
- `/register` - Registrarse
- `/noticias` - Noticias del taller

### Privadas (Taller)
- `/dashboard` - Panel principal
- `/recepcion-vehiculo` - Recepción de vehículos
- `/recepcion-laboratorio` - Recepción de piezas
- `/ordenes-trabajo` - Gestión de órdenes
- `/cotizaciones` - Gestión de cotizaciones
- `/kanban` - Vista Kanban
- `/gestion-usuarios` - Gestión de usuarios

### Privadas (Cliente)
- `/mi-perfil` - Perfil del cliente
- `/mis-vehiculos` - Vehículos del cliente
- `/mis-ordenes` - Órdenes del cliente
- `/agendar-cita` - Agendar cita

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## 🔧 Configuración del Backend

Este frontend se conecta al backend de AutoSmart. Asegúrate de que el backend esté corriendo en el puerto configurado (por defecto `5000`).

Backend: `http://localhost:5000`

## 📝 Convenciones de Código

- **Componentes**: PascalCase (`Button.jsx`)
- **Archivos CSS**: CamelCase con `.module.css` (`Button.module.css`)
- **Funciones**: camelCase (`handleSubmit`)
- **Constantes**: UPPER_SNAKE_CASE (`API_URL`)

## 🎨 Sistema de Diseño

### Colores Principales
- **Primary Blue**: `#0066CC`
- **Primary Red**: `#EF4444`
- **Secondary Yellow**: `#FFC857`
- **Success Green**: `#10B981`

### Espaciado
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

## 📦 Dependencias Principales

```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.21.1",
  "axios": "^1.6.5",
  "lucide-react": "^0.263.1"
}
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y pertenece a AutoSmart.

## 👨‍💻 Autor

AutoSmart Team - Sistema de Gestión de Talleres

---

**¿Necesitas ayuda?** Contacta al equipo de desarrollo.