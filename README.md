# ⚡ ENERLOVA - Sistema Integral de Gestión Energética

<div align="center">
  <img src="public/logo-enerlova.png" alt="Enerlova Logo" width="200"/>

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-7.5.3-CA4245?style=for-the-badge&logo=react-router)](https://reactrouter.com/)
[![Vite](https://img.shields.io/badge/Vite-6.3.3-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

</div>

---

## 📋 Descripción

**Enerlova** es un sistema integral de gestión energética desarrollado para empresas de distribución eléctrica. Administra el ciclo completo de facturación, desde la lectura de medidores hasta la generación de facturas, con integración a sistemas externos como SAP.

### 🎯 Características Principales

- ⚡ **Gestión completa del ciclo de facturación eléctrica**
- 📊 **Monitoreo en tiempo real de lecturas de medidores**
- 👥 **Administración de contratos y clientes**
- ⚙️ **Operaciones de corte y reposición de servicios**
- 🔗 **Integración con sistemas externos (SAP)**
- 🛠️ **Mantención de parámetros del sistema**
- 📱 **Interfaz responsive optimizada para móviles**
- 🌙 **Modo oscuro/claro**
- 🔐 **Autenticación JWT segura**

---

> ¿Eres nuevo en el proyecto? Consulta la guía de desarrollador y normas de contribución:

- `CONTRIBUTING.md` — reglas de contribución y checklist de PR.
- `docs/DEVELOPER_GUIDE.md` — onboarding rápido y scripts.


## 🚀 Inicio Rápido

### 📋 Prerrequisitos

```bash
# Verificar versiones requeridas
node --version    # >= 18.0.0
pnpm --version    # >= 8.0.0
git --version     # Cualquier versión reciente
```

### ⚡ Instalación

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd enerlova/res

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
echo "VITE_API_URL=http://192.168.1.139:8081/Enerlova" > .env

# 4. Iniciar servidor de desarrollo
pnpm dev
```

### 🌐 Acceso

- **Frontend**: http://localhost:5173
- **Login**: Usar credenciales del sistema backend

---

## 🏗️ Arquitectura

### 📊 Stack Tecnológico

#### Frontend Core

| Tecnología       | Versión | Propósito               |
| ---------------- | ------- | ----------------------- |
| **React**        | 19.1.0  | Framework principal     |
| **React Router** | 7.5.3   | Enrutamiento file-based |
| **TypeScript**   | 5.8.3   | Tipado estático         |
| **Vite**         | 6.3.3   | Build tool y dev server |

#### UI/UX

| Tecnología       | Versión | Propósito                   |
| ---------------- | ------- | --------------------------- |
| **Tailwind CSS** | 4.1.4   | Framework CSS utility-first |
| **Radix UI**     | ~1.x    | Componentes accesibles      |
| **Lucide React** | 0.513.0 | Iconografía                 |
| **Next Themes**  | 0.4.6   | Gestión de temas            |

#### Gestión de Datos

| Tecnología          | Versión | Propósito              |
| ------------------- | ------- | ---------------------- |
| **Axios**           | 1.9.0   | Cliente HTTP           |
| **React Hook Form** | 7.56.4  | Manejo de formularios  |
| **Zod**             | 3.25.36 | Validación de esquemas |
| **TanStack Table**  | 8.21.3  | Tablas avanzadas       |

### 🔄 Arquitectura en Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Routes    │ │ Components  │ │   Hooks     │          │
│  │ (Pages)     │ │ (UI Logic)  │ │ (State)     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     BUSINESS LAYER                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Services   │ │   Context   │ │   Utils     │          │
│  │ (API Logic) │ │ (Global)    │ │ (Helpers)   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Axios     │ │   Types     │ │   Storage   │          │
│  │ (HTTP)      │ │ (TS Defs)   │ │ (Local)     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
enerlova/res/
├── 📁 app/                          # Código fuente principal
│   ├── 📁 assets/                   # Recursos estáticos
│   ├── 📁 components/              # Componentes React
│   │   ├── 📁 administracion/      # Módulo administración
│   │   │   ├── 📁 acometida/       # Gestión acometidas
│   │   │   ├── 📁 clientes/        # Gestión clientes
│   │   │   ├── 📁 contratos/       # Gestión contratos
│   │   │   ├── 📁 medidores/       # Gestión medidores
│   │   │   └── 📁 usuarios/        # Gestión usuarios
│   │   ├── 📁 auth/               # Autenticación
│   │   ├── 📁 dashboard/          # Dashboard principal
│   │   ├── 📁 data-table/         # Tablas reutilizables
│   │   ├── 📁 mantencion/         # Módulo mantención
│   │   │   ├── 📁 ciclos-facturacion/
│   │   │   ├── 📁 conceptos/
│   │   │   ├── 📁 parametros/
│   │   │   ├── 📁 tarifas/
│   │   │   └── 📁 zonas/
│   │   ├── 📁 monitor/            # Módulo monitoreo
│   │   │   └── 📁 monitor-lecturas/
│   │   ├── 📁 operaciones/        # Módulo operaciones
│   │   │   ├── 📁 anular-factura-impresa/
│   │   │   ├── 📁 cambio-medidor/
│   │   │   ├── 📁 corte-reposicion/
│   │   │   ├── 📁 crear-archivos-sap/
│   │   │   └── 📁 periodo-facturacion/
│   │   ├── 📁 sidebar/            # Navegación lateral
│   │   └── 📁 ui/                 # Componentes base UI
│   ├── 📁 context/                # Contextos React
│   ├── 📁 hooks/                  # Custom hooks
│   ├── 📁 lib/                    # Librerías y utilidades
│   ├── 📁 routes/                 # Definición de rutas
│   ├── 📁 services/              # Servicios API
│   ├── 📁 types/                 # Definiciones TypeScript
│   └── 📁 utils/                 # Utilidades específicas
├── 📁 docs/                      # Documentación
├── 📁 public/                    # Archivos públicos
├── 📁 scripts/                   # Scripts deployment
├── package.json                  # Dependencias
├── tsconfig.json                # Configuración TypeScript
├── vite.config.ts               # Configuración Vite
├── docker-compose.yml           # Docker producción
└── Dockerfile                   # Imagen Docker
```

---

## 🎯 Módulos del Sistema

### 📊 Monitor

**Ruta**: `/dashboard/monitor`

- Monitoreo de lecturas de medidores
- Exportación de datos de lecturas
- Visualización en tiempo real

### ⚙️ Operaciones

**Ruta**: `/dashboard/operaciones`

- Ciclo completo de facturación
- Corte y reposición de servicios
- Cambio de medidores
- Anulación de facturas
- Creación de archivos SAP
- Preparación y cierre de lecturas

### 👥 Administración

**Ruta**: `/dashboard/administracion`

- Gestión de usuarios y permisos
- Administración de clientes
- Gestión de contratos
- Configuración de medidores
- Gestión de acometidas

### 🛠️ Mantención

**Ruta**: `/dashboard/mantencion`

- Configuración de parámetros del sistema
- Gestión de tarifas y conceptos
- Configuración de zonas y sectores
- Mantención de ciclos de facturación
- Gestión de tipos de contratos

---

## 🛠️ Comandos de Desarrollo

### Desarrollo Local

```bash
# Servidor de desarrollo
pnpm dev

# Build para producción
pnpm build

# Verificación de tipos
pnpm typecheck

# Preview del build
pnpm preview
```

### Calidad de Código

```bash
# Linting
pnpm lint
pnpm lint:fix

# Formateo
pnpm format
pnpm format:check

# Pipeline completo
pnpm ci
```

### Docker

```bash
# Producción
docker-compose up -d

# Desarrollo
docker-compose -f docker-compose.dev.yml up -d

# Ambos entornos
docker-compose -f docker-compose.multi.yml up -d
```

---

## 🚀 Despliegue

### 📦 Entornos Disponibles

| Entorno        | Rama      | Puerto | API URL                            |
| -------------- | --------- | ------ | ---------------------------------- |
| **Producción** | `main`    | 8080   | http://192.168.1.139:8081/Enerlova |
| **Desarrollo** | `develop` | 4200   | http://192.168.1.139:8082/Enerlova |

### 🔧 Scripts de Despliegue

#### Linux/Mac

```bash
# Dar permisos
chmod +x deploy.sh

# Desplegar producción
./deploy.sh prod

# Desplegar desarrollo
./deploy.sh dev

# Ver estado
./deploy.sh status
```

#### Windows PowerShell

```powershell
# Desplegar producción
.\deploy.ps1 prod

# Desplegar desarrollo
.\deploy.ps1 dev

# Ver estado
.\deploy.ps1 status
```

### 🐳 Docker Manual

```bash
# Producción
docker-compose -f docker-compose.prod.yml up --build -d

# Desarrollo
docker-compose -f docker-compose.develop.yml up --build -d
```

---

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# API Backend
VITE_API_URL=http://192.168.1.139:8081/Enerlova

# Opcional: Configuraciones adicionales
VITE_APP_NAME=Enerlova
VITE_APP_VERSION=1.0.0
```

### Configuración de Desarrollo

#### ESLint

```javascript
// eslint.config.js
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react,
      'unused-imports': unusedImports
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'react/react-in-jsx-scope': 'off'
    }
  }
];
```

#### Prettier

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

## 🧪 Testing

### Estructura de Testing

```bash
# Ejecutar tests (cuando estén configurados)
npm test

