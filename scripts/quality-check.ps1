# Script de Verificación de Calidad para Windows
# Ejecutar: .\scripts\quality-check.ps1

Write-Host "🎯 Iniciando análisis de calidad completo..." -ForegroundColor Cyan
Write-Host ""

# Contadores
$errors = 0
$warnings = 0

# Función para mostrar paso
function Show-Step {
    param($message)
    Write-Host "▶ $message" -ForegroundColor Blue
}

# Función para mostrar éxito
function Show-Success {
    param($message)
    Write-Host "✅ $message" -ForegroundColor Green
}

# Función para mostrar error
function Show-Error {
    param($message)
    Write-Host "❌ $message" -ForegroundColor Red
    $script:errors++
}

# Función para mostrar warning
function Show-Warning {
    param($message)
    Write-Host "⚠️  $message" -ForegroundColor Yellow
    $script:warnings++
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  📊 ANÁLISIS DE CALIDAD DE CÓDIGO - ENERLOVA" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# 1. TypeScript Check
Show-Step "1/5 Verificando TypeScript..."
try {
    $tsOutput = pnpm run typecheck 2>&1
    if ($LASTEXITCODE -eq 0) {
        Show-Success "TypeScript: Sin errores"
    } else {
        Show-Error "TypeScript: Errores encontrados"
        Write-Host $tsOutput
    }
} catch {
    Show-Error "TypeScript: Error al ejecutar"
}
Write-Host ""

# 2. ESLint
Show-Step "2/5 Ejecutando ESLint..."
try {
    $eslintOutput = pnpm run lint 2>&1 | Out-String
    $eslintErrors = ([regex]::Matches($eslintOutput, "error")).Count
    $eslintWarnings = ([regex]::Matches($eslintOutput, "warning")).Count
    
    if ($eslintErrors -eq 0) {
        Show-Success "ESLint: Sin errores"
        if ($eslintWarnings -gt 0) {
            Show-Warning "ESLint: $eslintWarnings warnings encontrados"
        }
    } else {
        Show-Error "ESLint: $eslintErrors errores encontrados"
        Write-Host ($eslintOutput -split "`n" | Select-Object -Last 20 | Out-String)
    }
} catch {
    Show-Error "ESLint: Error al ejecutar"
}
Write-Host ""

# 3. Tests
Show-Step "3/5 Ejecutando tests..."
try {
    $testOutput = pnpm run test:run 2>&1
    if ($LASTEXITCODE -eq 0) {
        Show-Success "Tests: Todos pasaron"
    } else {
        Show-Error "Tests: Algunos fallaron"
        Write-Host ($testOutput | Select-Object -Last 20 | Out-String)
    }
} catch {
    Show-Error "Tests: Error al ejecutar"
}
Write-Host ""

# 4. Cobertura
Show-Step "4/5 Generando reporte de cobertura..."
try {
    pnpm run coverage 2>&1 | Out-Null
    if (Test-Path "coverage/coverage-summary.json") {
        $coverageData = Get-Content "coverage/coverage-summary.json" | ConvertFrom-Json
        $coverage = $coverageData.total.lines.pct
        if ($coverage -ge 80) {
            Show-Success "Cobertura: $coverage% (objetivo: >80%)"
        } else {
            Show-Warning "Cobertura: $coverage% (objetivo: >80%)"
        }
    } else {
        Show-Warning "Cobertura: No se pudo generar reporte"
    }
} catch {
    Show-Warning "Cobertura: Error al calcular"
}
Write-Host ""

# 5. Análisis de archivos
Show-Step "5/5 Analizando estructura de código..."
try {
    $tsFiles = (Get-ChildItem -Path "app" -Include "*.ts","*.tsx" -Recurse).Count
    Show-Success "Archivos analizados: $tsFiles"
} catch {
    Show-Warning "No se pudo contar archivos"
}
Write-Host ""

# Reporte final
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  📈 RESUMEN DEL ANÁLISIS" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "🎉 ¡Excelente! No se encontraron problemas." -ForegroundColor Green
    Write-Host ""
    Write-Host "El código está listo para:" -ForegroundColor Green
    Write-Host "  • Commit"
    Write-Host "  • Pull Request"
    Write-Host "  • Deploy"
} elseif ($errors -eq 0) {
    Write-Host "⚠️  Hay $warnings warnings que deberían revisarse." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ejecuta 'pnpm run lint:fix' para corregir automáticamente."
} else {
    Write-Host "❌ Se encontraron $errors errores críticos." -ForegroundColor Red
    Write-Host "   También hay $warnings warnings." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Por favor corrige los errores antes de continuar:"
    Write-Host "  1. Revisa los errores de TypeScript"
    Write-Host "  2. Ejecuta 'pnpm run lint:fix'"
    Write-Host "  3. Ejecuta 'pnpm run test' para ver tests fallidos"
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  📚 COMANDOS ÚTILES" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  pnpm run lint:fix        - Corregir problemas automáticamente"
Write-Host "  pnpm run test:ui         - Ejecutar tests en modo UI"
Write-Host "  pnpm run coverage        - Ver cobertura detallada"
Write-Host "  pnpm run sonar:optimize  - Optimizar para SonarQube"
Write-Host ""

# Exit code basado en errores
if ($errors -gt 0) {
    exit 1
} else {
    exit 0
}
