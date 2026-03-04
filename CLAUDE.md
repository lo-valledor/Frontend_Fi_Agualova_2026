# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

**ENERLOVA RES** — Frontend SPA de gestión energética para Lo Valledor. Aplicación React 19 con React Router v7 (modo SPA, SSR desactivado), Tailwind CSS v4, y componentes shadcn/ui (estilo new-york).

## Comandos

```bash
pnpm install              # Instalar dependencias
pnpm dev                  # Servidor de desarrollo (http://localhost:5173)
pnpm build                # Build de producción
pnpm start                # Servir build de producción
pnpm test                 # Ejecutar tests (modo watch)
pnpm test:run             # Ejecutar tests una vez
pnpm test:ui              # Vitest UI (interfaz visual de tests en navegador)
pnpm test:coverage        # Tests con cobertura (v8, reporters: text/json/html/lcov)
pnpm vitest run app/utils/auth-utils.test.ts  # Test individual
pnpm lint                 # ESLint
pnpm lint:fix             # ESLint con auto-fix
pnpm format               # Prettier (formatear todos los archivos)
pnpm format:check         # Verificar formato sin modificar
pnpm typecheck            # Generar tipos de React Router (typegen) + tsc
pnpm ci                   # Pipeline completo: typecheck + lint + test + build
pnpm quality:check        # lint + typecheck + test con cobertura
pnpm build:analyze        # Build + visualizer de bundles (abre stats.html)
```

## Stack tecnológico

- **Runtime**: Node 22 (Alpine en Docker), pnpm
- **Framework**: React 19 + React Router v7 (SPA mode, `ssr: false` en `react-router.config.ts`)
- **Estilos**: Tailwind CSS v4 con plugin Vite (`@tailwindcss/vite`), tw-animate-css
- **Componentes UI**: shadcn/ui (Radix UI primitives, estilo `new-york`, `rsc: false`), lucide-react + @tabler/icons-react
- **Formularios**: react-hook-form + zod + @hookform/resolvers
- **Tablas**: @tanstack/react-table + @tanstack/react-virtual (virtualización)
- **Gráficos**: recharts
- **HTTP**: axios (instancia centralizada con interceptores en `services/axiosConfig.ts`)
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Command Palette**: cmdk
- **Paneles redimensionables**: react-resizable-panels
- **Select avanzado**: react-select (estilos custom en `components/shared/react-select-styles.tsx`)
- **Exportación**: xlsx (SheetJS desde CDN tgz), jspdf + jspdf-autotable
- **Animaciones**: motion (framer-motion), driver.js (tours interactivos)
- **Testing**: vitest + jsdom + @testing-library/react + msw
- **Linting**: ESLint 9 flat config + typescript-eslint + unused-imports + jsdoc
- **Formatting**: Prettier con plugin tailwindcss + sort-imports (single quotes, no trailing comma, `arrowParens: avoid`, `jsxSingleQuote: true` en TSX)
- **Git hooks**: husky

## Arquitectura

### Path alias

`~/` mapea a `./app/` (configurado en `tsconfig.json` y `vitest.config.ts`). Siempre importar con `~/`.

### Estructura app/

- **`routes.ts`** — Definición centralizada de todas las rutas (React Router v7 `RouteConfig`). Las rutas protegidas están envueltas en `layout('routes/protected-route.tsx')` → `layout('routes/dashboard/layout.tsx')`.
- **`root.tsx`** — Layout raíz con providers anidados: `LoadingBarProvider` > `ThemeProvider` > `BreadcrumbProvider` > `AuthProvider`. Carga CSS de UAT dinámicamente si el hostname NO es `enerlova.mmlovalledor.cl`.
- **`context/`** — `AuthContext` (JWT en localStorage, refresh automático, permisos RBAC), `BreadcrumbContext`, `LoadingBarContext`.
- **`services/`** — Ver sección "Capa de servicios" más abajo.
- **`components/ui/`** — Componentes shadcn/ui. No editar manualmente, usar: `pnpm dlx shadcn@latest add <componente>`.
- **`components/data-table/`** — DataTable genérica con TanStack Table, paginación avanzada y virtualización.
- **`components/guards/`** — `PermissionGuard` y `PermissionButton` para control RBAC en UI.
- **`components/shared/`** — Componentes reutilizables: `ModernHeader`, `ExportButton`, `PermissionButton`.
- **`hooks/`** — Custom hooks por dominio (`use-administracion`, `use-operaciones`, `use-monitor`, etc.) + hooks compartidos (`use-permissions`, `use-mobile`, `use-keyboard-shortcuts`).
- **`types/`** — Tipos TypeScript por dominio: `administracion.ts`, `operaciones.ts`, `monitor.ts`, `mantencion.ts`, `reportes.ts`, `roles-permisos.ts`.
- **`utils/export/`** — Sistema de exportación con builder pattern (`ExportColumnBuilder`), soporta CSV/Excel y PDF. Archivos: `column-builder.ts`, `csv-excel.ts`, `pdf-rendering.ts`, `formatters.ts`, `types.ts`.

### Capa de servicios

Los servicios están en transición de archivos monolíticos a módulos especializados en subdirectorios:

