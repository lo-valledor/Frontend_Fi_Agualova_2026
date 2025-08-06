# 🏗️ ENERLOVA - Arquitectura y Patrones de Desarrollo

## 📋 Índice

1. [Visión General de la Arquitectura](#-visión-general-de-la-arquitectura)
2. [Stack Tecnológico Detallado](#-stack-tecnológico-detallado)
3. [Patrones de Diseño](#-patrones-de-diseño)
4. [Estructura de Datos](#-estructura-de-datos)
5. [Flujos de Autenticación](#-flujos-de-autenticación)
6. [Gestión de Estado](#-gestión-de-estado)
7. [Optimizaciones de Performance](#-optimizaciones-de-performance)

---

## 🏛️ Visión General de la Arquitectura

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

### 🎯 Principios Arquitectónicos

#### 1. **Separation of Concerns**
- **Routes**: Solo manejo de routing y data loading
- **Components**: Solo lógica de UI y presentación
- **Services**: Solo comunicación con APIs
- **Hooks**: Solo gestión de estado local
- **Context**: Solo estado global necesario

#### 2. **Single Responsibility**
- Cada módulo tiene una responsabilidad específica
- Servicios separados por dominio de negocio
- Componentes pequeños y enfocados

#### 3. **Dependency Inversion**
- Components dependen de abstracciones (hooks/services)
- Services implementan interfaces consistentes
- Fácil testing y mocking

---

## 🔧 Stack Tecnológico Detallado

### ⚛️ Frontend Core

#### React 19 + TypeScript
```typescript
// Ejemplo de componente tipado
interface ComponentProps {
  data: DataType[];
  onAction: (id: string) => Promise<void>;
  loading?: boolean;
}

export default function Component({ data, onAction, loading = false }: ComponentProps) {
  // Implementación con tipos seguros
}
```

#### React Router 7 - File-based Routing
```typescript
// app/routes.ts - Configuración centralizada
export default [
  index('routes/home.tsx'),
  layout('routes/protected-route.tsx', [
    layout('routes/dashboard/layout.tsx', [
      ...prefix('dashboard', [
        index('routes/dashboard/dashboard.tsx'),
        ...prefix('administracion', [
          route('usuarios', 'routes/dashboard/administracion/usuarios.tsx'),
          route('clientes', 'routes/dashboard/administracion/clientes.tsx'),
        ])
      ])
    ])
  ])
];

// Loader pattern para data fetching
export async function clientLoader() {
  const [dataA, dataB] = await Promise.all([
    serviceA.getData(),
    serviceB.getData()
  ]);
  return { dataA: dataA.data, dataB: dataB.data };
}
```

### 🎨 UI Framework

#### Tailwind CSS + Radix UI
```typescript
// Componente base siguiendo design system
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';

interface CustomButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CustomButton({ variant = 'primary', size = 'md', className, ...props }: CustomButtonProps) {
  return (
    <Button
      className={cn(
        'transition-colors',
        {
          'bg-blue-600 hover:bg-blue-700': variant === 'primary',
          'bg-gray-600 hover:bg-gray-700': variant === 'secondary',
          'bg-red-600 hover:bg-red-700': variant === 'danger',
        },
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
```

### 📊 Data Management

#### TanStack Table
```typescript
// Definición de columnas tipadas
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper<UserType>();

export const columns = [
  columnHelper.accessor('nombre', {
    header: 'Nombre',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: info => (
      <a href={`mailto:${info.getValue()}`} className="text-blue-600">
        {info.getValue()}
      </a>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <ActionButtons 
        onEdit={() => handleEdit(row.original.id)}
        onDelete={() => handleDelete(row.original.id)}
      />
    ),
  }),
];
```

#### React Hook Form + Zod
```typescript
// Schema-first validation
const userSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(100, 'Máximo 100 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Teléfono inválido').optional(),
  fechaNacimiento: z.date().max(new Date(), 'Fecha no puede ser futura'),
});

type UserFormData = z.infer<typeof userSchema>;

// Formulario con validación automática
export function UserForm({ defaultValues, onSubmit }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        control={control}
        name="nombre"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input placeholder="Ingrese nombre" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </form>
  );
}
```

---

## 🎨 Patrones de Diseño

### 🏗️ 1. Service Layer Pattern

#### Implementación Base
```typescript
// Interfaz consistente para todos los servicios
export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

// Clase base para servicios
abstract class BaseService {
  protected processApiResponse<T>(response: AxiosResponse): T[] {
    // Normalización de respuestas API
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  }

  protected handleError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Error desconocido';
  }
}

// Implementación específica
class AdministracionService extends BaseService {
  async getClientes(): Promise<ServiceResponse<Cliente[]>> {
    try {
      const response = await api.get('/ClienteBuscar');
      return {
        data: this.processApiResponse<Cliente>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error)
      };
    }
  }

  // Método compuesto para múltiples datos relacionados
  async getClientesData(): Promise<ServiceResponse<{
    clientes: Cliente[];
    giros: Giro[];
    comunas: Comuna[];
  }>> {
    try {
      const [resClientes, resGiros, resComunas] = await Promise.all([
        api.get('/ClienteBuscar'),
        api.get('/giro/buscar'),
        api.get('/comuna/por-region')
      ]);

      return {
        data: {
          clientes: this.processApiResponse<Cliente>(resClientes),
          giros: this.processApiResponse<Giro>(resGiros),
          comunas: this.processApiResponse<Comuna>(resComunas)
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error)
      };
    }
  }
}
```

### 🔗 2. Custom Hooks Pattern

#### Hook para Data Fetching
```typescript
// Hook genérico para operaciones CRUD
export function useEntityCRUD<T extends { id: string }>(
  service: {
    getAll: () => Promise<ServiceResponse<T[]>>;
    create: (data: Omit<T, 'id'>) => Promise<ServiceResponse<T>>;
    update: (id: string, data: Partial<T>) => Promise<ServiceResponse<T>>;
    delete: (id: string) => Promise<ServiceResponse<void>>;
  }
) {
  const [entities, setEntities] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const result = await service.getAll();
    
    if (result.error) {
      setError(result.error);
    } else {
      setEntities(result.data || []);
    }
    
    setLoading(false);
  }, [service]);

  const create = useCallback(async (data: Omit<T, 'id'>) => {
    const result = await service.create(data);
    
    if (result.error) {
      toast.error(result.error);
      return false;
    }
    
    if (result.data) {
      setEntities(prev => [...prev, result.data!]);
      toast.success('Creado exitosamente');
    }
    
    return true;
  }, [service]);

  const update = useCallback(async (id: string, data: Partial<T>) => {
    const result = await service.update(id, data);
    
    if (result.error) {
      toast.error(result.error);
      return false;
    }
    
    if (result.data) {
      setEntities(prev => 
        prev.map(entity => entity.id === id ? result.data! : entity)
      );
      toast.success('Actualizado exitosamente');
    }
    
    return true;
  }, [service]);

  const remove = useCallback(async (id: string) => {
    const result = await service.delete(id);
    
    if (result.error) {
      toast.error(result.error);
      return false;
    }
    
    setEntities(prev => prev.filter(entity => entity.id !== id));
    toast.success('Eliminado exitosamente');
    return true;
  }, [service]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    entities,
    loading,
    error,
    refresh: fetchAll,
    create,
    update,
    remove
  };
}

// Uso específico
export const useClientes = () => {
  return useEntityCRUD({
    getAll: () => administracionService.getClientes(),
    create: (data) => administracionService.createCliente(data),
    update: (id, data) => administracionService.updateCliente(id, data),
    delete: (id) => administracionService.deleteCliente(id)
  });
};
```

### 🏛️ 3. Compound Components Pattern

#### DataTable Compuesto
```typescript
// Componente principal
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  children?: React.ReactNode;
}

function DataTable<T>({ data, columns, children }: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <DataTableContext.Provider value={{ table }}>
      <div className="space-y-4">
        {children}
      </div>
    </DataTableContext.Provider>
  );
}

// Sub-componentes
DataTable.Header = function DataTableHeader() {
  const { table } = useDataTableContext();
  
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium">Datos</h3>
      <DataTableSearch />
    </div>
  );
};

DataTable.Body = function DataTableBody() {
  const { table } = useDataTableContext();
  
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())
                  }
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No hay resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

DataTable.Pagination = function DataTablePagination() {
  const { table } = useDataTableContext();
  
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} de{" "}
        {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};

// Uso del componente compuesto
export default function ClientesPage() {
  const { data, columns } = useClientesTable();
  
  return (
    <DataTable data={data} columns={columns}>
      <DataTable.Header />
      <DataTable.Body />
      <DataTable.Pagination />
    </DataTable>
  );
}
```

### 🔄 4. Provider Pattern

#### Context con Estado Complejo
```typescript
// Definición de estado
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
}

type AuthContextType = AuthState & AuthActions;

// Context y reducer
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.user,
        loading: false
      };
    
    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    
    default:
      return state;
  }
}

// Provider con lógica completa
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true
  });

  // Inicialización desde localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const userData = getAuthenticatedUser();
          dispatch({
            type: 'SET_USER',
            payload: { user: userData, token }
          });
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({ type: 'CLEAR_USER' });
        }
      } else {
        dispatch({ type: 'CLEAR_USER' });
      }
    };

    initAuth();
  }, []);

  // Acciones
  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = await authService.login(credentials);
      
      if (result.data) {
        localStorage.setItem('token', result.data.token);
        const userData = getAuthenticatedUser();
        
        dispatch({
          type: 'SET_USER',
          payload: { user: userData, token: result.data.token }
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      dispatch({ type: 'CLEAR_USER' });
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    dispatch({ type: 'CLEAR_USER' });
    
    // Redirect a login
    window.location.href = '/auth/login';
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken: authService.refreshToken,
    updateUser: (userData) => {
      if (state.user) {
        dispatch({
          type: 'SET_USER',
          payload: {
            user: { ...state.user, ...userData },
            token: state.token!
          }
        });
      }
    }
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
```

---

## 📊 Estructura de Datos

### 🏗️ Modelos de Dominio

#### Entidades Principales
```typescript
// types/administracion.ts
export interface Cliente {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rut: string;
  email: string;
  telefono?: string;
  direccion: string;
  comuna: Comuna;
  giro: Giro;
  estado: 'activo' | 'inactivo';
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface Contrato {
  id: string;
  numero: string;
  cliente: Cliente;
  medidor: Medidor;
  acometida: Acometida;
  tarifa: Tarifa;
  tipoContrato: TipoContrato;
  fechaInicio: string;
  fechaFin?: string;
  estado: 'vigente' | 'suspendido' | 'terminado';
  condiciones: CondicionContrato[];
}

export interface Medidor {
  id: string;
  numero: string;
  marca: Marca;
  modelo: string;
  fechaInstalacion: string;
  fechaUltimaLectura?: string;
  lecturaActual: number;
  lecturaAnterior: number;
  estado: 'activo' | 'reemplazado' | 'averiado';
  ubicacion: Ubicacion;
}

// types/operaciones.ts
export interface Lectura {
  id: string;
  medidor: Medidor;
  periodo: Periodo;
  sector: Sector;
  lecturaActual: number;
  lecturaAnterior: number;
  consumo: number;
  fechaLectura: string;
  clave: Clave;
  observaciones?: string;
  estado: 'pendiente' | 'validada' | 'rechazada';
  lectorAsignado?: Usuario;
}

export interface Factura {
  id: string;
  numero: string;
  contrato: Contrato;
  periodo: Periodo;
  lectura: Lectura;
  cargos: CargoFactura[];
  montoTotal: number;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: 'borrador' | 'emitida' | 'pagada' | 'vencida';
}
```

#### DTOs y Responses
```typescript
// types/api-responses.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

// DTOs para formularios
export interface CreateClienteDTO {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rut: string;
  email: string;
  telefono?: string;
  direccion: string;
  comunaId: string;
  giroId: string;
}

export interface UpdateClienteDTO extends Partial<CreateClienteDTO> {
  id: string;
}
```

### 🔄 Transformadores de Datos

#### Normalización de Respuestas API
```typescript
// utils/data-transformers.ts
export class DataTransformer {
  // Normalizar respuestas inconsistentes de la API
  static normalizeApiResponse<T>(response: any): T[] {
    // Caso 1: Array directo
    if (Array.isArray(response)) {
      return response;
    }
    
    // Caso 2: Wrapper con data
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    // Caso 3: Objeto único
    if (typeof response === 'object' && response !== null) {
      return [response];
    }
    
    return [];
  }

  // Transformar cliente API a modelo de dominio
  static transformCliente(apiCliente: any): Cliente {
    return {
      id: apiCliente.idCliente || apiCliente.id,
      nombre: apiCliente.nombre || '',
      apellidoPaterno: apiCliente.apellidoPaterno || '',
      apellidoMaterno: apiCliente.apellidoMaterno || '',
      rut: apiCliente.rut || '',
      email: apiCliente.email || '',
      telefono: apiCliente.telefono,
      direccion: apiCliente.direccion || '',
      comuna: this.transformComuna(apiCliente.comuna),
      giro: this.transformGiro(apiCliente.giro),
      estado: apiCliente.estado === '1' ? 'activo' : 'inactivo',
      fechaCreacion: apiCliente.fechaCreacion || new Date().toISOString(),
      fechaModificacion: apiCliente.fechaModificacion || new Date().toISOString()
    };
  }

  // Transformar modelo de dominio a DTO de creación
  static clienteToCreateDTO(cliente: Partial<Cliente>): CreateClienteDTO {
    return {
      nombre: cliente.nombre!,
      apellidoPaterno: cliente.apellidoPaterno!,
      apellidoMaterno: cliente.apellidoMaterno!,
      rut: cliente.rut!,
      email: cliente.email!,
      telefono: cliente.telefono,
      direccion: cliente.direccion!,
      comunaId: cliente.comuna?.id!,
      giroId: cliente.giro?.id!
    };
  }
}
```

---

## 🔐 Flujos de Autenticación

### 🚪 Sistema de Autenticación JWT

#### Configuración Axios
```typescript
// services/axiosConfig.ts
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  withCredentials: true
});

// Interceptor para agregar token automáticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejo de respuestas y refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Error de red
    if (!error.response) {
      toast.error('Error de red. Verifica tu conexión.');
      return Promise.reject(error);
    }

    // Token expirado
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Intentar refresh token
        const refreshResponse = await refreshAxiosInstance.post('/refresh-token');
        const newToken = refreshResponse.data.token || refreshResponse.data.data?.token;
        
        if (newToken) {
          localStorage.setItem('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh falló, redirigir a login
        localStorage.removeItem('token');
        sessionStorage.clear();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    // Otros errores HTTP
    if (error.response.status >= 500) {
      toast.error('Error del servidor. Intenta más tarde.');
    } else if (error.response.status === 403) {
      toast.error('No tienes permisos para esta acción.');
    }

    return Promise.reject(error);
  }
);
```

#### Utilidades de Autenticación
```typescript
// utils/auth-utils.ts
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  id: string;
  usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  permisos: string[];
  exp: number;
  iat: number;
}

export function getAuthenticatedUser(): User | null {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decoded = jwtDecode<JWTPayload>(token);
    
    // Verificar expiración
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }

    return {
      id: decoded.id,
      usuario: decoded.usuario,
      nombre: decoded.nombre,
      apellido: decoded.apellido,
      email: decoded.email,
      rol: decoded.rol,
      permisos: decoded.permisos
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    localStorage.removeItem('token');
    return null;
  }
}

export function hasPermission(permission: string): boolean {
  const user = getAuthenticatedUser();
  return user?.permisos.includes(permission) ?? false;
}

export function hasRole(role: string): boolean {
  const user = getAuthenticatedUser();
  return user?.rol === role;
}

export function isTokenExpired(): boolean {
  try {
    const token = localStorage.getItem('token');
    if (!token) return true;

    const decoded = jwtDecode<JWTPayload>(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
```

#### Componente de Protección de Rutas
```typescript
// routes/protected-route.tsx
import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router';
import { getAuthenticatedUser, isTokenExpired } from '~/utils/auth-utils';
import LoadingSpinner from '~/components/loading-spinner';

export default function ProtectedRoute() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Verificar si existe token y no está expirado
        if (isTokenExpired()) {
          localStorage.removeItem('token');
          sessionStorage.clear();
          setIsAuthenticated(false);
          return;
        }

        // Verificar si se puede decodificar el token
        const user = getAuthenticatedUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();

    // Verificar periódicamente el estado del token
    const interval = setInterval(checkAuth, 60000); // cada minuto

    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
```

---

## ⚡ Gestión de Estado

### 🎯 Estrategia de Estado

#### 1. Estado Local (useState/useReducer)
```typescript
// Para estado específico de componente
const [filters, setFilters] = useState<FilterState>({
  search: '',
  status: 'all',
  dateRange: null
});

// Para estado complejo con múltiples acciones
const [tableState, dispatch] = useReducer(tableReducer, initialState);
```

#### 2. Estado Global (Context API)
```typescript
// Solo para estado que necesita ser compartido entre múltiples componentes
// Ejemplos: usuario autenticado, tema, configuración global

// context/ThemeContext.tsx
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resolvedTheme: 'light' | 'dark';
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  const resolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

#### 3. Estado de Servidor (React Router Loaders)
```typescript
// Para datos que vienen del servidor
export async function clientLoader({ params }: LoaderFunctionArgs) {
  const [usuarios, roles, permisos] = await Promise.all([
    administracionService.getUsuarios(),
    administracionService.getRoles(),
    administracionService.getPermisos()
  ]);

  if (usuarios.error) {
    throw new Error(usuarios.error);
  }

  return {
    usuarios: usuarios.data!,
    roles: roles.data || [],
    permisos: permisos.data || []
  };
}

// En el componente
export default function UsuariosPage() {
  const { usuarios, roles, permisos } = useLoaderData<typeof clientLoader>();
  
  // Estado local para operaciones específicas de la página
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  return (
    <UsuariosComponent
      usuarios={usuarios}
      roles={roles}
      permisos={permisos}
      selectedUsers={selectedUsers}
      onSelectionChange={setSelectedUsers}
      onCreateUser={() => setIsCreateModalOpen(true)}
    />
  );
}
```

### 🔄 Synchronización de Estado

#### Custom Hook para Sincronización
```typescript
// hooks/use-sync-state.ts
export function useSyncState<T>(
  key: string,
  defaultValue: T,
  storage: 'local' | 'session' = 'local'
) {
  const storageObj = storage === 'local' ? localStorage : sessionStorage;
  
  const [state, setState] = useState<T>(() => {
    try {
      const item = storageObj.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const newValue = typeof value === 'function' ? (value as Function)(prev) : value;
      
      try {
        storageObj.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.warn('Failed to save to storage:', error);
      }
      
      return newValue;
    });
  }, [key, storageObj]);

  const removeValue = useCallback(() => {
    setState(defaultValue);
    storageObj.removeItem(key);
  }, [key, defaultValue, storageObj]);

  return [state, setValue, removeValue] as const;
}

// Uso
export function useUserPreferences() {
  const [preferences, setPreferences] = useSyncState('userPreferences', {
    tablePageSize: 10,
    defaultView: 'grid',
    notifications: true
  });

  return { preferences, setPreferences };
}
```

---

## 🚀 Optimizaciones de Performance

### ⚡ Code Splitting y Lazy Loading

#### Lazy Loading de Rutas
```typescript
// routes.ts con lazy loading automático
import { lazy } from 'react';

// React Router 7 hace esto automáticamente por archivo
// Cada ruta en routes/ se carga de forma lazy por defecto

// Para lazy loading manual
const AdministracionPage = lazy(() => import('~/routes/dashboard/administracion'));
const MonitorPage = lazy(() => import('~/routes/dashboard/monitor'));

// Wrapper con Suspense
function LazyRoute({ Component }: { Component: React.ComponentType }) {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Component />
    </Suspense>
  );
}
```

#### Lazy Loading de Componentes
```typescript
// Componentes pesados con lazy loading
const DataTable = lazy(() => import('~/components/data-table/data-table'));
const ChartComponent = lazy(() => import('~/components/charts/chart-component'));

// Hook para lazy loading condicional
function useLazyComponent<T>(
  importFn: () => Promise<{ default: T }>,
  condition: boolean
) {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (condition && !Component) {
      setLoading(true);
      importFn()
        .then((module) => {
          setComponent(module.default);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [condition, Component, importFn]);

  return { Component, loading };
}
```

### 🎯 Optimización de Re-renders

#### Memo y Callbacks
```typescript
// Componente optimizado con React.memo
const TableRow = React.memo(function TableRow({ 
  data, 
  onEdit, 
  onDelete 
}: TableRowProps) {
  const handleEdit = useCallback(() => {
    onEdit(data.id);
  }, [data.id, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(data.id);
  }, [data.id, onDelete]);

  return (
    <tr>
      <td>{data.name}</td>
      <td>
        <Button onClick={handleEdit}>Editar</Button>
        <Button onClick={handleDelete}>Eliminar</Button>
      </td>
    </tr>
  );
});

// Componente padre con callbacks estables
export default function DataTable({ data }: { data: TableData[] }) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Callbacks estables
  const handleEdit = useCallback((id: string) => {
    // Lógica de edición
  }, []);

  const handleDelete = useCallback((id: string) => {
    // Lógica de eliminación
  }, []);

  // Datos memoizados
  const sortedData = useMemo(() => {
    return data.sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  return (
    <table>
      <tbody>
        {sortedData.map((row) => (
          <TableRow
            key={row.id}
            data={row}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </tbody>
    </table>
  );
}
```

### 📊 Optimización de Datos

#### Paginación Virtual
```typescript
// Hook para paginación virtual en tablas grandes
function useVirtualPagination<T>({
  data,
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5
}: {
  data: T[];
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(data.length, startIndex + visibleCount + overscan * 2);

  const visibleItems = useMemo(() => {
    return data.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index
    }));
  }, [data, startIndex, endIndex]);

  const totalHeight = data.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    scrollTop,
    setScrollTop
  };
}

// Componente de tabla virtual
export function VirtualTable<T>({ data, renderRow }: VirtualTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { visibleItems, totalHeight, offsetY, setScrollTop } = useVirtualPagination({
    data,
    itemHeight: 60,
    containerHeight: 400
  });

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, [setScrollTop]);

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height: 400 }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div key={index} style={{ height: 60 }}>
              {renderRow(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### Debounce y Throttle
```typescript
// Hook para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook para throttle
function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

// Componente de búsqueda optimizado
export function SearchInput({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  return (
    <Input
      type="text"
      placeholder="Buscar..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
```

---

## 📝 Conclusión

Esta arquitectura proporciona:

- **🏗️ Escalabilidad**: Estructura modular y patrones consistentes
- **🔧 Mantenibilidad**: Separación clara de responsabilidades
- **⚡ Performance**: Optimizaciones en múltiples niveles
- **🔒 Seguridad**: Manejo robusto de autenticación y autorización
- **🎨 Experiencia de Usuario**: UI responsive y accesible
- **👨‍💻 Experiencia de Desarrollador**: Tipos seguros y herramientas de calidad

Los patrones establecidos permiten agregar nuevas funcionalidades de manera consistente y mantener el código organizado a medida que el proyecto crece.
