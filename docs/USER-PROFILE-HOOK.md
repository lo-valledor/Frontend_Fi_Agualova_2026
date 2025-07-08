# Hook de Perfil de Usuario - Solución 4

## Descripción

El hook `useUserProfileSimple` es la solución más práctica para obtener los datos del perfil de usuario usando el ID del token JWT, sin necesidad de un endpoint específico por ID.

## Características

✅ **Sin endpoint específico**: Usa `/usuarios` y filtra por ID
✅ **Caché inteligente**: 10 minutos de duración
✅ **Fallback robusto**: Datos simulados si falla la API
✅ **Manejo de errores**: Gestión completa
✅ **Actualización manual**: Permite refrescar datos
✅ **Tipado completo**: TypeScript en todas las interfaces

## Instalación

Los archivos ya están creados:
- `app/services/userService.ts` - Servicio de usuario
- `app/hooks/use-user-profile-simple.ts` - Hook principal
- `app/components/user-profile-test.tsx` - Componente de prueba

## Uso Básico

```typescript
import { useUserProfileSimple } from '~/hooks/use-user-profile-simple';

function MiComponente() {
  const { userData, isLoading, error, refreshProfile, clearCache } = useUserProfileSimple();

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!userData) return <div>No hay datos</div>;

  return (
    <div>
      <h1>Hola {userData.nombres} {userData.apellidos}</h1>
      <p>Usuario: {userData.nombreDeUsuario}</p>
      <p>Departamento: {userData.departamento}</p>
      <button onClick={refreshProfile}>Actualizar</button>
    </div>
  );
}
```

## API del Hook

### Retorno

```typescript
interface UseUserProfileSimpleReturn {
  userData: Usuarios | null;           // Datos del usuario
  isLoading: boolean;                  // Estado de carga
  error: string | null;                // Error si existe
  updateProfile: (data: ActualizarUsuarioProps) => Promise<void>;  // Actualizar perfil
  refreshProfile: () => Promise<void>; // Refrescar datos
  clearCache: () => void;              // Limpiar caché
}
```

### Datos del Usuario

```typescript
interface Usuarios {
  idUsuario: number;        // ID del usuario
  nombreDeUsuario: string;  // Nombre de usuario
  perfilId: number;         // ID del perfil
  nombres: string;          // Nombres
  apellidos: string;        // Apellidos
  departamento: number;     // Departamento
  activo: boolean;          // Estado activo
  fechaCreacion: string;    // Fecha de creación
}
```

## Funciones Disponibles

### 1. `userData`
Datos del usuario obtenidos del servidor o simulados.

### 2. `isLoading`
Indica si se están cargando los datos.

### 3. `error`
Mensaje de error si algo falló.

### 4. `refreshProfile()`
Actualiza los datos del usuario (fuerza nueva llamada a la API).

### 5. `clearCache()`
Limpia el caché del servicio.

### 6. `updateProfile(data)`
Actualiza el perfil del usuario.

## Ejemplos de Uso

### Ejemplo 1: Mostrar Información Básica

```typescript
function UserInfo() {
  const { userData, isLoading } = useUserProfileSimple();

  if (isLoading) return <div>Cargando...</div>;
  if (!userData) return <div>No hay datos</div>;

  return (
    <div>
      <h2>{userData.nombres} {userData.apellidos}</h2>
      <p>@{userData.nombreDeUsuario}</p>
      <p>Departamento: {userData.departamento}</p>
    </div>
  );
}
```

### Ejemplo 2: Formulario de Edición

```typescript
function EditProfile() {
  const { userData, updateProfile, isLoading } = useUserProfileSimple();
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    nombreDeUsuario: '',
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        nombreDeUsuario: userData.nombreDeUsuario,
      });
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        ...formData,
        contrasena: '', // Campo requerido
        departamento: userData?.departamento || 1,
        activo: userData?.activo || true,
      });
      alert('Perfil actualizado');
    } catch (error) {
      alert('Error al actualizar');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.nombres}
        onChange={(e) => setFormData({...formData, nombres: e.target.value})}
        placeholder="Nombres"
      />
      <input
        value={formData.apellidos}
        onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
        placeholder="Apellidos"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}
```

