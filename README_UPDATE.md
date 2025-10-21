# 🎨 Información para Actualizar README.md

## Sección a Agregar al README Principal

Agregar esta sección después de "Características Principales":

---

### 🎨 Diferenciación Visual de Entornos

**Enerlova** implementa un sistema de tematización visual que permite identificar instantáneamente el entorno en el que estás trabajando:

- **🔵 Producción**: Tema azul profesional sin indicadores
- **🟠 Desarrollo**: Tema naranja cálido con banner superior

#### Beneficios

✅ **Previene errores** al trabajar en el entorno equivocado  
✅ **Identificación inmediata** del entorno  
✅ **No intrusivo** pero altamente visible  
✅ **Compatible con modo oscuro**  
✅ **Zero configuration** en Docker

#### Vista Rápida

```
Producción             Desarrollo
┌─────────────┐       ╔═══ 🟠 DEV ══╗
│ 🔵 Dashboard│       ║ 🟠 Dashboard ║
└─────────────┘       ╚═════════════╝
Sin banner             Con banner
```

📚 **Documentación**: Ver [ENVIRONMENT_VISUAL_GUIDE.md](ENVIRONMENT_VISUAL_GUIDE.md)

---

## Sección para "Inicio Rápido"

Agregar después de la instalación:

### 🎯 Elección del Entorno

#### Opción 1: Scripts Automatizados (Recomendado)

```bash
# Windows PowerShell
.\scripts\switch-environment.ps1 -Environment dev

# Linux/Mac
./scripts/switch-environment.sh dev
```

#### Opción 2: Manual

**Desarrollo:**

```bash
pnpm run dev
# → http://localhost:5173 (Tema Naranja)
```

**Producción:**

```bash
VITE_APP_ENV=production pnpm run build
pnpm run start
# → http://localhost:3000 (Tema Azul)
```

#### Opción 3: Docker

**Desarrollo:**

```bash
docker-compose -f docker-compose.dev.yml up --build
# → http://localhost:3000 (Tema Naranja)
```

**Producción:**

```bash
docker-compose -f docker-compose.prod.yml up --build
# → http://localhost:8080 (Tema Azul)
```

---

## Sección para "Scripts Disponibles"

Agregar estos comandos:

```json
{
  "scripts": {
    "dev": "react-router dev",
    "build": "react-router build",
    "start": "react-router-serve ./build/server/index.js",

    // Gestión de entornos (PowerShell)
    "env:dev": "scripts/switch-environment.ps1 -Environment dev",
    "env:prod": "scripts/switch-environment.ps1 -Environment prod",
    "env:docker-dev": "scripts/switch-environment.ps1 -Environment docker-dev",
    "env:docker-prod": "scripts/switch-environment.ps1 -Environment docker-prod",
    "env:compare": "scripts/switch-environment.ps1 -Environment compare"
  }
}
```

**Uso:**

```bash
pnpm run env:dev        # Desarrollo local
pnpm run env:prod       # Producción local
pnpm run env:docker-dev # Docker desarrollo
```

---

## Sección Nueva: "Entornos"

### 🌍 Entornos

#### Características por Entorno

| Característica      | Desarrollo              | Producción            |
| ------------------- | ----------------------- | --------------------- |
| **Tema de Color**   | 🟠 Naranja (Cálido)     | 🔵 Azul (Profesional) |
| **Banner Superior** | ✅ Visible              | ❌ Oculto             |
| **Indicador**       | "ENTORNO DE DESARROLLO" | Ninguno               |
| **Puerto (Local)**  | 5173                    | 3000                  |
| **Puerto (Docker)** | 3000                    | 8080                  |
| **Hot Reload**      | ✅ Sí                   | ❌ No                 |
| **Source Maps**     | ✅ Completos            | ⚠️ Limitados          |
| **Optimización**    | ⚡ Rápido               | 🚀 Máxima             |

#### Variables de Entorno

```bash
# .env.development
VITE_APP_ENV=development
VITE_API_URL=http://192.168.1.139:8081/Enerlova

# .env.production
VITE_APP_ENV=production
VITE_API_URL=http://192.168.1.139:8081/Enerlova
```

