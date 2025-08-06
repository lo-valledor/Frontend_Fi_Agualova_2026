# 🔧 ENERLOVA - Guía de Configuración de Entorno

## 📋 Índice

1. [Configuración de Desarrollo](#-configuración-de-desarrollo)
2. [Variables de Entorno](#-variables-de-entorno)
3. [Herramientas de Desarrollo](#️-herramientas-de-desarrollo)
4. [IDE y Extensiones](#-ide-y-extensiones)
5. [Configuración de Base de Datos](#️-configuración-de-base-de-datos)
6. [Docker y Contenedores](#-docker-y-contenedores)
7. [CI/CD y Deployment](#-cicd-y-deployment)

---

## 💻 Configuración de Desarrollo

### 📋 Prerrequisitos del Sistema

#### Windows
```powershell
# Instalar Node.js via winget
winget install OpenJS.NodeJS

# Instalar pnpm
npm install -g pnpm

# Instalar Git
winget install Git.Git

# Verificar instalaciones
node --version    # >= 18.0.0
pnpm --version    # >= 8.0.0
git --version     # Cualquier versión reciente
```

#### macOS
```bash
# Instalar Homebrew si no está instalado
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js
brew install node

# Instalar pnpm
npm install -g pnpm

# Verificar instalaciones
node --version
pnpm --version
```

#### Linux (Ubuntu/Debian)
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Verificar instalaciones
node --version
pnpm --version
```

### 🔧 Configuración Inicial del Proyecto

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd enerlova/res

# 2. Configurar Node.js version (opcional con nvm)
nvm use 18  # o la versión especificada en .nvmrc

# 3. Instalar dependencias
pnpm install

# 4. Configurar Git hooks
pnpm prepare

# 5. Configurar variables de entorno
cp .env.example .env
# Editar .env con configuraciones específicas

# 6. Verificar configuración
pnpm typecheck
pnpm lint
```

---

## 🌍 Variables de Entorno

### 📝 Archivo .env

#### Desarrollo Local
```bash
# .env.development
NODE_ENV=development
VITE_API_URL=http://192.168.1.139:8082/Enerlova
VITE_APP_NAME=Enerlova
VITE_APP_VERSION=1.0.0

# Configuración de debugging
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug

# URLs de servicios externos (desarrollo)
VITE_SAP_INTEGRATION_URL=http://192.168.1.139:8082/sap
VITE_REPORTS_SERVICE_URL=http://192.168.1.139:8082/reports
```

#### Producción
```bash
# .env.production
NODE_ENV=production
VITE_API_URL=http://192.168.1.139:8081/Enerlova
VITE_APP_NAME=Enerlova
VITE_APP_VERSION=1.0.0

# Configuración de producción
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error

# URLs de servicios externos (producción)
VITE_SAP_INTEGRATION_URL=http://192.168.1.139:8081/sap
VITE_REPORTS_SERVICE_URL=http://192.168.1.139:8081/reports

# Configuración de seguridad
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=your-sentry-dsn
```

#### Testing
```bash
# .env.test
NODE_ENV=test
VITE_API_URL=http://localhost:3001/mock-api
VITE_APP_NAME=Enerlova Test
VITE_DEBUG_MODE=true
VITE_MOCK_API=true
```

### 🔧 Configuración por Entorno

#### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      tailwindcss(),
      reactRouter(),
      tsconfigPaths()
    ],
    define: {
      // Exponer variables de entorno al cliente
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        // Proxy para desarrollo local
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      outDir: 'build/client',
      rollupOptions: {
        output: {
          manualChunks: {
            // Separar vendors para mejor caching
            'react-vendor': ['react', 'react-dom', 'react-router'],
            'ui-vendor': ['@radix-ui/react-alert-dialog', '@radix-ui/react-button'],
            'chart-vendor': ['recharts'],
            'form-vendor': ['react-hook-form', 'zod']
          }
        }
      }
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router',
        '@radix-ui/react-alert-dialog'
      ]
    }
  };
});
```

---

## 🛠️ Herramientas de Desarrollo

### 📝 ESLint Configuration

#### eslint.config.js
```javascript
import js from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import unusedImports from 'eslint-plugin-unused-imports';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      'build/**/*',
      'dist/**/*',
      'node_modules/**/*',
      '*.config.js',
      '*.config.ts',
      'public/**/*',
      '.react-router/**/*',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: {
      react: pluginReact,
      'unused-imports': unusedImports,
      import: importPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/jsx-filename-extension': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/function-component-definition': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'off',

      // Import/export rules
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'off', // Handled by unused-imports
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
];
```

### 🎨 Prettier Configuration

#### .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "plugins": [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss"
  ],
  "importOrder": [
    "^react$",
    "^react-(.*)$",
    "^@(.*)$",
    "^~/(.*)$",
    "^[./]"
  ],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true,
  "tailwindConfig": "./tailwind.config.js",
  "tailwindFunctions": ["cn", "clsx"]
}
```

#### .prettierignore
```
build/
dist/
node_modules/
.react-router/
public/
*.config.js
*.config.ts
pnpm-lock.yaml
```

### 📊 TypeScript Configuration

#### tsconfig.json
```jsonc
{
  "include": [
    "**/*",
    "**/.server/**/*",
    "**/.client/**/*",
    ".react-router/types/**/*"
  ],
  "exclude": [
    "node_modules",
    "build",
    "dist"
  ],
  "compilerOptions": {
    // Target and module
    "target": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleDetection": "force",
    "moduleResolution": "bundler",
    
    // JSX
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    
    // Paths
    "rootDirs": [".", "./.react-router/types"],
    "baseUrl": ".",
    "paths": {
      "~/*": ["./app/*"]
    },
    
    // Type checking
    "strict": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noPropertyAccessFromIndexSignature": false,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": false,
    
    // Emit
    "noEmit": true,
    "declaration": false,
    "declarationMap": false,
    "sourceMap": true,
    
    // Interop
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    
    // Others
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowImportingTsExtensions": false,
    "allowJs": true,
    "checkJs": false
  },
  "ts-node": {
    "esm": true,
    "compilerOptions": {
      "module": "ESNext",
      "moduleResolution": "node"
    }
  }
}
```

### 🎯 Husky Git Hooks

#### .husky/pre-commit
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged
npx lint-staged

# Run type check
pnpm typecheck
```

#### package.json lint-staged
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yaml,yml}": [
      "prettier --write"
    ],
    "*.{css,scss}": [
      "prettier --write"
    ]
  }
}
```

---

## 💡 IDE y Extensiones

### 🔧 Visual Studio Code

#### Extensiones Recomendadas (.vscode/extensions.json)
```json
{
  "recommendations": [
    // Language support
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    
    // React/JSX
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    
    // Code quality
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "streetsidesoftware.code-spell-checker",
    
    // Git
    "eamodio.gitlens",
    "github.vscode-pull-request-github",
    
    // Development
    "ms-vscode.vscode-thunder-client",
    "humao.rest-client",
    "ms-vscode-remote.remote-containers",
    
    // Utilities
    "aaron-bond.better-comments",
    "gruntfuggly.todo-tree",
    "alefragnani.bookmarks",
    "ms-vscode.vscode-todo-highlight"
  ]
}
```

#### Configuración del Workspace (.vscode/settings.json)
```json
{
  // Editor
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.wordWrap": "on",
  "editor.rulers": [80, 120],
  
  // TypeScript
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.suggest.autoImports": true,
  "typescript.format.enable": true,
  
  // Files
  "files.exclude": {
    "**/node_modules": true,
    "**/build": true,
    "**/dist": true,
    "**/.react-router": true,
    "**/coverage": true
  },
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/build/**": true,
    "**/dist/**": true
  },
  
  // Search
  "search.exclude": {
    "**/node_modules": true,
    "**/build": true,
    "**/dist": true,
    "**/coverage": true,
    "pnpm-lock.yaml": true
  },
  
  // Tailwind CSS
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"],
    ["clsx\\(([^)]*)\\)", "'([^']*)'"]
  ],
  
  // ESLint
  "eslint.workingDirectories": ["."],
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  
  // Prettier
  "prettier.requireConfig": true,
  "prettier.useEditorConfig": false,
  
  // Emmet
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

#### Snippets Personalizados (.vscode/snippets.json)
```json
{
  "React Component": {
    "prefix": "rfc",
    "body": [
      "interface ${1:Component}Props {",
      "  $2",
      "}",
      "",
      "export default function ${1:Component}({ $3 }: ${1:Component}Props) {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "}"
    ],
    "description": "Create a React functional component"
  },
  "Custom Hook": {
    "prefix": "hook",
    "body": [
      "import { useState, useCallback } from 'react';",
      "",
      "export function use${1:Hook}() {",
      "  const [${2:state}, set${2/(.*)/${1:/capitalize}/}] = useState$3();",
      "",
      "  const ${4:action} = useCallback(() => {",
      "    $0",
      "  }, []);",
      "",
      "  return {",
      "    ${2:state},",
      "    ${4:action}",
      "  };",
      "}"
    ],
    "description": "Create a custom React hook"
  },
  "Service Function": {
    "prefix": "service",
    "body": [
      "async ${1:functionName}(): Promise<ServiceResponse<${2:Type}[]>> {",
      "  try {",
      "    const response = await api.get('/${3:endpoint}');",
      "    return {",
      "      data: this.processApiResponse<${2:Type}>(response),",
      "      error: null",
      "    };",
      "  } catch (error) {",
      "    return {",
      "      data: null,",
      "      error: error instanceof Error ? error.message : 'Error desconocido'",
      "    };",
      "  }",
      "}"
    ],
    "description": "Create a service function"
  }
}
```

### ⚙️ Tasks de VS Code (.vscode/tasks.json)
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "dev",
      "type": "shell",
      "command": "pnpm",
      "args": ["dev"],
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "isBackground": true,
      "problemMatcher": {
        "owner": "typescript",
        "source": "ts",
        "applyTo": "closedDocuments",
        "fileLocation": ["relative", "${workspaceFolder}"],
        "pattern": [
          {
            "regexp": "(.*):(\\d+):(\\d+): (error|warning|info) (.*)",
            "file": 1,
            "line": 2,
            "column": 3,
            "severity": 4,
            "message": 5
          }
        ],
        "background": {
          "activeOnStart": true,
          "beginsPattern": "^\\s*Local:\\s+http://",
          "endsPattern": "^\\s*ready in \\d+ms\\.$"
        }
      }
    },
    {
      "label": "build",
      "type": "shell",
      "command": "pnpm",
      "args": ["build"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": ["$tsc"]
    },
    {
      "label": "typecheck",
      "type": "shell",
      "command": "pnpm",
      "args": ["typecheck"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": ["$tsc"]
    },
    {
      "label": "lint",
      "type": "shell",
      "command": "pnpm",
      "args": ["lint"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": ["$eslint-stylish"]
    }
  ]
}
```

---

## 🗄️ Configuración de Base de Datos

### 📊 Configuración de Conexión

#### Environment Variables para BD
```bash
# Base de datos principal
DB_HOST=192.168.1.139
DB_PORT=1433
DB_NAME=enerlova_db
DB_USER=enerlova_user
DB_PASSWORD=secure_password

# Base de datos de testing
TEST_DB_HOST=localhost
TEST_DB_PORT=1433
TEST_DB_NAME=enerlova_test
TEST_DB_USER=test_user
TEST_DB_PASSWORD=test_password

# Configuración de pool de conexiones
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_TIMEOUT=30000
```

### 🔧 SQL Server Configuration

#### Dockerfile para SQL Server (desarrollo)
```dockerfile
# docker/sql-server/Dockerfile
FROM mcr.microsoft.com/mssql/server:2019-latest

ENV ACCEPT_EULA=Y
ENV SA_PASSWORD=YourStrong@Passw0rd
ENV MSSQL_PID=Express

# Copiar scripts de inicialización
COPY ./scripts/init/ /opt/mssql-tools/bin/

# Exponer puerto
EXPOSE 1433

# Comando de inicio
CMD ["/opt/mssql/bin/sqlservr"]
```

#### Scripts de Inicialización
```sql
-- scripts/init/01-create-database.sql
CREATE DATABASE enerlova_dev;
GO

USE enerlova_dev;
GO

-- Crear esquemas
CREATE SCHEMA administracion;
GO
CREATE SCHEMA operaciones;
GO
CREATE SCHEMA monitor;
GO
CREATE SCHEMA mantencion;
GO

-- Crear usuario de aplicación
CREATE LOGIN enerlova_user WITH PASSWORD = 'Dev@Password123';
GO
CREATE USER enerlova_user FOR LOGIN enerlova_user;
GO

-- Asignar permisos
EXEC sp_addrolemember 'db_datareader', 'enerlova_user';
EXEC sp_addrolemember 'db_datawriter', 'enerlova_user';
EXEC sp_addrolemember 'db_ddladmin', 'enerlova_user';
GO
```

---

## 🐳 Docker y Contenedores

### 🏗️ Multi-Stage Dockerfile

#### Dockerfile Principal
```dockerfile
# Dockerfile
# Stage 1: Build dependencies
FROM node:18-alpine AS dependencies

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Stage 2: Build application
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar dependencias desde stage anterior
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Build arguments
ARG VITE_API_URL
ARG NODE_ENV=production

# Set environment variables
ENV VITE_API_URL=${VITE_API_URL}
ENV NODE_ENV=${NODE_ENV}

# Instalar pnpm y build
RUN npm install -g pnpm
RUN pnpm build

# Stage 3: Production runtime
FROM nginx:alpine AS production

# Instalar Node.js para server-side rendering
RUN apk add --no-cache nodejs npm

# Copiar build de la aplicación
COPY --from=builder /app/build /app/build

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Crear script de inicio
COPY scripts/start.sh /start.sh
RUN chmod +x /start.sh

# Exponer puertos
EXPOSE 80 3000

# Comando de inicio
CMD ["/start.sh"]
```

#### Dockerfile para Desarrollo
```dockerfile
# Dockerfile.dev
FROM node:18-alpine AS base

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Instalar dependencias del sistema para desarrollo
RUN apk add --no-cache git curl

# Development stage con hot reload
FROM base AS development-server

# Copiar archivos de configuración
COPY package.json pnpm-lock.yaml ./

# Instalar todas las dependencias (incluyendo dev)
RUN pnpm install

# Copiar código fuente
COPY . .

# Exponer puerto de desarrollo
EXPOSE 5173

# Comando para desarrollo con hot reload
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# Development stage con nginx
FROM base AS development-nginx

# Copiar dependencias y código
COPY --from=development-server /app ./

# Build para desarrollo
ARG VITE_API_URL=http://192.168.1.139:8082/Enerlova
ARG NODE_ENV=development
ENV VITE_API_URL=${VITE_API_URL}
ENV NODE_ENV=${NODE_ENV}

RUN pnpm build

# Instalar nginx
RUN apk add --no-cache nginx

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
```

### 🚀 Docker Compose Configurations

#### docker-compose.yml (Producción)
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
      args:
        VITE_API_URL: http://192.168.1.139:8081/Enerlova
        NODE_ENV: production
    ports:
      - '8080:80'
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - VITE_API_URL=http://192.168.1.139:8081/Enerlova
    volumes:
      - ./logs:/var/log/nginx
    networks:
      - enerlova-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Opcional: Base de datos para desarrollo completo
  database:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Passw0rd
      - MSSQL_PID=Express
    ports:
      - '1433:1433'
    volumes:
      - db_data:/var/opt/mssql
      - ./scripts/sql:/docker-entrypoint-initdb.d
    networks:
      - enerlova-network
    restart: unless-stopped

networks:
  enerlova-network:
    driver: bridge

volumes:
  db_data:
    driver: local
```

#### docker-compose.dev.yml (Desarrollo)
```yaml
version: '3.8'

services:
  frontend-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
      target: development-server
      args:
        VITE_API_URL: http://192.168.1.139:8082/Enerlova
        NODE_ENV: development
    ports:
      - '3000:5173'
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://192.168.1.139:8082/Enerlova
      - VITE_DEBUG_MODE=true
    networks:
      - enerlova-dev-network
    restart: unless-stopped
    command: pnpm dev --host 0.0.0.0

  # Nginx para servir archivos estáticos en desarrollo
  frontend-dev-nginx:
    build:
      context: .
      dockerfile: Dockerfile.dev
      target: development-nginx
      args:
        VITE_API_URL: http://192.168.1.139:8082/Enerlova
        NODE_ENV: development
    ports:
      - '8080:80'
    networks:
      - enerlova-dev-network
    restart: unless-stopped

networks:
  enerlova-dev-network:
    driver: bridge
```

### 📋 Scripts de Gestión

#### scripts/manage-environments.ps1 (PowerShell)
```powershell
# scripts/manage-environments.ps1
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("dev", "prod", "stop", "clean", "status", "help")]
    [string]$Action
)

