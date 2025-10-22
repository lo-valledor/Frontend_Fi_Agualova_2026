# Sistema de Permisos en la UI

## Descripción General

Este documento describe cómo funciona el sistema de permisos en la interfaz de usuario de la aplicación Enerlova. El sistema controla qué elementos del menú son visibles y qué acciones (crear, editar, eliminar) están disponibles para cada usuario según sus permisos asignados.

## Arquitectura

### Flujo de Permisos

1. **Carga Inicial**: Al iniciar sesión, `AuthContext` carga los permisos del usuario desde la API
2. **Verificación**: Los componentes verifican permisos usando hooks o el contexto directamente
3. **Renderizado Condicional**: Los elementos se muestran/ocultan/deshabilitan según los permisos

```
Usuario → Login → AuthContext carga permisos → Componentes verifican → UI se ajusta
```

### Componentes Principales

#### 1. AuthContext (`app/context/AuthContext.tsx`)

Proporciona el contexto global de autenticación y permisos:

```typescript
interface AuthContextType {
  user: UserData | null;
  permissions: PermisosUsuario[];
  hasPermission: (ruta: string) => boolean;
  canView: (ruta: string) => boolean;
  canCreate: (ruta: string) => boolean;
  canEdit: (ruta: string) => boolean;
  canDelete: (ruta: string) => boolean;
  // ... otros métodos
}
```

#### 2. Hook usePermissions (`app/hooks/use-permissions.ts`)

Hook simplificado para verificar permisos en una ruta específica:

```typescript
const { canView, canCreate, canEdit, canDelete } = usePermissions(
  '/dashboard/monitor/monitor-lecturas'
);
```

#### 3. PermissionButton (`app/components/shared/permission-button.tsx`)

Componente de botón que verifica permisos automáticamente:

```typescript
<PermissionButton
  route="/dashboard/monitor/monitor-lecturas"
  requiredPermission="create"
  onClick={handleCreate}
>
  Crear Nuevo
</PermissionButton>
```

## Uso en Componentes

### Verificar Permisos de Vista

Para controlar si un usuario puede ver una página completa:

```typescript
import { useAuth } from '~/context/AuthContext';

function MyComponent() {
  const { canView } = useAuth();

  if (!canView('/dashboard/monitor/monitor-lecturas')) {
    return <AccessDenied />;
  }

  return <div>Contenido de la página</div>;
}
```

### Controlar Botones de Acción

#### Opción 1: Usando PermissionButton (Recomendado)

```typescript
import { PermissionButton } from '~/components/shared/permission-button';

function MyComponent() {
  return (
    <PermissionButton
      route="/dashboard/operaciones/revisar-precio"
      requiredPermission="edit"
      onClick={handleEdit}
    >
      Editar Precio
    </PermissionButton>
  );
}
```

#### Opción 2: Usando useAuth directamente

```typescript
import { useAuth } from '~/context/AuthContext';
import { Button } from '~/components/ui/button';

function MyComponent() {
  const { canEdit } = useAuth();

  return (
    <Button
      disabled={!canEdit('/dashboard/operaciones/revisar-precio')}
      onClick={handleEdit}
    >
      Editar Precio
    </Button>
  );
}
```

### Filtrar Elementos del Menú

El sidebar ya filtra automáticamente los elementos según el permiso `canView`:

```typescript
// app/components/sidebar/app-sidebar.tsx
const filteredNavMain = useMemo(() => {
  return data.navMain.map(section => {
    const filteredItems = section.items.filter(
      item => canView(item.url) // Solo mostrar si tiene permiso
    );
    // ...
  });
}, [canView]);
```

## Ejemplos Prácticos

### Ejemplo 1: Página con Múltiples Acciones

```typescript
import { useAuth } from '~/context/AuthContext';
import { PermissionButton } from '~/components/shared/permission-button';

function UsuariosPage() {
  const { canView } = useAuth();
  const route = '/dashboard/administracion/usuarios';

  if (!canView(route)) {
    return <AccessDenied />;
  }

  return (
    <div>
      <h1>Usuarios</h1>

      {/* Botón Crear */}
      <PermissionButton
        route={route}
        requiredPermission="create"
        onClick={handleCreate}
      >
        Nuevo Usuario
      </PermissionButton>

      {/* Tabla con acciones */}
      <UsersTable
        onEdit={handleEdit}
        onDelete={handleDelete}
        route={route}
      />
    </div>
  );
}
```

### Ejemplo 2: Botón con Tooltip Personalizado

