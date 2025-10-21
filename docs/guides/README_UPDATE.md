# 📝 Guía de Actualización de README

Este documento proporciona información sobre cómo mantener actualizada la documentación del proyecto Enerlova.

## 📚 Archivos README del Proyecto

### 📄 READMEs Principales

1. **[README.md](../../README.md)** - README principal del proyecto
   - Descripción general del sistema
   - Stack tecnológico
   - Guías de inicio rápido
   - Comandos de desarrollo
   - Enlaces a documentación detallada

2. **[docs/README.md](../README.md)** - Índice de documentación
   - Estructura de documentación organizada
   - Enlaces a todas las guías
   - Recursos de ayuda rápida

3. **[.github/workflows/README.md](../../.github/workflows/README.md)** - Workflows de CI/CD
   - Documentación completa de GitHub Actions
   - Configuración de runners
   - Troubleshooting de CI/CD

### 📂 READMEs por Categoría

#### Deployment

- **[docs/deployment/DEPLOY-README.md](../deployment/DEPLOY-README.md)**
  - Guía de despliegue
  - Entornos disponibles
  - CI/CD con GitHub Actions
  - Flujos de trabajo recomendados

- **[docs/deployment/README-DOCKER.md](../deployment/README-DOCKER.md)**
  - Configuración completa de Docker
  - Docker Compose
  - Multi-entorno

#### Scripts

- **[scripts/README.md](../../scripts/README.md)**
  - Scripts de gestión de entornos
  - Comandos disponibles
  - Uso de scripts PowerShell y Bash

## 🔄 Cuándo Actualizar los READMEs

### README.md Principal

Actualizar cuando:

- ✅ Se agreguen nuevas características principales
- ✅ Cambien versiones del stack tecnológico
- ✅ Se modifique la estructura del proyecto
- ✅ Se agreguen nuevos módulos del sistema
- ✅ Cambien comandos de desarrollo importantes

### docs/README.md

Actualizar cuando:

- ✅ Se agregue nueva documentación
- ✅ Se reorganice la estructura de docs/
- ✅ Se creen nuevas categorías de documentación

### .github/workflows/README.md

Actualizar cuando:

- ✅ Se agreguen nuevos workflows
- ✅ Se modifiquen workflows existentes
- ✅ Cambien los requisitos de secrets
- ✅ Se actualice la configuración del runner

### docs/deployment/DEPLOY-README.md

Actualizar cuando:

- ✅ Cambien los entornos disponibles
- ✅ Se modifiquen puertos o URLs
- ✅ Se actualicen workflows de CI/CD
- ✅ Cambien métodos de despliegue

## ✍️ Guía de Estilo para READMEs

### Formato General

```markdown
# 🚀 Título Principal

Descripción breve y clara del contenido.

## 📋 Sección Principal

Contenido organizado con subsecciones claras.

### Subsección

Detalles específicos.

#### Sub-subsección

Información más detallada cuando sea necesario.
```

### Uso de Emojis

Usar emojis de forma consistente:

- 🚀 Deploy/Lanzamiento
- 📋 Listados/Índices
- 🔧 Configuración
- 📊 Monitoreo/Métricas
- 🐛 Debugging/Problemas
- ✅ Éxito/Completado
- ❌ Error/Fallo
- ⚠️ Advertencia
- 📚 Documentación
- 🔐 Seguridad/Secrets
- 🎯 Objetivos/Metas
- 💡 Tips/Consejos

### Bloques de Código

Siempre especificar el lenguaje:

````markdown
```bash
pnpm install
```

```typescript
const example: string = "hello";
```

```yaml
name: CI Pipeline
```
````

### Enlaces

Usar rutas relativas cuando sea posible:

```markdown
# ✅ Correcto
[Guía de Deploy](docs/deployment/DEPLOY-README.md)

# ❌ Evitar
[Guía de Deploy](/full/absolute/path/docs/deployment/DEPLOY-README.md)
```

### Tablas

Mantener tablas bien formateadas:

```markdown
| Columna 1 | Columna 2 | Columna 3 |
| --------- | --------- | --------- |
| Valor 1   | Valor 2   | Valor 3   |
```

## 🔍 Checklist de Actualización

Antes de hacer commit de cambios en READMEs:

### Contenido

- [ ] La información está actualizada y es precisa
- [ ] Los enlaces funcionan correctamente
- [ ] Los comandos han sido probados
- [ ] Las versiones de tecnologías son correctas
- [ ] Los ejemplos son relevantes y funcionales

### Formato

- [ ] Markdown está bien formateado
- [ ] Los bloques de código tienen lenguaje especificado
- [ ] Los emojis son consistentes con el resto del proyecto
- [ ] Las tablas están alineadas
- [ ] Los títulos siguen la jerarquía correcta

### Enlaces

- [ ] Todos los enlaces internos funcionan
- [ ] Las rutas son relativas cuando es posible
- [ ] No hay enlaces rotos
- [ ] Los enlaces a documentación externa son válidos

### Ejemplos y Comandos

- [ ] Los comandos son correctos
- [ ] Los ejemplos usan el package manager correcto (pnpm)
- [ ] Las variables de entorno son las correctas
- [ ] Los puertos y URLs coinciden con la configuración

## 📊 Estructura Recomendada para Nuevos READMEs

```markdown
# 🎯 Título del Documento

Breve descripción de qué trata este documento.

## 📋 Tabla de Contenidos (opcional para docs largos)

- [Sección 1](#sección-1)
- [Sección 2](#sección-2)

## 🚀 Sección Principal 1

Contenido principal con subsecciones según necesidad.

### Subsección 1.1

Detalles específicos.

## 🔧 Sección Principal 2

Más contenido organizado.

## 🐛 Troubleshooting (si aplica)

Problemas comunes y soluciones.

## 📚 Referencias

- Enlaces a documentación relacionada
- Recursos externos

---

**Última actualización**: YYYY-MM-DD
```

## 🔄 Proceso de Actualización

### 1. Identificar qué actualizar

Revisar los cambios realizados y determinar qué READMEs necesitan actualizarse.

### 2. Hacer las actualizaciones

Editar los archivos correspondientes siguiendo la guía de estilo.

### 3. Verificar

Usar el checklist anterior para verificar que todo esté correcto.

### 4. Commit

Hacer commit con un mensaje descriptivo:

```bash
git add README.md docs/**/*.md
git commit -m "docs: actualizar READMEs con nueva información de CI/CD"
```

### 5. PR (si aplica)

Si es un cambio significativo, crear un PR para revisión.

## 🎯 Mejores Prácticas

### ✅ Hacer

- Mantener la información actualizada
- Usar ejemplos concretos y funcionales
- Incluir troubleshooting para problemas comunes
- Referenciar documentación más detallada
- Mantener consistencia de formato
- Usar comandos que funcionen (probados)

### ❌ Evitar

- Información desactualizada o incorrecta
- Comandos que no funcionan
- Enlaces rotos
- Formato inconsistente
- Ejemplos genéricos sin contexto
- Duplicación de información sin valor agregado

## 📚 Referencias

- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- [Emoji Cheat Sheet](https://github.com/ikatyang/emoji-cheat-sheet)

## 🆘 Ayuda

Si tienes dudas sobre cómo actualizar la documentación:

1. Revisa READMEs existentes como referencia
2. Consulta esta guía
3. Pregunta al equipo de desarrollo

---

**Última actualización**: 2025-01-21

**Mantenedores**: Equipo de desarrollo Enerlova
