# Script de PowerShell para manejar entornos de desarrollo y producción
# Uso: .\scripts\manage-environments.ps1 [dev|prod|stop] [nginx]

param(
    [Parameter(Position=0)]
    [string]$Environment = "dev",

    [Parameter(Position=1)]
    [string]$Profile = ""
)

# Colores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Función para mostrar mensajes
function Write-Log {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor $Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] WARNING: $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ERROR: $Message" -ForegroundColor $Red
    exit 1
}

# Función para verificar si Docker está ejecutándose
function Test-Docker {
    try {
        docker info | Out-Null
    }
    catch {
        Write-Error "Docker no está ejecutándose. Por favor, inicia Docker primero."
    }
}

# Función para detener todos los contenedores
function Stop-AllContainers {
    Write-Log "Deteniendo todos los contenedores..."
    try {
        docker-compose down 2>$null
    }
    catch { }

    try {
        docker-compose -f docker-compose.dev.yml down 2>$null
    }
    catch { }

    Write-Log "Todos los contenedores han sido detenidos."
}

# Función para iniciar entorno de desarrollo
function Start-Development {
    Write-Log "Iniciando entorno de desarrollo..."

    if ($Profile -eq "nginx") {
        Write-Log "Usando perfil nginx para desarrollo..."
        docker-compose -f docker-compose.dev.yml --profile nginx-dev up -d
        Write-Log "Entorno de desarrollo con nginx iniciado en http://localhost:3001"
    }
    else {
        Write-Log "Usando servidor de desarrollo con hot reload..."
        docker-compose -f docker-compose.dev.yml up -d
        Write-Log "Entorno de desarrollo iniciado en http://localhost:4200"
        Write-Log "Hot reload habilitado - los cambios se reflejarán automáticamente"
    }
}

# Función para iniciar entorno de producción
function Start-Production {
    Write-Log "Iniciando entorno de producción..."
    docker-compose up -d
    Write-Log "Entorno de producción iniciado en http://localhost:8080"
}

# Función para mostrar logs
function Show-Logs {
    if ($Environment -eq "dev") {
        docker-compose -f docker-compose.dev.yml logs -f
    }
    else {
        docker-compose logs -f
    }
}

# Función para mostrar estado
function Show-Status {
    Write-Log "Estado de los contenedores:"
    if ($Environment -eq "dev") {
        docker-compose -f docker-compose.dev.yml ps
    }
    else {
        docker-compose ps
    }
}

# Función para limpiar
function Cleanup-Containers {
    Write-Log "Limpiando contenedores e imágenes no utilizadas..."
    docker system prune -f
    Write-Log "Limpieza completada."
}

# Función para mostrar ayuda
function Show-Help {
    Write-Host "Script de gestión de entornos - Enerlova Frontend" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Uso: .\scripts\manage-environments.ps1 [comando] [opción]"
    Write-Host ""
    Write-Host "Comandos:"
    Write-Host "  dev [nginx]    - Inicia entorno de desarrollo"
    Write-Host "                   Opción 'nginx': usa nginx en lugar del servidor de desarrollo"
    Write-Host "  prod           - Inicia entorno de producción"
    Write-Host "  stop           - Detiene todos los contenedores"
    Write-Host "  logs           - Muestra logs del entorno actual"
    Write-Host "  status         - Muestra estado de los contenedores"
    Write-Host "  cleanup        - Limpia contenedores e imágenes no utilizadas"
    Write-Host "  help           - Muestra esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\scripts\manage-environments.ps1 dev         - Inicia desarrollo con hot reload"
    Write-Host "  .\scripts\manage-environments.ps1 dev nginx   - Inicia desarrollo con nginx"
    Write-Host "  .\scripts\manage-environments.ps1 prod        - Inicia producción"
    Write-Host "  .\scripts\manage-environments.ps1 stop        - Detiene todos los entornos"
}

# Verificar Docker
Test-Docker

# Procesar comandos
switch ($Environment.ToLower()) {
    "dev" {
        Stop-AllContainers
        Start-Development
    }
    "prod" {
        Stop-AllContainers
        Start-Production
    }
    "stop" {
        Stop-AllContainers
    }
    "logs" {
        Show-Logs
    }
    "status" {
        Show-Status
    }
    "cleanup" {
        Cleanup-Containers
    }
    { $_ -in @("help", "-h", "--help") } {
        Show-Help
    }
    default {
        Write-Error "Comando no válido: $Environment"
        Write-Host ""
        Show-Help
    }
}