```typescript
import { useAuth } from '~/context/AuthContext';
import { Button } from '~/components/ui/button';
import { Tooltip } from '~/components/ui/tooltip';

function MyComponent() {
  const { canCreate } = useAuth();
  const hasPermission = canCreate('/dashboard/operaciones/periodo-facturacion');

  return (
    <Tooltip>
      <TooltipTrigger>
        <Button disabled={!hasPermission}>
          Crear Período
        </Button>
      </TooltipTrigger>
      {!hasPermission && (
        <TooltipContent>
          No tiene permisos para crear períodos de facturación
        </TooltipContent>
      )}
    </Tooltip>
  );
}
```

### Ejemplo 3: Ocultar vs Deshabilitar

```typescript
// Ocultar completamente (bueno para menús y listas)
<PermissionButton
  route="/dashboard/monitor/monitor-lecturas"
  requiredPermission="create"
  hideWhenDisabled={true}  // No renderiza nada si no tiene permiso
  onClick={handleCreate}
>
  Crear
</PermissionButton>

// Deshabilitar con tooltip (bueno para formularios)
<PermissionButton
  route="/dashboard/monitor/monitor-lecturas"
  requiredPermission="edit"
  hideWhenDisabled={false}  // Muestra deshabilitado con tooltip
  onClick={handleEdit}
>
  Editar
</PermissionButton>
```

### Ejemplo 4: Permisos en Componentes Reutilizables

```typescript
// Componente que recibe el estado de permisos desde el padre
interface ComponentProps {
  onClose: () => void;
  disabled?: boolean;
}

function MyComponent({ onClose, disabled }: ComponentProps) {
  const { canDelete } = useAuth();
  const hasPermission = canDelete('/dashboard/operaciones/periodo-facturacion');

  return (
    <Button
      onClick={onClose}
      disabled={disabled || !hasPermission}
      title={!hasPermission ? 'No tiene permisos para esta acción' : ''}
    >
      Cerrar Periodo
    </Button>
  );
}

// Uso desde el padre
function ParentComponent() {
  const { canDelete } = useAuth();

  return (
    <MyComponent
      onClose={handleClose}
      disabled={!canDelete('/dashboard/operaciones/periodo-facturacion')}
    />
  );
}
```

## Utilidades Disponibles

### permission-utils.ts

```typescript
import {
  getPermissionMessage,
  logPermissionCheck
} from '~/utils/permission-utils';

// Obtener mensaje estándar
const message = getPermissionMessage('create');
// "No tiene permisos para crear"

// Log de debugging (solo en desarrollo)
logPermissionCheck('/dashboard/monitor/monitor-lecturas', {
  canView: true,
  canCreate: false,
  canEdit: false,
  canDelete: false
});
```

## Mejores Prácticas

### ✅ Hacer

1. **Siempre verificar permisos de vista en páginas protegidas**

   ```typescript
   if (!canView(route)) return <AccessDenied />;
   ```

2. **Usar PermissionButton para acciones simples**

   ```typescript
   <PermissionButton route={route} requiredPermission="create" />
   ```

3. **Combinar con otras validaciones**

   ```typescript
   disabled={!hasPermission || isLoading || !formValid}
   ```

4. **Proporcionar feedback claro al usuario**
   ```typescript
   title={!hasPermission ? 'No tiene permisos...' : ''}
   ```

### ❌ Evitar

1. **No verificar solo en el frontend**

   - El backend también debe verificar permisos
   - El frontend solo mejora UX

2. **No hardcodear permisos**

   ```typescript
   // ❌ Malo
   if (user.role === 'admin') { ... }

   // ✅ Bueno
   if (canEdit(route)) { ... }
   ```

3. **No duplicar lógica**
   - Usar hooks y componentes compartidos
   - No reimplementar verificaciones

## Debugging

### Ver Permisos en Consola (Desarrollo)

```typescript
import { logPermissionCheck } from '~/utils/permission-utils';

const permissions = usePermissions('/dashboard/monitor/monitor-lecturas');
logPermissionCheck('/dashboard/monitor/monitor-lecturas', permissions);
```

### Verificar Permisos en DevTools

1. Abrir React DevTools
2. Buscar `AuthContext.Provider`
3. Ver el estado `permissions`

### Logs del Sistema

El `AuthContext` ya incluye logs automáticos:

- `🔐 Cargando permisos para usuario: {id}`
- `✅ Permisos cargados: {data}`
- `❌ Error al cargar permisos: {error}`

## Rutas Implementadas

### Monitor

- `/dashboard/monitor/monitor-lecturas` - Ver, Crear

### Operaciones

