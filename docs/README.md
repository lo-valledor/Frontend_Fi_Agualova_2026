# Documentación del Proyecto Enerlova Frontend

Índice central de toda la documentación del proyecto.

## 📖 Documentación Principal

### General
- **[README.md](../README.md)** - Introducción y setup inicial del proyecto
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Arquitectura completa del sistema
  - Stack tecnológico
  - Estructura de proyecto
  - Módulos de negocio (Administración, Mantención, Monitor, etc.)
  - Patrones y convenciones

### Desarrollo
- **[CLAUDE.md](../CLAUDE.md)** - Guía para trabajar con Claude Code
  - Comandos de desarrollo
  - Estructura del proyecto
  - Patrones arquitectónicos clave

- **[DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md)** - Guía completa de documentación
  - Cómo documentar código
  - Herramientas y plugins
  - Plantillas y ejemplos
  - Workflow de documentación

### Deployment
- **[DEPLOY-README.md](../DEPLOY-README.md)** - Guía de deployment y producción

---

## 📝 Plantillas de Documentación

Usa estas plantillas para mantener consistencia en la documentación:

### [SERVICE_TEMPLATE.md](./templates/SERVICE_TEMPLATE.md)
Plantilla para documentar servicios API
- Estructura básica
- JSDoc tags recomendados
- Ejemplos de CRUD
- Métodos con Promise.all
- Checklist de documentación

### [COMPONENT_TEMPLATE.md](./templates/COMPONENT_TEMPLATE.md)
Plantilla para documentar componentes React
- Componentes simples
- Componentes de módulo/vista
- Hooks personalizados
- Props complejos
- Ejemplos de uso

---

## 🗂️ Documentación por Módulo

### Administración
**Ubicación**: `app/components/administracion/`, `app/routes/dashboard/administracion/`

Gestión de entidades del negocio:
- Clientes, Propietarios, Contratantes
- Contratos y Medidores
- Acometidas y Condiciones de Contrato
- Cargos Facturables
- Usuarios del sistema

**Servicio**: `app/services/administracionService.ts`

### Mantención
**Ubicación**: `app/components/mantencion/`, `app/routes/dashboard/mantencion/`

Mantenimiento de catálogos del sistema:
- Ciclos de Facturación
- Claves, Conceptos, Empalmes
- Marcas, Nichos, Parámetros
- Sectores, Tarifas, Tipos de Contrato, Zonas

**Servicio**: `app/services/mantencionService.ts`
**Ejemplo documentado**: ✅ Ver para referencia

### Monitor
**Ubicación**: `app/components/monitor/`, `app/routes/dashboard/monitor/`

Monitoreo y visualización de lecturas:
- Monitor de Lecturas por medidor
- Exportación de datos

**Servicio**: `app/services/monitorService.ts`

### Operaciones
**Ubicación**: `app/components/operaciones/`, `app/routes/dashboard/operaciones/`

Procesos operacionales de facturación:
- Preparar y Cerrar Lecturas
- Períodos de Facturación
- Precios por Cargo
- Revisión de Cálculos y Precios
- Corte y Reposición

**Servicio**: `app/services/operacionesService.ts`

### Reportes
**Ubicación**: `app/components/reportes/`, `app/routes/dashboard/reportes/`

Generación de reportes:
- Consultar Contrato
- Resumen de Facturación

**Servicio**: `app/services/reportesService.ts`

### Configuración
**Ubicación**: `app/components/configuracion/`, `app/routes/dashboard/configuracion/`

Configuración del sistema:
- Roles y Permisos
- Menús

**Servicio**: `app/services/rolesPermisosService.ts`

---

## 🛠️ Componentes Base

### UI Components (`app/components/ui/`)
Componentes reutilizables basados en Radix UI + Tailwind (estilo shadcn/ui):
- Botones, Inputs, Selects
- Dialogs, Modals, Popovers
- Tables, Cards, Badges
- Tabs, Accordions, etc.

**Documentación**: Mínima (solo si tienen comportamiento especial)

### Data Table (`app/components/data-table/`)
Componentes para tablas con TanStack Table:
- `data-table.tsx` - Componente base
- `data-table-pagination.tsx` - Paginación
- `data-table-column-header.tsx` - Headers con sorting
- `table-helpers.tsx` - Utilidades

### Layout Components
- `app/components/sidebar/` - Sidebar y navegación
- `app/components/dashboard/` - Dashboard y métricas
- `app/components/breadcrumb-setter.tsx` - Breadcrumbs

---

## 🔧 Servicios y Utilidades

### Servicios (`app/services/`)
Capa de comunicación con API:

| Servicio | Módulo | Estado Docs |
|----------|--------|-------------|
| `administracionService.ts` | Administración | ⚠️ Parcial |
| `mantencionService.ts` | Mantención | ✅ Completo |
| `monitorService.ts` | Monitor | ⚠️ Parcial |
| `operacionesService.ts` | Operaciones | ⚠️ Parcial |
| `reportesService.ts` | Reportes | ⚠️ Parcial |
| `rolesPermisosService.ts` | Configuración | ⚠️ Parcial |
| `authService.ts` | Autenticación | ⚠️ Parcial |
| `userService.ts` | Usuario | ⚠️ Parcial |
| `axiosConfig.ts` | HTTP Config | ✅ Con comentarios |

**Ver ejemplo completo**: `app/services/mantencionService.ts`

### Utilidades (`app/utils/`)
- `auth-utils.ts` - Helpers de autenticación
- `export-utils.ts` - Exportación de datos (Excel, CSV)
- `format-utils.ts` - Formateo de datos

### Context Providers (`app/context/`)
- `AuthContext.tsx` - Contexto de autenticación
- `BreadcrumbContext.tsx` - Contexto de breadcrumbs
- `LoadingBarContext.tsx` - Barra de carga global

### Hooks Personalizados (`app/hooks/`)
- `useAuth.ts` - Hook de autenticación
- `useBreadcrumb.ts` - Hook de breadcrumbs
- `useLoadingBar.ts` - Hook de loading bar

**Estado**: ❌ Sin documentar (TODO)

---

## 🧪 Testing

⚠️ **PENDIENTE**: El proyecto actualmente no tiene tests configurados.

**Recomendaciones futuras**:
- **Vitest** para unit tests
- **Testing Library** para component tests
- **Playwright** o **Cypress** para E2E

---

## 📊 Estado de la Documentación

### Completitud por Categoría

| Categoría | Estado | Prioridad |
|-----------|--------|-----------|
| Arquitectura General | ✅ Completo | Alta |
| Servicios API | 🟡 20% | Alta |
| Componentes de Módulo | 🔴 10% | Media |
| Hooks Personalizados | 🔴 0% | Media |
| Utilidades | 🟡 30% | Baja |
| Componentes UI | ✅ No necesario | - |

### Próximos Pasos

1. **Fase 1 (Corto Plazo)**
   - [ ] Completar JSDoc en todos los servicios
   - [ ] Documentar hooks personalizados
   - [ ] Agregar ejemplos en utilidades clave

2. **Fase 2 (Mediano Plazo)**
   - [ ] Documentar componentes de módulo principales
   - [ ] Crear guías de formularios y validación
   - [ ] Documentar patrones de data fetching

3. **Fase 3 (Largo Plazo)**
   - [ ] Considerar Storybook para componentes UI
   - [ ] Configurar TypeDoc para docs HTML
   - [ ] Agregar diagramas de arquitectura

---

## 🔍 Búsqueda Rápida

### ¿Cómo implemento...?

- **Un nuevo servicio**: Ver [mantencionService.ts](../app/services/mantencionService.ts) + [SERVICE_TEMPLATE.md](./templates/SERVICE_TEMPLATE.md)
- **Una nueva ruta**: Ver [ARCHITECTURE.md](../ARCHITECTURE.md#gestión-de-rutas)
- **Un formulario con validación**: Ver [ARCHITECTURE.md](../ARCHITECTURE.md#formularios-y-validación)
- **Una tabla con filtros**: Ver componentes en `app/components/{modulo}/`
- **Autenticación**: Ver [ARCHITECTURE.md](../ARCHITECTURE.md#sistema-de-autenticación)

### ¿Dónde está...?

- **Configuración de axios**: `app/services/axiosConfig.ts`
- **Configuración de ESLint**: `eslint.config.js`
- **Configuración de TypeScript**: `tsconfig.json`
- **Configuración de Tailwind**: `tailwind.config.ts`
- **Scripts de build**: `package.json`

---

## 📞 Soporte

### Recursos Externos
- [React Router 7 Docs](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://radix-ui.com)
- [Shadcn/ui](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [TanStack Table](https://tanstack.com/table)

### Contribuir a la Documentación

Si encuentras documentación faltante, incorrecta o confusa:

1. **Crea un issue** describiendo el problema
2. **Propón una mejora** en un PR
3. **Sigue las plantillas** en `docs/templates/`
4. **Mantén consistencia** con docs existentes

---

## 📝 Changelog de Documentación

### 2025-01-13
- ✅ Creada arquitectura completa del sistema (ARCHITECTURE.md)
- ✅ Documentado completamente mantencionService.ts
- ✅ Creadas plantillas de servicios y componentes
- ✅ Configurado eslint-plugin-jsdoc
- ✅ Creada guía de documentación completa

### Próximas Actualizaciones
- [ ] Completar documentación de servicios restantes
- [ ] Documentar hooks personalizados
- [ ] Agregar diagramas de flujo
- [ ] Crear guías específicas por módulo

---

**Última actualización**: 2025-01-13