#### Archivos de Configuración

- `app/app.css` - Estilos base (producción)
- `app/app.dev.css` - Override para desarrollo
- `.env.development` - Variables de desarrollo
- `.env.production` - Variables de producción
- `docker-compose.dev.yml` - Docker desarrollo
- `docker-compose.prod.yml` - Docker producción

#### Cambio Rápido de Entorno

```bash
# Opción 1: Scripts (Recomendado)
./scripts/switch-environment.sh dev
./scripts/switch-environment.sh prod

# Opción 2: Variable de entorno
VITE_APP_ENV=development pnpm run dev
VITE_APP_ENV=production pnpm run build

# Opción 3: Docker Compose
docker-compose -f docker-compose.dev.yml up
docker-compose -f docker-compose.prod.yml up
```

#### Comparar Entornos

Para verificar las diferencias visuales:

```bash
# Levantar ambos entornos simultáneamente
./scripts/switch-environment.sh compare

# Acceder a:
# Desarrollo → http://localhost:3000 (Naranja)
# Producción → http://localhost:8080 (Azul)
```

---

## Sección para "Documentación"

Agregar estos links:

### 📚 Guías de Entornos

- [🎨 Guía Visual de Entornos](ENVIRONMENT_VISUAL_GUIDE.md) - Comparativa visual completa
- [⚙️ Documentación Técnica de Tematización](docs/ENVIRONMENT_THEMING.md) - Detalles técnicos
- [🚀 Guía Rápida de Entornos](docs/ENVIRONMENT_QUICK_START.md) - Inicio rápido
- [📜 Scripts de Gestión](scripts/README.md) - Uso de scripts
- [✅ Checklist de Verificación](VERIFICATION_CHECKLIST.md) - Validación del sistema

---

## Badge para el Top del README

Agregar junto a los otros badges:

```markdown
[![Environments](https://img.shields.io/badge/Environments-Dev%20%7C%20Prod-orange?style=for-the-badge)](ENVIRONMENT_VISUAL_GUIDE.md)
```

---

## Tips para el README

### Sección "Tips y Trucos"

````markdown
### 💡 Tips y Trucos

#### Identificar el Entorno Rápidamente

- **Desarrollo**: Busca el banner naranja superior
- **Producción**: Interfaz azul sin banner

#### Atajos de Teclado (Opcional)

Puedes crear alias en tu shell:

```bash
# ~/.bashrc o ~/.zshrc
alias enerlova-dev='cd /path/to/enerlova && ./scripts/switch-environment.sh dev'
alias enerlova-prod='cd /path/to/enerlova && ./scripts/switch-environment.sh prod'
```
````

#### Limpiar Cache

Si los cambios no se reflejan:

```bash
# Opción 1: Con script
./scripts/switch-environment.sh dev --clean

# Opción 2: Manual
rm -rf build/ node_modules/.vite/
pnpm install
```

````

---

## Screenshot Sugeridos

Si tienes screenshots, puedes agregarlos así:

```markdown
### 📸 Screenshots

#### Entorno de Producción
![Producción](docs/screenshots/production.png)
*Tema azul profesional sin indicadores*

#### Entorno de Desarrollo
![Desarrollo](docs/screenshots/development.png)
*Tema naranja con banner de identificación*

#### Comparación Side-by-Side
![Comparación](docs/screenshots/comparison.png)
*Diferencias visuales entre entornos*
````

---

## Usar esta Información

1. **Copia** las secciones relevantes al README.md principal
2. **Adapta** el formato según el estilo actual del README
3. **Agrega** screenshots si están disponibles
4. **Actualiza** los links para que apunten correctamente
5. **Verifica** que los badges funcionen

**Ubicación sugerida de secciones:**

1. Badge de entornos → Top, junto a otros badges
2. Diferenciación visual → Después de "Características Principales"
3. Elección de entorno → En "Inicio Rápido"
4. Scripts → En "Scripts Disponibles"
5. Entornos completo → Nueva sección después de "Instalación"
6. Links de documentación → En sección "Documentación"
