# 🚨 Plan de Respuesta a Incidentes - ENERLOVA

**Fecha**: 4 Diciembre 2025  
**Versión**: 1.0  
**Estado**: Activo  
**Clasificación**: INTERNO

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Equipo de Respuesta](#equipo-de-respuesta)
3. [Clasificación de Incidentes](#clasificación-de-incidentes)
4. [Proceso de Respuesta](#proceso-de-respuesta)
5. [Procedimientos Específicos](#procedimientos-específicos)
6. [Comunicación](#comunicación)
7. [Post-Incidente](#post-incidente)

---

## 🎯 Introducción

### Propósito

Este documento define los procedimientos para detectar, responder y recuperarse de incidentes de seguridad en ENERLOVA Frontend.

### Alcance

- Aplicación frontend (React)
- Infraestructura de hosting (Nginx, Docker)
- Integración con backend API
- Datos de usuario en el cliente

### Definición de Incidente

Un incidente de seguridad es cualquier evento que:
- Comprometa la confidencialidad, integridad o disponibilidad
- Viole políticas de seguridad
- Ponga en riesgo datos de usuarios
- Afecte la reputación de la organización

---

## 👥 Equipo de Respuesta (CSIRT)

### Roles y Responsabilidades

| Rol | Responsable | Contacto | Responsabilidades |
|-----|-------------|----------|-------------------|
| **Incident Commander** | @gbourguett | [email] | Coordinar respuesta, tomar decisiones |
| **Technical Lead** | [TBD] | [email] | Análisis técnico, contención |
| **Communications Lead** | [TBD] | [email] | Comunicación interna/externa |
| **Legal/Compliance** | [TBD] | [email] | Aspectos legales, notificaciones |

### Escalación

```
┌─────────────────────────────────────────────────────────────┐
│  Nivel 1: Technical Lead                                    │
│  Tiempo: 0-15 min desde detección                          │
│  Acción: Evaluación inicial, contención básica             │
├─────────────────────────────────────────────────────────────┤
│  Nivel 2: Incident Commander                                │
│  Tiempo: 15-30 min (si Nivel 1 no resuelve)                │
│  Acción: Decisiones de negocio, recursos adicionales       │
├─────────────────────────────────────────────────────────────┤
│  Nivel 3: Executive Team                                    │
│  Tiempo: 30-60 min (si impacto crítico)                    │
│  Acción: Comunicación externa, decisiones mayores          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏷️ Clasificación de Incidentes

### Severidad

| Nivel | Nombre | Descripción | Tiempo Respuesta |
|-------|--------|-------------|------------------|
| **P1** | CRÍTICO | Brecha activa, datos expuestos | < 15 min |
| **P2** | ALTO | Vulnerabilidad explotable, sin evidencia de brecha | < 1 hora |
| **P3** | MEDIO | Vulnerabilidad detectada, no explotada | < 4 horas |
| **P4** | BAJO | Debilidad menor, riesgo limitado | < 24 horas |

### Tipos de Incidentes

| Tipo | Ejemplos | Severidad Típica |
|------|----------|------------------|
| **Brecha de Datos** | Tokens expuestos, datos filtrados | P1-P2 |
| **Compromiso de Cuenta** | Acceso no autorizado, session hijacking | P1-P2 |
| **Malware/XSS** | Código malicioso inyectado | P1-P2 |
| **DDoS** | Servicio no disponible | P2-P3 |
| **Vulnerabilidad** | CVE en dependencia, misconfiguration | P2-P4 |
| **Phishing** | Sitio falso, credenciales robadas | P2-P3 |

---

## 🔄 Proceso de Respuesta

### Fases del Proceso

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  DETECCIÓN   │───▶│   ANÁLISIS   │───▶│  CONTENCIÓN  │
│              │    │              │    │              │
│ • Alertas    │    │ • Alcance    │    │ • Aislar     │
│ • Reportes   │    │ • Impacto    │    │ • Preservar  │
│ • Monitoreo  │    │ • Root cause │    │ • Mitigar    │
└──────────────┘    └──────────────┘    └──────────────┘
       │                                       │
       │                                       ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ POST-MORTEM  │◀───│ RECUPERACIÓN │◀───│ ERRADICACIÓN │
│              │    │              │    │              │
│ • Lecciones  │    │ • Restaurar  │    │ • Eliminar   │
│ • Mejoras    │    │ • Validar    │    │ • Parchear   │
│ • Documentar │    │ • Monitorear │    │ • Hardening  │
└──────────────┘    └──────────────┘    └──────────────┘
```

### 1. Detección

**Fuentes de Detección:**
- Alertas de OWASP ZAP (CI/CD)
- Alertas de SonarQube
- Dependabot security alerts
- Logs de seguridad frontend
- Reportes de usuarios
- Monitoreo de CSP violations

**Acciones Inmediatas:**
1. Crear ticket de incidente
2. Notificar a Technical Lead
3. Iniciar timeline de eventos
4. NO modificar evidencia

### 2. Análisis

**Preguntas Clave:**
- ¿Qué sistemas están afectados?
- ¿Cuántos usuarios impactados?
- ¿Hay evidencia de exfiltración de datos?
- ¿El ataque está activo o pasado?
- ¿Cuál es el vector de ataque?

**Herramientas de Análisis:**
```bash
# Ver logs de Nginx
docker logs enerlova-frontend-prod --tail=1000

# Buscar patrones sospechosos
grep -E "(sql|script|eval|exec)" /var/log/nginx/access.log

# Verificar integridad de archivos
sha256sum /usr/share/nginx/html/*.js
```

### 3. Contención

**Contención a Corto Plazo:**
- Bloquear IPs maliciosas en Nginx
- Revocar tokens/sesiones comprometidas
- Deshabilitar funcionalidades afectadas
- Activar modo mantenimiento si necesario

**Contención a Largo Plazo:**
- Parchar vulnerabilidades
- Actualizar dependencias
- Reforzar configuraciones

### 4. Erradicación

**Acciones:**
- Eliminar código malicioso
- Actualizar credenciales comprometidas
- Aplicar parches de seguridad
- Remover accesos no autorizados

### 5. Recuperación

**Checklist de Recuperación:**
- [ ] Sistemas restaurados desde backup limpio
- [ ] Parches de seguridad aplicados
- [ ] Credenciales rotadas
- [ ] Monitoreo intensivo activado
- [ ] Tests de seguridad ejecutados
- [ ] Validación de integridad completada

### 6. Post-Mortem

**Template de Post-Mortem:**
```markdown
## Incidente: [TÍTULO]
**Fecha**: [FECHA]
**Severidad**: [P1-P4]
**Duración**: [TIEMPO]

### Resumen
[Descripción breve]

### Timeline
- HH:MM - Evento
- HH:MM - Acción tomada
- ...

### Root Cause
[Análisis de causa raíz]

### Impacto
- Usuarios afectados: [N]
- Datos comprometidos: [Sí/No]
- Tiempo de downtime: [N minutos]

### Acciones Tomadas
1. [Acción 1]
2. [Acción 2]

### Lecciones Aprendidas
1. [Lección 1]
2. [Lección 2]

### Acciones de Mejora
| Acción | Responsable | Deadline | Estado |
|--------|-------------|----------|--------|
| [Acción] | [Quien] | [Fecha] | [Estado] |
```

---

## 🔧 Procedimientos Específicos

### Brecha de Token JWT

```
1. DETECTAR
   - Alerta de uso de token desde IP inusual
   - Múltiples sesiones simultáneas

2. CONTENER
   - Invalidar todos los tokens del usuario
   - Forzar re-login
   - Bloquear IP sospechosa

3. ERRADICAR
   - Rotar secret de JWT (backend)
   - Revisar logs de acceso
   - Identificar vector de robo

4. RECUPERAR
   - Notificar al usuario
   - Restablecer credenciales
   - Activar 2FA si disponible
```

### XSS Detectado

```
1. DETECTAR
   - Alerta de CSP violation
   - Reporte de usuario
   - Scan de OWASP ZAP

2. CONTENER
   - Identificar página/componente afectado
   - Deshabilitar input vulnerable
   - Activar modo solo lectura

3. ERRADICAR
   - Parchar código vulnerable
   - Revisar inputs similares
   - Actualizar validaciones Zod

4. RECUPERAR
   - Deploy de fix
   - Ejecutar scan completo
   - Actualizar CSP si necesario
```

### Dependencia Vulnerable (CVE Crítico)

```
1. DETECTAR
   - Alerta de Dependabot
   - npm audit failure

2. CONTENER
   - Evaluar si explotable en contexto frontend
   - Considerar workaround temporal

3. ERRADICAR
   - pnpm update [paquete]
   - Ejecutar tests
   - Verificar compatibilidad

4. RECUPERAR
   - Deploy actualización
   - Cerrar alerta Dependabot
   - Documentar en changelog
```

---

## 📣 Comunicación

### Matriz de Comunicación

| Audiencia | Cuándo | Canal | Responsable |
|-----------|--------|-------|-------------|
| CSIRT | Inmediato | Slack/Teams | Technical Lead |
| Management | P1-P2, 30 min | Email + llamada | Incident Commander |
| Usuarios afectados | Post-contención | Email | Communications Lead |
| Todos los usuarios | Si brecha de datos | Email + Banner | Communications Lead |
| Reguladores | Si requerido por ley | Formal | Legal |

### Templates de Comunicación

**Comunicación Interna (Slack):**
```
🚨 INCIDENTE DE SEGURIDAD - [SEVERIDAD]

Tipo: [TIPO]
Estado: [EN INVESTIGACIÓN/CONTENIDO/RESUELTO]
Afectados: [ALCANCE]

Acciones inmediatas:
- [ACCIÓN 1]
- [ACCIÓN 2]

Próxima actualización: [HORA]
```

**Comunicación a Usuarios:**
```
Asunto: Aviso de Seguridad - ENERLOVA

Estimado usuario,

El [FECHA] detectamos [DESCRIPCIÓN GENERAL].

¿Qué ocurrió?
[EXPLICACIÓN SIN DETALLES TÉCNICOS]

¿Qué estamos haciendo?
[ACCIONES TOMADAS]

¿Qué debe hacer usted?
[RECOMENDACIONES: cambiar contraseña, etc.]

Lamentamos los inconvenientes.

Equipo ENERLOVA
```

---

## 📊 Métricas de Incidentes

### KPIs a Monitorear

| Métrica | Objetivo | Frecuencia |
|---------|----------|------------|
| MTTD (Mean Time to Detect) | < 15 min | Por incidente |
| MTTR (Mean Time to Respond) | < 30 min | Por incidente |
| MTTC (Mean Time to Contain) | < 2 horas | Por incidente |
| Incidentes por mes | < 2 P3+ | Mensual |
| Tasa de reincidencia | < 5% | Trimestral |

---

## 📝 Documentos Relacionados

- [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md) - Arquitectura de seguridad
- [THREAT_MODEL.md](./THREAT_MODEL.md) - Modelo de amenazas
- [SECURITY.md](../SECURITY.md) - Política de seguridad pública
- [OWASP_IMPLEMENTACION_RECOMENDACIONES.md](./OWASP_IMPLEMENTACION_RECOMENDACIONES.md) - Recomendaciones OWASP

---

## 📅 Revisiones

| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0 | 04-12-2025 | Documento inicial | @gbourguett |

**Próxima revisión**: 04-06-2026 (Semestral o después de incidente P1-P2)

---

**Documento clasificado como**: INTERNO  
**Distribución**: Equipo CSIRT + Development Team