function Show-Help {
    Write-Host "Gestión de Entornos Enerlova" -ForegroundColor Cyan
    Write-Host "=============================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso: .\manage-environments.ps1 <action>" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Acciones disponibles:" -ForegroundColor Green
    Write-Host "  dev     - Iniciar entorno de desarrollo (puerto 3000)" -ForegroundColor White
    Write-Host "  prod    - Iniciar entorno de producción (puerto 8080)" -ForegroundColor White
    Write-Host "  stop    - Detener todos los contenedores" -ForegroundColor White
    Write-Host "  clean   - Limpiar contenedores e imágenes" -ForegroundColor White
    Write-Host "  status  - Ver estado de contenedores" -ForegroundColor White
    Write-Host "  help    - Mostrar esta ayuda" -ForegroundColor White
}

function Start-Development {
    Write-Host "🚀 Iniciando entorno de desarrollo..." -ForegroundColor Green
    docker-compose -f docker-compose.dev.yml up -d --build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Entorno de desarrollo iniciado correctamente" -ForegroundColor Green
        Write-Host "🌐 Acceso: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "📊 Hot reload: Habilitado" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error al iniciar entorno de desarrollo" -ForegroundColor Red
    }
}

function Start-Production {
    Write-Host "🏭 Iniciando entorno de producción..." -ForegroundColor Green
    docker-compose up -d --build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Entorno de producción iniciado correctamente" -ForegroundColor Green
        Write-Host "🌐 Acceso: http://localhost:8080" -ForegroundColor Cyan
        Write-Host "⚡ Modo: Producción optimizada" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error al iniciar entorno de producción" -ForegroundColor Red
    }
}

