# 🎯 Threat Model - ENERLOVA Frontend

**Fecha**: 4 Diciembre 2025  
**Versión**: 1.0  
**Metodología**: STRIDE + DREAD

---

## 📋 Tabla de Contenidos

1. [Alcance del Sistema](#alcance-del-sistema)
2. [Activos a Proteger](#activos-a-proteger)
3. [Actores de Amenaza](#actores-de-amenaza)
4. [Análisis STRIDE](#análisis-stride)
5. [Evaluación DREAD](#evaluación-dread)
6. [Matriz de Riesgos](#matriz-de-riesgos)
7. [Mitigaciones](#mitigaciones)

---

## 🎯 Alcance del Sistema

### Componentes en Alcance

```
┌─────────────────────────────────────────────────────────────┐
│                     EN ALCANCE                               │
├─────────────────────────────────────────────────────────────┤
│  • Aplicación React (SPA)                                    │
│  • Configuración Nginx                                       │
│  • Autenticación frontend                                    │
│  • Comunicación con API backend                              │
│  • Almacenamiento local (tokens, preferencias)               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   FUERA DE ALCANCE                           │
├─────────────────────────────────────────────────────────────┤
│  • Backend API (análisis separado)                           │
│  • Base de datos                                             │
│  • Infraestructura de red                                    │
│  • Dispositivos de usuario final                             │
└─────────────────────────────────────────────────────────────┘
```

### Diagrama de Flujo de Datos (DFD)

```
                                    ┌─────────────┐
                                    │   Usuario   │
                                    │   (Actor)   │
                                    └──────┬──────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────┐
│                         BROWSER                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │ React App   │───▶│ localStorage│    │  Cookies    │       │
│  │             │    │ (tokens)    │    │ (session)   │       │
│  └──────┬──────┘    └─────────────┘    └─────────────┘       │
│         │                                                     │
└─────────┼─────────────────────────────────────────────────────┘
          │ HTTPS
          ▼
┌─────────────────────────────────────────────────────────────┐
│                         NGINX                                │
│         (TLS Termination + Security Headers)                 │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND API                             │
│                   (Fuera de alcance)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 💎 Activos a Proteger

| ID | Activo | Clasificación | Impacto si Comprometido |
|----|--------|---------------|-------------------------|
| A1 | JWT Access Token | 🔴 Crítico | Suplantación de identidad |
| A2 | Refresh Token | 🔴 Crítico | Acceso persistente no autorizado |
| A3 | Datos de sesión | 🟠 Alto | Secuestro de sesión |
| A4 | Código fuente cliente | 🟡 Medio | Ingeniería inversa |
| A5 | Credenciales de usuario | 🔴 Crítico | Robo de cuentas |
| A6 | Datos de negocio (UI) | 🟠 Alto | Fuga de información |

---

## 👤 Actores de Amenaza

| Actor | Motivación | Capacidad | Probabilidad |
|-------|------------|-----------|--------------|
| **Script Kiddie** | Curiosidad, fama | Baja | Alta |
| **Atacante Oportunista** | Financiera | Media | Media |
| **Insider Malicioso** | Venganza, financiera | Alta | Baja |
| **Competidor** | Espionaje industrial | Media | Baja |
| **APT (Estado)** | Estratégica | Muy Alta | Muy Baja |

---

## 🔍 Análisis STRIDE

### S - Spoofing (Suplantación de Identidad)

| ID | Amenaza | Probabilidad | Impacto | Mitigación |
|----|---------|--------------|---------|------------|
| S1 | Robo de JWT token | Media | Alto | Tokens cortos, refresh rotation |
| S2 | Token replay attack | Media | Alto | Validación de expiración |
| S3 | Credential stuffing | Alta | Alto | Rate limiting (backend) |

### T - Tampering (Manipulación)

| ID | Amenaza | Probabilidad | Impacto | Mitigación |
|----|---------|--------------|---------|------------|
| T1 | Modificación de localStorage | Media | Medio | Validación de tokens en backend |
| T2 | Inyección de código JS | Baja | Crítico | CSP estricto |
| T3 | Man-in-the-Middle | Baja | Crítico | HTTPS + HSTS |

### R - Repudiation (Repudio)

| ID | Amenaza | Probabilidad | Impacto | Mitigación |
|----|---------|--------------|---------|------------|
| R1 | Negación de acciones | Media | Medio | Logging en backend |
| R2 | Falsificación de logs | Baja | Medio | Logs inmutables (backend) |

### I - Information Disclosure (Divulgación)

| ID | Amenaza | Probabilidad | Impacto | Mitigación |
|----|---------|--------------|---------|------------|
| I1 | Exposición de tokens en logs | Media | Alto | No logging de datos sensibles |
| I2 | Datos en caché del browser | Media | Medio | Cache-Control headers |
| I3 | Error messages verbosos | Alta | Bajo | Error boundaries genéricos |
| I4 | Source maps en producción | Media | Medio | Desactivar source maps |

### D - Denial of Service (Denegación de Servicio)

| ID | Amenaza | Probabilidad | Impacto | Mitigación |
|----|---------|--------------|---------|------------|
| D1 | DDoS a CDN/Nginx | Media | Alto | CDN con protección DDoS |
| D2 | Ataques de formularios | Media | Medio | Rate limiting, captcha |
| D3 | Memory leaks intencionales | Baja | Bajo | Cleanup en unmount |

### E - Elevation of Privilege (Elevación de Privilegios)

| ID | Amenaza | Probabilidad | Impacto | Mitigación |
|----|---------|--------------|---------|------------|
| E1 | Bypass de route guards | Media | Alto | Validación en backend |
| E2 | Manipulación de roles en token | Baja | Crítico | Tokens firmados (backend) |
| E3 | XSS para robo de admin token | Baja | Crítico | CSP + escapado React |

---

## 📊 Evaluación DREAD

### Escala de Puntuación

| Valor | Descripción |
|-------|-------------|
| 1 | Bajo |
| 2 | Medio |
| 3 | Alto |

### Top 5 Amenazas por Riesgo

| Rank | Amenaza | D | R | E | A | D | **Total** | Prioridad |
|------|---------|---|---|---|---|---|-----------|-----------|
| 1 | E3: XSS para robo de token | 3 | 3 | 2 | 2 | 3 | **13** | 🔴 Crítica |
| 2 | S1: Robo de JWT token | 3 | 3 | 2 | 2 | 2 | **12** | 🔴 Crítica |
| 3 | T3: Man-in-the-Middle | 3 | 2 | 1 | 2 | 3 | **11** | 🟠 Alta |
| 4 | I1: Tokens en logs | 2 | 3 | 2 | 2 | 2 | **11** | 🟠 Alta |
| 5 | E1: Bypass route guards | 2 | 2 | 2 | 3 | 2 | **11** | 🟠 Alta |

> **DREAD**: Damage, Reproducibility, Exploitability, Affected Users, Discoverability

---

## 📈 Matriz de Riesgos

```
         PROBABILIDAD
         ┌─────┬─────┬─────┐
    ALTA │ 🟡  │ 🟠  │ 🔴  │  S3, I3
         ├─────┼─────┼─────┤
   MEDIA │ 🟢  │ 🟡  │ 🟠  │  S1, S2, T1, I1, I2, D1, D2, E1
         ├─────┼─────┼─────┤
    BAJA │ 🟢  │ 🟢  │ 🟡  │  T2, T3, R2, D3, E2, E3
         └─────┴─────┴─────┘
           BAJO  MEDIO ALTO
              IMPACTO
```

---

## 🛡️ Mitigaciones Implementadas

### Estado de Mitigaciones

| Amenaza | Mitigación | Estado | Responsable |
|---------|------------|--------|-------------|
| **XSS (E3)** | CSP Header | ✅ Implementado | Frontend |
| **XSS (E3)** | React escapado automático | ✅ Por defecto | Framework |
| **Token theft (S1)** | Token expiración corta | ✅ Implementado | Backend |
| **MitM (T3)** | HTTPS + HSTS | ⚠️ Pendiente TLS | Infra |
| **Route bypass (E1)** | Validación backend | ✅ Implementado | Backend |
| **Logging tokens (I1)** | No console.log sensible | ⚠️ Revisar | Frontend |
| **Cache (I2)** | Cache-Control headers | ✅ Nginx | Frontend |

### Acciones Pendientes

| Prioridad | Acción | Responsable | Deadline |
|-----------|--------|-------------|----------|
| 🔴 Crítica | Configurar TLS/HTTPS en producción | Infra | Semana 1 |
| 🟠 Alta | Revisar logs para datos sensibles | Frontend | Semana 2 |
| 🟠 Alta | Desactivar source maps en prod | Frontend | Semana 1 |
| 🟡 Media | Implementar rate limiting UI | Frontend | Mes 1 |

---

## 📝 Revisiones y Actualizaciones

| Fecha | Versión | Cambios | Autor |
|-------|---------|---------|-------|
| 04-12-2025 | 1.0 | Documento inicial | @gbourguett |

### Próxima Revisión Programada

- **Fecha**: 04-03-2026 (Trimestral)
- **Disparadores de revisión extraordinaria**:
  - Nuevo componente crítico
  - Incidente de seguridad
  - Cambio en stack tecnológico
  - Nueva integración con terceros

---

**Documento clasificado como**: INTERNO  
**Distribución**: Equipo de desarrollo + DevOps
