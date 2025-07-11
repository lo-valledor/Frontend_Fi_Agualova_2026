# Sistema de Rastreo de Actividad de Usuarios

## Descripción

Este sistema permite rastrear y mostrar la actividad reciente de los usuarios en la aplicación sin necesidad de una tabla de logs en el backend. Utiliza el almacenamiento local del navegador para mantener un registro de las acciones realizadas por los usuarios.

## Características

- ✅ **Rastreo automático**: Registra automáticamente las acciones de los usuarios
- ✅ **Almacenamiento local**: Los datos se guardan en el navegador del usuario
- ✅ **Tiempo real**: Actualización automática cada 30 segundos
- ✅ **Exportación**: Permite exportar los datos de actividad
- ✅ **Filtros**: Filtrado por usuario, módulo y período de tiempo
- ✅ **Estadísticas**: Métricas detalladas de uso del sistema

## Componentes Principales

### 1. ActivityTracker (Servicio)

```typescript
// app/services/activityTracker.ts
export const activityTracker = new ActivityTracker();
```

**Funciones principales:**

- `logActivity()`: Registra una nueva actividad
- `getRecentActivities()`: Obtiene actividades recientes
- `getActivitySummary()`: Obtiene resumen de estadísticas
- `getUserStats()`: Obtiene estadísticas por usuario
- `exportActivities()`: Exporta datos en formato JSON

### 2. useActivityTracker (Hook)

```typescript
// app/hooks/useActivityTracker.ts
const { logActivity, getRecentActivities, getActivitySummary } =
  useActivityTracker();
```

### 3. useActivityEvent (Hook para eventos específicos)

```typescript
// app/components/activity-tracker-hoc.tsx
const { trackEvent, trackPageView, trackFormAction, trackDataAction } =
  useActivityEvent();
```

## Cómo Usar

### 1. Rastreo Básico de Actividad

```typescript
import { useActivityEvent } from '~/components/activity-tracker-hoc';

function MiComponente() {
  const { trackDataAction } = useActivityEvent();

  const handleCrearCliente = () => {
    // Lógica de creación
    trackDataAction('Crear', 'Clientes', 'Cliente creado exitosamente');
  };

  const handleEditarCliente = (clienteId: string) => {
    // Lógica de edición
    trackDataAction('Editar', 'Clientes', `Cliente ${clienteId} editado`);
  };
}
```

### 2. Rastreo de Navegación

```typescript
import { useActivityEvent } from '~/components/activity-tracker-hoc';

function MiPagina() {
  const { trackPageView } = useActivityEvent();

  useEffect(() => {
    trackPageView('Gestión de Clientes');
  }, [trackPageView]);
}
```

### 3. Rastreo de Formularios

```typescript
import { useActivityEvent } from '~/components/activity-tracker-hoc';

function MiFormulario() {
  const { trackFormAction } = useActivityEvent();

  const handleSubmit = (data: any) => {
    // Lógica de envío
    trackFormAction(
      'Enviar',
      'Formulario Cliente',
      `Datos: ${JSON.stringify(data)}`,
    );
  };
}
```

### 4. Mostrar Actividad Reciente

```typescript
import { RecentActivity } from '~/components/dashboard/recent-activity';

function Dashboard() {
  return (
    <RecentActivity
      limit={10}
      showUserInfo={true}
      refreshInterval={30000}
    />
  );
}
```

### 5. Mostrar Estadísticas

```typescript
import { ActivityStats } from '~/components/dashboard/activity-stats';

function AnalyticsPage() {
  return (
    <ActivityStats refreshInterval={60000} />
  );
}
```

## Tipos de Actividad Rastreados

### Acciones Automáticas

- **Navegación**: Visitas a páginas
- **Formularios**: Apertura, envío y cancelación
- **Operaciones CRUD**: Crear, leer, actualizar, eliminar
- **Búsquedas**: Consultas y filtros
- **Exportaciones**: Descarga de datos

### Acciones Personalizadas

- **Eventos específicos**: Cualquier acción que quieras rastrear
- **Métricas de negocio**: Actividades relevantes para el negocio
- **Errores**: Intentos fallidos de operaciones

## Estructura de Datos

```typescript
interface UserActivity {
  id: string;
  userId: string;
  username: string;
  action: string;
  module: string;
  timestamp: number;
  details?: string;
  ipAddress?: string;
}
```

## Configuración

### Límites de Almacenamiento

- **Máximo de actividades**: 1000 registros
- **Retención**: 30 días
- **Limpieza automática**: Se ejecuta al cargar el módulo