function Stop-All {
    Write-Host "🛑 Deteniendo todos los contenedores..." -ForegroundColor Yellow
    
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    
    Write-Host "✅ Todos los contenedores detenidos" -ForegroundColor Green
}

function Clean-All {
    Write-Host "🧹 Limpiando contenedores e imágenes..." -ForegroundColor Yellow
    
    # Detener contenedores
    Stop-All
    
    # Limpiar imágenes del proyecto
    docker images | Select-String "enerlova" | ForEach-Object {
        $imageId = ($_ -split '\s+')[2]
        docker rmi $imageId -f
    }
    
    # Limpiar volúmenes no utilizados
    docker volume prune -f
    
    # Limpiar redes no utilizadas
    docker network prune -f
    
    Write-Host "✅ Limpieza completada" -ForegroundColor Green
}

function Show-Status {
    Write-Host "📊 Estado de contenedores:" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    
    $containers = docker ps -a --filter "name=enerlova" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    if ($containers) {
        $containers
    } else {
        Write-Host "No hay contenedores de Enerlova ejecutándose" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🖼️ Imágenes de Enerlova:" -ForegroundColor Cyan
    docker images | Select-String "enerlova"
}

# Ejecutar acción
switch ($Action) {
    "dev" { Start-Development }
    "prod" { Start-Production }
    "stop" { Stop-All }
    "clean" { Clean-All }
    "status" { Show-Status }
    "help" { Show-Help }
}
```

#### scripts/manage-environments.sh (Bash)
```bash
#!/bin/bash
# scripts/manage-environments.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

function show_help() {
    echo -e "${CYAN}Gestión de Entornos Enerlova${NC}"
    echo -e "${CYAN}=============================${NC}"
    echo ""
    echo -e "${YELLOW}Uso: ./manage-environments.sh <action>${NC}"
    echo ""
    echo -e "${GREEN}Acciones disponibles:${NC}"
    echo -e "  ${GREEN}dev${NC}     - Iniciar entorno de desarrollo (puerto 3000)"
    echo -e "  ${GREEN}prod${NC}    - Iniciar entorno de producción (puerto 8080)"
    echo -e "  ${GREEN}stop${NC}    - Detener todos los contenedores"
    echo -e "  ${GREEN}clean${NC}   - Limpiar contenedores e imágenes"
    echo -e "  ${GREEN}status${NC}  - Ver estado de contenedores"
    echo -e "  ${GREEN}help${NC}    - Mostrar esta ayuda"
}

function start_development() {
    echo -e "${GREEN}🚀 Iniciando entorno de desarrollo...${NC}"
    
    if docker-compose -f docker-compose.dev.yml up -d --build; then
        echo -e "${GREEN}✅ Entorno de desarrollo iniciado correctamente${NC}"
        echo -e "${CYAN}🌐 Acceso: http://localhost:3000${NC}"
        echo -e "${YELLOW}📊 Hot reload: Habilitado${NC}"
        
        # Mostrar logs en tiempo real
        echo -e "${BLUE}📄 Mostrando logs (Ctrl+C para detener):${NC}"
        docker-compose -f docker-compose.dev.yml logs -f
    else
        echo -e "${RED}❌ Error al iniciar entorno de desarrollo${NC}"
        exit 1
    fi
}

function start_production() {
    echo -e "${GREEN}🏭 Iniciando entorno de producción...${NC}"
    
    if docker-compose up -d --build; then
        echo -e "${GREEN}✅ Entorno de producción iniciado correctamente${NC}"
        echo -e "${CYAN}🌐 Acceso: http://localhost:8080${NC}"
        echo -e "${YELLOW}⚡ Modo: Producción optimizada${NC}"
    else
        echo -e "${RED}❌ Error al iniciar entorno de producción${NC}"
        exit 1
    fi
}

function stop_all() {
    echo -e "${YELLOW}🛑 Deteniendo todos los contenedores...${NC}"
    
    docker-compose down || true
    docker-compose -f docker-compose.dev.yml down || true
    
    echo -e "${GREEN}✅ Todos los contenedores detenidos${NC}"
}

function clean_all() {
    echo -e "${YELLOW}🧹 Limpiando contenedores e imágenes...${NC}"
    
    # Detener contenedores
    stop_all
    
    # Limpiar imágenes del proyecto
    docker images | grep enerlova | awk '{print $3}' | xargs -r docker rmi -f
    
    # Limpiar volúmenes no utilizados
    docker volume prune -f
    
    # Limpiar redes no utilizadas
    docker network prune -f
    
    echo -e "${GREEN}✅ Limpieza completada${NC}"
}

function show_status() {
    echo -e "${CYAN}📊 Estado de contenedores:${NC}"
    echo -e "${CYAN}=========================${NC}"
    
    if docker ps -a --filter "name=enerlova" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | tail -n +2 | grep -q .; then
        docker ps -a --filter "name=enerlova" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        echo -e "${YELLOW}No hay contenedores de Enerlova ejecutándose${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}🖼️ Imágenes de Enerlova:${NC}"
    docker images | grep enerlova || echo -e "${YELLOW}No hay imágenes de Enerlova${NC}"
}

# Verificar que Docker esté ejecutándose
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está ejecutándose. Por favor, inicia Docker primero.${NC}"
    exit 1
fi

# Verificar argumentos
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Se requiere una acción.${NC}"
    show_help
    exit 1
fi

# Ejecutar acción
case "$1" in
    "dev")
        start_development
        ;;
    "prod")
        start_production
        ;;
    "stop")
        stop_all
        ;;
    "clean")
        clean_all
        ;;
    "status")
        show_status
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Acción no válida: $1${NC}"
        show_help
        exit 1
        ;;