- `/dashboard/operaciones/revisar-precio` - Ver, Crear (Autorización), Editar (Modificar Valores)
- `/dashboard/operaciones/periodo-facturacion` - Ver, Crear, Eliminar (Cerrar Periodo)
- `/dashboard/operaciones/precios-cargo` - Ver, Crear (Agregar Precios ENEL), Editar (Actualizar Valores Enerlova)
- `/dashboard/operaciones/preparar-lecturas` - Ver, Crear/Editar (Preparar y Seleccionar Lecturas)
- `/dashboard/operaciones/cerrar-lecturas` - Ver, Crear/Editar (Cerrar Lecturas)
- `/dashboard/operaciones/revisar-calculo-factura` - Ver, Crear/Editar (Aceptar Cálculos)
- `/dashboard/operaciones/cambio-medidor` - Ver, Editar (Búsqueda y Ejecutar Cambio de Medidor)
- `/dashboard/operaciones/corte-reposicion` - Ver, Crear (Iniciar), Editar (Actualizar y Acciones de Tabla), Eliminar (Finalizar)
- `/dashboard/operaciones/anular-factura-impresa` - Ver, Eliminar (Anular Factura)

### Administración

- `/dashboard/administracion/usuarios` - Ver, Crear, Editar, Eliminar
- `/dashboard/administracion/contratos` - Ver, Crear, Editar

## Agregar Permisos a Nuevos Componentes

### Checklist

1. ✅ Identificar la ruta del componente
2. ✅ Importar `useAuth` o `usePermissions`
3. ✅ Verificar permiso de vista (si aplica)
4. ✅ Aplicar permisos a botones de acción
5. ✅ Agregar tooltips informativos
6. ✅ Probar con diferentes roles

### Template Básico

```typescript
import { useAuth } from '~/context/AuthContext';
import { PermissionButton } from '~/components/shared/permission-button';

function NewComponent() {
  const { canView, canCreate, canEdit } = useAuth();
  const route = '/dashboard/nueva-seccion/nuevo-componente';

  // Verificar acceso a la vista
  if (!canView(route)) {
    return <AccessDenied />;
  }

  return (
    <div>
      <h1>Mi Componente</h1>

      {/* Botones con permisos */}
      <PermissionButton
        route={route}
        requiredPermission="create"
        onClick={handleCreate}
      >
        Crear
      </PermissionButton>

      <PermissionButton
        route={route}
        requiredPermission="edit"
        onClick={handleEdit}
      >
        Editar
      </PermissionButton>
    </div>
  );
}
```

## Soporte

Para preguntas o problemas con el sistema de permisos:

1. Revisar este documento
2. Verificar la implementación en componentes existentes
3. Revisar los logs en modo desarrollo
4. Contactar al equipo de desarrollo

## Changelog

### v1.0.4 - 2025-10-22

- **Cambio Medidor**: Control refinado desde el inicio
  - Editar: Deshabilita búsqueda de medidor antiguo (Paso 1) sin permiso
  - Inputs y botones de búsqueda bloqueados
- **Corte Reposición**: Control granular del proceso completo
  - Crear: Controla botón "Iniciar" proceso
  - Editar: Controla botón "Actualizar" y todas las acciones de tabla (Liberar, Registrar Corte, Solicitar Reposición)
  - Eliminar: Controla botón "Finalizar" proceso
  - Tooltips informativos en todos los botones de acción
- **Anular Factura Impresa**: Control de anulación
  - Eliminar: Controla botón "Anular Factura"
  - Tooltip informativo cuando no tiene permisos

### v1.0.3 - 2025-10-22

- **Cerrar Lecturas**: Control completo de permisos
  - Crear/Editar: Controla botón "Cerrar" en AlertCerrarLecturas
  - Deshabilita acción de cierre sin permisos
- **Revisar Cálculo Factura**: Control de aceptación de cálculos
  - Crear/Editar: Controla botón "Aceptar Cálculo"
  - Tooltip informativo cuando no tiene permisos
- **Cambio Medidor**: Control de ejecución de cambios
  - Editar: Controla botón "Confirmar Cambio"
  - Tooltip informativo cuando no tiene permisos

### v1.0.2 - 2025-10-22

- **Precios Cargo**: Agregado control de permisos
  - Crear: Habilita botón "Agregar Precios" en tabla ENEL
  - Editar: Habilita botón "Nuevo Valor" en tabla Enerlova
- **Revisar Precio**: Mejorado control de permisos
  - Crear: Control de autorización con contraseña
  - Editar: Control de modificación de valores en tablas
- **Preparar Lecturas**: Control completo de permisos
  - Crear/Editar: Controla selección de nichos y botón "Preparar Lecturas"
  - Deshabilita checkboxes sin permisos

### v1.0.1 - 2025-10-22

- Agregado permiso de eliminación para cerrar períodos de facturación
- Actualizado componente `CerrarPeriodo` para verificar permisos
- Ejemplo adicional de permisos en componentes reutilizables

### v1.0.0 - 2025-10-22

- Implementación inicial del sistema de permisos en UI
- Creación de hooks y componentes reutilizables
- Aplicación en Sidebar, Monitor de Lecturas y Operaciones
- Documentación completa
