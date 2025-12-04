# 🎓 Security Training Guide - ENERLOVA Frontend

**Fecha**: 4 Diciembre 2025  
**Versión**: 1.0  
**Audiencia**: Desarrolladores Frontend

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [OWASP Top 10 para Frontend](#owasp-top-10-para-frontend)
3. [Buenas Prácticas React](#buenas-prácticas-react)
4. [Manejo Seguro de Datos](#manejo-seguro-de-datos)
5. [Autenticación y Sesiones](#autenticación-y-sesiones)
6. [Ejercicios Prácticos](#ejercicios-prácticos)
7. [Recursos Adicionales](#recursos-adicionales)

---

## 🎯 Introducción

### Objetivo del Training

Capacitar al equipo de desarrollo frontend en prácticas de seguridad para:
- Prevenir vulnerabilidades comunes
- Detectar código inseguro en code reviews
- Responder correctamente a incidentes
- Mantener una cultura de seguridad

### Frecuencia de Training

| Tipo | Frecuencia | Duración |
|------|------------|----------|
| Onboarding | Al ingresar | 2 horas |
| Refresher | Trimestral | 1 hora |
| Actualizaciones | Según necesidad | 30 min |
| Post-Incidente | Después de P1-P2 | 1 hora |

---

## 🔟 OWASP Top 10 para Frontend

### A01: Broken Access Control

**Qué es**: Usuarios accediendo a recursos sin autorización.

**En Frontend**:
```typescript
// ❌ MAL: Solo ocultar el botón
{user.role === 'admin' && <AdminButton />}

// ✅ BIEN: Validar también en backend + route guard
<ProtectedRoute requiredRole="admin">
  <AdminPage />
</ProtectedRoute>
```

**Regla de Oro**: El frontend NUNCA es la última línea de defensa. El backend DEBE validar.

---

### A02: Cryptographic Failures

**Qué es**: Datos sensibles expuestos por falta de cifrado.

**En Frontend**:
```typescript
// ❌ MAL: Tokens en URL
window.location.href = `/dashboard?token=${token}`;

// ✅ BIEN: Tokens en headers
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// ❌ MAL: Datos sensibles en localStorage con clave obvia
localStorage.setItem('user_password', password);

// ✅ BIEN: Solo tokens necesarios, nunca contraseñas
// Y considerar sessionStorage para datos temporales
```

---

### A03: Injection

**Qué es**: Código malicioso ejecutado a través de inputs.

**En Frontend (XSS)**:
```typescript
// ❌ MUY MAL: HTML sin sanitizar
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ BIEN: React escapa automáticamente
<div>{userInput}</div>

// ❌ MAL: Eval con input de usuario
eval(userInput);

// ❌ MAL: innerHTML directo
element.innerHTML = userInput;

// ✅ BIEN: textContent para texto plano
element.textContent = userInput;
```

**Validación con Zod**:
```typescript
// ✅ Siempre validar inputs
const UserInputSchema = z.object({
  name: z.string().max(100).regex(/^[a-zA-Z\s]+$/),
  email: z.string().email(),
  age: z.number().int().positive().max(150)
});
```

---

### A05: Security Misconfiguration

**En Frontend**:
```typescript
// ❌ MAL: Console.logs en producción
console.log('User token:', token);
console.log('API Response:', sensitiveData);

// ✅ BIEN: Usar el security logger
import { securityLogger } from '~/lib/security-logger';
securityLogger.info('User authenticated'); // Datos sanitizados

// ❌ MAL: Source maps en producción
// vite.config.ts
build: {
  sourcemap: true  // ❌ Expone código fuente
}

// ✅ BIEN: Sin source maps en prod
build: {
  sourcemap: false
}
```

---

### A07: Identification and Authentication Failures

**En Frontend**:
```typescript
// ❌ MAL: Contraseñas débiles permitidas
const password = '123456';

// ✅ BIEN: Validación OWASP de contraseñas
const PasswordSchema = z.string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener mayúscula')
  .regex(/[a-z]/, 'Debe contener minúscula')
  .regex(/[0-9]/, 'Debe contener número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener caracter especial');

// ❌ MAL: Token sin expiración manejada
const token = localStorage.getItem('token');
// Usar directamente sin verificar expiración

// ✅ BIEN: Verificar expiración
import { jwtDecode } from 'jwt-decode';

function isTokenValid(token: string): boolean {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
```

---

## ⚛️ Buenas Prácticas React

### 1. Escapado Automático

React escapa automáticamente el contenido renderizado:

```typescript
// Seguro: React escapa el HTML
const userInput = '<script>alert("xss")</script>';
return <div>{userInput}</div>;
// Renderiza: &lt;script&gt;alert("xss")&lt;/script&gt;
```

### 2. Props Peligrosas

Evitar props que permiten HTML crudo:

```typescript
// ❌ PELIGROSO
<div dangerouslySetInnerHTML={{ __html: content }} />

// Si es absolutamente necesario, sanitizar primero:
import DOMPurify from 'dompurify';
const sanitized = DOMPurify.sanitize(content);
<div dangerouslySetInnerHTML={{ __html: sanitized }} />
```

### 3. URLs y Links

```typescript
// ❌ PELIGROSO: javascript: URLs
<a href={userProvidedUrl}>Click</a>

// ✅ SEGURO: Validar protocolo
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

<a href={isSafeUrl(url) ? url : '#'}>Click</a>
```

### 4. Event Handlers

```typescript
// ❌ MAL: Ejecutar código de usuario
<button onClick={() => eval(userCode)}>Run</button>

// ✅ BIEN: Solo funciones predefinidas
<button onClick={() => handleAction(actionId)}>Run</button>
```

---

## 🔐 Manejo Seguro de Datos

### Qué NO almacenar en Frontend

| Dato | localStorage | sessionStorage | Memory (State) |
|------|--------------|----------------|----------------|
| Contraseñas | ❌ NUNCA | ❌ NUNCA | ❌ NUNCA |
| Tokens de acceso | ⚠️ Solo si necesario | ✅ Preferido | ✅ Preferido |
| Refresh tokens | ⚠️ Con cuidado | ⚠️ Con cuidado | ✅ Preferido |
| Datos de tarjeta | ❌ NUNCA | ❌ NUNCA | ❌ NUNCA |
| PII sensible | ❌ Evitar | ❌ Evitar | ⚠️ Solo temporal |
| Preferencias UI | ✅ OK | ✅ OK | ✅ OK |

### Limpieza de Datos

```typescript
// ✅ Limpiar al cerrar sesión
function logout() {
  // Limpiar storage
  localStorage.removeItem('token');
  sessionStorage.clear();
  
  // Limpiar estado
  setUser(null);
  setToken(null);
  
  // Limpiar cookies (si aplica)
  document.cookie.split(";").forEach(cookie => {
    document.cookie = cookie
      .replace(/^ +/, "")
      .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
  });
  
  // Redirigir
  navigate('/login');
}
```

### Logs Seguros

```typescript
// ❌ MAL: Loggear datos sensibles
console.log('Login con password:', password);
console.log('Token:', token);
console.log('Response:', { user: { ssn: '123-45-6789' } });

// ✅ BIEN: Usar security logger que sanitiza
import { securityLogger } from '~/lib/security-logger';
securityLogger.authLoginSuccess(userId);
// El logger automáticamente redacta campos sensibles
```

---

## 🔑 Autenticación y Sesiones

### Flujo Seguro de Login

```typescript
async function login(credentials: LoginCredentials) {
  // 1. Validar input localmente
  const result = LoginSchema.safeParse(credentials);
  if (!result.success) {
    securityLogger.validationFailure('login', { errors: result.error.issues });
    throw new Error('Datos inválidos');
  }

  // 2. Enviar a backend (HTTPS)
  const response = await api.post('/auth/login', credentials);

  // 3. Almacenar token de forma segura
  const { accessToken, refreshToken } = response.data;
  setAccessToken(accessToken);  // En memoria
  
  // 4. Log del evento
  securityLogger.authLoginSuccess(response.data.userId);

  // 5. Redirigir
  navigate('/dashboard');
}
```

### Manejo de Token Expirado

```typescript
// Interceptor de Axios
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Intentar refresh
      try {
        const newToken = await refreshAccessToken();
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance.request(error.config);
      } catch {
        // Refresh falló, forzar logout
        securityLogger.security(SecurityEventType.AUTH_SESSION_TIMEOUT, 'Session expired');
        logout();
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 🏋️ Ejercicios Prácticos

### Ejercicio 1: Identificar Vulnerabilidades

Encuentra los problemas de seguridad en este código:

```typescript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Fetching user with token:', token);
    
    fetch(`/api/users/${userId}?token=${token}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]);

  return (
    <div>
      <h1 dangerouslySetInnerHTML={{ __html: user?.name }} />
      <a href={user?.website}>Website</a>
    </div>
  );
}
```

<details>
<summary>Ver Respuesta</summary>

**Problemas encontrados**:

1. ❌ `console.log` con token
2. ❌ Token en URL query parameter
3. ❌ `dangerouslySetInnerHTML` con datos de usuario
4. ❌ URL de usuario sin validar (posible javascript: exploit)
5. ❌ Sin manejo de errores
6. ❌ Sin validación de datos recibidos

**Versión corregida**:

```typescript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    api.get(`/api/users/${userId}`)
      .then(res => {
        const validated = UserSchema.parse(res.data);
        setUser(validated);
      })
      .catch(err => {
        securityLogger.apiError(`/api/users/${userId}`, err.status);
      });
  }, [userId]);

  return (
    <div>
      <h1>{user?.name}</h1>
      {isSafeUrl(user?.website) && (
        <a href={user.website}>Website</a>
      )}
    </div>
  );
}
```

</details>

---

### Ejercicio 2: Code Review

Revisa este PR y lista los issues de seguridad:

```typescript
// auth-service.ts
export async function resetPassword(email: string, newPassword: string) {
  const response = await fetch('/api/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, newPassword })
  });
  
  if (response.ok) {
    alert('Password changed to: ' + newPassword);
    localStorage.setItem('lastPassword', newPassword);
  }
}
```

<details>
<summary>Ver Issues</summary>

1. ❌ **Password en alert**: Expone la contraseña en pantalla
2. ❌ **Password en localStorage**: Almacenamiento inseguro
3. ❌ **Sin Content-Type header**: Potencial parsing incorrecto
4. ❌ **Sin validación de password**: Podría ser débil
5. ❌ **Sin manejo de errores**: Falla silenciosa

</details>

---

## 📚 Recursos Adicionales

### Documentación Interna

- [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md) - Arquitectura de seguridad
- [THREAT_MODEL.md](./THREAT_MODEL.md) - Modelo de amenazas
- [INCIDENT_RESPONSE_PLAN.md](./INCIDENT_RESPONSE_PLAN.md) - Plan de respuesta
- [SECURITY_CHECKLISTS.md](./SECURITY_CHECKLISTS.md) - Checklists

### Recursos Externos

| Recurso | URL | Tema |
|---------|-----|------|
| OWASP Cheat Sheets | https://cheatsheetseries.owasp.org/ | Guías prácticas |
| React Security | https://snyk.io/blog/10-react-security-best-practices/ | React específico |
| OWASP Top 10 | https://owasp.org/Top10/ | Vulnerabilidades web |
| JWT Best Practices | https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/ | Tokens |
| CSP Evaluator | https://csp-evaluator.withgoogle.com/ | Validar CSP |

### Herramientas

| Herramienta | Propósito |
|-------------|-----------|
| OWASP ZAP | Escaneo DAST |
| SonarQube | Análisis SAST |
| npm audit | Dependencias vulnerables |
| Burp Suite | Pentesting manual |
| Browser DevTools | Inspección de seguridad |

---

## ✅ Evaluación

### Quiz Rápido (Auto-evaluación)

1. ¿Cuándo es seguro usar `dangerouslySetInnerHTML`?
2. ¿Dónde deberían almacenarse los tokens de acceso?
3. ¿Por qué el frontend no es suficiente para control de acceso?
4. ¿Qué debe hacer el código si recibe un 401?
5. ¿Cómo se previene XSS en React?

<details>
<summary>Ver Respuestas</summary>

1. Solo con contenido sanitizado (DOMPurify) de fuentes confiables
2. Preferiblemente en memoria (state), o httpOnly cookies
3. Porque el usuario puede modificar el código JS del cliente
4. Intentar refresh token, si falla hacer logout
5. React escapa automáticamente, evitar props peligrosas, validar URLs

</details>

---

## 📅 Registro de Training

| Fecha | Participante | Tipo | Completado |
|-------|--------------|------|------------|
| YYYY-MM-DD | @username | Onboarding | ✅ |

---

**Documento creado por**: [@gbourguett](https://github.com/gbourguett)  
**Última actualización**: 04-12-2025
