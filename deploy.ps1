# deploy.ps1 - Script de despliegue para Windows PowerShell

param(
    [Parameter(Position=0)]
    [ValidateSet("prod", "dev", "both", "stop", "clean", "status", "help")]
    [string]$Environment = "help"
)

function Show-Help {
    Write-Host "🚀 Script de despliegue automático - Enerlova Frontend" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso: .\deploy.ps1 [ENTORNO]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "ENTORNOS disponibles:" -ForegroundColor Green
    Write-Host "  prod     - Despliega entorno de producción (puerto 8080)" -ForegroundColor White
    Write-Host "  dev      - Despliega entorno de desarrollo (puerto 4200)" -ForegroundColor White
    Write-Host "  both     - Despliega ambos entornos" -ForegroundColor White
    Write-Host "  stop     - Detiene todos los contenedores" -ForegroundColor White
    Write-Host "  clean    - Limpia contenedores e imágenes" -ForegroundColor White
    Write-Host "  status   - Muestra el estado de los servicios" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1 prod    # Despliega solo producción" -ForegroundColor Gray
    Write-Host "  .\deploy.ps1 dev     # Despliega solo desarrollo" -ForegroundColor Gray
    Write-Host "  .\deploy.ps1 both    # Despliega ambos entornos" -ForegroundColor Gray
}

function Deploy-Production {
    Write-Host "📦 Desplegando entorno de PRODUCCIÓN..." -ForegroundColor Green
    Write-Host "🌐 Puerto: 8080" -ForegroundColor Yellow
    Write-Host "🔗 API: http://192.168.1.139:8081/Enerlova" -ForegroundColor Yellow

    & docker-compose -f docker-compose.prod.yml down
    & docker-compose -f docker-compose.prod.yml up --build -d

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Entorno de producción desplegado exitosamente" -ForegroundColor Green
        Write-Host "🌍 Acceso: http://localhost:8080" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error en el despliegue de producción" -ForegroundColor Red
    }
}

function Deploy-Development {
    Write-Host "🛠️  Desplegando entorno de DESARROLLO..." -ForegroundColor Blue
    Write-Host "🌐 Puerto: 4200" -ForegroundColor Yellow
    Write-Host "🔗 API: http://192.168.1.139:8082/Enerlova" -ForegroundColor Yellow

    & docker-compose -f docker-compose.develop.yml down
    & docker-compose -f docker-compose.develop.yml up --build -d

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Entorno de desarrollo desplegado exitosamente" -ForegroundColor Green
        Write-Host "🌍 Acceso: http://localhost:4200" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error en el despliegue de desarrollo" -ForegroundColor Red
    }
}

function Stop-Services {
    Write-Host "🛑 Deteniendo todos los servicios..." -ForegroundColor Yellow
    & docker-compose -f docker-compose.prod.yml down 2>$null
    & docker-compose -f docker-compose.develop.yml down 2>$null
    Write-Host "✅ Servicios detenidos" -ForegroundColor Green
}

function Clean-All {
    Write-Host "🧹 Limpiando contenedores e imágenes..." -ForegroundColor Magenta
    Stop-Services
    & docker system prune -f
    & docker image prune -f
    Write-Host "✅ Limpieza completada" -ForegroundColor Green
}

function Show-Status {
    Write-Host "📊 Estado de los servicios:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🏭 Producción (puerto 8080):" -ForegroundColor Green
    & docker-compose -f docker-compose.prod.yml ps
    Write-Host ""
    Write-Host "🛠️  Desarrollo (puerto 4200):" -ForegroundColor Blue
    & docker-compose -f docker-compose.develop.yml ps
}

# Validar que Docker esté disponible
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Docker no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Docker Compose no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Ejecutar según el parámetro
switch ($Environment) {
    "prod" { Deploy-Production }
    "dev" { Deploy-Development }
    "both" {
        Deploy-Production
        Write-Host ""
        Deploy-Development
    }
    "stop" { Stop-Services }
    "clean" { Clean-All }
    "status" { Show-Status }
    default { Show-Help }
}
