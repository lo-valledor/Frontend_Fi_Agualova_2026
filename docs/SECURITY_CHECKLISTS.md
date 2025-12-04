# ✅ Security Checklists - ENERLOVA Frontend

**Fecha**: 4 Diciembre 2025  
**Versión**: 1.0

---

## 📋 Tabla de Contenidos

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Code Review Security Checklist](#code-review-security-checklist)
3. [Dependency Update Checklist](#dependency-update-checklist)
4. [Incident Response Checklist](#incident-response-checklist)
5. [Periodic Security Review](#periodic-security-review)

---

## 🚀 Pre-Deployment Checklist

### Antes de cada deploy a producción:

#### Build & Configuration
- [ ] Build exitoso sin warnings de seguridad
- [ ] Variables de entorno de producción configuradas
- [ ] Source maps desactivados en producción
- [ ] Console.logs removidos o desactivados

#### Testing
- [ ] Tests unitarios pasando (100%)
- [ ] Tests de integración pasando
- [ ] npm audit sin vulnerabilidades críticas/altas
- [ ] ESLint sin errores de seguridad
- [ ] TypeScript sin errores

#### Security Scans
- [ ] SonarQube Quality Gate pasando
- [ ] OWASP ZAP baseline scan revisado
- [ ] Dependabot alerts resueltos (críticos/altos)

#### Configuration
- [ ] HTTPS/TLS configurado
- [ ] Security headers verificados
- [ ] CSP policy actualizada si hay cambios
- [ ] CORS configurado correctamente

#### Rollback Plan
- [ ] Versión anterior disponible para rollback
- [ ] Procedimiento de rollback documentado
- [ ] Equipo notificado del deploy

---

## 🔍 Code Review Security Checklist

### Para cada Pull Request:

#### Input Handling
- [ ] Todos los inputs validados con Zod
- [ ] No uso de `dangerouslySetInnerHTML`
- [ ] URLs sanitizadas antes de usar
- [ ] No concatenación directa de user input en queries

#### Authentication & Authorization
- [ ] Rutas protegidas usan AuthGuard
- [ ] Tokens manejados correctamente (no en URLs)
- [ ] No credenciales hardcodeadas
- [ ] Roles/permisos verificados

#### Data Handling
- [ ] Datos sensibles no logueados
- [ ] Datos sensibles no almacenados en localStorage (excepto tokens)
- [ ] Datos limpiados en logout/unmount
- [ ] No exposición de datos en error messages

#### Dependencies
- [ ] Nuevas dependencias revisadas por seguridad
- [ ] No dependencias deprecated
- [ ] Versiones específicas (no `*` o `latest`)

#### API Calls
- [ ] Axios interceptors para auth headers
- [ ] Manejo de errores 401/403
- [ ] Timeouts configurados
- [ ] No secrets en requests client-side

---

## 📦 Dependency Update Checklist

### Al actualizar dependencias:

#### Pre-Update
- [ ] Backup de `pnpm-lock.yaml`
- [ ] Revisar changelogs de breaking changes
- [ ] `pnpm audit` ejecutado (estado actual)

#### Update Process
- [ ] Actualizar una dependencia a la vez (críticas)
- [ ] `pnpm update` para minor/patch
- [ ] Tests ejecutados después de cada update
- [ ] Build verificado

#### Post-Update
- [ ] `pnpm audit` limpio
- [ ] Aplicación funcional (smoke test)
- [ ] No regresiones en funcionalidad
- [ ] Commit con mensaje descriptivo

#### Documentation
- [ ] CHANGELOG actualizado si breaking changes
- [ ] PR creado para review
- [ ] Dependabot alert cerrado si aplicable

---

## 🚨 Incident Response Checklist

### Al detectar un incidente:

#### Fase 1: Detección (0-15 min)
- [ ] Incidente confirmado (no falso positivo)
- [ ] Severidad clasificada (P1-P4)
- [ ] Ticket de incidente creado
- [ ] Timeline iniciado
- [ ] Technical Lead notificado

#### Fase 2: Contención (15-60 min)
- [ ] Alcance del incidente determinado
- [ ] Sistemas afectados identificados
- [ ] Usuarios afectados estimados
- [ ] Contención inmediata aplicada
- [ ] Evidencia preservada

#### Fase 3: Erradicación (Variable)
- [ ] Causa raíz identificada
- [ ] Fix desarrollado y testeado
- [ ] Fix desplegado
- [ ] Verificación de erradicación

#### Fase 4: Recuperación
- [ ] Sistemas restaurados
- [ ] Monitoreo intensivo activado
- [ ] Usuarios notificados (si aplica)
- [ ] Servicios normalizados

#### Fase 5: Post-Mortem
- [ ] Timeline completo documentado
- [ ] Root cause analysis completado
- [ ] Lecciones aprendidas identificadas
- [ ] Action items asignados
- [ ] Post-mortem meeting realizado

---

## 🔄 Periodic Security Review

### Checklist Semanal

- [ ] Revisar alertas de Dependabot
- [ ] Revisar reportes de OWASP ZAP
- [ ] Verificar logs de seguridad
- [ ] Revisar PRs pendientes con label `security`

### Checklist Mensual

- [ ] `pnpm audit` completo
- [ ] Revisar SonarQube dashboard
- [ ] Actualizar dependencias minor/patch
- [ ] Revisar y rotar secrets si necesario
- [ ] Backup de configuraciones críticas

### Checklist Trimestral

- [ ] Actualizar dependencias major
- [ ] Full security scan con OWASP ZAP
- [ ] Revisar y actualizar Threat Model
- [ ] Revisar y actualizar Security Architecture
- [ ] Penetration testing (si aplica)
- [ ] Revisar accesos y permisos del equipo
- [ ] Actualizar documentación de seguridad

### Checklist Anual

- [ ] Auditoría de seguridad externa
- [ ] Revisión completa de políticas
- [ ] Security training para el equipo
- [ ] Actualizar Incident Response Plan
- [ ] Ejercicio de simulacro de incidente
- [ ] Revisar y renovar certificados SSL
- [ ] Evaluar nuevas herramientas de seguridad

---

## 📊 Registro de Checklists Completados

| Fecha | Tipo | Completado Por | Notas |
|-------|------|----------------|-------|
| YYYY-MM-DD | Pre-Deploy | @usuario | - |
| YYYY-MM-DD | Security Review | @usuario | - |

---

## 🔗 Referencias

- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)
- [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md)
- [INCIDENT_RESPONSE_PLAN.md](./INCIDENT_RESPONSE_PLAN.md)

---

**Documento mantenido por**: [@gbourguett](https://github.com/gbourguett)  
**Próxima revisión**: 04-03-2026