### Intervalos de Actualización

- **Actividad reciente**: 30 segundos
- **Estadísticas**: 60 segundos
- **Configurable**: Cada componente puede tener su propio intervalo

## Páginas Disponibles

### 1. Dashboard Principal

- Muestra actividad reciente en el dashboard principal
- Componente: `RecentActivity`

### 2. Análisis de Actividad

- URL: `/dashboard/activity-analytics`
- Página dedicada con estadísticas detalladas
- Componentes: `ActivityStats`, `RecentActivity`

## Ventajas del Sistema

### ✅ Sin Backend

- No requiere cambios en la base de datos
- No necesita APIs adicionales
- Implementación rápida y sencilla

### ✅ Privacidad

- Los datos se mantienen en el navegador del usuario
- No se envían al servidor
- Cumple con regulaciones de privacidad

### ✅ Rendimiento

- No hay llamadas al servidor para logging
- Actualización en tiempo real
- Interfaz responsiva y fluida

### ✅ Flexibilidad

- Fácil de personalizar
- Se puede extender con nuevas funcionalidades
- Compatible con cualquier tipo de aplicación

## Limitaciones

### ❌ Persistencia

- Los datos se pierden al limpiar el navegador
- No se sincronizan entre dispositivos
- No hay backup automático

### ❌ Alcance

- Solo rastrea actividad en el frontend
- No captura errores del servidor
- No registra actividad de otros usuarios

### ❌ Análisis Avanzado

- Análisis limitado a datos locales
- No hay correlación entre usuarios
- No hay métricas de rendimiento del servidor

## Mejoras Futuras

### 🔮 Sincronización

- Integración con backend para persistencia
- Sincronización entre dispositivos
- Backup automático de datos

### 🔮 Análisis Avanzado

- Machine learning para detectar patrones
- Predicción de uso del sistema
- Recomendaciones personalizadas

### 🔮 Integración

- Webhooks para notificaciones
- APIs para exportación
- Integración con herramientas de analytics

## Ejemplos de Uso

### Ejemplo 1: Rastreo en Componente de Clientes

```typescript
// app/components/administracion/clientes/clientes-component.tsx
import { useActivityEvent } from '~/components/activity-tracker-hoc';

export default function ClientesComponent() {
  const { trackPageView, trackDataAction } = useActivityEvent();

  useEffect(() => {
    trackPageView('Gestión de Clientes');
  }, [trackPageView]);

  const handleAddCliente = () => {
    trackDataAction('Abrir formulario', 'Clientes', 'Crear nuevo cliente');
    // Lógica del componente
  };

  const handleEditCliente = (cliente: any) => {
    trackDataAction(
      'Abrir formulario',
      'Clientes',
      `Editar cliente: ${cliente.rut}`,
    );
    // Lógica del componente
  };
}
```

### Ejemplo 2: Rastreo en Formularios

```typescript
// app/components/administracion/clientes/cliente-form-modal.tsx
import { useActivityEvent } from '~/components/activity-tracker-hoc';

export default function ClienteFormModal() {
  const { trackFormAction } = useActivityEvent();

  const handleSubmit = (data: any) => {
    trackFormAction('Enviar', 'Formulario Cliente', `Cliente: ${data.rut}`);
    // Lógica de envío
  };

  const handleCancel = () => {
    trackFormAction('Cancelar', 'Formulario Cliente', 'Formulario cancelado');
    // Lógica de cancelación
  };
}
```

## Troubleshooting

### Problema: No se registran actividades

**Solución:**

1. Verificar que el usuario esté autenticado
2. Revisar la consola del navegador para errores
3. Confirmar que localStorage esté habilitado

### Problema: Datos no se actualizan

**Solución:**

1. Verificar el intervalo de actualización
2. Revisar que el componente esté montado
3. Confirmar que no haya errores en el hook

### Problema: Rendimiento lento

**Solución:**

1. Reducir el número máximo de actividades
2. Aumentar el intervalo de limpieza
3. Optimizar los filtros de búsqueda

## Contribución

Para agregar nuevas funcionalidades al sistema de rastreo:

1. **Nuevos tipos de actividad**: Agregar en `activityTracker.ts`
2. **Nuevos componentes**: Crear en `components/dashboard/`
3. **Nuevos hooks**: Agregar en `hooks/` o `components/`
4. **Documentación**: Actualizar este archivo

## Licencia

Este sistema es parte del proyecto Enerlova y está sujeto a los mismos términos de licencia.