# Coverage
npm run test:coverage

# Tests E2E
npm run test:e2e
```

### Patrones de Testing

- **Unit Tests**: Componentes individuales
- **Integration Tests**: Flujos de usuario
- **E2E Tests**: Casos de uso completos

---

## 📚 Documentación Adicional

### Documentación Principal

- 📋 **[Índice de Documentación](docs/README.md)** - Índice completo de toda la documentación

### Desarrollo

- 🚀 **[Guía de Inicio Rápido](docs/development/QUICK-START.md)** - Configuración en 5 minutos
- 🔐 **[Sistema de Permisos](docs/development/PERMISOS.md)** - Control de acceso basado en roles
- 📝 **[Cheatsheet de Comandos](docs/development/COMMANDS_CHEATSHEET.md)** - Comandos útiles
- 🐛 **[Guía de Debug API](docs/development/API_DEBUG_GUIDE.md)** - Debugging de API

### Arquitectura & Deployment

- 🏗️ **[Arquitectura](docs/architecture/ARCHITECTURE.md)** - Patrones y diseño del sistema
- 🐳 **[Despliegue Docker](docs/deployment/DEPLOY-README.md)** - Guía de deployment
- 📦 **[Docker Completo](docs/deployment/README-DOCKER.md)** - Configuración Docker detallada

Para la documentación completa, consulta la carpeta [docs/](./docs/)

---

## 🤝 Contribución

### Flujo de Desarrollo

1. **Fork** del repositorio
2. **Crear** rama feature: `git checkout -b feature/nueva-funcionalidad`
3. **Commit** cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
4. **Push** a la rama: `git push origin feature/nueva-funcionalidad`
5. **Crear** Pull Request

### Convenciones

#### Commits

```bash
# Tipos de commit
feat:     # Nueva funcionalidad
fix:      # Corrección de bug
docs:     # Documentación
style:    # Formateo, sin cambios de código
refactor: # Refactorización
test:     # Tests
chore:    # Mantención
```

#### Nomenclatura

- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useUserProfile.ts`)
- **Servicios**: camelCase con sufijo `Service` (`userService.ts`)
- **Tipos**: PascalCase con sufijo `Type` (`UserType.ts`)