### Ejemplo 3: Componente con Manejo de Errores

```typescript
function UserProfile() {
  const { userData, isLoading, error, refreshProfile } = useUserProfileSimple();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando perfil...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-medium">Error al cargar perfil</h3>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={refreshProfile}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">No hay datos de usuario disponibles</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border rounded-lg">
      <h2 className="text-xl font-bold">{userData.nombres} {userData.apellidos}</h2>
      <p className="text-gray-600">@{userData.nombreDeUsuario}</p>
      <p className="text-sm text-gray-500">
        Departamento: {userData.departamento} |
        Estado: {userData.activo ? 'Activo' : 'Inactivo'}
      </p>
    </div>
  );
}
```

## Cómo Funciona

### 1. Obtención de Datos
1. Obtiene el ID del usuario del token JWT
2. Llama al endpoint `/usuarios` para obtener todos los usuarios
3. Filtra por el ID del usuario actual
4. Si encuentra el usuario, lo devuelve
5. Si no lo encuentra, crea datos simulados basados en el token

### 2. Caché
- Los datos se almacenan en caché por 10 minutos
- Evita llamadas repetidas a la API
- Se puede limpiar manualmente con `clearCache()`

### 3. Fallback
Si la API falla o no encuentra el usuario:
- Crea datos simulados usando la información del token
- Mantiene la funcionalidad de la aplicación
- Registra advertencias en la consola

## Ventajas

✅ **Sin cambios en backend**: No necesita endpoint específico
✅ **Rendimiento**: Caché reduce llamadas a la API
✅ **Robustez**: Fallback garantiza funcionamiento
✅ **Fácil uso**: Interfaz simple y clara
✅ **Tipado**: TypeScript completo
✅ **Mantenible**: Código bien estructurado

## Limitaciones

❌ **Dependencia del endpoint**: Necesita que `/usuarios` funcione
❌ **Datos simulados**: Algunos campos pueden no ser reales
❌ **Caché local**: No se sincroniza entre pestañas
❌ **Sin validación**: No valida la estructura de datos

## Troubleshooting

### Problema: No se cargan los datos
**Solución:**
1. Verificar que el usuario esté autenticado
2. Revisar que el endpoint `/usuarios` funcione
3. Verificar la consola para errores
4. Usar `refreshProfile()` para forzar actualización

### Problema: Datos simulados en lugar de reales
**Solución:**
1. Verificar que el usuario exista en la base de datos
2. Confirmar que el ID del token coincida con un usuario real
3. Revisar logs del servidor

### Problema: Caché desactualizado
**Solución:**
1. Usar `clearCache()` para limpiar el caché
2. Usar `refreshProfile()` para obtener datos frescos
3. Esperar 10 minutos para que expire automáticamente

## Integración con Otros Componentes

El hook se puede usar en cualquier componente que necesite datos del usuario:

```typescript
// En el header
function Header() {
  const { userData } = useUserProfileSimple();
  return <div>Bienvenido, {userData?.nombres}</div>;
}

// En el sidebar
function Sidebar() {
  const { userData } = useUserProfileSimple();
  return <div>Usuario: {userData?.nombreDeUsuario}</div>;
}

// En formularios
function UserForm() {
  const { userData, updateProfile } = useUserProfileSimple();
  // Lógica del formulario
}
```

## Próximos Pasos

1. **Probar el hook** en el dashboard
2. **Integrar en componentes existentes**
3. **Personalizar según necesidades específicas**
4. **Considerar agregar validaciones adicionales**
5. **Evaluar si se necesita sincronización entre pestañas**
