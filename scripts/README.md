# 🎨 Scripts de Gestión de Entornos

Este directorio contiene scripts para facilitar el cambio entre entornos de desarrollo y producción.

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
| `prod`        | Build de producción local             | 3000        | 🔵 Azul    |
| `docker-dev`  | Contenedor Docker de desarrollo       | 3000        | 🟠 Naranja |
| `docker-prod` | Contenedor Docker de producción       | 8080        | 🔵 Azul    |
| `compare`     | Ambos entornos Docker simultáneamente | 3000 + 8080 | Ambos      |

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

- Desarrollo en `http://localhost:3000` (naranja)
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

---

**🎨 Scripts v1.0.0**  
Parte del Sistema de Tematización por Entorno
