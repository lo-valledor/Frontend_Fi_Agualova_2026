# Enerlova - Sistema de Gestión Energética

Sistema integral de gestión para empresas de distribución eléctrica, diseñado para administrar el ciclo completo de facturación, desde la lectura de medidores hasta la generación de facturas.

## 🚀 Características Principales

### 📊 **Monitor de Lecturas**
- Visualización y gestión de lecturas de medidores por sector y período
- Soporte para diferentes tipos de tarifas (BT-1, BT-2, BT-4.3)
- Análisis de consumo energético con estadísticas detalladas
- Validación automática de lecturas con claves de control
- Exportación de datos de lecturas

### ⚙️ **Operaciones**
- **Gestión de Períodos**: Apertura y cierre de períodos de facturación
- **Preparación de Lecturas**: Asignación de sectores y validación de pendientes
- **Cálculo de Facturas**: Revisión y aceptación de cálculos prefactura
- **Cambio de Medidores**: Gestión de reemplazos y reaperturas
- **Corte y Reposición**: Control de servicios suspendidos
- **Precios y Cargos**: Administración de tarifas y conceptos facturables
- **Integración SAP**: Generación de archivos para sistemas externos

### 👥 **Administración**
- **Gestión de Usuarios**: Control de acceso y perfiles
- **Clientes**: Registro y mantenimiento de información de clientes
- **Contratos**: Administración de contratos de suministro
- **Medidores**: Control de equipos de medición
- **Acometidas**: Gestión de conexiones eléctricas
- **Cargos Facturables**: Configuración de conceptos de cobro

### 🔧 **Mantención**
- **Parámetros del Sistema**: Configuración de variables operativas
- **Tarifas**: Definición de estructuras tarifarias
- **Conceptos**: Gestión de conceptos facturables
- **Ciclos de Facturación**: Configuración de períodos
- **Zonas y Sectores**: Organización territorial
- **Nichos y Empalmes**: Infraestructura de distribución
- **Marcas de Medidores**: Catálogo de equipos

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19, React Router 7, TypeScript
- **UI/UX**: Tailwind CSS, Radix UI, Lucide React
- **Formularios**: React Hook Form, Zod validation
- **Tablas**: TanStack Table con paginación avanzada
- **Gráficos**: Recharts para visualizaciones
- **Notificaciones**: Sonner toast
- **Autenticación**: JWT con manejo de sesiones
- **HTTP Client**: Axios con interceptores
- **Desarrollo**: Vite, ESLint, Prettier

## 📦 Instalación

### Prerrequisitos
- Node.js 18+
- pnpm (recomendado) o npm

### Configuración

```bash
# Clonar el repositorio
git clone <repository-url>
cd res

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con las configuraciones del backend
```

## 🚀 Desarrollo

```bash
# Iniciar servidor de desarrollo
pnpm dev

# La aplicación estará disponible en http://localhost:5173
```

## 🏗️ Construcción para Producción

```bash
# Crear build de producción
pnpm build

# Iniciar servidor de producción
pnpm start
```

## 🐳 Despliegue con Docker

```bash
# Construir imagen
docker build -t enerlova-app .

# Ejecutar contenedor
docker run -p 3000:3000 enerlova-app
```

### Plataformas de Despliegue Soportadas
- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

## 📁 Estructura del Proyecto

```
app/
├── components/          # Componentes React reutilizables
│   ├── administracion/  # Módulo de administración
│   ├── mantencion/      # Módulo de mantención
│   ├── monitor/         # Módulo de monitoreo
│   ├── operaciones/     # Módulo de operaciones
│   └── ui/             # Componentes de interfaz base
├── hooks/              # Custom hooks
├── routes/             # Páginas y rutas
├── services/           # Servicios de API
├── types/              # Definiciones TypeScript
└── utils/              # Utilidades y helpers
```

## 🔐 Autenticación y Seguridad

- Sistema de autenticación JWT
- Control de acceso basado en roles
- Manejo automático de expiración de sesiones
- Interceptores para renovación de tokens
- Protección de rutas sensibles

## 📊 Funcionalidades Avanzadas

### Análisis de Actividad
- Tracking de acciones de usuarios
- Métricas de uso del sistema
- Reportes de actividad

### Gestión de Estados
- Estados de carga optimizados
- Manejo de errores centralizado
- Feedback visual para usuarios

### Responsive Design
- Interfaz adaptativa para móviles
- Componentes optimizados para diferentes pantallas
- Navegación intuitiva

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto es privado y confidencial. Todos los derechos reservados.

---

**Desarrollado con ❤️ para la gestión eficiente de sistemas energéticos**
