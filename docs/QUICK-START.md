# 🚀 ENERLOVA - Guía de Inicio Rápido

## ⚡ Configuración Inicial (5 minutos)

### 1. 📋 Prerrequisitos
```bash
# Verificar versiones
node --version    # >= 18.0.0
pnpm --version    # >= 8.0.0
git --version     # Cualquier versión reciente
```

### 2. 🔧 Instalación
```bash
# Clonar y configurar
git clone <repository-url>
cd enerlova/res
pnpm install

# Variables de entorno
echo "VITE_API_URL=http://192.168.1.139:8081/Enerlova" > .env

# Iniciar desarrollo
pnpm dev
```

### 3. 🌐 Acceso
- **Frontend**: http://localhost:5173
- **Login**: Usar credenciales del sistema

---

## 📁 Estructura Esencial

```
app/
├── components/     # Componentes React por módulo
├── routes/        # Rutas file-based (React Router 7)
├── services/      # Servicios API (uno por módulo)
├── types/         # Tipos TypeScript
└── hooks/         # Custom hooks
```

---

## 🎯 Módulos Principales

| Módulo | Ruta | Propósito |
|--------|------|-----------|
| **Monitor** | `/dashboard/monitor` | Lecturas medidores |
| **Operaciones** | `/dashboard/operaciones` | Ciclo facturación |
| **Administración** | `/dashboard/administracion` | Gestión entidades |
| **Mantención** | `/dashboard/mantencion` | Configuración sistema |

---

## 🛠️ Comandos Esenciales

```bash
# Desarrollo
pnpm dev                # Servidor desarrollo
pnpm build             # Build producción
pnpm typecheck         # Verificar tipos

# Calidad
pnpm lint              # ESLint
pnpm format            # Prettier
pnpm ci                # Pipeline completo

# Docker
docker-compose up -d                      # Producción
docker-compose -f docker-compose.dev.yml up -d  # Desarrollo
```

---

## 🔗 Enlaces Rápidos

- **📖 Documentación Completa**: [PROJECT-DOCUMENTATION.md](./PROJECT-DOCUMENTATION.md)
- **🏗️ Arquitectura API**: [API-SERVICES-STRUCTURE.md](./API-SERVICES-STRUCTURE.md)
- **🐳 Deploy**: [DEPLOY-README.md](../DEPLOY-README.md)
- **🤖 GitHub Actions**: [.github/workflows/](.github/workflows/)

---

## 🆘 Solución Rápida de Problemas

### Error de Conexión API
```bash
# Verificar variable de entorno
echo $VITE_API_URL

# Verificar conectividad
curl http://192.168.1.139:8081/Enerlova/health
```

### Error de Compilación TypeScript
```bash
# Limpiar y reinstalar
rm -rf node_modules .react-router
pnpm install
pnpm typecheck
```

### Error de Docker
```bash
# Limpiar contenedores
docker-compose down
docker system prune -f
docker-compose up -d --build
```

---

## 📞 Ayuda Rápida

- **🐛 Errores**: Revisar consola del navegador
- **🔐 Autenticación**: Verificar token en localStorage
- **📡 API**: Verificar Network tab en DevTools
- **🎨 UI**: Componentes siguen patrón shadcn/ui

---

**⚡ ¡Listo para desarrollar!**