esac
```

---

## 🚀 CI/CD y Deployment

### 🔧 GitHub Actions

#### .github/workflows/ci.yml
```yaml
name: CI Pipeline

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV
          
      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-
            
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Type check
        run: pnpm typecheck
        
      - name: Lint
        run: pnpm lint
        
      - name: Format check
        run: pnpm format:check
        
      - name: Build
        run: pnpm build
        
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-files-${{ matrix.node-version }}
          path: build/
          retention-days: 7

  security:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Run security audit
        uses: pnpm/action-setup@v2
        with:
          version: 8
          run_install: |
            - args: [--frozen-lockfile]
            
      - name: Security audit
        run: pnpm audit
        
      - name: Check for vulnerabilities
        run: |
          if pnpm audit --audit-level moderate; then
            echo "✅ No security vulnerabilities found"
          else
            echo "❌ Security vulnerabilities detected"
            exit 1
          fi

  docker-build:
    runs-on: ubuntu-latest
    needs: [test]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
        
      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: false
          tags: enerlova-frontend:test
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            VITE_API_URL=http://localhost:8081/Enerlova
            NODE_ENV=production
```

#### .github/workflows/deploy-production.yml
```yaml
name: Deploy to Production

on:
  workflow_dispatch:
    inputs:
      force_deploy:
        description: 'Force deployment even if tests fail'
        required: false
        type: boolean
        default: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run tests
        run: |
          pnpm typecheck
          pnpm lint
          pnpm build
        continue-on-error: ${{ github.event.inputs.force_deploy == 'true' }}
        
      - name: Build Docker image
        run: |
          docker build -t enerlova-frontend:${{ github.sha }} \
            --build-arg VITE_API_URL=${{ secrets.PROD_API_URL }} \
            --build-arg NODE_ENV=production .
            
      - name: Save Docker image
        run: docker save enerlova-frontend:${{ github.sha }} | gzip > enerlova-frontend.tar.gz
        
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            # Crear directorio de despliegue
            mkdir -p /opt/enerlova/releases/${{ github.sha }}
            cd /opt/enerlova
            
            # Descargar y cargar nueva imagen
            docker load < enerlova-frontend.tar.gz
            
            # Actualizar docker-compose
            sed -i 's/image: enerlova-frontend:.*/image: enerlova-frontend:${{ github.sha }}/' docker-compose.yml
            
            # Deploy con zero-downtime
            docker-compose up -d --no-deps frontend
            
            # Verificar deployment
            sleep 30
            if curl -f http://localhost:8080/health; then
              echo "✅ Deployment successful"
              
              # Limpiar imágenes antiguas (mantener últimas 3)
              docker images enerlova-frontend --format "table {{.Tag}}" | \
                tail -n +4 | head -n -3 | \
                xargs -I {} docker rmi enerlova-frontend:{} || true
            else
              echo "❌ Deployment failed"
              exit 1
            fi
            
      - name: Notify deployment
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
          message: |
            Deployment to Production:
            Status: ${{ job.status }}
            Commit: ${{ github.sha }}
            Branch: ${{ github.ref }}
