# 🤖 Guía Completa de Automatización de Documentación

## 📋 Resumen de Implementación

Esta guía establece un sistema completo de documentación automática para el proyecto Enerlova Frontend.

## 🚀 Componentes Instalados

### 1. **Scripts de Generación Automática**

- **`scripts/generate-docs.ps1`** - Script principal de PowerShell
- **Comandos disponibles**:
  ```bash
  pnpm run docs:generate       # Generar docs personalizadas
  pnpm run docs:components     # Solo componentes
  pnpm run docs:services       # Solo servicios
  pnpm run docs:typedoc        # TypeDoc
  pnpm run docs:all           # Todo junto
  ```

### 2. **Configuración TypeDoc**

- **`typedoc.json`** - Configuración completa de TypeDoc
- **Características**:
  - Documentación automática de tipos
  - Links a GitHub
  - Temas personalizados
  - Exclusión de archivos de test

### 3. **Integración con Git**

- **`.husky/pre-commit`** - Hook para generar docs antes de commit
- **Auto-detección** de archivos que requieren actualización
- **Staging automático** de documentación generada

### 4. **GitHub Actions (CI/CD)**

- **`.github/workflows/documentation.yml`** - Workflow automático
- **Triggers**:
  - Push a main/develop
  - Pull requests
  - Cambios en archivos relevantes
- **Características**:
  - Generación automática en CI
  - Comentarios en PRs
  - Deploy opcional a GitHub Pages

### 5. **Tareas de VSCode**

- **`.vscode/tasks.json`** - Tareas integradas
- **Acceso rápido**: `Ctrl+Shift+P` → "Tasks: Run Task"
- **Opciones disponibles**:
  - Generar documentación completa
  - Solo componentes/servicios
  - Validar JSDoc

### 6. **Configuración de VSCode**

- **`.vscode/settings.json`** - Auto-completado JSDoc
- **Sugerencias automáticas** de documentación
- **Exclusiones** de archivos generados

## 📖 Cómo Usar

### Uso Básico

```bash
# Generar toda la documentación
pnpm run docs:all

# Solo generar docs personalizadas
pnpm run docs:generate

# Solo TypeDoc
pnpm run docs:typedoc
```

### Desde VSCode

1. **Abrir Command Palette**: `Ctrl+Shift+P`
2. **Escribir**: "Tasks: Run Task"
3. **Seleccionar**: "📚 Generar Documentación Completa"

### Automatización Completa

La documentación se genera automáticamente cuando:

1. **Haces commit** (git hook)
2. **Haces push** a main/develop (GitHub Actions)
3. **Abres un PR** (GitHub Actions con comentario)

## 📂 Estructura de Documentación Generada

```
docs/
├── generated/                    # 🤖 Generado automáticamente
│   ├── README.md                # Índice principal
│   ├── components.md            # Docs de componentes
│   ├── services.md              # Docs de servicios
│   └── api.md                   # Docs de API
├── typedoc/                     # 📖 TypeDoc automático
│   ├── index.html
│   └── ...
├── templates/                   # 📋 Plantillas manuales
│   ├── COMPONENT_TEMPLATE.md
│   └── SERVICE_TEMPLATE.md
└── DOCUMENTATION_GUIDE.md       # 📚 Guía manual
```

## ⚙️ Configuración Adicional

### Para habilitar TypeDoc:

```bash
# Instalar dependencias
pnpm add -D typedoc typedoc-plugin-markdown

# Ejecutar
pnpm run docs:typedoc
```

### Para JSDoc con ESLint (opcional):

```bash
# Instalar
pnpm add -D eslint-plugin-jsdoc

# Ver configuración en docs/AUTOMATION_SETUP.md
```

## 🎯 Beneficios

### ✅ **Automatización Completa**

- Sin intervención manual
- Consistencia garantizada
- Actualización en tiempo real

### ✅ **Integración con Workflow**

- Git hooks automáticos
- CI/CD integrado
- Tareas de VSCode

### ✅ **Múltiples Formatos**

- Markdown personalizado
- TypeDoc profesional
- Enlaces automáticos

### ✅ **Detección Inteligente**

- Solo se regenera cuando es necesario
- Exclusión de archivos irrelevantes
- Staging automático

## 🔧 Troubleshooting

### Si PowerShell da error de permisos:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Si TypeDoc no encuentra archivos:

1. Verificar que `typedoc.json` esté en la raíz
2. Instalar dependencias: `pnpm add -D typedoc`
3. Verificar paths en `entryPoints`

### Si los hooks de Git no funcionan:

```bash
# Reinstalar husky
pnpm run prepare
chmod +x .husky/pre-commit
```

## 📈 Próximos Pasos

1. **Ejecutar primera generación**: `pnpm run docs:all`
2. **Verificar Git hooks**: Hacer un commit de prueba
3. **Configurar GitHub Actions**: Push a develop/main
4. **Revisar documentación generada**: `docs/generated/README.md`

## 🎉 ¡Listo!

Tu sistema de documentación automática está completamente configurado. La documentación se mantendrá actualizada automáticamente con cada cambio en el código.
