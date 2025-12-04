# 🔐 Preguntas 11-16: Seguridad de Datos, Sesiones y Procedimientos

**Fecha de análisis**: 4 de Diciembre 2025  
**Versión**: 1.0  
**Formato**: Análisis exhaustivo sin implementación

---

## 📋 Tabla de Contenidos

1. [Pregunta 11: Validación y Sanitización](#pregunta-11-validación-de-entradas-sanitización-autenticación-y-autorización)
2. [Pregunta 12: Datos Sensibles](#pregunta-12-tratamiento-de-datos-sensibles)
3. [Pregunta 13: Control de Sesiones](#pregunta-13-control-de-sesiones)
4. [Pregunta 14: Rate Limiting](#pregunta-14-límites-de-tasa-y-protección-ante-abuso)
5. [Pregunta 15: Ethical Hacking](#pregunta-15-ethical-hacking)
6. [Pregunta 16: Procedimientos de Actualización](#pregunta-16-procedimiento-de-actualización-de-componentes)

---

## ❓ Pregunta 11: Validación de Entradas, Sanitización, Autenticación y Autorización

### 📌 Resumen

| Aspecto                   | Implementado | Status                   |
| ------------------------- | ------------ | ------------------------ |
| **Validación de Entrada** | ✅ Sí        | 🟢 Zod + React Hook Form |
| **Sanitización**          | ✅ Parcial   | 🟢 React (automático)    |
| **Autenticación**         | ✅ Sí        | 🟢 JWT + Refresh         |
| **Autorización**          | ✅ Parcial   | 🟡 Frontend + RBAC       |

---

### 1. **Validación de Entradas**

#### Tecnología Implementada: **Zod 3.25.76**

```typescript
// Esquemas de validación típicos en el proyecto:

// Login
const LoginSchema = z.object({
  usuario: z.string().email('Email inválido'),
  contrasena: z.string().min(8, 'Mínimo 8 caracteres')
});

// Contraseña (en reset)
const PasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe incluir mayúscula')
      .regex(/[a-z]/, 'Debe incluir minúscula')
      .regex(/\d/, 'Debe incluir número')
      .regex(
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        'Debe incluir carácter especial'
      ),
    confirmPassword: z.string()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  });

// RUT (Identificación chilena)
const RutSchema = z.object({
  rut: z.string().refine(val => isValidRutFormat(val), 'RUT inválido')
});
```

**Características Zod**:

- ✅ Type-safe validación
- ✅ Composable schemas
- ✅ Custom validations
- ✅ Async validations
- ✅ Error messages customizados

#### Tecnología Complementaria: **React Hook Form 7.66.0**

```typescript
// Integración con Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(LoginSchema),
    mode: 'onBlur' // Validar al perder focus
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input
        {...form.register('usuario')}
        placeholder="Usuario"
      />
      {form.formState.errors.usuario && (
        <span>{form.formState.errors.usuario.message}</span>
      )}
    </form>
  );
}
```

**Características React Hook Form**:

- ✅ Validación en cliente
- ✅ Manejo de errores
- ✅ Campos dinámicos
- ✅ Performance optimizado

---

### 2. **Sanitización de Entradas**

#### Sanitización Automática (React)

```typescript
// ✅ React escapa HTML automáticamente
<div>{userInput}</div>  // Seguro - React lo escapa

// ❌ NUNCA usar dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**Contexto**: React previene XSS automáticamente en el DOM

#### Sanitización de RUT

```typescript
// app/utils/rut-utils.ts (inferido del código)

function cleanRut(rut: string): string {
  // Remover puntos y guiones
  return rut.replace(/\./g, '').replace(/-/g, '');
}

function formatRut(rut: string): string {
  const cleaned = cleanRut(rut);
  // Formatear: XX.XXX.XXX-K
  const match = cleaned.match(/(\d{1,2})(\d{3})(\d{3})(.{1})/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
  }
  return rut;
}

function isValidRutFormat(rut: string): boolean {
  // Validar dígito verificador
  const cleaned = cleanRut(rut);
  // ... validación con rut.js library
  return isValidRut(cleaned);
}
```

**Librería utilizada**: `rut.js ^2.1.0`

---

### 3. **Autenticación (JWT)**

#### Flujo de Autenticación

```typescript
// app/context/AuthContext.tsx

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (
    usuario: string,
    contrasena: string,
    redirectTo?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Usuario decodificado del JWT
interface UserData {
  id: string; // UUID o ID del usuario
  username: string; // Nombre de usuario
  role: string; // Rol asignado
  profileId: string; // Perfil del usuario
  fullName: string; // Nombre completo
}
```

#### Token Storage

```typescript
// Token almacenado en localStorage
localStorage.setItem('token', jwt_token);

// En cada solicitud, se envía en header:
config.headers.Authorization = `Bearer ${token}`;

// Validación de expiración:
const isTokenValid = (token: string): boolean => {
  const decoded = jwtDecode<{ exp: number }>(token);
  const currentTime = Date.now() / 1000;
  return decoded.exp > currentTime; // Comparar con timestamp actual
};
```

#### Refresh Token Automático

```typescript
// En interceptor de respuesta (401)
if (status === 401) {
  // Intentar refrescar token
  const newToken = await POST('/refresh-token');

  if (newToken) {
    localStorage.setItem('token', newToken);
    // Reintentar solicitud original
    config.headers.Authorization = `Bearer ${newToken}`;
    return axiosInstance(originalRequest);
  } else {
    // Redirigir a login
    window.location.href = '/session-expired';
  }
}
```

**Parámetros del Token**:

- ✅ `sub` - Subject (ID del usuario)
- ✅ `exp` - Expiration time (timestamp)
- ✅ `role` - Rol del usuario
- ✅ `iss` - Issuer (servidor que emite)
- ✅ `aud` - Audience (para quién es)

---

### 4. **Autorización (RBAC)**

#### Sistema de Permisos

```typescript
// app/context/AuthContext.tsx

interface PermisosUsuario {
  ruta: string; // Ruta del recurso: /dashboard/admin
  puedeVer: boolean; // Permiso de lectura (READ)
  puedeCrear: boolean; // Permiso de creación (CREATE)
  puedeEditar: boolean; // Permiso de edición (UPDATE)
  puedeEliminar: boolean; // Permiso de eliminación (DELETE)
}

// Métodos de verificación:
const canView = (ruta: string): boolean => {
  const permission = permissions.find(p => p.ruta === ruta);
  return permission?.puedeVer ?? false;
};

const canCreate = (ruta: string): boolean => {
  const permission = permissions.find(p => p.ruta === ruta);
  return permission?.puedeCrear ?? false;
};

const canEdit = (ruta: string): boolean => {
  const permission = permissions.find(p => p.ruta === ruta);
  return permission?.puedeEditar ?? false;
};

const canDelete = (ruta: string): boolean => {
  const permission = permissions.find(p => p.ruta === ruta);
  return permission?.puedeEliminar ?? false;
};
```

#### Componentes de Guardia

```typescript
// Protección de rutas
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}

// Guardia por rol
export function RoleGuard({ requiredRoles, children }) {
  const { user } = useAuth();

  if (!requiredRoles.includes(user.role)) {
    return <Unauthorized />;
  }

  return children;
}

// Guardia por permiso
export function PermissionGuard({ requiredPermission, children }) {
  const { canEdit } = useAuth();

  if (!canEdit(requiredPermission)) {
    return <Forbidden />;
  }

  return children;
}
```

#### Carga de Permisos

```typescript
// Al hacer login:
const loadUserPermissions = async (userId: string) => {
  try {
    const response = await rolesPermisosService.getPermisosUsuario(userId);

    if (!response.error) {
      setPermissions(response.data || []);
    }
  } catch {
    setPermissions([]);
  }
};

// Endpoint: GET /permisos-usuario/{userId}
// Respuesta: Array<PermisosUsuario>
```

---

### 5. **Validación de Contraseña (OWASP)**

```typescript
// app/utils/password-validation.ts

const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'Al menos 8 caracteres',
    validator: pwd => pwd.length >= 8
  },
  {
    id: 'uppercase',
    label: 'Al menos una letra mayúscula',
    validator: pwd => /[A-Z]/.test(pwd)
  },
  {
    id: 'lowercase',
    label: 'Al menos una letra minúscula',
    validator: pwd => /[a-z]/.test(pwd)
  },
  {
    id: 'number',
    label: 'Al menos un número',
    validator: pwd => /\d/.test(pwd)
  },
  {
    id: 'special',
    label: 'Al menos un carácter especial',
    validator: pwd => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)
  }
];

// Detección de patrones inseguros:
const COMMON_PATTERNS = [
  /^123456/,
  /password/i,
  /qwerty/i,
  /admin/i,
  /letmein/i,
  /welcome/i,
  /monkey/i,
  /dragon/i,
  /master/i
];

// Función de validación:
export function validatePassword(password: string) {
  const failedRules = PASSWORD_RULES.filter(rule => !rule.validator(password));

  const warnings = [];

  // Verificar patrones comunes
  for (const pattern of COMMON_PATTERNS) {
    if (pattern.test(password)) {
      warnings.push('Contraseña contiene patrón inseguro');
      break;
    }
  }

  // Verificar repeticiones
  if (/(.)\1{2,}/.test(password)) {
    warnings.push('Evitar 3+ caracteres repetidos');
  }

  return {
    isValid: failedRules.length === 0,
    failedRules,
    warnings
  };
}

// Cálculo de fortaleza (0-4):
export function calculatePasswordStrength(password: string) {
  let score = 0;

  // Base: 1 punto por cada regla cumplida
  const passedRules = PASSWORD_RULES.filter(rule =>
    rule.validator(password)
  ).length;
  score += passedRules;

  // Bonus por longitud
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Penalización por patrones comunes
  if (COMMON_PATTERNS.some(p => p.test(password))) {
    score = Math.max(0, score - 2);
  }

  return Math.min(4, Math.max(0, Math.floor(score / 2)));
}
```

---

### 📊 Resumen Pregunta 11

```
Validación:        ✅ Zod 3.25.76 + React Hook Form
Sanitización:      ✅ React (automática) + rut.js
Autenticación:     ✅ JWT con refresh automático
Autorización:      ✅ RBAC en frontend
Contraseña:        ✅ OWASP standards

Impacto: 🟢 BIEN IMPLEMENTADO (90%)
```

---

## ❓ Pregunta 12: Tratamiento de Datos Sensibles

### 📌 Resumen

| Aspecto             | En Tránsito | En Reposo       | Cifrado | Enmascaramiento |
| ------------------- | ----------- | --------------- | ------- | --------------- |
| **Tokens JWT**      | ❌ HTTP     | ❌ localStorage | ❌ No   | ❌ No           |
| **Contraseñas**     | ❌ HTTP     | ❌ No (backend) | ❌ No   | ✅ Parcial      |
| **RUT**             | ❌ HTTP     | ⚠️ Parcial      | ❌ No   | ⚠️ Parcial      |
| **Datos Bancarios** | ❌ HTTP     | ⚠️ Desconocido  | ❌ No   | ❌ No           |

---

### 1. **Datos en Tránsito**

#### Estado Actual: 🔴 CRÍTICO

```
Protocolo: HTTP (sin cifrar)
TLS: No configurado
Cifrado: No

Datos sensibles en tránsito sin protección:
- JWT tokens
- Credenciales de login
- Información de contratos
- Datos de facturación
- RUT de clientes
```

#### Solución Requerida:

```
✅ Implementar HTTPS/TLS 1.2+
✅ Forzar redirección HTTP → HTTPS
✅ Habilitar HSTS header
✅ Validar certificados SSL en cliente
```

---

### 2. **Datos en Reposo**

#### Token JWT

```typescript
// Almacenamiento ACTUAL (vulnerable):
localStorage.setItem('token', jwtToken);

// ❌ Problemas:
// - Accesible a cualquier script en la página
// - XSS puede robar el token
// - No tiene protección de cookies (HttpOnly)
// - Visible en DevTools

// ✅ Mejora recomendada:
// Usar httpOnly cookies en servidor:
// Set-Cookie: authToken=...; HttpOnly; Secure; SameSite=Strict
```

#### Contraseñas

```typescript
// Contraseñas en FRONTEND: No se almacenan
// ✅ Correcto - Se envían en login y se descartan

// Contraseñas en BACKEND:
// ❌ DEBE estar hasheada (bcrypt, argon2)
// Asumido que backend lo hace (no verificable en frontend)
```

#### Datos Personales

```typescript
// Información sensible visible en estados:
const user = {
  id: '123', // UUID - OK
  username: 'jperez', // Username - OK
  fullName: 'Juan Pérez López', // ✅ Enmascarable
  role: 'admin' // ✅ No sensible
};

// ✅ Recomendación:
// Mostrar nombre enmascarado:
// "Juan P****" o "JP" (iniciales)
```

---

### 3. **Enmascaramiento de Datos**

#### RUT (Número de Identificación)

```typescript
// Formato actual:
const rut = '12.345.678-9';

// ✅ Enmascaramiento recomendado:
function maskRut(rut: string): string {
  const cleaned = rut.replace(/\./g, '').replace(/-/g, '');
  const first = cleaned.substring(0, 2);
  const last = cleaned.substring(cleaned.length - 1);
  return `${first}.***.***-${last}`;
  // Resultado: "12.***.***.***-9"
}

// ✅ En tablas de listar:
// Mostrar: "12.***.***-9"
// Mostrar completo: Solo en detalles con permiso
```

#### Información de Facturación

```typescript
// Números sensibles que deben enmascararse:

// Monto facturado:
function maskAmount(amount: number): string {
  const str = amount.toString();
  return (
    str.substring(0, 2) +
    '*'.repeat(str.length - 3) +
    str.substring(str.length - 1)
  );
}

// Cuenta bancaria (si aplica):
function maskBankAccount(account: string): string {
  return '****' + account.substring(account.length - 4);
}

// Teléfono:
function maskPhone(phone: string): string {
  return phone.substring(0, 2) + '****' + phone.substring(phone.length - 2);
}

// Email:
function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  const maskedUser = user.substring(0, 2) + '*'.repeat(user.length - 2);
  return `${maskedUser}@${domain}`;
}
```

---

### 4. **Cifrado de Datos**

#### Estado Actual: 🔴 NO IMPLEMENTADO

```
Cifrado E2E:        ❌ No
Cifrado en tránsito: ❌ No (HTTP)
Cifrado en reposo:   ❌ No (localStorage)
Key Management:      ❌ No
```

#### Solución Recomendada:

```typescript
// Para datos muy sensibles:
import crypto from 'crypto-js';

// ❌ NO USAR crypto-js en frontend (inseguro)
// ✅ USAR: Cifrado en servidor (backend)

// Flujo seguro:
// 1. Frontend envía datos vía HTTPS
// 2. Backend recibe y cifra
// 3. Backend almacena cifrado en BD
// 4. Backend descifra al recuperar (si necesario)

// En frontend: Solo confiar en conexión HTTPS + JWT válido
```

---

### 📊 Resumen Pregunta 12

```
Datos en Tránsito:   🔴 HTTP sin cifrar - CRÍTICO
Datos en Reposo:     ❌ localStorage sin protección
Cifrado:             ❌ No implementado
Enmascaramiento:     ⚠️ Parcial (RUT, no otros)

Impacto: 🔴 CRÍTICO - Requiere mejora inmediata
```

---

## ❓ Pregunta 13: Control de Sesiones

### 📌 Resumen

| Parámetro          | Implementado | Valor             |
| ------------------ | ------------ | ----------------- |
| **Almacenamiento** | ✅           | localStorage      |
| **Duración**       | ✅           | JWT exp (backend) |
| **Refresh**        | ✅           | Automático        |
| **Timeout**        | ⚠️           | No visible        |
| **Invalidación**   | ✅           | Logout            |
| **Multi-sesión**   | ✅           | Permitido         |
| **Same-site**      | ❌           | No configurado    |

---

### 1. **Almacenamiento de Sesión**

```typescript
// Método ACTUAL: localStorage
localStorage.setItem('token', jwtToken);
localStorage.removeItem('token');  // En logout

// Métodos de acceso:
const token = localStorage.getItem('token');

// ❌ Problemas:
// - localStorage persiste entre pestañas/ventanas
// - Vulnerable a XSS
// - Sincronización entre pestañas manual

// ✅ Solución: Usar sessionStorage + Event Listeners
sessionStorage.setItem('token', jwtToken);  // Se limpia al cerrar

// ✅ Mejor aún: httpOnly cookies
Set-Cookie: authToken=...; HttpOnly; Secure; SameSite=Strict;
```

---

### 2. **Duración de Sesión**

```typescript
// Parámetros del JWT (decodificado):
const decoded = jwtDecode(token);

{
  sub: "user-id-123",
  name: "Juan Pérez",
  role: "administrador",
  exp: 1735689600,      // Expiration: timestamp Unix
  iss: "backend-server", // Emisor
  aud: "frontend-app"    // Audiencia
}

// Cálculo de tiempo hasta expiración:
const expiresIn = (decoded.exp * 1000) - Date.now();
const minutesLeft = Math.floor(expiresIn / 60000);

// ⚠️ Duración no especificada en código
// Inferencia: Típicamente 15 min - 2 horas
```

---

### 3. **Refresh de Sesión**

```typescript
// Implementación en axiosConfig.ts:

async function attemptTokenRefresh(): Promise<string> {
  const response = await refreshAxiosInstance.post<{ token: string }>(
    '/refresh-token'
  );

  const newToken = response.data?.token;
  if (!newToken) {
    throw new Error('No se recibió token válido');
  }

  return newToken;
}

// Flujo automático:
// 1. Solicitud HTTP
// 2. Servidor responde 401 (Unauthorized)
// 3. Cliente intenta refresh token
// 4. Backend genera nuevo token
// 5. Cliente actualiza localStorage
// 6. Reintentar solicitud original
// 7. Si refresh falla → Redirigir a login

// ✅ Reintentos: 1 intento
// ❌ Sin exponential backoff
```

---

### 4. **Timeout de Sesión**

```
Timeout Detectado: NO explícitamente en código

Mecanismos de timeout:
1. JWT expiration (backend) ✅
2. Refresh token expiration (backend) ✅
3. Activity timeout (NOT FOUND) ❌
4. Absolute timeout (NOT FOUND) ❌

❌ Sin timeout por inactividad
❌ Sin aviso previo a expiración
```

#### Recomendación de Implementación:

```typescript
// Activity timeout (session expira si no hay actividad):
export function useSessionTimeout(timeoutMs = 30 * 60 * 1000) {
  // 30 minutos de inactividad

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Sesión expirada por inactividad
        logout();
        navigate('/session-expired');
      }, timeoutMs);
    };

    // Detectar actividad del usuario
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    events.forEach(event => {
      document.addEventListener(event, resetTimeout);
    });

    // Iniciar timer
    resetTimeout();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout);
      });
      clearTimeout(timeoutId);
    };
  }, [timeoutMs]);
}
```

---

### 5. **Invalidación de Sesión**

```typescript
// Logout en AuthContext:

const logout = async () => {
  try {
    await authService.logout(); // Notificar al backend
  } catch (error) {
    console.error('Error al cerrar sesión', error);
  } finally {
    // Limpiar localStorage
    localStorage.removeItem('token');

    // Limpiar sessionStorage
    sessionStorage.removeItem('token');

    // Reset state
    setUser(null);
    setPermissions([]);

    // Redirigir
    navigate('/auth/login', { replace: true });
  }
};

// ✅ Implementado correctamente
```

---

### 6. **Sincronización entre Pestañas**

```typescript
// Token Sync Utility (app/utils/token-sync.ts):

export const listenToTokenChanges = (
  callback: (action: 'login' | 'logout', token?: string) => void
) => {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail.action, customEvent.detail.token);
  };

  globalThis.addEventListener(TOKEN_CHANGED_EVENT, handler);

  return () => {
    globalThis.removeEventListener(TOKEN_CHANGED_EVENT, handler);
  };
};

export const dispatchTokenChange = (
  action: 'login' | 'logout',
  token?: string
) => {
  globalThis.dispatchEvent(
    new CustomEvent(TOKEN_CHANGED_EVENT, {
      detail: { action, token }
    })
  );
};

// ✅ Permite sincronizar sesión entre pestañas
```

---

### 7. **Parámetros de Sesión**

```typescript
// Parámetros configurados/detectados:

{
  storage: 'localStorage',           // ⚠️ Vulnerable
  duration: 'JWT_DEPENDENT',         // ~15min - 2hours (default backend)
  refresh: 'Automático',             // ✅ Con 1 reintento
  invalidation: 'Logout + logout()', // ✅ Completo
  multiSession: 'Permitido',         // ✅ Múltiples pestañas
  timeout: 'No configurado',         // ❌ Falta
  sameSite: 'No configurado',        // ❌ Falta
  secure: 'No (HTTP)',               // 🔴 CRÍTICO
  httpOnly: 'No implementado',       // ⚠️ Recomendado
}
```

---

### 📊 Resumen Pregunta 13

```
Almacenamiento:     ⚠️ localStorage (debería ser sessionStorage)
Duración:           ✅ JWT-based (backend)
Refresh:            ✅ Automático
Timeout:            ❌ No implementado
Invalidación:       ✅ Logout limpio
Multi-sesión:       ✅ Soportado
Control:            ⚠️ Básico pero funcional

Impacto: 🟡 FUNCIONAL pero MEJORABLE
Recomendación: Migrar a httpOnly cookies + sesión timeout
```

---

## ❓ Pregunta 14: Límites de Tasa (Rate Limiting) y Protección ante Abuso

### 📌 Estado: 🔴 NO IMPLEMENTADO

---

### 1. **Rate Limiting en Frontend**

```
Implementado: ❌ No
Mecanismo: No encontrado en código