```

### 📋 Deployment Scripts

#### scripts/deploy.sh
```bash
#!/bin/bash
# scripts/deploy.sh

set -euo pipefail

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV=${1:-production}
VERSION=${2:-latest}

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

function log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

function warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

function error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

function deploy_production() {
    log "🚀 Iniciando deployment a producción..."
    
    # Verificaciones pre-deployment
    log "🔍 Ejecutando verificaciones pre-deployment..."
    
    # Verificar que estamos en la rama correcta
    current_branch=$(git branch --show-current)
    if [[ "$current_branch" != "main" ]]; then
        warn "No estás en la rama main. Rama actual: $current_branch"
        read -p "¿Continuar? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Verificar que no hay cambios sin commit
    if [[ -n $(git status --porcelain) ]]; then
        error "Hay cambios sin commit. Commit los cambios antes de hacer deploy."
    fi
    
    # Pull latest changes
    log "📥 Obteniendo últimos cambios..."
    git pull origin main
    
    # Ejecutar tests
    log "🧪 Ejecutando tests..."
    pnpm install --frozen-lockfile
    pnpm typecheck
    pnpm lint
    
    # Build
    log "🏗️ Construyendo aplicación..."
    pnpm build
    
    # Build Docker image
    log "🐳 Construyendo imagen Docker..."
    docker build -t enerlova-frontend:$VERSION \
        --build-arg VITE_API_URL=http://192.168.1.139:8081/Enerlova \
        --build-arg NODE_ENV=production \
        .
    
    # Tag latest
    docker tag enerlova-frontend:$VERSION enerlova-frontend:latest
    
    # Deploy
    log "🚀 Desplegando a producción..."
    docker-compose down
    docker-compose up -d
    
    # Health check
    log "🏥 Verificando health check..."
    sleep 30
    
    max_attempts=10
    attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f http://localhost:8080/health > /dev/null 2>&1; then
            log "✅ Aplicación desplegada exitosamente"
            break
        else
            warn "Intento $attempt/$max_attempts fallido. Reintentando en 10 segundos..."
            sleep 10
            ((attempt++))
        fi
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        error "❌ Deployment falló. La aplicación no está respondiendo."
    fi
    
    # Cleanup
    log "🧹 Limpiando imágenes antiguas..."
    docker image prune -f
    
    log "🎉 Deployment completado exitosamente!"
}

