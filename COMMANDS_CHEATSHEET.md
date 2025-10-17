# 🚀 Comandos Rápidos - Sistema de Entornos

> Referencia rápida de comandos para trabajar con diferentes entornos

---

## 📋 Comandos Básicos

### Desarrollo Local
```bash
# Inicio rápido
pnpm run dev

# Con variable explícita
VITE_APP_ENV=development pnpm run dev

# Script automatizado (Windows)
.\scripts\switch-environment.ps1 -Environment dev

# Script automatizado (Linux/Mac)
./scripts/switch-environment.sh dev
```

### Producción Local
```bash
# Build y start
VITE_APP_ENV=production pnpm run build
pnpm run start

# Script automatizado (Windows)
.\scripts\switch-environment.ps1 -Environment prod

# Script automatizado (Linux/Mac)
./scripts/switch-environment.sh prod
```

---

## 🐳 Docker

### Desarrollo
```bash
# Iniciar contenedor de desarrollo
docker-compose -f docker-compose.dev.yml up --build

# En background
docker-compose -f docker-compose.dev.yml up -d --build

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Detener
docker-compose -f docker-compose.dev.yml down

# Limpiar todo
docker-compose -f docker-compose.dev.yml down -v
```

### Producción
```bash
# Iniciar contenedor de producción
docker-compose -f docker-compose.prod.yml up --build

# En background
docker-compose -f docker-compose.prod.yml up -d --build

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Detener
docker-compose -f docker-compose.prod.yml down

# Limpiar todo
docker-compose -f docker-compose.prod.yml down -v
```

### Rebuild Sin Cache
```bash
# Desarrollo
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up

# Producción
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up
```

---

## 🔍 Verificación

### Ver Variables de Entorno
```bash
# En el navegador (DevTools Console)
console.log(import.meta.env.VITE_APP_ENV)
console.log(import.meta.env.MODE)
console.log(import.meta.env.DEV)
console.log(import.meta.env.PROD)

# En terminal (durante dev)
echo $VITE_APP_ENV  # Linux/Mac
echo %VITE_APP_ENV% # Windows CMD
$env:VITE_APP_ENV   # Windows PowerShell

# En Docker (contenedor corriendo)
docker exec -it enerlova-frontend-dev printenv | grep VITE
docker exec -it enerlova-frontend-prod printenv | grep VITE
```

### Inspeccionar CSS
```javascript
// En DevTools Console
getComputedStyle(document.documentElement).getPropertyValue('--primary')
// → Dev: "oklch(0.65 0.18 35)" (Naranja)
// → Prod: "oklch(0.71 0.15 239.15)" (Azul)
```

---

## 🧹 Limpieza

### Limpiar Cache Local
```bash
# Eliminar build y cache
rm -rf build/
rm -rf node_modules/.vite/

# Reinstalar dependencias
pnpm install

# O con script
./scripts/switch-environment.sh dev --clean
```

### Limpiar Docker
```bash
# Detener y eliminar contenedores
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.prod.yml down

# Eliminar imágenes
docker rmi enerlova-frontend-dev
docker rmi enerlova-frontend-prod

# Limpiar todo Docker
docker system prune -a --volumes
```

---

## 📊 Comparación de Entornos

### Levantar Ambos
```bash
# Método 1: Script automatizado
./scripts/switch-environment.sh compare

# Método 2: Manual en diferentes terminales
# Terminal 1
docker-compose -f docker-compose.dev.yml up --build

# Terminal 2
docker-compose -f docker-compose.prod.yml up --build
```

### Acceder
```bash
# Desarrollo
open http://localhost:3000  # Mac
xdg-open http://localhost:3000  # Linux
start http://localhost:3000  # Windows

# Producción
open http://localhost:8080  # Mac
xdg-open http://localhost:8080  # Linux
start http://localhost:8080  # Windows
```

---

## 🔧 Troubleshooting

### Puerto en Uso
```bash
# Ver qué proceso usa el puerto
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Matar proceso (Mac/Linux)
kill -9 <PID>

# Matar proceso (Windows)
taskkill /PID <PID> /F

# O cambiar puerto en docker-compose.yml
ports:
  - '3001:3000'  # Usar 3001 en lugar de 3000
```

### Cambios No Se Reflejan
```bash
# 1. Limpiar cache
rm -rf build/ node_modules/.vite/

# 2. Reinstalar
pnpm install

# 3. Hard reload del navegador
Ctrl+Shift+R  # Windows/Linux
Cmd+Shift+R   # Mac

# 4. Limpiar Docker
docker-compose down -v
docker-compose up --build --force-recreate
```