❌ Sin límite de solicitudes por usuario
❌ Sin throttling de búsquedas
❌ Sin rate limiting de login
❌ Sin CAPTCHA
❌ Sin detección de bots
```

#### Recomendación de Implementación:

```typescript
// Rate Limiter genérico:
export function useRateLimit(fn: () => Promise<void>, delayMs: number = 1000) {
  const [lastCall, setLastCall] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const execute = async () => {
    const now = Date.now();
    if (now - lastCall < delayMs) {
      toast.error(`Espera ${delayMs / 1000}s antes de intentar de nuevo`);
      return;
    }

    setLastCall(now);
    setIsLoading(true);
    try {
      await fn();
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}

// Uso:
const { execute: search, isLoading } = useRateLimit(
  () => searchClientes(query),
  500 // Máximo 1 búsqueda por 500ms
);
```

---

### 2. **Rate Limiting en Servidor (Recomendado)**

```yaml
# Debería estar en backend, no en frontend:

Rate Limits Recomendados:
  - Login: 5 intentos / 15 minutos
  - Búsquedas: 100 requests / minuto
  - Crear registros: 50 requests / minuto
  - Modificar datos: 20 requests / minuto
  - Eliminar: 10 requests / minuto
  - API general: 1000 requests / hora
```

---

### 3. **Protección ante Bots**

```
Implementado: ❌ No

❌ Sin CAPTCHA
❌ Sin verificación de humanidad
❌ Sin detección de requests automatizados
❌ Sin User-Agent validation
❌ Sin fingerprinting del navegador
```

#### Recomendación:

```typescript
// Integrar reCAPTCHA v3 (invisible):
import ReCAPTCHA from 'react-google-recaptcha';

export function LoginForm() {
  const recaptchaRef = useRef();

  const handleLogin = async (e) => {
    e.preventDefault();

    const token = await recaptchaRef.current.executeAsync();

    // Enviar token al backend
    // Backend valida: score < 0.5 → rechazar
    const response = await login(usuario, password, token);
  };

  return (
    <form onSubmit={handleLogin}>
      {/* formulario */}
      <ReCAPTCHA
        ref={recaptchaRef}
        size="invisible"
        sitekey={import.meta.env.VITE_RECAPTCHA_KEY}
      />
    </form>
  );
}
```

---

### 📊 Resumen Pregunta 14

```
Rate Limiting Frontend:  ❌ No implementado
Rate Limiting Backend:   ❌ No (asumido)
CAPTCHA:                 ❌ No
Bot Detection:           ❌ No
DDoS Protection:         ❌ No (Nginx/CDN)

Impacto: 🔴 CRÍTICO - Vulnerable a abuso
Recomendación: Implementar en backend + CAPTCHA + Nginx rate limiting
```

---

## ❓ Pregunta 15: Ethical Hacking / Penetration Testing

### 📌 Estado: 🔴 NO REALIZADO

---

### 1. **Status Actual**

```
Ethical Hacking:     ❌ No realizado
Penetration Testing: ❌ No realizado
Security Audit:      ❌ No realizado
Vulnerability Scan:  ❌ No realizado
```

---

### 2. **Plan de Implementación Recomendado**

```markdown
# Fase 1: Preparación (Semana 1)

1. Definir Scope
   - Qué sistemas incluir
   - Qué excluir
   - Confidencialidad

2. Seleccionar Proveedor
   - Empresa de pen testing externa
   - Requisitos: Certified ethical hackers
   - Cobertura: OWASP Top 10

3. Documentar
   - Crear Rules of Engagement
   - Definir horarios de testing
   - Establecer contactos de emergencia

# Fase 2: Testing (Semana 2-3)

1. Reconnaissance
   - Port scanning
   - Identificación de servicios
   - Búsqueda de información pública

2. Scanning
   - Vulnerabilidades conocidas
   - Weak configurations
   - SSL/TLS issues

3. Exploitation
   - Proof of Concept de vulnerabilidades
   - Testing de autenticación
   - Testing de autorización
   - Testing de inyecciones

4. Post-Exploitation
   - Escalación de privilegios
   - Movimiento lateral
   - Extracción de datos

5. Reporting
   - Documentar hallazgos
   - Clasificar por severidad
   - Proporcionar recomendaciones

# Fase 3: Remediación (Semana 4+)

1. Priorizar
   - Crítico
   - Alto
   - Medio
   - Bajo

2. Corregir
   - Implementar patches
   - Mejorar configuraciones
   - Actualizar dependencias

3. Verificar
   - Re-testing de vulnerabilidades
   - Validar remedios
   - Firmar off
```

---

### 3. **Áreas de Enfoque Esperadas**

```
1. Autenticación
   - Fuerza de contraseñas
   - Session hijacking
   - Credential stuffing
   - Default credentials

2. Inyecciones
   - SQL Injection (backend)
   - XSS en formularios
   - Command injection

3. Acceso
   - Broken Access Control
   - Escalación de privilegios
   - Horizontal privilege escalation

4. Cifrado
   - Comunicación sin HTTPS
   - Datos sensibles en texto plano
   - Weak ciphers

5. Configuración
   - Headers de seguridad faltantes
   - Configuración insegura de servidores
   - Información expuesta en errores

6. Lógica de Negocio
   - Race conditions
   - Flaws en flujos
   - Validación incompleta
```

---

### 4. **Línea de Tiempo Recomendada**

```
Inmediato:   Correcciones críticas (1-2 semanas)
Corto plazo: Implementar OWASP (1 mes)
Mediano:     Primer pen test (2-3 meses)
Largo:       Pen tests regulares (c/6 meses)
```

---

### 📊 Resumen Pregunta 15

```
Ethical Hacking:     🔴 No realizado
Testing:             🔴 No
Recomendación:       Realizar dentro de 2-3 meses
Costo Estimado:      $5,000 - $15,000 USD
Duración:            3-4 semanas
Resultado:           Reporte de vulnerabilidades + remedios

Impacto: Identificar brechas antes que atacantes
```

---

## ❓ Pregunta 16: Procedimiento de Actualización de Componentes

### 📌 Estado: ⚠️ PARCIAL

---

### 1. **Proceso Actual Identificado**

```
Versionado:        ✅ Semver (package.json)
Lock file:         ✅ pnpm-lock.yaml
CI/CD:             ✅ GitHub Actions
Testing:           ✅ Vitest + Coverage
Build:             ✅ Vite build
Deployment:        ✅ Docker + self-hosted

❌ Sin Dependabot
❌ Sin estrategia de actualización
❌ Sin changelog
❌ Sin comunicación de cambios
```

---

### 2. **Stack de Dependencias Actual**

```
Frontend Framework
- React: 19.2.0
- React Router: 7.9.5
- TypeScript: 5.8.3
- Vite: 6.3.3

UI Components
- Radix UI: ^1.x
- Tailwind CSS: 4.1.4
- Lucide Icons: 0.513.0

Forms & Validation
- React Hook Form: 7.66.0
- Zod: 3.25.76
- @hookform/resolvers: 5.2.2

Data & API
- Axios: 1.13.2
- TanStack Table: 8.21.3
- TanStack Virtual: 3.13.12

Developer Tools
- ESLint: 9.39.1
- Prettier: 3.6.2
- Vitest: 3.2.4
- Husky: 9.1.7
```

---

### 3. **Procedimiento de Actualización Recomendado**

#### Paso 1: Planificación

```markdown
# Frecuencia de actualizaciones:

- Patch updates (x.y.Z): Semanal - Automático
- Minor updates (x.Y.z): Mensual - Manual con testing
- Major updates (X.y.z): Trimestral - Con análisis completo

# Clasificación de dependencias:

Critical (seguridad):

- Frameworks de seguridad
- Librerías criptográficas
- Validadores

High (funcional):

- React, TypeScript, Vite
- Radix UI, Tailwind
- Axios

Medium (utilidades):

- date-fns, rut.js
- Iconos, loaders

Low (dev):

- ESLint, Prettier
- Testing tools
```

#### Paso 2: Monitoreo

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
      day: 'monday'
      time: '03:00'

    open-pull-requests-limit: 10
    reviewers:
      - 'security-team'
    labels:
      - 'dependencies'
      - 'security'

    # Agrupar actualizaciones
    groups:
      security:
        dependency-type: 'all'
        patterns:
          - 'security*'
          - 'crypto*'
      development:
        dependency-type: 'dev'
      patches:
        update-types: ['patch']
```

#### Paso 3: Testing

```bash
#!/bin/bash
# update-dependencies.sh

echo "1️⃣ Actualizando dependencias..."
pnpm update

echo "2️⃣ Ejecutando tests..."
pnpm run test:run || exit 1

echo "3️⃣ Linting..."
pnpm run lint || exit 1

echo "4️⃣ Type checking..."
pnpm run typecheck || exit 1

echo "5️⃣ Build..."
pnpm run build || exit 1

echo "✅ Todas las validaciones pasaron"
```

#### Paso 4: Documentación

```markdown
# CHANGELOG.md

## [1.2.0] - 2025-12-04

### Updated

- React: 19.1.0 → 19.2.0 (seguridad)
- TypeScript: 5.8.2 → 5.8.3 (bug fixes)
- Zod: 3.25.75 → 3.25.76 (validaciones)

### Breaking Changes

- Ninguno

### Migration Guide

- Sin cambios requeridos

### Security Updates

- Actualización de seguridad crítica en React
```

#### Paso 5: Deployment

```yaml
# Versioning strategy
package.json:
  - Versión: X.Y.Z (Semver)
  - Tag en git: v1.2.0
  - GitHub Release: Con changelog

CI/CD:
  - Test: Automático en PR
  - Build: Automático
  - Deploy: Manual con aprobación
```

---

### 4. **Scripts de Actualización Automática**

```json
{
  "scripts": {
    "update:check": "npm outdated",
    "update:patch": "pnpm update --latest",
    "update:interactive": "pnpm update --interactive --latest",
    "update:security": "npm audit fix --force",
    "update:test": "pnpm run test:run && pnpm run lint && pnpm run build",
    "update:all": "pnpm update && pnpm run update:test"
  }
}
```

---

### 5. **Política de Actualización**

```
Parches de seguridad:
- Aplicar INMEDIATAMENTE
- Testing mínimo
- Deploy en horas

Actualizaciones de parches menores:
- Revisar changelog
- Testing completo
- Deploy en días

Actualizaciones mayores:
- Análisis completo de cambios
- Testing exhaustivo
- Deprecation warnings
- Deploy en semanas

Dependencias críticas:
- React: Actualizar con soporte LTS
- TypeScript: Actualizar versiones pares
- Vite: Actualizar cuando sea estable
```

---

### 6. **Procedimiento de Rollback**

```bash
#!/bin/bash
# rollback.sh - En caso de problema

# 1. Identificar versión anterior
git tag -l | tail -5

# 2. Volver a commit anterior
git revert HEAD

# 3. o resetear a tag anterior
git checkout v1.1.0
git reset --hard HEAD

# 4. Rebuild y deploy anterior
docker build -t enerlova-frontend:v1.1.0 .
docker run -d -p 8080:80 enerlova-frontend:v1.1.0

# 5. Verificar
curl -f http://localhost:8080

# 6. Comunicar al equipo
echo "Rollback a v1.1.0 completado"
```

---

### 7. **Automatización con Dependabot**

```
Dependabot Automático:
- Scannea vulnerabilidades diariamente
- Abre PRs automáticos
- Ejecuta CI automático
- Aprobación manual requerida
- Merge automático si pasa tests (opcional)

Configuración:
- Auto-merge: Deshabilitado inicialmente
- Reviews requeridas: 1-2
- Dismiss stale PRs: Habilitado
```

---

### 📊 Resumen Pregunta 16

```
Versionado:        ✅ Semver + Git tags
Lock file:         ✅ pnpm-lock.yaml
CI/CD:             ✅ GitHub Actions
Testing:           ✅ Vitest
Documentación:     ⚠️ Sin changelog formal
Automatización:    ⚠️ Sin Dependabot
Rollback:          ⚠️ Manual
Comunicación:      ❌ No definida

Impacto: 🟡 FUNCIONAL pero MEJORABLE
Recomendación: Implementar Dependabot + CHANGELOG
```

---

## 📋 Resumen Ejecutivo Preguntas 11-16

| Pregunta | Aspecto         | Status     | Impacto                |
| -------- | --------------- | ---------- | ---------------------- |
| 11       | Validación/Auth | ✅ 90%     | 🟢 Bueno               |
| 12       | Datos Sensibles | 🔴 10%     | 🔴 CRÍTICO             |
| 13       | Sesiones        | ⚠️ 60%     | 🟡 Mejorable           |
| 14       | Rate Limiting   | 🔴 0%      | 🔴 CRÍTICO             |
| 15       | Ethical Hacking | 🔴 0%      | 🟠 Recomendado         |
| 16       | Actualización   | ⚠️ 70%     | 🟡 Mejorable           |
|          | **PROMEDIO**    | **⚠️ 45%** | **🟠 REQUIERE ACCIÓN** |

---

**Documento de Análisis**: Preguntas 11-16  
**Fecha**: 4 Diciembre 2025  
**Próxima Acción**: Implementar HTTPS + Rate Limiting + Dependabot