function deploy_development() {
    log "🚀 Iniciando deployment a desarrollo..."
    
    # Build y deploy desarrollo
    log "🐳 Construyendo imagen de desarrollo..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml up -d --build
    
    # Health check
    log "🏥 Verificando aplicación de desarrollo..."
    sleep 15
    
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log "✅ Aplicación de desarrollo disponible en http://localhost:3000"
    else
        error "❌ Aplicación de desarrollo no está respondiendo"
    fi
}

function rollback() {
    log "🔄 Iniciando rollback..."
    
    # Obtener última imagen working
    previous_image=$(docker images enerlova-frontend --format "table {{.Tag}}" | sed -n '2p')
    
    if [[ -z "$previous_image" ]]; then
        error "No se encontró imagen anterior para rollback"
    fi
    
    log "🔄 Haciendo rollback a imagen: $previous_image"
    
    # Actualizar docker-compose para usar imagen anterior
    sed -i "s/image: enerlova-frontend:.*/image: enerlova-frontend:$previous_image/" docker-compose.yml
    
    # Restart services
    docker-compose up -d --no-deps frontend
    
    # Health check
    sleep 30
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        log "✅ Rollback completado exitosamente"
    else
        error "❌ Rollback falló"
    fi
}

# Parse argumentos
case "$ENV" in
    "production"|"prod")
        deploy_production
        ;;
    "development"|"dev")
        deploy_development
        ;;
    "rollback")
        rollback
        ;;
    *)
        echo "Uso: $0 {production|development|rollback} [version]"
        echo ""
        echo "Ejemplos:"
        echo "  $0 production v1.2.3"
        echo "  $0 development"
        echo "  $0 rollback"
        exit 1
        ;;
esac
```

---

## 📝 Conclusión

Esta guía de configuración proporciona:

- **🔧 Configuración completa** del entorno de desarrollo
- **🌍 Variables de entorno** para diferentes stages
- **🛠️ Herramientas de calidad** (ESLint, Prettier, TypeScript)
- **💡 IDE optimizado** con extensiones y configuraciones
- **🗄️ Base de datos** configurada para desarrollo
- **🐳 Docker** multi-entorno con scripts de gestión
- **🚀 CI/CD** automatizado con GitHub Actions

Siguiendo esta configuración, tendrás un entorno de desarrollo robusto, escalable y mantenible que sigue las mejores prácticas de la industria.
