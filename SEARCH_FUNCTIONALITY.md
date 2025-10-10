# Funcionalidad de Búsqueda en Monitor de Nichos

## Descripción
Se ha implementado un sistema de búsqueda en tiempo real para el componente `MonitorNichos` que permite filtrar medidores por diferentes criterios.

## Características

### Campos de Búsqueda
El buscador filtra por los siguientes campos:
- **N° Serie** (`ME_NSerie`): Número de serie del medidor
- **Ubicación** (`ubicacion`): Ubicación física del medidor
- **Local** (`local`): Identificación del local
- **Tarifa** (`tarifa`): Tipo de tarifa
- **Nro** (`Nro`): Número identificador

### Funcionalidades
- **Búsqueda en tiempo real**: Los resultados se filtran mientras el usuario escribe
- **Búsqueda insensible a mayúsculas**: No distingue entre mayúsculas y minúsculas
- **Botón de limpieza**: Botón "X" para limpiar rápidamente el término de búsqueda
- **Contador dinámico**: El badge muestra "X medidores de Y" cuando hay filtros activos
- **Estado vacío personalizado**: Mensaje específico cuando no hay resultados para el término de búsqueda

### Interfaz
- Campo de búsqueda con icono de lupa
- Placeholder descriptivo que indica los campos de búsqueda
- Botón de limpiar que aparece solo cuando hay texto
- Ubicado en la segunda fila del header para mantener la organización visual

### Implementación Técnica
- Usa `useMemo` para optimizar el rendimiento del filtrado
- Estado local `searchTerm` para el término de búsqueda
- Filtrado con `Array.filter()` y comparación con `toLowerCase()` e `includes()`
- Los resultados filtrados se pasan directamente a `DataTableNichos`

## Uso
1. El usuario escribe en el campo de búsqueda
2. Los resultados se filtran automáticamente
3. El contador de medidores se actualiza dinámicamente
4. Para limpiar, se puede usar el botón "X" o borrar manualmente el texto

## Beneficios
- Mejora la experiencia de usuario al buscar medidores específicos
- Reduce el tiempo de navegación en listas largas
- Mantiene la consistencia visual con el resto de la interfaz
- No afecta el rendimiento gracias a la optimización con `useMemo`