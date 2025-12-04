# 🛡️ Documento de Recomendaciones: Implementación de OWASP en ENERLOVA

**Fecha**: 4 Diciembre 2025  
**Versión**: 1.0  
**Propósito**: Guía para implementar prácticas OWASP faltantes  
**Estado**: Solo recomendaciones - No implementado

---

## 📋 Tabla de Contenidos

1. [Vulnerabilidades Críticas](#vulnerabilidades-críticas)
2. [Implementación de OWASP Top 10](#implementación-de-owasp-top-10)
3. [DAST Implementation](#dast-implementation)
4. [SCA Implementation](#sca-implementation)
5. [Checklist de Implementación](#checklist-de-implementación)

---

## 🚨 Vulnerabilidades Críticas a Resolver

### 1. **HTTPS/TLS (A02 - Cryptographic Failures)**

**Impacto**: 🔴 CRÍTICO

**Acciones Recomendadas**:

```bash
1. Obtener certificado SSL/TLS (Let's Encrypt gratuito)
2. Configurar Nginx con soporte HTTPS
3. Configurar redireccionamiento HTTP → HTTPS
4. Actualizar variables de entorno a https://
5. Habilitar HSTS header correctamente
6. Validar certificados en cliente (Axios)
```

**Configuración Nginx Recomendada**:
```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # ... resto de configuración
}
```

---

### 2. **DAST Integration (Dynamic Testing)**

**Impacto**: 🔴 ALTO

**Implementar OWASP ZAP en CI/CD**:

```yaml
# .github/workflows/dast.yml
name: 🔍 DAST Security Testing

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  dast:
    name: DAST with OWASP ZAP
    runs-on: ubuntu-latest
    
    services:
      frontend:
        image: enerlova-frontend:latest
        ports:
          - 80:80
    
    steps:
      - name: Run OWASP ZAP
        uses: zaproxy/action-baseline@v0.7.0
        with:
          target: 'http://localhost'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'
```

**Configuración Local**:
```bash
# Instalar OWASP ZAP
brew install zaproxy  # macOS
# o descargar desde https://www.zaproxy.org/

# Ejecutar escaneo
zaproxy -cmd \
  -quickurl http://localhost:3000 \
  -quickout report.html
```

---

### 3. **SCA - Dependencias Vulnerables**

**Impacto**: 🔴 ALTO

**Opción 1: GitHub Dependabot (Recomendado)**

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    labels:
      - "dependencies"
      - "security"
    
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
```

**Opción 2: Snyk CLI**

```bash
# Instalar Snyk
npm install -g snyk

# Autenticar
snyk auth

# Scan de vulnerabilidades
snyk test

# Monitoreo continuo
snyk monitor
```

**Opción 3: npm audit automático en CI**

```yaml
# En ci-cd.yml
- name: 📦 Security audit
  run: |
    npm audit --audit-level=moderate
```

---

### 4. **SAST - Integrar SonarQube en CI/CD**

**Impacto**: 🟠 MEDIO

**Configuración en CI/CD**:

```yaml
# .github/workflows/ci-cd.yml
- name: 🔍 SonarQube Analysis
  uses: SonarSource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
  with:
    args: |
      -Dsonar.projectKey=Enerlova-front
      -Dsonar.organization=lo-valledor
      -Dsonar.sources=app
      -Dsonar.exclusions=**/node_modules/**,**/build/**
```

**Activar Quality Gate**:
```properties
# sonar-project.properties
sonar.qualitygate.wait=true  # ✅ Bloquea si falla

# Umbrales
sonar.projectVersion.sonarqube.quality.gate=true
```

---

## 🏛️ Implementación de OWASP Top 10

### A01: Broken Access Control

**Nivel Actual**: ⚠️ 60%

**Acciones Recomendadas**:

```typescript
// 1. Validar permisos en cada solicitud API
export async function protectedApiCall(endpoint: string) {
  const user = useAuthContext();
  
  if (!user.hasPermission(endpoint)) {
    throw new Error('Acceso denegado');
  }
  
  return api.get(endpoint);
}

// 2. Implementar role-based route guards
export function RoleGuard({ 
  requiredRoles, 
  children 
}: { 
  requiredRoles: string[];
  children: React.ReactNode;
}) {
  const { user } = useAuthContext();
  
  if (!requiredRoles.includes(user.role)) {
    return <Unauthorized />;
  }
  
  return children;
}

// 3. Validar en backend (crítico)
// Backend DEBE validar TODOS los accesos
```

---

### A02: Cryptographic Failures

**Nivel Actual**: 🔴 10%

**Acciones Recomendadas**:

```typescript
// 1. Forzar HTTPS
// app/components/theme-provider.tsx

export function SecurityWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Redirigir HTTP → HTTPS en producción
    if (import.meta.env.PROD && window.location.protocol === 'http:') {
      window.location.href = 
        'https:' + window.location.href.substring(5);
    }
  }, []);
  
  return children;
}

// 2. Configurar Axios para validar certificados
import https from 'https';

const httpsAgent = new https.Agent({
  rejectUnauthorized: true,
  ca: [/* certificado CA si es necesario */]
});

const axiosInstance = axios.create({
  httpsAgent,
  httpAgent: false, // ✅ No permitir HTTP
});
```

---

### A03: Injection

**Nivel Actual**: ✅ 95% (Ya implementado)

**Mantener Implementación**:

```typescript
// ✅ Usar Zod para todas las validaciones
import { z } from 'zod';

const LoginSchema = z.object({
  username: z.string().email(),
  password: z.string().min(8)
});

// ✅ React escapa HTML automáticamente
// ✅ Evitar dangerouslySetInnerHTML

// ❌ NUNCA usar:
// <div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ USAR:
// <div>{userInput}</div>  // React lo escapa automáticamente
```

---

### A04: Insecure Design

**Nivel Actual**: ⚠️ 50%

**Acciones Recomendadas**:

```markdown
1. Documentar Security Architecture
   - Crear documento de diseño de seguridad
   - Incluir threat model
   - Risk assessment por componente

2. Implementar Privacy by Design
   - Minimizar recolección de datos
   - Anonimizar donde sea posible
   - GDPR compliance

3. Crear Incident Response Plan
   - Procedimientos de respuesta
   - Contactos de emergencia
   - Communication plan
```

---

### A05: Broken Authentication

**Nivel Actual**: ✅ 85%

**Mejoras Recomendadas**:

```typescript
// 1. Usar httpOnly cookies en lugar de localStorage
// Servidor debe setear cookie:
// Set-Cookie: authToken=...; HttpOnly; Secure; SameSite=Strict

// 2. Implementar 2FA (en backend)
export async function enableTwoFactor(userId: string) {
  // Backend debe generar secret TOTP
  // Frontend mostrar QR para escanear
}

// 3. Agregar rate limiting en login
// Backend debe implementar rate limiting
```

---

### A06: Vulnerable and Outdated Components

**Nivel Actual**: ⚠️ 30%

**Acciones Recomendadas**:

```bash
# 1. Configurar Dependabot (visto arriba)

# 2. Mantener pnpm lock file actualizado
pnpm update  # Actualizar a versiones menores

# 3. Auditar regularmente
pnpm audit --fix

# 4. Renovar dependencias mayores (trimestral)
npm outdated
pnpm update --interactive --latest
```

**Script para renovar dependencias seguramente**:

```bash
#!/bin/bash
# update-deps.sh

# 1. Actualizar a latest patch
pnpm update

# 2. Ejecutar tests
pnpm run test:run || exit 1

# 3. Ejecutar linting
pnpm run lint || exit 1

# 4. Build
pnpm run build || exit 1

echo "✅ Dependencies updated safely"
```

---

### A07: Identification and Authentication Failures

**Nivel Actual**: ✅ 90%

**Mantener Implementación**: 

```typescript
// ✅ Ya está implementado bien
// Mantener:
// - Validación de contraseña OWASP
// - JWT con expiración
// - Refresh token
// - Logout completo

// Mejorar:
// - Implementar 2FA en backend
// - Rate limiting en login
// - Account lockout después de intentos
```

---

### A08: Software and Data Integrity Failures

**Nivel Actual**: ⚠️ 40%

**Acciones Recomendadas**:

```yaml
# 1. Subresource Integrity (SRI) para CDN
<script 
  src="https://cdn.example.com/lib.js"
  integrity="sha384-..."
  crossorigin="anonymous">
</script>

# 2. Verificar firma de commits
# En git config:
# [user]
#   signingkey = ...
# [commit]
#   gpgSign = true

# 3. Firmar container images
docker tag enerlova-frontend:latest myregistry/enerlova:latest
docker push --sign=cosign myregistry/enerlova:latest

# 4. Verificar checksum de artifacts
sha256sum build.tar.gz > build.tar.gz.sha256
```

---

### A09: Logging and Monitoring

**Nivel Actual**: ⚠️ 20%

**Acciones Recomendadas**:

```typescript
// 1. Implementar logging estructurado
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 2. Logging de eventos de seguridad
function logSecurityEvent(event: SecurityEvent) {
  logger.warn('Security Event', {
    timestamp: new Date().toISOString(),
    type: event.type,
    userId: event.userId,
    action: event.action,
    resource: event.resource,
    result: event.result,
    ip: event.ip
  });
}

// 3. Auditoría de cambios
function logAudit(action: AuditAction) {
  logger.info('Audit Log', {
    timestamp: new Date().toISOString(),
    userId: action.userId,
    action: action.type,
    entity: action.entity,
    changes: action.changes,
    before: action.before,
    after: action.after
  });
}

// 4. Alertas en tiempo real
// Integrar con servicio de alertas (PagerDuty, etc.)
```

---

### A10: Server-Side Request Forgery

**Nivel Actual**: 🟢 N/A

**Contexto**: Frontend no es vulnerable a SSRF

---

## 🔧 DAST Implementation

### Opción 1: OWASP ZAP Baseline

```yaml
# .github/workflows/dast.yml
name: 🔍 DAST - OWASP ZAP

on:
  pull_request:
    branches: [main, develop]

jobs:
  dast:
    runs-on: ubuntu-latest
    
    services:
      app:
        image: enerlova-frontend:latest
        ports:
          - 80:80
    
    steps:
      - uses: actions/checkout@v4
      
      - name: 📦 Install dependencies
        run: npm install
      
      - name: 🏗️ Build
        run: npm run build
      
      - name: 🚀 Start app
        run: npm run start &
        env:
          PORT: 80
      
      - name: ⏳ Wait for app
        run: |
          for i in {1..30}; do
            curl -f http://localhost || sleep 1
          done
      
      - name: 🔍 OWASP ZAP Scan
        uses: zaproxy/action-baseline@v0.7.0
        with:
          target: 'http://localhost'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'
      
      - name: 📤 Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: zap-report
          path: report_*
```

### Opción 2: OWASP ZAP Full Scan

```yaml
- name: 🔍 OWASP ZAP Full Scan
  uses: zaproxy/action-full-scan@v0.7.0
  with:
    target: 'http://localhost'
    rules_file_name: '.zap/rules.tsv'
    cmd_options: '-a'
    issue_title: 'Security Issue'
```

---

## 🔍 SCA Implementation

### Opción 1: GitHub Dependabot (Recomendado)

```yaml
# .github/dependabot.yml
version: 2
updates:
  # NPM dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "03:00"
    open-pull-requests-limit: 10
    pull-request-branch-name:
      separator: "/"
    reviewers:
      - "security-team"
    assignees:
      - "dev-lead"
    labels:
      - "dependencies"
      - "security"
    commit-message:
      prefix: "chore(deps):"
      include: "scope"
    allow:
      - dependency-type: "all"
    ignore:
      - dependency-name: "old-package"
        versions: ["< 2.0.0"]
  
  # Docker images
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "docker"
      - "security"
```

### Opción 2: Snyk CLI

```bash
# Instalar
npm install -g snyk

# Autenticar con GitHub
snyk auth --github

# Scan inicial
snyk test --severity-threshold=high

# Monitoreo continuo
snyk monitor --org=your-org

# En CI/CD
snyk test --fail-on=all
```

### Opción 3: npm audit en CI

```yaml
# En .github/workflows/ci-cd.yml
- name: 🔐 Security Audit
  run: |
    npm audit --audit-level=moderate
    npm audit fix --force  # Opcional: fix automático
```

---

## ✅ Checklist de Implementación

### Fase 1: Crítica (Semana 1-2)

- [ ] Implementar HTTPS/TLS
- [ ] Configurar Dependabot
- [ ] Agregar npm audit en CI
- [ ] Activar SonarQube en CI
- [ ] Documentar Security Policy

### Fase 2: Alta (Semana 3-4)

- [ ] Implementar OWASP ZAP en CI
- [ ] Configurar rate limiting (backend)
- [ ] Implementar 2FA (backend)
- [ ] Crear Threat Model
- [ ] Documentar Security Architecture

### Fase 3: Media (Mes 2)

- [ ] Implementar logging estructurado
- [ ] Configurar alertas de seguridad
- [ ] Realizar penetration testing
- [ ] Auditoría de seguridad independiente
- [ ] Crear incident response plan

### Fase 4: Mejora Continua (Mes 3+)

- [ ] Rotación de dependencias trimestral
- [ ] Security training para equipo
- [ ] Regular security reviews
- [ ] Bug bounty program
- [ ] Security benchmarking

---

## 📊 Timeline Estimado

```
Semana 1-2:   Implementar 3 items críticos
              Impacto: 🔴 Crítico → 🟠 Alto

Semana 3-4:   Implementar 3 items altos
              Impacto: 🟠 Alto → 🟡 Medio

Mes 2:        Implementar items medios
              Impacto: 🟡 Medio → 🟢 Bajo

Mes 3+:       Mejora continua
              Impacto: 🟢 Bajo → 🟢 Mantenido
```

---

## 📝 Conclusión

**Recomendación Principal**: Implementar OWASP en fases:

1. **Inmediato**: HTTPS + Dependabot + npm audit
2. **Corto plazo**: OWASP ZAP + SonarQube CI + 2FA
3. **Mediano plazo**: Logging + Alertas + Pen Testing
4. **Largo plazo**: Bug Bounty + Security Culture

**Impacto Esperado**:
- Semana 1: 🔴 CRÍTICO → 🟠 ALTO
- Mes 1: 🟠 ALTO → 🟡 MEDIO
- Mes 2: 🟡 MEDIO → 🟢 BAJO
- Mes 3+: 🟢 BAJO (Mantenido)

---

**Documento de Recomendaciones**: OWASP Implementation  
**Fecha**: 4 Diciembre 2025  
**Próximo Review**: 1 Enero 2026