- **`services/core/`** — `base-service.ts` (`BaseApiService` clase base con `executeOperation`/`executeDataOperation`), `api-response.ts` (tipos `ServiceResponse<T>`, constructores `successResponse`/`errorResponse`), `api-processing.ts` (procesamiento de respuestas).
- **Subdirectorios refactorizados**: `administration/`, `operations/`, `reportes/`, `mantencion/`, `roles-permisos/`, `auto-insertion/`. Cada uno tiene su `index.ts` barrel, `types.ts`, y servicios especializados.
- **Archivos legacy** (raíz de `services/`): `administracionService.ts`, `operacionesService.ts`, etc. — coexisten con los refactorizados.
- **Barrel principal** (`services/index.ts`): exporta todo con aliases de backward-compatibility (e.g. `administracionService` → `administrationServices`).
- **Nuevos servicios** deben crearse en el subdirectorio correspondiente, extender `BaseApiService`, y usar `executeOperation`/`executeDataOperation` para manejo consistente de errores.

### axiosConfig.ts — Cliente HTTP

- En desarrollo (`import.meta.env.DEV`): usa baseURL `/api` → Vite lo proxea al backend (ver proxy en `vite.config.ts`).
- En producción: usa `VITE_API_URL` directamente.
- Interceptor request: auto-inject de `Bearer` token desde `localStorage`.
- Interceptor response: refresh automático en 401, manejo de errores por status code con toast (`sonner`). Rutas con errores esperados definidas en `EXPECTED_ERROR_ROUTES`.
- Instancia separada `refreshAxiosInstance` para evitar loops de interceptores.

### Proxy de desarrollo

En `vite.config.ts`, el proxy reescribe `/api` → `/Enerlova` en el backend target. La IP del backend está hardcodeada en el config — al cambiar de entorno de desarrollo, actualizar la propiedad `server.proxy['/api'].target`.

### Secciones del dashboard

Las rutas se organizan en módulos de negocio bajo `/dashboard/`:
- **monitor/** — Lecturas (ver, exportar, importar)
- **operaciones/** — Período facturación, precios, preparar/cerrar lecturas, cálculo facturas, SAP, corte/reposición, cambio medidor, anular factura
- **administracion/** — Usuarios, contratos, clientes, propietarios, contratantes, medidores, acometidas, cargos, condiciones contrato, cargo-tipo-contrato (con CRUD anidado)
- **mantencion/** — Zonas, sectores, nichos, empalmes, marcas, ciclos, claves, tipos contratos, conceptos, tarifas, parámetros
- **reportes/** — Consultar contrato (con vista detalle), resumen facturación, ver facturas
- **configuracion/** — Roles/permisos, permisos de usuarios

### Autenticación y permisos

- JWT almacenado en `localStorage` bajo la key `token`. Token decodificado con `jwt-decode`.
- `AuthContext` expone: `isAuthenticated`, `login`, `logout`, `hasPermission`, `canView`, `canCreate`, `canEdit`, `canDelete`.
- Los permisos se cargan desde API (`rolesPermisosService.getPermisosUsuario`) y se verifican por ruta.
- `ProtectedRoute` redirige a `/auth/login` si no autenticado. Sesión expirada redirige a `/session-expired`.

### Entornos CSS

- `app.css` — Producción (dominio `enerlova.mmlovalledor.cl`)
- `app.uat.css` — Se importa dinámicamente en `root.tsx` si el hostname NO es producción
- Plugin Vite `envCssPlugin` redirige `app.css` → `app.dev.css` cuando `VITE_ENV_MODE=development`

## Testing

- Configuración en `vitest.config.ts`: environment `jsdom`, globals habilitados.
- Setup file: `test/setup.ts` — provee mocks globales de `localStorage`, `matchMedia`, `IntersectionObserver`, y suprime `console.error`/`console.warn`.
- Archivos de test: `**/*.{test,spec}.{ts,tsx}`.
- Coverage: provider `v8`, excluye `node_modules/`, `build/`, config files, mock data.

## Convenciones

- ESLint requiere `unused-imports/no-unused-imports: error`. Variables no usadas prefijadas con `_`.
- `@typescript-eslint/no-explicit-any: off` — `any` está permitido.
- JSDoc requerido en clases, funciones y métodos (`jsdoc/require-description: warn`).
- Servicios API siguen el patrón `ServiceResponse<T>` con `{ data, error }` normalizado.
- Componentes UI de shadcn: `cn()` de `~/lib/utils` para merge de clases Tailwind.
- Temas: dark por defecto, toggle via `ThemeProvider` con `next-themes` (storageKey: `vite-ui-theme`).
- Build: code splitting manual en `vite.config.ts` separa chunks por vendor (react, ui, form, table, chart, icons, utils).

## Variables de entorno

- `VITE_API_URL` — URL del backend API (producción)
- `VITE_APP_ENV` — Entorno de la app (`development`/`production`)
- `VITE_ENV_MODE` — Controla CSS cargado (`development` → `app.dev.css`)
- En desarrollo local, el proxy de Vite maneja la conexión al backend; `VITE_API_URL` no se usa.

## Deploy

Docker multi-stage: build con Node 22 → servir con nginx. Docker Compose con variantes `dev`, `prod`, `test`, `multi`, `traefik-test`.