---

## 🐛 Solución de Problemas

### Errores Comunes

#### Error de Conexión API

```bash
# Verificar variable de entorno
echo $VITE_API_URL

# Verificar conectividad
curl http://192.168.1.139:8081/Enerlova/health
```

#### Error de Compilación TypeScript

```bash
# Limpiar y reinstalar
rm -rf node_modules .react-router
pnpm install
pnpm typecheck
```

#### Error de Docker

---

## 🐛 Solución de Problemas

### Errores Comunes

#### Error de Conexión API

```bash
# Verificar variable de entorno
echo $VITE_API_URL

# Verificar conectividad
curl http://192.168.1.139:8081/Enerlova/health
```

#### Error de Compilación TypeScript

```bash
# Limpiar y reinstalar
rm -rf node_modules .react-router
pnpm install
pnpm typecheck
```

#### Error de Docker

```bash
# Limpiar contenedores
docker-compose down
docker system prune -f
docker-compose up -d --build
```

### Logs y Debugging

```bash
# Ver logs de desarrollo
pnpm dev --debug

# Ver logs de Docker
docker-compose logs -f

# Verificar estado de contenedores
docker ps
```

---

## 📞 Soporte

### Recursos de Ayuda

- 🐛 **Errores**: Revisar consola del navegador
- 🔐 **Autenticación**: Verificar token en localStorage
- 📡 **API**: Verificar Network tab en DevTools
- 🎨 **UI**: Componentes siguen patrón shadcn/ui

### Contacto

Para soporte técnico o consultas sobre el proyecto, contactar al equipo de desarrollo.

---

## 📄 Licencia

Este proyecto es propiedad de la empresa y está sujeto a las políticas internas de desarrollo de software.

---

<div align="center">
  <p><em>Enerlova - 2025</em></p>
</div>
