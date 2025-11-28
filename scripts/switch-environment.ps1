#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script para gestionar entornos de desarrollo y producción

.DESCRIPTION
    Este script facilita el inicio de la aplicación en diferentes entornos,
    mostrando claramente en qué entorno se está ejecutando.

.PARAMETER Environment
    El entorno a ejecutar: 'dev', 'prod', 'docker-dev', 'docker-prod'

.PARAMETER Clean
    Limpia el build cache antes de iniciar

.EXAMPLE
    .\switch-environment.ps1 -Environment dev
    .\switch-environment.ps1 -Environment docker-prod -Clean
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('dev', 'prod', 'docker-dev', 'docker-prod', 'compare')]
    [string]$Environment,

    [Parameter(Mandatory=$false)]
    [switch]$Clean
)

# Colores para output
$ColorDev = "DarkYellow"
$ColorProd = "Blue"
$ColorInfo = "Cyan"
$ColorSuccess = "Green"
$ColorError = "Red"

function Write-Banner {
    param([string]$Text, [string]$Color)
    
    Write-Host ""
    Write-Host "╔═════════════════════════════════════════════════════╗" -ForegroundColor $Color
    Write-Host "║  $Text" -ForegroundColor $Color
    Write-Host "╚═════════════════════════════════════════════════════╝" -ForegroundColor $Color
    Write-Host ""
}

function Clean-BuildCache {
    Write-Host "🧹 Limpiando cache de build..." -ForegroundColor $ColorInfo
    
    if (Test-Path "build") {
        Remove-Item -Recurse -Force "build"
        Write-Host "   ✓ Eliminado: build/" -ForegroundColor $ColorSuccess
    }
    
    if (Test-Path "node_modules/.vite") {
        Remove-Item -Recurse -Force "node_modules/.vite"
        Write-Host "   ✓ Eliminado: node_modules/.vite/" -ForegroundColor $ColorSuccess
    }
    
    Write-Host ""
}

function Show-EnvironmentInfo {
    param([string]$Env, [string]$Port, [string]$Color, [string]$Theme)
    
    Write-Host "📋 Información del Entorno:" -ForegroundColor $ColorInfo
    Write-Host "   • Entorno:     " -NoNewline; Write-Host $Env -ForegroundColor $Color
    Write-Host "   • Tema:        " -NoNewline; Write-Host $Theme -ForegroundColor $Color
    Write-Host "   • Puerto:      " -NoNewline; Write-Host $Port -ForegroundColor $ColorInfo
    Write-Host "   • URL:         " -NoNewline; Write-Host "http://localhost:$Port" -ForegroundColor $ColorInfo
    Write-Host ""
}

