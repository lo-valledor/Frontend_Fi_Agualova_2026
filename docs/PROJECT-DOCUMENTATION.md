# 📋 ENERLOVA - Documentación Completa del Proyecto

## 📖 Índice

1. [Descripción General](#-descripción-general)
2. [Arquitectura del Sistema](#️-arquitectura-del-sistema)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Módulos Funcionales](#-módulos-funcionales)
6. [Configuración y Desarrollo](#️-configuración-y-desarrollo)
7. [Despliegue](#-despliegue)
8. [API y Servicios](#-api-y-servicios)
9. [Patrones de Diseño](#-patrones-de-diseño)
10. [Testing y Calidad](#-testing-y-calidad)
11. [Guías de Desarrollo](#-guías-de-desarrollo)

---

## 🔍 Descripción General

**Enerlova** es un sistema integral de gestión energética desarrollado para empresas de distribución eléctrica. El sistema administra el ciclo completo de facturación, desde la lectura de medidores hasta la generación de facturas, integrándose con sistemas externos como SAP.

### 🎯 Objetivos del Sistema

- **Gestión completa del ciclo de facturación eléctrica**
- **Monitoreo en tiempo real de lecturas de medidores**
- **Administración de contratos y clientes**
- **Operaciones de corte y reposición de servicios**
- **Integración con sistemas externos (SAP)**
- **Mantención de parámetros del sistema**

### 👥 Usuarios Objetivo

- Operadores de lectura
- Supervisores de facturación
- Administradores del sistema
- Personal de mantención
- Gerencia operativa

---

## ⚙️ Arquitectura del Sistema

### 🏗️ Arquitectura General

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   React SPA     │◄──►│   REST API      │◄──►│   SQL Server    │
│   (Puerto 3000) │    │   (Puerto 8081) │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   SAP System    │
                       │   Integration   │
                       └─────────────────┘
```

### 🔄 Flujo de Datos

1. **Autenticación JWT**: Login seguro con tokens
2. **Interceptores Axios**: Manejo automático de autenticación
3. **Service Layer**: Abstracción de llamadas API
4. **State Management**: Context API para estados globales
5. **Error Handling**: Manejo centralizado de errores

### 🎨 Arquitectura Frontend

- **React Router 7**: Enrutamiento file-based
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos utility-first
- **Radix UI**: Componentes accesibles
- **React Hook Form**: Manejo de formularios
- **Zod**: Validación de esquemas

---

## 🛠 Stack Tecnológico

### 📱 Frontend Core

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.1.0 | Framework principal |
| **React Router** | 7.5.3 | Enrutamiento |
| **TypeScript** | 5.8.3 | Tipado estático |
| **Vite** | 6.3.3 | Build tool |

### 🎨 UI/UX

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Tailwind CSS** | 4.1.4 | Framework CSS |
| **Radix UI** | ~1.x | Componentes base |
| **Lucide React** | 0.513.0 | Iconografía |
| **Next Themes** | 0.4.6 | Modo oscuro |

### 📋 Formularios y Validación

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React Hook Form** | 7.56.4 | Manejo de formularios |
| **Zod** | 3.25.36 | Validación de esquemas |
| **@hookform/resolvers** | 5.0.1 | Integración Zod |

### 📊 Datos y Estado

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Axios** | 1.9.0 | Cliente HTTP |
| **TanStack Table** | 8.21.3 | Tablas avanzadas |
| **JWT Decode** | 4.0.0 | Decodificación tokens |

### 📈 Visualización

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Recharts** | 2.15.3 | Gráficos |
| **React Spinners** | 0.17.0 | Indicadores de carga |
| **Sonner** | 2.0.3 | Notificaciones toast |

### 🔧 Herramientas de Desarrollo

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **ESLint** | 9.28.0 | Linting |
| **Prettier** | 3.5.3 | Formateo |
| **Husky** | 9.1.7 | Git hooks |
| **TypeScript ESLint** | 8.33.1 | Linting TS |

---

## 📁 Estructura del Proyecto

```
enerlova/res/
├── 📁 app/                          # Código fuente principal
│   ├── 📁 assets/                   # Recursos estáticos
│   │   ├── react.svg
│   │   └── 📁 fonts/               # Fuentes Roboto
│   ├── 📁 components/              # Componentes React
│   │   ├── 📁 administracion/      # Módulo administración
│   │   ├── 📁 auth/               # Componentes autenticación
│   │   ├── 📁 dashboard/          # Dashboard principal
│   │   ├── 📁 data-table/         # Tablas reutilizables
│   │   ├── 📁 mantencion/         # Módulo mantención
│   │   ├── 📁 monitor/            # Módulo monitoreo
│   │   ├── 📁 operaciones/        # Módulo operaciones
│   │   ├── 📁 sidebar/            # Navegación lateral
│   │   └── 📁 ui/                 # Componentes base UI
│   ├── 📁 context/                # Contextos React
│   │   ├── AuthContext.tsx
│   │   ├── BreadcrumbContext.tsx
│   │   └── LoadingBarContext.tsx
│   ├── 📁 hooks/                  # Custom hooks
│   │   ├── use-administracion.ts
│   │   ├── use-monitor.ts
│   │   ├── use-operaciones.ts
│   │   └── 📁 administracion/
│   ├── 📁 lib/                    # Librerías y utilidades
│   │   ├── api.ts                # Cliente API
│   │   └── utils.ts              # Utilidades generales
│   ├── 📁 routes/                 # Definición de rutas
│   │   ├── 📁 auth/              # Rutas autenticación
│   │   └── 📁 dashboard/         # Rutas dashboard
│   ├── 📁 services/              # Servicios API
│   │   ├── index.ts              # Exportaciones
│   │   ├── authService.ts        # Autenticación
│   │   ├── administracionService.ts
│   │   ├── mantencionService.ts
│   │   ├── monitorService.ts
│   │   ├── operacionesService.ts
│   │   └── axiosConfig.ts        # Configuración Axios
│   ├── 📁 types/                 # Definiciones TypeScript
│   │   ├── administracion.ts
│   │   ├── mantencion.ts
│   │   ├── monitor.ts
│   │   └── operaciones.ts
│   ├── 📁 utils/                 # Utilidades específicas
│   │   ├── auth-utils.ts         # Utilidades auth
│   │   ├── date-formatter.ts     # Formateo fechas
│   │   └── token-sync.ts         # Sincronización tokens
│   ├── app.css                   # Estilos globales
│   ├── root.tsx                  # Componente raíz
│   └── routes.ts                 # Configuración rutas
├── 📁 build/                     # Archivos compilados
├── 📁 docs/                      # Documentación
│   ├── API-SERVICES-STRUCTURE.md
│   ├── PROJECT-DOCUMENTATION.md
│   └── RUNNER-SETUP.md
├── 📁 public/                    # Archivos públicos
├── 📁 scripts/                   # Scripts deployment
├── package.json                  # Dependencias
├── tsconfig.json                # Configuración TS
├── vite.config.ts               # Configuración Vite
├── eslint.config.js             # Configuración ESLint
├── docker-compose.yml           # Docker producción
├── docker-compose.dev.yml       # Docker desarrollo
├── Dockerfile                   # Imagen Docker
└── README.md                    # Documentación básica
```

---

## 🏢 Módulos Funcionales

### 📊 1. Monitor de Lecturas

**Propósito**: Visualización y análisis de lecturas de medidores

**Características principales**:
- 📈 Visualización de lecturas por sector y período
- 🔍 Soporte para tarifas BT-1, BT-2, BT-4.3
- 📋 Análisis de consumo energético
- ✅ Validación automática con claves de control
- 📤 Exportación de datos

**Rutas principales**:
- `/dashboard/monitor/monitor-lecturas`
- `/dashboard/monitor/exportar-lecturas`

**Componentes clave**:
- `MonitorLecturas`
- `ExportarLecturas`
- `TablaLecturas`
- `GraficosConsumo`

### ⚙️ 2. Operaciones

**Propósito**: Gestión del ciclo operativo de facturación

**Características principales**:
- 🗓️ **Períodos**: Apertura/cierre períodos facturación
- 📖 **Lecturas**: Preparación y asignación sectores
- 🧮 **Facturas**: Cálculo y revisión prefacturas
- 🔄 **Medidores**: Cambios y reemplazos
- ✂️ **Servicios**: Corte y reposición
- 💰 **Precios**: Administración tarifas
- 🔗 **SAP**: Integración sistemas externos

**Rutas principales**:
- `/dashboard/operaciones/periodo-facturacion`
- `/dashboard/operaciones/revisar-precio`
- `/dashboard/operaciones/preparar-lecturas`
- `/dashboard/operaciones/calculo-facturas`

**Componentes clave**:
- `RevisarPrecioComponent`
- `PeriodoFacturacion`
- `CalculoFacturas`
- `IntegracionSAP`

### 👥 3. Administración

**Propósito**: Gestión de entidades del sistema

**Características principales**:
- 👤 **Usuarios**: Control acceso y perfiles
- 🏢 **Clientes**: Registro información clientes
- 📄 **Contratos**: Administración contratos suministro
- ⚡ **Medidores**: Control equipos medición
- 🔌 **Acometidas**: Gestión conexiones eléctricas
- 💸 **Cargos**: Configuración conceptos cobro

**Rutas principales**:
- `/dashboard/administracion/usuarios`
- `/dashboard/administracion/clientes`
- `/dashboard/administracion/contratos`
- `/dashboard/administracion/medidores`

**Componentes clave**:
- `UsuariosTable`
- `ClientesForm`
- `ContratosModal`
- `MedidoresGrid`

### 🔧 4. Mantención

**Propósito**: Configuración parámetros del sistema

**Características principales**:
- ⚙️ **Parámetros**: Variables operativas
- 💰 **Tarifas**: Estructuras tarifarias
- 📝 **Conceptos**: Conceptos facturables
- 🔄 **Ciclos**: Períodos facturación
- 🗺️ **Zonas**: Organización territorial
- 🏠 **Nichos**: Infraestructura distribución

**Rutas principales**:
- `/dashboard/mantencion/parametros`
- `/dashboard/mantencion/tarifas`
- `/dashboard/mantencion/zonas`
- `/dashboard/mantencion/ciclos-facturacion`

**Componentes clave**:
- `ParametrosConfig`
- `TarifasManager`
- `ZonasMap`
- `CiclosConfig`

---

## ⚙️ Configuración y Desarrollo

### 📋 Prerrequisitos

- **Node.js**: 18.0.0 o superior
- **pnpm**: 8.0.0 o superior (recomendado)
- **Git**: Para control de versiones

### 🚀 Instalación

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd enerlova/res

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con configuraciones backend

# 4. Iniciar desarrollo
pnpm dev
```

### 🌍 Variables de Entorno

```bash
# .env
VITE_API_URL=http://192.168.1.139:8081/Enerlova
NODE_ENV=development
```

### 🛠️ Scripts Disponibles

```bash
# Desarrollo
pnpm dev                 # Servidor desarrollo (puerto 5173)
pnpm build              # Build producción
pnpm start              # Servidor producción
pnpm preview            # Preview build local

# Calidad código
pnpm typecheck          # Verificar tipos TypeScript
pnpm lint               # Ejecutar ESLint
pnpm lint:fix           # Corregir errores ESLint
pnpm format             # Formatear código Prettier
pnpm format:check       # Verificar formato

# CI/CD
pnpm ci                 # Pipeline completo (typecheck + lint + build)
```

### 🔧 Configuración de Desarrollo

#### TypeScript
```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "~/*": ["./app/*"]
    },
    "strict": true
  }
}
```

#### ESLint
```javascript
// eslint.config.js
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  }
];
```

---

## 🐳 Despliegue

### 🏗️ Configuraciones Docker

El proyecto incluye configuración multi-entorno:

#### Producción
```bash
# Docker Compose Producción
docker-compose up -d
# Puerto: 8080
# API: http://192.168.1.139:8081/Enerlova
```

#### Desarrollo
```bash
# Docker Compose Desarrollo
docker-compose -f docker-compose.dev.yml up -d
# Puerto: 3000
# API: http://192.168.1.139:8082/Enerlova
```

### 📜 Scripts de Gestión

**Windows (PowerShell)**:
```powershell
.\scripts\manage-environments.ps1 dev    # Desarrollo
.\scripts\manage-environments.ps1 prod   # Producción
.\scripts\manage-environments.ps1 stop   # Detener
```

**Linux/macOS (Bash)**:
```bash
./scripts/manage-environments.sh dev     # Desarrollo
./scripts/manage-environments.sh prod    # Producción
./scripts/manage-environments.sh stop    # Detener
```

### ☁️ Plataformas Soportadas

- **AWS ECS**
- **Google Cloud Run**
- **Azure Container Apps**
- **Digital Ocean App Platform**
- **Fly.io**
- **Railway**

---

## 📡 API y Servicios

### 🔧 Configuración Base

```typescript
// app/services/axiosConfig.ts
const axiosInstance = axios.create({
  baseURL: process.env.VITE_API_URL,
  timeout: 15000,
  withCredentials: true
});

// Interceptor automático para tokens
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 🏗️ Estructura de Servicios

Cada módulo tiene su servicio dedicado:

```typescript
// Patrón base de servicio
export interface ModuloServiceResponse<T> {
  data: T | null;
  error: string | null;
}

class ModuloService {
  async getDatos(): Promise<ModuloServiceResponse<TipoDatos[]>> {
    try {
      const response = await api.get('/endpoint');
      return { data: response.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }
}
```

### 📋 Servicios Disponibles

| Servicio | Archivo | Propósito |
|----------|---------|-----------|
| **authService** | `authService.ts` | Autenticación y tokens |
| **monitorService** | `monitorService.ts` | Lecturas y monitoreo |
| **administracionService** | `administracionService.ts` | Gestión entidades |
| **operacionesService** | `operacionesService.ts` | Operaciones facturación |
| **mantencionService** | `mantencionService.ts` | Configuración sistema |

### 🔗 Endpoints Principales

#### Autenticación
```typescript
POST /login                    // Iniciar sesión
POST /logout                   // Cerrar sesión
POST /refresh-token           // Renovar token
POST /validar-usuario-modificacion // Validar usuario
```

#### Monitor
```typescript
GET /Periodos                 // Períodos disponibles
GET /Sectores                 // Sectores de lectura
GET /Claves                   // Claves de control
GET /ConsultarLecturas        // Lecturas por período
```

#### Administración
```typescript
GET /ClienteBuscar           // Buscar clientes
GET /contrato/buscar         // Buscar contratos
GET /buscar-Acometida        // Buscar acometidas
GET /BuscarMedidor          // Buscar medidores
```

#### Operaciones
```typescript
GET /ConsultarPeriodoAbierto      // Período abierto
GET /consultar-precios-uno        // Precios Enel
GET /consultar-precios-dos        // Precios Enerlova
POST /ConfirmarPrecio            // Confirmar precio
```

---

## 🎨 Patrones de Diseño

### 🏗️ Arquitectura de Componentes

#### 1. Atomic Design
```
Atoms (ui/)          → Button, Input, Badge
Molecules            → FormField, DataCell
Organisms            → DataTable, Modal
Templates            → PageLayout, FormLayout
Pages (routes/)      → DashboardPage, LoginPage
```

#### 2. Compound Components
```typescript
// Ejemplo: DataTable
<DataTable data={data} columns={columns}>
  <DataTable.Header />
  <DataTable.Body />
  <DataTable.Pagination />
</DataTable>
```

#### 3. Render Props
```typescript
// Ejemplo: Modal con estado
<Modal>
  {({ isOpen, close }) => (
    <Form onSubmit={() => close()} />
  )}
</Modal>
```

### 🔄 Patrones de Estado

#### 1. Context Pattern
```typescript
// AuthContext.tsx
const AuthContext = createContext<AuthState>();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

#### 2. Custom Hooks
```typescript
// use-administracion.ts
export const useAdministracion = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await administracionService.getData();
    setData(result.data);
    setLoading(false);
  }, []);
  
  return { data, loading, fetchData };
};
```

#### 3. Service Layer Pattern
```typescript
// Separación clara de responsabilidades
Route → Hook → Service → API → Backend
```

### 📋 Patrones de Formularios

#### 1. Schema-First Validation
```typescript
// Zod schema
const userSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido')
});

// React Hook Form
const { register, handleSubmit } = useForm({
  resolver: zodResolver(userSchema)
});
```

#### 2. Modal Forms
```typescript
// Patrón consistente para forms en modales
<Modal>
  <Form
    onSubmit={handleSubmit}
    onCancel={onClose}
    loading={isSubmitting}
  />
</Modal>
```

### 🗂️ Patrones de Datos

#### 1. Repository Pattern
```typescript
// Service como repository
class AdministracionService {
  async getClientes() { /* API call */ }
  async createCliente() { /* API call */ }
  async updateCliente() { /* API call */ }
  async deleteCliente() { /* API call */ }
}
```

#### 2. Response Normalization
```typescript
// Respuestas consistentes
interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}
```

---

## 🧪 Testing y Calidad

### ✅ Herramientas de Calidad

#### ESLint Configuration
```javascript
// eslint.config.js
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // React
      'react/react-in-jsx-scope': 'off',
      'react/jsx-props-no-spreading': 'off',
      
      // TypeScript
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      
      // Imports
      'unused-imports/no-unused-imports': 'error'
    }
  }
];
```

#### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "plugins": [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss"
  ]
}
```

### 🔍 Análisis de Código

#### TypeScript Strict Mode
```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false
  }
}
```

#### Git Hooks (Husky)
```json
// package.json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### 📊 Métricas de Calidad

- **TypeScript Coverage**: 100%
- **ESLint Rules**: ~50 reglas activas
- **Code Splitting**: Automático por rutas
- **Bundle Size**: Optimizado con Vite
- **Performance**: Lazy loading componentes

---

## 📖 Guías de Desarrollo

### 🆕 Agregar Nuevo Módulo

#### 1. Crear Estructura
```bash
# Crear directorios
mkdir -p app/components/nuevo-modulo
mkdir -p app/routes/dashboard/nuevo-modulo
mkdir -p app/types
mkdir -p app/hooks

# Archivos base
touch app/services/nuevoModuloService.ts
touch app/types/nuevo-modulo.ts
touch app/hooks/use-nuevo-modulo.ts
```

#### 2. Definir Tipos
```typescript
// app/types/nuevo-modulo.ts
export interface NuevoItem {
  id: number;
  nombre: string;
  estado: 'activo' | 'inactivo';
  fechaCreacion: string;
}

export interface NuevoModuloResponse {
  items: NuevoItem[];
  total: number;
}
```

#### 3. Crear Servicio
```typescript
// app/services/nuevoModuloService.ts
import api from '~/lib/api';
import type { NuevoItem } from '~/types/nuevo-modulo';

export interface NuevoModuloServiceResponse<T> {
  data: T | null;
  error: string | null;
}

class NuevoModuloService {
  async getItems(): Promise<NuevoModuloServiceResponse<NuevoItem[]>> {
    try {
      const response = await api.get('/nuevo-modulo');
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export const nuevoModuloService = new NuevoModuloService();
```

#### 4. Crear Hook
```typescript
// app/hooks/use-nuevo-modulo.ts
import { useState, useCallback } from 'react';
import { nuevoModuloService } from '~/services/nuevoModuloService';
import type { NuevoItem } from '~/types/nuevo-modulo';

export const useNuevoModulo = () => {
  const [items, setItems] = useState<NuevoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const result = await nuevoModuloService.getItems();
    
    if (result.error) {
      setError(result.error);
    } else {
      setItems(result.data || []);
    }
    
    setLoading(false);
  }, []);

  return { items, loading, error, fetchItems };
};
```

#### 5. Crear Ruta
```typescript
// app/routes/dashboard/nuevo-modulo.tsx
import { useLoaderData } from 'react-router';
import { nuevoModuloService } from '~/services/nuevoModuloService';
import NuevoModuloComponent from '~/components/nuevo-modulo/nuevo-modulo-component';

export async function clientLoader() {
  const result = await nuevoModuloService.getItems();
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  return { items: result.data };
}

export default function NuevoModuloPage() {
  const { items } = useLoaderData<typeof clientLoader>();
  
  return <NuevoModuloComponent items={items} />;
}
```

### 🎨 Crear Nuevo Componente

#### 1. Estructura Base
```typescript
// app/components/nuevo-modulo/nuevo-componente.tsx
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

interface NuevoComponenteProps {
  title: string;
  data: any[];
  onAction?: () => void;
}

export default function NuevoComponente({ 
  title, 
  data, 
  onAction 
}: NuevoComponenteProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      await onAction?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="border p-2 rounded">
              {JSON.stringify(item)}
            </div>
          ))}
          <Button onClick={handleAction} disabled={loading}>
            {loading ? 'Procesando...' : 'Ejecutar Acción'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 📋 Agregar Nuevo Formulario

#### 1. Esquema Zod
```typescript
// schemas/nuevo-form-schema.ts
import { z } from 'zod';

export const nuevoFormSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  estado: z.enum(['activo', 'inactivo'])
});

export type NuevoFormData = z.infer<typeof nuevoFormSchema>;
```

#### 2. Componente Form
```typescript
// components/nuevo-modulo/nuevo-form.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { nuevoFormSchema, type NuevoFormData } from './schemas/nuevo-form-schema';

interface NuevoFormProps {
  defaultValues?: Partial<NuevoFormData>;
  onSubmit: (data: NuevoFormData) => Promise<void>;
  onCancel: () => void;
}

export default function NuevoForm({ 
  defaultValues, 
  onSubmit, 
  onCancel 
}: NuevoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<NuevoFormData>({
    resolver: zodResolver(nuevoFormSchema),
    defaultValues
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          {...register('nombre')}
          placeholder="Ingrese nombre"
        />
        {errors.nombre && (
          <p className="text-sm text-red-600">{errors.nombre.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="Ingrese email"
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
```

### 🔧 Mejores Prácticas

#### ✅ Código Limpio
- **Nombres descriptivos** para variables y funciones
- **Componentes pequeños** y enfocados
- **Separación de responsabilidades**
- **Reutilización de código**

#### 🎯 Performance
- **Lazy loading** para rutas
- **React.memo** para componentes pesados
- **useCallback/useMemo** cuando sea necesario
- **Optimización de imágenes**

#### 🔒 Seguridad
- **Validación en frontend y backend**
- **Sanitización de inputs**
- **Manejo seguro de tokens**
- **CORS configurado correctamente**

#### 📱 Responsividad
- **Mobile-first approach**
- **Breakpoints consistentes**
- **Touch-friendly interfaces**
- **Accesibilidad (a11y)**

---

## 📞 Soporte y Contacto

### 🐛 Reporte de Errores

Para reportar errores o problemas:

1. **Verificar** documentación existente
2. **Revisar** issues existentes en el repositorio
3. **Crear** nuevo issue con:
   - Descripción detallada del problema
   - Pasos para reproducir
   - Screenshots si aplica
   - Información del entorno

### 💡 Solicitudes de Funcionalidades

Para solicitar nuevas funcionalidades:

1. **Describir** la funcionalidad solicitada
2. **Justificar** la necesidad del negocio
3. **Proponer** posible implementación
4. **Evaluar** impacto en sistema existente

### 🤝 Contribuciones

Para contribuir al proyecto:

1. **Fork** del repositorio
2. **Crear** rama para nueva funcionalidad
3. **Implementar** cambios siguiendo guías
4. **Testing** exhaustivo
5. **Pull Request** con descripción detallada

---

## 📄 Licencia

Este proyecto es **privado y confidencial**. Todos los derechos reservados para Enerlova y Lo Valledor.

---

**📅 Última actualización**: Agosto 2025  
**📝 Versión de documentación**: 1.0.0  
**👨‍💻 Desarrollado con ❤️ para la gestión eficiente de sistemas energéticos**
