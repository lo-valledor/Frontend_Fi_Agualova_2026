# Script de Generación Automática de Documentación
# Autor: Sistema de Documentación Automática
# Fecha: $(Get-Date -Format "yyyy-MM-dd")

param(
    [string]$Target = "all",  # all, components, services, api
    [string]$OutputPath = "./docs/generated",
    [switch]$Force = $false
)

Write-Host "🤖 Iniciando generación automática de documentación..." -ForegroundColor Green

# Crear directorio de salida si no existe
if (!(Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force
    Write-Host "📁 Creado directorio: $OutputPath" -ForegroundColor Yellow
}

# Función para extraer JSDoc de archivos TypeScript
function Extract-JSDoc {
    param([string]$FilePath)
    
    try {
        $content = Get-Content $FilePath -Raw -ErrorAction Stop
        if ([string]::IsNullOrEmpty($content)) {
            return @()
        }
        
        $jsdocPattern = '/\*\*[\s\S]*?\*/'
        $matches = [regex]::Matches($content, $jsdocPattern)
        
        return $matches | ForEach-Object { $_.Value }
    }
    catch {
        Write-Host "⚠️ Error leyendo archivo: $FilePath - $($_.Exception.Message)" -ForegroundColor Yellow
        return @()
    }
}

# Función para generar documentación de componentes
function Generate-ComponentDocs {
    Write-Host "📋 Generando documentación de componentes..." -ForegroundColor Cyan
    
    $componentFiles = Get-ChildItem -Path "./app/components" -Recurse -Filter "*.tsx" | 
                     Where-Object { $_.Name -notmatch "\.test\.|\.spec\." }
    
    $componentDocs = @"
# Documentación de Componentes
*Generado automáticamente el $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*

## Índice de Componentes

"@

    foreach ($file in $componentFiles) {
        $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
        $componentName = $file.BaseName
        
        # Extraer JSDoc si existe
        $jsdocs = Extract-JSDoc -FilePath $file.FullName
        
        $componentDocs += @"

### $componentName
**Archivo**: ``$relativePath``

"@
        
        if ($jsdocs) {
            $componentDocs += @"
**Documentación**:
``````typescript
$($jsdocs -join "`n")
``````

"@
        } else {
            $componentDocs += "⚠️ *Sin documentación JSDoc*`n`n"
        }
    }
    
    $componentDocs | Out-File -FilePath "$OutputPath/components.md" -Encoding UTF8
    Write-Host "✅ Documentación de componentes generada en: $OutputPath/components.md" -ForegroundColor Green
}

# Función para generar documentación de servicios
function Generate-ServiceDocs {
    Write-Host "🔧 Generando documentación de servicios..." -ForegroundColor Cyan
    
    $serviceFiles = Get-ChildItem -Path "./app/services" -Filter "*.ts"
    
    $serviceDocs = @"
# Documentación de Servicios
*Generado automáticamente el $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*

## Índice de Servicios

"@

    foreach ($file in $serviceFiles) {
        $serviceName = $file.BaseName
        $content = Get-Content $file.FullName -Raw
        
        # Extraer exports principales
        $exportPattern = 'export\s+(?:const|function|class|default)\s+(\w+)'
        $exports = [regex]::Matches($content, $exportPattern) | ForEach-Object { $_.Groups[1].Value }
        
        $serviceDocs += @"

### $serviceName
**Archivo**: ``app/services/$($file.Name)``

**Exports**:
$(($exports | ForEach-Object { "- ``$_``" }) -join "`n")

"@
    }
    
    $serviceDocs | Out-File -FilePath "$OutputPath/services.md" -Encoding UTF8
    Write-Host "✅ Documentación de servicios generada en: $OutputPath/services.md" -ForegroundColor Green
}

# Función para generar documentación de API
function Generate-ApiDocs {
    Write-Host "🌐 Generando documentación de API..." -ForegroundColor Cyan
    
    $apiFile = "./app/lib/api.ts"
    if (Test-Path $apiFile) {
        $content = Get-Content $apiFile -Raw
        
        # Extraer endpoints
        $endpointPattern = '(?:get|post|put|delete|patch)\s*\(\s*["`'']([^"`'']+)["`'']'
        $endpoints = [regex]::Matches($content, $endpointPattern) | ForEach-Object { $_.Groups[1].Value }
        
        $apiDocs = @"
# Documentación de API
*Generado automáticamente el $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*

## Endpoints Detectados

$(($endpoints | Sort-Object | Get-Unique | ForEach-Object { "- ``$_``" }) -join "`n")

**Archivo fuente**: ``$apiFile``

"@
        
        $apiDocs | Out-File -FilePath "$OutputPath/api.md" -Encoding UTF8
        Write-Host "✅ Documentación de API generada en: $OutputPath/api.md" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No se encontró archivo de API en: $apiFile" -ForegroundColor Yellow
    }
}

# Función para generar índice general
function Generate-Index {
    $indexDocs = @"
# Documentación Generada Automáticamente
*Última actualización: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*

## 📚 Documentación Disponible

- [📋 Componentes](./components.md) - Documentación de todos los componentes React
- [🔧 Servicios](./services.md) - Documentación de servicios y utilidades
- [🌐 API](./api.md) - Endpoints y configuración de API

## 🤖 Generación Automática

Esta documentación se genera automáticamente usando:
``````powershell
.\scripts\generate-docs.ps1 -Target all
``````

### Opciones disponibles:
- ``-Target components`` - Solo componentes
- ``-Target services`` - Solo servicios  
- ``-Target api`` - Solo API
- ``-Target all`` - Todo (por defecto)
- ``-Force`` - Sobrescribir archivos existentes

"@
    
    $indexDocs | Out-File -FilePath "$OutputPath/README.md" -Encoding UTF8
    Write-Host "✅ Índice generado en: $OutputPath/README.md" -ForegroundColor Green
}

# Ejecutar según el target especificado
switch ($Target) {
    "components" { Generate-ComponentDocs }
    "services" { Generate-ServiceDocs }
    "api" { Generate-ApiDocs }
    "all" { 
        Generate-ComponentDocs
        Generate-ServiceDocs
        Generate-ApiDocs
        Generate-Index
    }
    default { 
        Write-Host "❌ Target no válido: $Target" -ForegroundColor Red
        Write-Host "Targets válidos: components, services, api, all" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "🎉 Generación de documentación completada!" -ForegroundColor Green
Write-Host "📁 Revisa los archivos en: $OutputPath" -ForegroundColor Cyan