# Arquitectura del Sistema Enerlova Frontend

Este documento describe la arquitectura, patrones y organización del frontend de Enerlova.

## 📋 Tabla de Contenidos

- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Módulos de Negocio](#módulos-de-negocio)
- [Capa de Servicios](#capa-de-servicios)
- [Sistema de Autenticación](#sistema-de-autenticación)
- [Gestión de Rutas](#gestión-de-rutas)
- [Componentes](#componentes)
- [Formularios y Validación](#formularios-y-validación)
- [Manejo de Errores](#manejo-de-errores)
- [Patrones y Convenciones](#patrones-y-convenciones)

---

## Stack Tecnológico

### Core

- **React 19** - Biblioteca UI principal
- **React Router 7** - Enrutamiento basado en archivos (TanStack Router)
- **TypeScript 5.8** - Tipado estático con modo strict
- **Vite 6** - Build tool y dev server

### Estilos y UI

- **Tailwind CSS 4** - Framework CSS utility-first
- **Radix UI** - Primitivas accesibles para componentes
- **Shadcn/ui** - Componentes base construidos sobre Radix
- **Lucide React** - Sistema de iconos

### Formularios y Validación

- **React Hook Form 7** - Manejo de formularios performante
- **Zod 3** - Schema validation TypeScript-first

### Data Fetching y Estado

- **Axios 1.9** - Cliente HTTP con interceptores
- **React Context** - Estado compartido (Auth, Breadcrumbs, Loading)
- **No state manager global** - Estado local por componente/ruta

### Tablas y Data Display

- **TanStack Table 8** - Tablas con sorting, filtering, pagination
- **Recharts 2** - Gráficos y visualizaciones

### Utilerías

- **date-fns 4** - Manipulación de fechas
- **jwt-decode 4** - Decodificación de JWT
- **Sonner** - Toast notifications
- **rut.js** - Validación de RUT chileno

---

## Estructura del Proyecto

```
app/
├── components/           # Componentes React organizados por módulo
│   ├── administracion/   # Componentes del módulo de administración
│   ├── mantencion/       # Componentes del módulo de mantención
│   ├── monitor/          # Componentes del módulo de monitoreo
│   ├── operaciones/      # Componentes del módulo de operaciones
│   ├── reportes/         # Componentes de reportes
│   ├── configuracion/    # Componentes de configuración
│   ├── auth/             # Componentes de autenticación
│   ├── dashboard/        # Componentes del dashboard
│   ├── data-table/       # Componentes reutilizables de tablas
│   ├── sidebar/          # Componentes del sidebar
│   └── ui/               # Componentes base (shadcn/ui style)
│
├── routes/               # File-based routing (React Router 7)
│   ├── auth/             # Rutas de autenticación (/auth/*)
│   └── dashboard/        # Rutas protegidas (/dashboard/*)
│       ├── administracion/
│       ├── mantencion/
│       ├── monitor/
│       ├── operaciones/
│       └── reportes/
│
├── services/             # Capa de servicios API
│   ├── administracionService.ts
│   ├── mantencionService.ts
│   ├── monitorService.ts
│   ├── operacionesService.ts
│   ├── reportesService.ts
│   ├── authService.ts
│   ├── userService.ts
│   ├── rolesPermisosService.ts
│   ├── axiosConfig.ts    # Configuración de axios con interceptores
│   └── index.ts
│
├── types/                # Definiciones TypeScript por módulo
│   ├── administracion.ts
│   ├── mantencion.ts
│   ├── monitor.ts
│   ├── operaciones.ts
│   ├── reportes.ts
│   └── auth.ts
│
├── utils/                # Funciones utilitarias
│   ├── auth-utils.ts     # Helpers de autenticación
│   ├── export-utils.ts   # Helpers para exportar datos
│   └── format-utils.ts   # Helpers de formateo
│
├── hooks/                # Custom React hooks
│   ├── useAuth.ts
│   ├── useBreadcrumb.ts
│   └── useLoadingBar.ts
│
├── context/              # React Context providers
│   ├── AuthContext.tsx
│   ├── BreadcrumbContext.tsx
│   └── LoadingBarContext.tsx
│
├── lib/                  # Configuraciones y utilidades
│   ├── api.ts            # Exporta instancia axios configurada
│   └── utils.ts          # Utilidades generales (cn, etc.)
│
└── root.tsx              # Layout raíz con providers
```

---

## Módulos de Negocio

El sistema está organizado en **6 módulos principales** de negocio:

### 1. **Administración** (`administracion`)

Gestión de entidades del negocio:

- **Clientes**: CRUD de empresas clientes
- **Propietarios**: Gestión de propietarios
- **Contratantes**: Gestión de contratantes
- **Contratos**: Gestión de contratos de suministro
- **Medidores**: CRUD de medidores eléctricos
- **Acometidas**: Gestión de acometidas eléctricas
- **Condiciones de Contrato**: Parámetros contractuales
- **Cargo Facturable**: Tipos de cargos
- **Cargo por Tipo de Contrato**: Asignación de cargos
- **Usuarios**: Administración de usuarios del sistema

**Servicio**: `administracionService.ts`

### 2. **Mantención** (`mantencion`)

Mantenimiento de catálogos y parámetros del sistema:

- **Ciclos de Facturación**: Períodos de facturación
- **Claves**: Claves del sistema
- **Conceptos**: Conceptos de facturación
- **Empalmes**: Tipos de empalme
- **Marcas**: Marcas de medidores
- **Nichos**: Categorización de clientes
- **Parámetros**: Parámetros del sistema
- **Sectores**: Sectores geográficos
- **Tarifas**: Tarifas eléctricas
- **Tipos de Contrato**: Categorías de contratos
- **Zonas**: Zonas de servicio

**Servicio**: `mantencionService.ts`

### 3. **Monitor** (`monitor`)

Monitoreo y visualización de lecturas:

- **Monitor de Lecturas**: Visualización de lecturas por medidor
- **Exportar Lecturas**: Exportación de datos a Excel/CSV

**Servicio**: `monitorService.ts`

### 4. **Operaciones** (`operaciones`)

Procesos operacionales de facturación:

- **Preparar Lecturas**: Importación y preparación de lecturas
- **Cerrar Lecturas**: Cierre de período de lecturas
- **Período de Facturación**: Gestión de períodos
- **Precios por Cargo**: Configuración de precios
- **Revisar Cálculo de Factura**: Validación de cálculos
- **Revisar Precio**: Validación de precios
- **Corte y Reposición**: Gestión de cortes de suministro

**Servicio**: `operacionesService.ts`

### 5. **Reportes** (`reportes`)

Generación de reportes y consultas:

- **Consultar Contrato**: Vista detallada de contratos
- **Resumen de Facturación**: Reportes consolidados

**Servicio**: `reportesService.ts`

### 6. **Configuración** (`configuracion`)

Configuración del sistema:

- **Roles y Permisos**: Gestión de roles, permisos y menús

**Servicio**: `rolesPermisosService.ts`

---

## Capa de Servicios

### Patrón de Servicios

Todos los servicios siguen un patrón consistente:

```typescript
// Interfaz estándar de respuesta
interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

// Clase de servicio
class MiServicio {
  async getDatos(): Promise<ServiceResponse<Dato[]>> {
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

// Export singleton
export const miServicio = new MiServicio();
```

### Axios Configuration

**Archivo**: `app/services/axiosConfig.ts`

Configuración centralizada de axios con:

#### Request Interceptor

- Agrega automáticamente el token JWT a los headers
- Lee token desde `localStorage.getItem('token')`

#### Response Interceptor

- **Manejo de errores por código HTTP**:
  - `400`: Valida datos y muestra mensaje
  - `401`: Intenta refresh token automático
  - `403`: Sin permisos
  - `404`: Recurso no encontrado
  - `500`: Error de servidor
- **Refresh Token Automático**:
  - Si una petición falla con 401, intenta refrescar el token
  - Usa instancia separada para evitar loop infinito
  - Reintenta la petición original con nuevo token
  - Redirige a `/session-expired` si falla el refresh
- **Rutas excluidas del refresh**: `/login`, `/refresh-token`
- **Toast notifications** con Sonner para errores

```typescript
// Ejemplo de uso
import api from '~/lib/api';

const response = await api.get('/buscarCiclo');
// El token se agrega automáticamente
// Los errores se manejan con toasts
```

---

## Sistema de Autenticación

### Flujo de Autenticación

1. **Login**: Usuario ingresa credenciales en `/auth/login`
2. **Token Storage**: JWT se almacena en `localStorage`
3. **Auto-attach**: Axios interceptor agrega token a requests
4. **Decodificación**: `getAuthenticatedUser()` decodifica JWT
5. **Refresh**: Token se refresca automáticamente en 401
6. **Logout**: Token se elimina y redirige a login

### AuthContext

**Archivo**: `app/context/AuthContext.tsx`

Provee:

- `user`: Usuario autenticado decodificado del JWT
- `loading`: Estado de carga
- `login()`: Función de login
- `logout()`: Función de logout

```typescript
const { user, login, logout } = useAuth();

if (user) {
  console.log('Usuario:', user.nombre);
}
```

### Protected Routes

**Componente**: `ProtectedRoute`

Valida token antes de renderizar rutas protegidas:

- Revisa si existe token en localStorage
- Valida que no esté expirado
- Redirige a `/auth/login` si no hay token válido

---

## Gestión de Rutas

### File-based Routing (React Router 7)

React Router 7 usa **file-based routing** basado en la estructura de archivos:

```
app/routes/
├── auth/
│   ├── login.tsx           → /auth/login
│   └── session-expired.tsx → /auth/session-expired
│
└── dashboard/
    ├── dashboard.tsx       → /dashboard
    ├── administracion/
    │   ├── clientes.tsx    → /dashboard/administracion/clientes
    │   └── contratos.tsx   → /dashboard/administracion/contratos
    └── mantencion/
        └── tarifas.tsx     → /dashboard/mantencion/tarifas
```

### Estructura de una Ruta

```typescript
// app/routes/dashboard/modulo/ruta.tsx
import type { Route } from './+types/ruta';

// Metadata SEO
export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Título de la página' },
    { name: 'description', content: 'Descripción' }
  ];
}

// Loader: carga datos antes de renderizar
export async function clientLoader() {
  const { data, error } = await miServicio.getDatos();

  if (error || !data) {
    throw new Response('Error al cargar', { status: 500 });
  }

  return { datos: data };
}

// Componente principal
export default function MiRuta({ loaderData }: Route.ComponentProps) {
  const { datos } = loaderData;

  return <MiComponente datos={datos} />;
}

// Fallback durante hidration
export function hydrateFallback() {
  return <LoadingSpinner />;
}
```

### Loaders vs Client-side Fetching

**Usa `clientLoader` cuando**:

- Los datos se necesitan antes de renderizar
- Quieres aprovechar el caching de React Router
- Los datos son críticos para la ruta

**Usa fetching en componente cuando**:

- Los datos son opcionales o secundarios
- Necesitas refetch por acciones del usuario
- Los datos se actualizan frecuentemente

---

## Componentes

### Organización de Componentes

Los componentes se organizan por módulo de negocio:

```
app/components/administracion/
├── clientes/
│   ├── clientes-component.tsx      # Componente principal
│   ├── columns.tsx                 # Definición de columnas de tabla
│   ├── client-filters.tsx          # Filtros
│   ├── filter-summary.tsx          # Resumen de filtros aplicados
│   ├── detalles-cliente.tsx        # Modal de detalles
│   └── form/
│       ├── crear-cliente-component.tsx
│       └── editar-cliente-component.tsx
```

### Patrón de Componentes de Módulo

Cada vista de módulo típicamente tiene:

1. **Main Component**: Componente orquestador
2. **Columns Definition**: Configuración TanStack Table
3. **Filters**: Componente de filtros
4. **Filter Summary**: Chips con filtros activos
5. **Details Modal**: Modal con detalles completos
6. **Form Components**: Formularios de creación/edición

### Componentes Base (UI)

**Ubicación**: `app/components/ui/`

Componentes reutilizables basados en Radix UI + Tailwind:

- `button.tsx`
- `input.tsx`
- `dialog.tsx`
- `table.tsx`
- `select.tsx`
- etc.

Estos siguen el patrón **shadcn/ui**: componentes copiados en el proyecto (no NPM package) para máxima flexibilidad.

---

## Formularios y Validación

### Patrón de Formularios

**Stack**: React Hook Form + Zod

```typescript
// 1. Schema Zod
const formSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido')
});

type FormData = z.infer<typeof formSchema>;

// 2. Hook Form
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    nombre: '',
    email: ''
  }
});

// 3. Submit Handler
const onSubmit = async (data: FormData) => {
  const { data: result, error } = await miServicio.crear(data);

  if (error) {
    toast.error(error);
    return;
  }

  toast.success('Creado exitosamente');
  onClose();
};

// 4. Form JSX
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="nombre"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nombre</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Guardar</Button>
  </form>
</Form>
```

### Validaciones Comunes

- **RUT Chileno**: `rut.js` library
- **Emails**: Zod `z.string().email()`
- **Fechas**: `@internationalized/date`
- **Números**: `z.number().min().max()`
- **Custom**: Zod `refine()` y `superRefine()`

---

## Manejo de Errores

### Estrategia de Manejo de Errores

#### 1. **Axios Interceptor** (Global)

Maneja errores HTTP automáticamente con toasts.

#### 2. **Try-Catch en Servicios**

Cada método de servicio captura errores y retorna `{ data: null, error: string }`.

#### 3. **Loader Error Boundaries**

Si un loader falla, React Router muestra error boundary.

#### 4. **Component Error Boundaries**

Componente `ErrorBoundary` captura errores de renderizado.

#### 5. **Form Validation Errors**

React Hook Form + Zod muestran errores inline.

### Toast Notifications

**Librería**: Sonner

```typescript
import { toast } from 'sonner';

// Success
toast.success('Operación exitosa');

// Error
toast.error('Ha ocurrido un error');

// Warning
toast.warning('Atención');

// Info
toast.info('Información');
```

---

## Patrones y Convenciones

### Naming Conventions

- **Componentes**: PascalCase (`MiComponente.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useAuth.ts`)
- **Servicios**: camelCase con sufijo `Service` (`miServicio.ts`)
- **Types**: PascalCase (`MiTipo.ts`)
- **Utils**: camelCase (`mi-util.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`MI_CONSTANTE`)

### Import Order

Ordenado automáticamente por Prettier:

1. External packages
2. Internal aliases (`~/...`)
3. Relative imports
4. Types
5. Styles

### TypeScript Strict Mode

El proyecto usa `"strict": true` en `tsconfig.json`:

- `noImplicitAny`: true
- `strictNullChecks`: true
- `strictFunctionTypes`: true
- etc.

### Code Style

- **ESLint**: Configuración basada en Airbnb + TypeScript
- **Prettier**: Formateo automático
- **Unused Imports**: Plugin para remover imports no usados
- **Husky**: Pre-commit hooks

### Performance

- **React.memo**: Para componentes pesados que no cambian
- **useMemo**: Para cálculos costosos
- **useCallback**: Para funciones pasadas como props
- **Lazy loading**: Para rutas grandes (opcional)

---

## Testing

⚠️ **PENDIENTE**: El proyecto actualmente no tiene tests configurados.

**Recomendaciones futuras**:

- **Vitest** para unit tests
- **Testing Library** para component tests
- **Playwright** o **Cypress** para E2E tests

---

## Build y Deployment

Ver [DEPLOY-README.md](./DEPLOY-README.md) para instrucciones completas.

### Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Inicia dev server

# Build
pnpm build            # Build para producción
pnpm start            # Inicia servidor de producción

# Quality
pnpm typecheck        # Verifica tipos
pnpm lint             # Ejecuta ESLint
pnpm lint:fix         # Fix automático
pnpm format           # Formatea con Prettier
pnpm format:check     # Verifica formato

# CI
pnpm ci               # typecheck + lint + build
```

### Variables de Entorno

```bash
VITE_API_URL=http://localhost:4200/api
```

---

## Contribución

Ver [CLAUDE.md](./CLAUDE.md) para guías específicas de desarrollo con Claude Code.

### Workflow Recomendado

1. Crear branch desde `develop`
2. Hacer cambios siguiendo convenciones
3. Ejecutar `pnpm ci` antes de commit
4. Crear PR hacia `develop`
5. Merge a `main` para deploy

---

## Referencias

- [React Router 7 Docs](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://radix-ui.com)
- [Shadcn/ui](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [TanStack Table](https://tanstack.com/table)