# Main logic
switch ($Environment) {
    'dev' {
        Write-Banner "🔧 INICIANDO ENTORNO DE DESARROLLO" $ColorDev
        
        if ($Clean) {
            Clean-BuildCache
        }
        
        Show-EnvironmentInfo -Env "DESARROLLO" -Port "5173" -Color $ColorDev -Theme "Naranja (Cálido)"
        
        Write-Host "🚀 Iniciando servidor de desarrollo..." -ForegroundColor $ColorDev
        Write-Host "   Verás un banner NARANJA en la parte superior" -ForegroundColor $ColorDev
        Write-Host ""
        
        $env:VITE_APP_ENV = "development"
        pnpm run dev
    }
    
    'prod' {
        Write-Banner "🏢 INICIANDO ENTORNO DE PRODUCCIÓN (LOCAL)" $ColorProd
        
        if ($Clean) {
            Clean-BuildCache
        }
        
        Show-EnvironmentInfo -Env "PRODUCCIÓN" -Port "4200" -Color $ColorProd -Theme "Azul (Profesional)"
        
        Write-Host "🔨 Construyendo aplicación..." -ForegroundColor $ColorProd
        $env:VITE_APP_ENV = "production"
        pnpm run build
        
        Write-Host ""
        Write-Host "🚀 Iniciando servidor de producción..." -ForegroundColor $ColorProd
        Write-Host "   NO verás banner, tema AZUL profesional" -ForegroundColor $ColorProd
        Write-Host ""
        
        pnpm run start
    }
    
    'docker-dev' {
        Write-Banner "🐳 INICIANDO DOCKER - DESARROLLO" $ColorDev
        
        if ($Clean) {
            Write-Host "🧹 Limpiando contenedores anteriores..." -ForegroundColor $ColorInfo
            docker-compose -f docker-compose.dev.yml down -v
        }
        
        Show-EnvironmentInfo -Env "DESARROLLO (Docker)" -Port "4200" -Color $ColorDev -Theme "Naranja (Cálido)"
        
        Write-Host "🐳 Construyendo y levantando contenedor..." -ForegroundColor $ColorDev
        Write-Host "   Verás un banner NARANJA en la parte superior" -ForegroundColor $ColorDev
        Write-Host ""
        
        if ($Clean) {
            docker-compose -f docker-compose.dev.yml up --build --force-recreate
        } else {
            docker-compose -f docker-compose.dev.yml up --build
        }
    }
    
    'docker-prod' {
        Write-Banner "🐳 INICIANDO DOCKER - PRODUCCIÓN" $ColorProd
        
        if ($Clean) {
            Write-Host "🧹 Limpiando contenedores anteriores..." -ForegroundColor $ColorInfo
            docker-compose -f docker-compose.prod.yml down -v
        }
        
        Show-EnvironmentInfo -Env "PRODUCCIÓN (Docker)" -Port "8080" -Color $ColorProd -Theme "Azul (Profesional)"
        
        Write-Host "🐳 Construyendo y levantando contenedor..." -ForegroundColor $ColorProd
        Write-Host "   NO verás banner, tema AZUL profesional" -ForegroundColor $ColorProd
        Write-Host ""
        
        if ($Clean) {
            docker-compose -f docker-compose.prod.yml up --build --force-recreate
        } else {
            docker-compose -f docker-compose.prod.yml up --build
        }
    }
    
    'compare' {
        Write-Banner "🔍 COMPARAR ENTORNOS" $ColorInfo
        
        Write-Host "Esta opción inicia ambos entornos simultáneamente para comparación" -ForegroundColor $ColorInfo
        Write-Host ""
        Write-Host "Se abrirán dos contenedores Docker:" -ForegroundColor $ColorInfo
        Write-Host "   1. DESARROLLO →  http://localhost:4200  (Naranja)" -ForegroundColor $ColorDev
        Write-Host "   2. PRODUCCIÓN →  http://localhost:8080  (Azul)" -ForegroundColor $ColorProd
        Write-Host ""
        
        $confirm = Read-Host "¿Continuar? (s/n)"
        
        if ($confirm -eq 's' -or $confirm -eq 'S') {
            Write-Host ""
            Write-Host "🐳 Levantando ambos entornos..." -ForegroundColor $ColorInfo
            
            # Levantar en background
            Start-Job -ScriptBlock {
                docker-compose -f docker-compose.dev.yml up --build
            } -Name "DevEnvironment"
            
            Start-Job -ScriptBlock {
                docker-compose -f docker-compose.prod.yml up --build
            } -Name "ProdEnvironment"
            
            Write-Host ""
            Write-Host "✅ Entornos iniciándose en segundo plano" -ForegroundColor $ColorSuccess
            Write-Host ""
            Write-Host "Ver logs:" -ForegroundColor $ColorInfo
            Write-Host "   Get-Job | Receive-Job" -ForegroundColor $ColorInfo
            Write-Host ""
            Write-Host "Detener:" -ForegroundColor $ColorInfo
            Write-Host "   docker-compose -f docker-compose.dev.yml down" -ForegroundColor $ColorInfo
            Write-Host "   docker-compose -f docker-compose.prod.yml down" -ForegroundColor $ColorInfo
            Write-Host ""
        } else {
            Write-Host "❌ Operación cancelada" -ForegroundColor $ColorError
        }
    }
}

# Footer
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host " 🎨 Sistema de Tematización por Entorno v1.0.0" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
