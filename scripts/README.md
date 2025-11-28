# 🎨 Scripts del Proyecto Enerlova

Este directorio contiene scripts útiles para el desarrollo, testing, documentación y gestión de entornos del proyecto.

## 📋 Categorías de Scripts

### 🔧 Scripts de Desarrollo

Scripts para facilitar el desarrollo local y cambio entre entornos.

### 📚 Scripts de Documentación

Scripts para generar documentación automática del proyecto (PowerShell).

### 🐳 Scripts de Deployment

Scripts para despliegue automatizado con Docker.

## 📜 Scripts Disponibles

### 1. `switch-environment.ps1` (Windows PowerShell)

Script para usuarios de Windows con PowerShell.

**Uso:**

```powershell
# Desarrollo local
.\scripts\switch-environment.ps1 -Environment dev

# Producción local
.\scripts\switch-environment.ps1 -Environment prod

# Docker desarrollo
.\scripts\switch-environment.ps1 -Environment docker-dev

# Docker producción
.\scripts\switch-environment.ps1 -Environment docker-prod

# Comparar ambos entornos
.\scripts\switch-environment.ps1 -Environment compare

# Con limpieza de cache
.\scripts\switch-environment.ps1 -Environment dev -Clean
```

### 2. `switch-environment.sh` (Linux/Mac Bash)

Script para usuarios de Linux y macOS.

**Uso:**

```bash
# Desarrollo local
./scripts/switch-environment.sh dev

# Producción local
./scripts/switch-environment.sh prod

# Docker desarrollo
./scripts/switch-environment.sh docker-dev

# Docker producción
./scripts/switch-environment.sh docker-prod

# Comparar ambos entornos
./scripts/switch-environment.sh compare

# Con limpieza de cache
./scripts/switch-environment.sh dev --clean
```

## 🎯 Opciones de Entorno

| Opción        | Descripción                           | Puerto      | Tema       |
| ------------- | ------------------------------------- | ----------- | ---------- |
| `dev`         | Desarrollo local con Vite             | 5173        | 🟠 Naranja |
| `prod`        | Build de producción local             | 4200        | 🔵 Azul    |
| `docker-dev`  | Contenedor Docker de desarrollo       | 4200        | 🟠 Naranja |
| `docker-prod` | Contenedor Docker de producción       | 8080        | 🔵 Azul    |
| `compare`     | Ambos entornos Docker simultáneamente | 4200 + 8080 | Ambos      |

## 🚀 Ejemplos de Uso

### Desarrollo Rápido

```bash
# Windows
.\scripts\switch-environment.ps1 -Environment dev

# Linux/Mac
./scripts/switch-environment.sh dev
```

### Probar Producción Localmente

```bash
# Windows
.\scripts\switch-environment.ps1 -Environment prod

# Linux/Mac
./scripts/switch-environment.sh prod
```

### Comparar Ambos Entornos

Útil para verificar que las diferencias visuales funcionan correctamente:

```bash
# Windows
.\scripts\switch-environment.ps1 -Environment compare

# Linux/Mac
./scripts/switch-environment.sh compare
```

Esto abrirá:

- Desarrollo en `http://localhost:4200` (naranja)
- Producción en `http://localhost:8080` (azul)

### Limpiar Cache y Reiniciar

Si los cambios no se reflejan, limpia el cache:

```bash
# Windows
.\scripts\switch-environment.ps1 -Environment dev -Clean

# Linux/Mac
./scripts/switch-environment.sh dev --clean
```

## 🔧 Qué Hacen Los Scripts

1. **Muestran banner visual** indicando el entorno
2. **Configuran variables de entorno** (`VITE_APP_ENV`)
3. **Limpian cache** si se solicita
4. **Inician el entorno** correcto
5. **Muestran información** útil (puerto, URL, tema)

## 🎨 Salida Visual

### Desarrollo

```
╔═════════════════════════════════════════════════════╗
║  🔧 INICIANDO ENTORNO DE DESARROLLO
╚═════════════════════════════════════════════════════╝

📋 Información del Entorno:
   • Entorno:     DESARROLLO
   • Tema:        Naranja (Cálido)
   • Puerto:      5173
   • URL:         http://localhost:5173
```

### Producción

```
╔═════════════════════════════════════════════════════╗
║  🏢 INICIANDO ENTORNO DE PRODUCCIÓN (LOCAL)
╚═════════════════════════════════════════════════════╝

📋 Información del Entorno:
   • Entorno:     PRODUCCIÓN
   • Tema:        Azul (Profesional)
   • Puerto:      8080
   • URL:         http://localhost:8080
```

