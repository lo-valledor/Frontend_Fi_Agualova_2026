# Sistema de Permisos y Roles

Este documento explica cómo funciona el sistema de permisos basado en roles implementado en la aplicación.

## Arquitectura

El sistema de permisos está compuesto por:

1. **AuthContext** - Maneja la autenticación y carga los permisos del usuario
2. **PermissionGuard** - Protege rutas basándose en permisos
3. **PermissionButton** - Controla acciones (crear, editar, eliminar) según permisos
4. **PermissionWrapper** - Muestra/oculta contenido según permisos
5. **Sidebar filtrado** - Solo muestra menús a los que el usuario tiene acceso

## Estructura de Permisos

Cada permiso tiene la siguiente estructura:

```typescript
interface PermisosUsuario {
  idMenu: number;
  nombreMenu: string;
  ruta: string;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
}
```

## Uso del Sistema

### 1. Verificar permisos en el AuthContext

El AuthContext proporciona funciones helper para verificar permisos:

```typescript
import { useAuth } from '~/context/AuthContext';

function MyComponent() {
  const { permissions, canView, canCreate, canEdit, canDelete } = useAuth();

  // Verificar si puede ver una ruta específica
  const canViewContratos = canView('/dashboard/administracion/contratos');

  // Verificar si puede crear en la ruta actual
  const canCreateHere = canCreate(location.pathname);

  return (
    <div>
      {canViewContratos && <Link to="/dashboard/administracion/contratos">Ver Contratos</Link>}
      {canCreateHere && <Button>Crear</Button>}
    </div>
  );
}
```

### 2. Proteger rutas con PermissionGuard

Usa `PermissionGuard` para proteger rutas enteras:

```typescript
import { PermissionGuard } from '~/components/guards';

function MiRutaProtegida() {
  return (
    <PermissionGuard
      requiredPermission="view"
      fallbackPath="/dashboard"
    >
      <div>Contenido protegido</div>
    </PermissionGuard>
  );
}
```

### 3. Controlar acciones con PermissionButton

Usa `PermissionButton` para botones que requieren permisos específicos:

```typescript
import { PermissionButton } from '~/components/guards';

function MyComponent() {
  return (
    <div>
      {/* Se deshabilita automáticamente si no tiene permiso de crear */}
      <PermissionButton
        requiredPermission="create"
        onClick={handleCreate}
      >
        Crear Nuevo
      </PermissionButton>

      {/* Se oculta si no tiene permiso de eliminar */}
      <PermissionButton
        requiredPermission="delete"
        hideIfNoPermission
        onClick={handleDelete}
        variant="destructive"
      >
        Eliminar
      </PermissionButton>
    </div>
  );
}
```

### 4. Mostrar/Ocultar contenido con PermissionWrapper

```typescript
import { PermissionWrapper } from '~/components/guards';

function MyComponent() {
  return (
    <div>
      <PermissionWrapper
        requiredPermission="edit"
        fallback={<p>No tienes permisos para editar</p>}
      >
        <EditForm />
      </PermissionWrapper>
    </div>
  );
}
```

### 5. Hook usePermissionCheck

Para verificaciones más complejas:

```typescript
import { usePermissionCheck } from '~/components/guards';

function MyComponent() {
  const { permission, canView, canCreate, canEdit, canDelete } = usePermissionCheck();

  return (
    <div>
      {canView && <DataTable />}
      {canCreate && <CreateButton />}
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
    </div>
  );
}
```

## Sidebar Automático

El sidebar filtra automáticamente los menús basándose en los permisos del usuario. No necesitas hacer nada adicional; el componente `AppSidebar` ya está configurado para:

1. Cargar permisos cuando el usuario inicia sesión
2. Filtrar menús que el usuario no puede ver
3. Mostrar solo las opciones permitidas

## API Endpoint

Los permisos se obtienen del endpoint:

```
GET /Enerlova/ObtenerPermisoUsuario/{codigoUsuario}
```

Respuesta:
```json
[
  {
    "idMenu": 1,
    "nombreMenu": "Monitor Lecturas",
    "ruta": "/dashboard/monitor/monitor-lecturas",
    "puedeVer": true,
    "puedeCrear": true,
    "puedeEditar": true,
    "puedeEliminar": true
  }
]
```

## Flujo de Carga de Permisos

1. Usuario inicia sesión
2. Se decodifica el token JWT
3. Se carga el ID del usuario del token
4. Se llama al endpoint `/ObtenerPermisoUsuario/{userId}`
5. Los permisos se almacenan en el AuthContext
6. El sidebar se filtra automáticamente
7. Los componentes pueden verificar permisos según sea necesario

## Mejores Prácticas

1. **Siempre verifica permisos en el backend** - Los permisos del frontend son solo para UX, no para seguridad
2. **Usa PermissionButton para acciones** - Mejora la experiencia del usuario deshabilitando botones
3. **Oculta elementos sensibles** - Usa `hideIfNoPermission` para elementos que no deben ser visibles
4. **Maneja estados de carga** - El `permissionsLoading` te indica si los permisos están cargando
5. **Rutas protegidas** - Considera usar PermissionGuard en rutas críticas

## Ejemplo Completo

```typescript
import { useAuth } from '~/context/AuthContext';
import { PermissionButton, PermissionWrapper, usePermissionCheck } from '~/components/guards';

function ContratosPage() {
  const { permissionsLoading } = useAuth();
  const { canCreate, canEdit, canDelete } = usePermissionCheck();

  if (permissionsLoading) {
    return <div>Cargando permisos...</div>;
  }

  return (
    <div>
      <h1>Gestión de Contratos</h1>

      {/* Botón que se deshabilita si no puede crear */}
      <PermissionButton
        requiredPermission="create"
        onClick={handleCreate}
      >
        Nuevo Contrato
      </PermissionButton>

      {/* Tabla que solo muestra acciones permitidas */}
      <DataTable
        data={contratos}
        actions={(row) => (
          <>
            {canEdit && <EditButton onClick={() => handleEdit(row)} />}
            {canDelete && <DeleteButton onClick={() => handleDelete(row)} />}
          </>
        )}
      />

      {/* Sección que se oculta si no puede editar */}
      <PermissionWrapper requiredPermission="edit">
        <ConfigurationPanel />
      </PermissionWrapper>
    </div>
  );
}
```

## Solución de Problemas

### Los permisos no se cargan
- Verifica que el usuario esté autenticado
- Revisa la consola para errores del API
- Confirma que el endpoint devuelve datos correctos

### El sidebar no se filtra
- Asegúrate de que las rutas en el sidebar coincidan exactamente con las del API
- Verifica que `permissions` no esté vacío en AuthContext

### Los botones no se deshabilitan
- Confirma que estás usando `PermissionButton` en lugar de `Button`
- Verifica que la ruta actual tenga permisos configurados