### Variables No Cargadas
```bash
# Verificar archivo .env existe
ls -la .env.development .env.production

# Verificar contenido
cat .env.development

# Re-export variables
export VITE_APP_ENV=development
pnpm run dev
```

---

## 🎨 Personalización

### Cambiar Color de Desarrollo
```bash
# 1. Editar archivo CSS
code app/app.dev.css

# 2. Modificar variable --primary
--primary: oklch(0.65 0.18 35);  # Cambiar valores

# 3. Recargar
pnpm run dev
```

### Cambiar Mensaje del Banner
```bash
# 1. Editar root.tsx
code app/root.tsx

# 2. Buscar EnvironmentIndicator
# 3. Modificar el texto
<span>TU MENSAJE AQUÍ</span>

# 4. Guardar y recargar
```

---

## 📦 Build y Deploy

### Build para Producción
```bash
# Build con variable explícita
VITE_APP_ENV=production pnpm run build

# Verificar build
ls -la build/

# Test local
pnpm run start
```

### Deploy Docker
```bash
# 1. Build imagen
docker-compose -f docker-compose.prod.yml build

# 2. Tag imagen
docker tag enerlova-frontend-prod registry.example.com/enerlova:latest

# 3. Push a registry
docker push registry.example.com/enerlova:latest

# 4. Deploy en servidor
ssh user@server 'docker pull registry.example.com/enerlova:latest && docker-compose up -d'
```

---

## 🔄 Workflows Comunes

### Desarrollo Diario
```bash
# 1. Pull último código
git pull

# 2. Instalar dependencias (si hay cambios)
pnpm install

# 3. Iniciar desarrollo
pnpm run dev

# 4. Trabajar...

# 5. Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push
```

### Testing de Producción
```bash
# 1. Build producción
VITE_APP_ENV=production pnpm run build

# 2. Test local
pnpm run start

# 3. Verificar en navegador
# → http://localhost:3000

# 4. Si todo OK, deploy
docker-compose -f docker-compose.prod.yml up --build
```

### Debugging
```bash
# 1. Iniciar con logs verbose
DEBUG=* pnpm run dev

# 2. Ver network en DevTools
# → Verificar requests

# 3. Verificar variables
console.log(import.meta.env)

# 4. Verificar estilos
console.log(getComputedStyle(document.documentElement).getPropertyValue('--primary'))
```

---

## 💡 Tips

### Alias Útiles

Agregar a tu `.bashrc`, `.zshrc` o PowerShell `$PROFILE`:

```bash
# Bash/Zsh
alias ed='cd /path/to/enerlova && ./scripts/switch-environment.sh dev'
alias ep='cd /path/to/enerlova && ./scripts/switch-environment.sh prod'
alias edd='cd /path/to/enerlova && ./scripts/switch-environment.sh docker-dev'
alias epd='cd /path/to/enerlova && ./scripts/switch-environment.sh docker-prod'
alias ec='cd /path/to/enerlova && ./scripts/switch-environment.sh compare'

# PowerShell
function ed { cd C:\path\to\enerlova; .\scripts\switch-environment.ps1 -Environment dev }
function ep { cd C:\path\to\enerlova; .\scripts\switch-environment.ps1 -Environment prod }
```

### Package.json Scripts

Agregar a `package.json`:

```json
{
  "scripts": {
    "env:dev": "pwsh scripts/switch-environment.ps1 -Environment dev",
    "env:prod": "pwsh scripts/switch-environment.ps1 -Environment prod",
    "env:docker-dev": "pwsh scripts/switch-environment.ps1 -Environment docker-dev",
    "env:docker-prod": "pwsh scripts/switch-environment.ps1 -Environment docker-prod"
  }
}
```

Uso:
```bash
pnpm run env:dev
pnpm run env:prod
```

---

## 📖 Referencias Rápidas

- **Documentación Completa**: `docs/ENVIRONMENT_THEMING.md`
- **Guía Visual**: `ENVIRONMENT_VISUAL_GUIDE.md`
- **Quick Start**: `docs/ENVIRONMENT_QUICK_START.md`
- **Scripts**: `scripts/README.md`
- **Checklist**: `VERIFICATION_CHECKLIST.md`
- **Resumen**: `IMPLEMENTATION_SUMMARY.md`

---

**🚀 Cheatsheet v1.0.0**  
Guarda este archivo para referencia rápida