## 🛠️ Troubleshooting

### El script no se ejecuta (PowerShell)

```powershell
# Cambiar política de ejecución
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### El script no se ejecuta (Bash)

```bash
# Hacer ejecutable
chmod +x scripts/switch-environment.sh
```

### Los cambios no se reflejan

```bash
# Usar la opción --clean
./scripts/switch-environment.sh dev --clean
```

### Docker no construye correctamente

```bash
# Reconstruir sin cache
docker-compose -f docker-compose.dev.yml build --no-cache
```

## 📚 Más Información

- Ver `../docs/ENVIRONMENT_THEMING.md` para documentación técnica completa
- Ver `../docs/ENVIRONMENT_QUICK_START.md` para guía rápida
- Ver `../ENVIRONMENT_VISUAL_GUIDE.md` para comparativa visual

## 🎯 Atajos Recomendados

Agrega estos alias a tu shell para acceso rápido:

### PowerShell (`$PROFILE`)

```powershell
function Start-Dev { .\scripts\switch-environment.ps1 -Environment dev }
function Start-Prod { .\scripts\switch-environment.ps1 -Environment prod }
function Start-DockerDev { .\scripts\switch-environment.ps1 -Environment docker-dev }
function Start-DockerProd { .\scripts\switch-environment.ps1 -Environment docker-prod }

Set-Alias dev Start-Dev
Set-Alias prod Start-Prod
```

### Bash/Zsh (`~/.bashrc` o `~/.zshrc`)

```bash
alias dev='./scripts/switch-environment.sh dev'
alias prod='./scripts/switch-environment.sh prod'
alias docker-dev='./scripts/switch-environment.sh docker-dev'
alias docker-prod='./scripts/switch-environment.sh docker-prod'
```

Después puedes simplemente escribir:

```bash
dev      # Inicia desarrollo
prod     # Inicia producción
```

## 📚 Scripts de Documentación

### `generate-docs.ps1` (PowerShell)

Genera documentación automática de componentes y servicios.

**Uso**:

```powershell
# Generar toda la documentación
.\scripts\generate-docs.ps1

# Generar solo componentes
.\scripts\generate-docs.ps1 -Target components

# Generar solo servicios
.\scripts\generate-docs.ps1 -Target services

# Generar documentación específica
.\scripts\generate-docs.ps1 -Target all
```

**Características**:

- Analiza código TypeScript/TSX
- Genera documentación Markdown
- Extrae JSDoc comments
- Crea índices automáticos

**Output**:

- `docs/generated/components.md`
- `docs/generated/services.md`
- `docs/generated/api.md`

## 🚀 Scripts de Deployment

### `deploy.sh` / `deploy.ps1`

Scripts para despliegue automatizado con Docker (si existen).

**Nota**: El deployment principal se maneja mediante GitHub Actions. Ver [Workflows CI/CD](../.github/workflows/README.md).

## 🔄 Integración con GitHub Actions

Estos scripts son utilizados por los workflows de GitHub Actions:

- **documentation.yml**: Usa `generate-docs.ps1` para documentación automática
- **ci-cd.yml**: Pipeline principal de CI/CD
- **development.yml**: Build y deploy de desarrollo

Ver documentación completa de workflows en [.github/workflows/README.md](../.github/workflows/README.md).

## 💻 Comandos desde package.json

Los scripts también están disponibles como comandos de npm/pnpm:

```bash
# Documentación
pnpm run docs:generate       # Generar docs personalizadas
pnpm run docs:typedoc        # Generar TypeDoc
pnpm run docs:all            # Generar toda la documentación
pnpm run docs:components     # Solo componentes
pnpm run docs:services       # Solo servicios
```

## 🐛 Troubleshooting de Scripts

### PowerShell no ejecuta scripts

```powershell
# Cambiar política de ejecución
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Bash no ejecuta scripts

```bash
# Hacer ejecutable
chmod +x scripts/*.sh
```

### Errores de permisos

```bash
# Linux/Mac: Ejecutar con sudo si es necesario
sudo ./scripts/script.sh

# Windows: Ejecutar PowerShell como Administrador
```

---

## 📚 Más Información

- **[Documentación de Deployment](../docs/deployment/DEPLOY-README.md)** - Guía de despliegue
- **[Workflows CI/CD](../.github/workflows/README.md)** - Automatización con GitHub Actions
- **[Guía de Desarrollador](../docs/DEVELOPER_GUIDE.md)** - Onboarding rápido

---

**🎨 Scripts - Proyecto Enerlova**

**Última actualización**: 2025-01-21
