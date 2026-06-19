# Monitor de Lecturas - Documentación de Edge Cases

Documentación detallada de casos extremos, errores y comportamientos especiales del sistema de monitoreo.

## Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Carga de Datos](#carga-de-datos)
3. [Búsqueda y Filtrado](#búsqueda-y-filtrado)
4. [Edición de Medidores](#edición-de-medidores)
5. [Estados UI/UX](#estados-uiux)
6. [Manejo de Red](#manejo-de-red)
7. [Browser Compatibility](#browser-compatibility)
8. [Concurrencia](#concurrencia)
9. [Límites del Sistema](#límites-del-sistema)

---

## Autenticación

### Edge Case 1: Token Expirado Durante Operación

**Descripción:**
El usuario tiene token válido, inicia búsqueda, pero el token expira antes de completarse.

**Comportamiento Esperado:**
1. API retorna 401 Unauthorized
2. Componente captura error
3. Redirect a login (implementado en api.ts)
4. Usuario pierde estado de filtros

**Código de Manejo:**
```typescript
// En monitorService.ts
try {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  // ... requests ...
} catch (error) {
  // API interceptor maneja 401
  // Redirige a /login automáticamente
}
```

**Cómo Evitar:**
- Implementar token refresh automático
- Mostrar advertencia antes de expiración
- Guardar estado en sessionStorage para recuperar

### Edge Case 2: Token No Existe en localStorage

**Descripción:**
localStorage está vacío o token nunca fue guardado.

**Escenarios:**
- Primera visita sin login
- localStorage fue borrado
- Navegación directa a URL

**Comportamiento Esperado:**
```typescript
const token = localStorage.getItem('token'); // null
if (!token) {
  throw new Error('No authentication token found');
}
// Catch → error response
// clientLoader retorna arrays vacíos
// MonitorLecturasComponent muestra Alert
```

**UI Result:**
```
┌─────────────────────────────────────────┐
│ ⚠️ Error de Carga                       │
│ Ocurrió un error al cargar los datos    │
│ iniciales. Por favor, intente recargar  │
│ la página.                              │
└─────────────────────────────────────────┘
```

**Testing:**
```javascript
// Clear token before test
localStorage.removeItem('token');
// Navigate to /monitor/monitor-lecturas
// Expect error alert
```

---

## Carga de Datos

### Edge Case 3: Una API Falla, Otras Suceden

**Descripción:**
3 requests paralelos (Periodos, Sectores, Claves) - una falla pero las otras tienen éxito.

**Implementación Actual:**
```typescript
const results = await Promise.allSettled([
  api.get<Periodo[]>('/Periodos'),      // ✓ Success
  api.get<Sector[]>('/Sectores'),       // ✗ 500 Error
  api.get<Clave[]>('/Claves')           // ✓ Success
]);

// Procesa cada resultado
results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    // Use data
  } else {
    // resultado.reason contiene error
  }
});
```

**Resultado Final:**
```typescript
{
  periodos: [{ ... }, ...],    // ✓ Loaded
  sectores: [],               // ✗ Empty fallback
  claves: [{ ... }, ...],     // ✓ Loaded
  error: null                 // Sin error general
}
```

**UI Impact:**
- Sectores campo muestra: "No hay sectores disponibles"
- Búsqueda deshabilitada (requiere sector)
- Usuario puede esperar o reintentar

### Edge Case 4: Todas las APIs Fallan

**Descripción:**
Network down, backend offline, CORS error.

**Código:**
```typescript
const results = await Promise.allSettled([
  api.get<Periodo[]>('/Periodos'),      // ✗ 0 - Network Error
  api.get<Sector[]>('/Sectores'),       // ✗ 0 - Network Error
  api.get<Clave[]>('/Claves')           // ✗ 0 - Network Error
]);

// Ninguno fulfilled, todos rejected
return {
  data: null,
  error: 'Network request failed'
};
```

**Resultado en Component:**
```tsx
if (error) {
  return (
    <Alert variant='destructive'>
      <AlertCircle className='h-4 w-4' />
      <AlertTitle>Error de Carga</AlertTitle>
      <AlertDescription>
        Ocurrió un error al cargar los datos iniciales.
        Por favor, intente recargar la página.
      </AlertDescription>
    </Alert>
  );
}
```

### Edge Case 5: Response No Es Array

**Descripción:**
Backend retorna objeto en lugar de array para /Periodos.

```json
// ✗ Invalid response
{
  "IdPeriodo": "1",
  "DescripcionPeriodo": "Enero 2025"
}

// ✓ Expected response
[
  { "IdPeriodo": "1", "DescripcionPeriodo": "Enero 2025" },
  { "IdPeriodo": "2", "DescripcionPeriodo": "Febrero 2025" }
]
```

**Manejo:**
```typescript
const periodosData = Array.isArray(periodosRes.data)
  ? periodosRes.data
  : [];
// Si no es array, usa array vacío como fallback
```

### Edge Case 6: Sin Período Activo (EstadoPeriodo ≠ 2)

**Descripción:**
Todos los períodos tienen `EstadoPeriodo` diferente de 2.

```typescript
const periodos = [
  { IdPeriodo: 1, EstadoPeriodo: 1 },  // Cerrado
  { IdPeriodo: 2, EstadoPeriodo: 3 },  // Proyectado
  { IdPeriodo: 3, EstadoPeriodo: 1 }   // Cerrado
];

// findActivePeriodo retorna null
const activePeriodoId = periodos.find(p => p.EstadoPeriodo === 2); // undefined
```

**Comportamiento:**
```typescript
useEffect(() => {
  if (!periodos || periodos.length === 0) return; // ✓ Pasa
  if (selectedPeriodo) return;                     // ✓ Pasa

  const periodoActivo = findActivePeriod(periodos); // null

  if (!periodoActivo) return;  // ✓ EARLY RETURN - Detiene inicialización

  setSelectedPeriodo(periodoActivo);  // No ejecuta
}, [periodos, selectedPeriodo, fechaFin]);
```

**UI Result:**
- `selectedPeriodo` permanece null
- Usuario DEBE seleccionar período manualmente
- Búsqueda deshabilitada hasta que seleccione

### Edge Case 7: Array de Períodos Vacío

**Descripción:**
Períodos cargó exitosamente pero es array vacío.

```typescript
const periodos = []; // Empty from API
```

**Comportamiento:**
```typescript
if (!periodos || periodos.length === 0) return; // EARLY RETURN

// No se ejecuta:
// - findActivePeriod()
// - setSelectedPeriodo()
// - getDefaultDates()
```

**UI Result:**
- Select de período muestra placeholder "Seleccionar periodo..."
- Botón search deshabilitado
- Mensaje: período requerido en validación si intenta buscar

---

## Búsqueda y Filtrado

### Edge Case 8: Búsqueda Sin Criterios

**Descripción:**
Usuario hace clic en "Iniciar Monitoreo" sin llenar filtros opcionales.

```typescript
const state = {
  selectedSector: { sectorId: 'SEC1', ... },      // ✓ Filled
  selectedPeriodo: { IdPeriodo: '1', ... },       // ✓ Filled
  selectedClave: null,                             // ✗ Optional
  meterSerial: '',                                 // ✗ Optional
  selectedStatusFilter: 0                          // ✗ All statuses
};
```

**Validación:**
```typescript
const validation = validateSearchParams(
  selectedSector,  // ✓ Exists
  selectedPeriodo  // ✓ Exists
);
// Retorna { isValid: true, error: '' }
```

**API Call:**
```typescript
const params = new URLSearchParams({
  sector: 'SEC1',
  periodo: '1',
  stfechaini: '2025-01-01',
  stfechafin: '2025-01-31',
  tipoclave: '0',        // 0 = All
  medidor: '',           // Empty = All
  clave: ''              // Empty = All
});

// GET /lecturas-nicho?sector=SEC1&periodo=1&...
```

**Resultado:**
- Busca todo en sector/período seleccionados
- Puede retornar 1000s de medidores
- Virtualization maneja el volumen

### Edge Case 9: Serial de Medidor Inválido

**Descripción:**
Usuario ingresa caracteres especiales en búsqueda de serial.

```typescript
const meterSerial = '<script>alert("xss")</script>';
```

**Protección:**
```tsx
<Input
  id='meter-serial-input'
  type='text'
  placeholder='Buscar medidor específico...'
  value={meterSerial}
  // No HTML binding - React escapa automáticamente
/>

// En API call
const params = new URLSearchParams({
  medidor: meterSerial  // Encoded by URLSearchParams
  // Result: %3Cscript%3E... (safely encoded)
});
```

### Edge Case 10: Búsqueda Retorna 0 Resultados

**Descripción:**
Filtros válidos pero ningún medidor coincide.

**Código:**
```typescript
if (results.length === 0 && !isLoading) {
  return (
    <EmptyState message='No se encontraron medidores para los parámetros seleccionados' />
  );
}
```

**UI:**
```
┌──────────────────────────────────┐
│                                  │
│     No se encontraron medidores  │
│     para los parámetros          │
│     seleccionados                │
│                                  │
└──────────────────────────────────┘
```

**Usuario puede:**
- Modificar filtros y reintentar
- Limpiar filtros (handleLimpiezaFiltros)
- Seleccionar otro sector/período

### Edge Case 11: Búsqueda de Texto Vacío

**Descripción:**
Usuario abre filtros avanzados, busca en tabla sin ingresar nada.

```typescript
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300); // ''

const filteredResults = useMemo(() => {
  if (!debouncedSearch.trim()) {
    return results;  // Retorna todo sin filtrar
  }
  // ... filter logic ...
}, [results, debouncedSearch]);
```

**Comportamiento:**
- Muestra todos los 10-20 medidores del nicho
- No hay recálculo hasta que usuario escriba
- Badge muestra: "10 medidores"

### Edge Case 12: Búsqueda Muy General (1 carácter)

**Descripción:**
Usuario tipea "1" que coincide con muchos campos.

```typescript
const filteredResults = results.filter(item => {
  return (
    item.ME_NSerie?.toLowerCase().includes('1') ||    // "12345", "100", "1"
    item.ubicacion?.toLowerCase().includes('1') ||    // "Sector 1", "Pasillo 1"
    item.local?.toLowerCase().includes('1') ||        // "Local 1", "Piso 1"
    item.tarifa?.toLowerCase().includes('1') ||       // "Tarifa 1"
    item.Nro?.toString().includes('1')               // Nro 1, 10, 100, etc
  );
});
// Potencialmente retorna 100+ resultados
```

**Optimización:**
- Virtualization renderiza solo visibles (10-20)
- Scroll es suave (60 FPS)
- Badge muestra: "127 medidores de 234"

---

## Edición de Medidores

### Edge Case 13: Medidor en Estado 5 (Facturación)

**Descripción:**
Medidor está en estado final (facturación), no puede editarse.

```typescript
const handleRowClick = (medidor: MedidorNichoItem) => {
  if (medidor.Estado !== 5 && lastEditedId !== medidor.LM_ID) {
    setSelectedMedidor(medidor);
    setIsDialogOpen(true);
  }
};

// Si Estado === 5:
// - Click no abre dialog
// - Row no es clickeable
// - Tooltip indica "Estado final"
```

### Edge Case 14: Último Medidor Editado

**Descripción:**
Usuario edita medidor, quiere ver que se guardó. Se resalta por 4.2s.

```typescript
const handleSuccess = (id: number) => {
  setIsDialogOpen(false);
  setNeedsRefreshOnClose(true);

  if (highlightTimeout) {
    clearTimeout(highlightTimeout);  // Clear prev timeout
  }

  setLastEditedId(id);

  // Resalta por 4.2 segundos
  const timer = setTimeout(() => {
    setLastEditedId(null);
  }, 4200);

  setHighlightTimeout(timer);
};

// Cleanup en unmount
useEffect(() => {
  return () => {
    if (highlightTimeout) {
      clearTimeout(highlightTimeout);
    }
  };
}, [highlightTimeout]);
```

**Row Styling:**
```tsx
{lastEditedId === medidor.LM_ID ? (
  <tr className='bg-green-100 animate-pulse'>
    {/* Row content */}
  </tr>
) : (
  <tr>{/* Normal row */}</tr>
)}
```

### Edge Case 15: Actualización Mientras Editor Abierto

**Descripción:**
Datos actualizados en servidor mientras usuario edita.

**Problema:**
- Usuario abre formulario
- Servidor actualiza ese medidor
- Usuario guarda cambios antiguos

**Solución Actual:**
- No hay lock/versioning
- Last-write-wins
- Podría mostrar advertencia

**Mejora Futura:**
```typescript
// Check before save
const response = await api.get(`/medidor/${id}/version`);
if (response.version !== localVersion) {
  toast.error('Datos actualizados. Recargando...');
  // Reload data
}
```

### Edge Case 16: Fallo de Guardado Silencioso

**Descripción:**
API retorna 200 pero no guarda realmente.

```typescript
// En EditarMedidores
const submit = async (data) => {
  const response = await api.post('/actualizar-lectura', data);
  // Asume que status 200 = éxito
  handleSuccess(medidor.LM_ID);  // Llama directamente
};
```

**Recomendación:**
```typescript
const submit = async (data) => {
  const response = await api.post('/actualizar-lectura', data);

  // Verify saved
  const verify = await api.get(`/medidor/${medidor.LM_ID}`);
  if (verify.data.lectura === data.lectura) {
    handleSuccess(medidor.LM_ID);
  } else {
    toast.error('Guardado falló. Intenta nuevamente.');
  }
};
```

---

## Estados UI/UX

### Edge Case 17: Filtros Abiertos y Usuario Busca

**Descripción:**
Usuario abre filtros avanzados y hace clic en "Iniciar Monitoreo".

**Comportamiento:**
```typescript
const handleSearch = () => {
  // ... validation ...
  setIsSearchActive(true);
  setSearchTrigger(prev => prev + 1);
  setIsFiltersOpen(false);  // 👈 AUTO-COLLAPSES
};
```

**UX:**
1. Usuario hace clic en search
2. Filtros se cierran automáticamente
3. Spinner aparece
4. Resultados reemplazan cuando listos

### Edge Case 18: Resultado Muy Grande

**Descripción:**
Búsqueda retorna 10000+ medidores en múltiples nichos.

**Virtualización Protege:**
```typescript
<DataTableNichosVirtualized
  data={filteredResults}  // 10000 items
  // Pero solo renderiza 10-20 visibles
/>
```

**Rendimiento:**
- Initial render: <500ms
- Scroll: 60 FPS
- Memory: ~5-10 MB para lista

### Edge Case 19: Scroll Mientras Carga Nicho

**Descripción:**
Usuario scrollea tabla mientras MonitorNichos llama API.

**Comportamiento:**
```typescript
useEffect(() => {
  searchResults();  // Fetch en background
}, [searchResults]);

// Mientras fetching === true:
if (isLoading && results.length === 0) {
  return <LoadingState />;  // Full screen spinner
}

// Si ya tiene datos de antes:
if (isLoading) {
  return <DataTableNichosVirtualized data={results} />;  // Muestra datos viejos
}
```

**UX:**
- Si sin datos: muestra spinner
- Si con datos: muestra datos viejos + refresh indicator
- Scroll funciona mientras actualiza

### Edge Case 20: Tour Interrumpido

**Descripción:**
Usuario cierra tour a mitad.

```typescript
const driverjs = driver({
  allowClose: true,  // ✓ Allow close anytime
  // ... config ...
});

// User clicks X o presiona Esc
// Tour se cierra completamente
// Ningún estado se afecta
// Puede reiniciar haciendo clic en ?
```

### Edge Case 21: Atajos de Teclado en Input

**Descripción:**
Usuario presiona Ctrl+K mientras escribe en meterSerial.

```typescript
useMonitorKeyboardShortcuts({
  onSearch: () => {
    // Abre filtros si cerrados
    // Enfoca input de busqueda
  },
  // ...
});

// En input:
<Input
  id='meter-serial-input'
  onKeyDown={(e) => {
    // Los hooks pueden capturar Ctrl+K aquí
    // Depende del orden de listeners
  }}
/>
```

**Comportamiento Esperado:**
- Ctrl+K: abre filtros y mueve foco
- Ctrl+Enter: busca
- Esc: cierra filtros

---

## Manejo de Red

### Edge Case 22: Request Timeout

**Descripción:**
API no responde en 30+ segundos.

```typescript
// En api.ts (assumed config)
const api = axios.create({
  baseURL: '/api',
  timeout: 30000  // 30 segundos
});

// Si timeout:
// Error capturado en catch
// Service retorna error
// Toast: "Conexión tardó demasiado"
```

### Edge Case 23: Intermittent Network

**Descripción:**
Red intermitente, requests fallan aleatoriamente.

**Solución:**
- Retry logic en api.ts (¿implementado?)
- Manual retry button
- Graceful degradation

### Edge Case 24: CORS Error

**Descripción:**
Backend no tiene CORS headers correctos.

```
Access to XMLHttpRequest at 'https://api.example.com/Periodos'
from origin 'https://app.example.com' has been blocked by CORS policy
```

**Manejo:**
```typescript
// En catch de service
try {
  // ... request ...
} catch (error) {
  if (error.message.includes('CORS')) {
    return {
      data: null,
      error: 'No se puede acceder a los datos. Intenta más tarde.'
    };
  }
}
```

### Edge Case 25: 401 Unauthorized Inesperado

**Descripción:**
Token válido pero API retorna 401 (backend bug).

**Manejo (en api interceptor):**
```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth
      localStorage.removeItem('token');
      // Redirect
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Browser Compatibility

### Edge Case 26: localStorage No Disponible

**Descripción:**
Browser en modo privado/incógnito donde localStorage no es persistente.

```typescript
const token = localStorage.getItem('token');  // Puede ser null
```

**Comportamiento:**
- Primera visit: OK (sesión nueva)
- Reload: Token perdido
- Redirect a login

### Edge Case 27: ResizeObserver No Soportado

**Descripción:**
Navegador viejo sin ResizeObserver (necesario para virtualización).

**Riesgo:**
- Virtualized table podría no calcular tamaño correcto
- Potencial error de librería

**Protección:**
```typescript
// En DataTableNichosVirtualized
if (!window.ResizeObserver) {
  // Fallback a non-virtualized table
  // O mostrar warning
}
```

### Edge Case 28: JavaScript Deshabilitado

**Descripción:**
Usuario tiene JS deshabilitado.

**Resultado:**
- SSR layout muestra (si implementado)
- Componentes React no renderizan
- Mensaje: "Enable JavaScript"

---

## Concurrencia

### Edge Case 29: Múltiples Búsquedas Rápidas

**Descripción:**
Usuario hace clic en "Buscar" 3 veces en rápida sucesión.

```typescript
const [searchTrigger, setSearchTrigger] = useState(0);

const handleSearch = () => {
  setSearchTrigger(prev => prev + 1);  // 1, 2, 3
};

// ResultadosBusqueda watch searchTrigger
useEffect(() => {
  // Hace 3 requests en orden
  // Ultimo resulta gana
}, [searchTrigger, /* other deps */]);
```

**Problema:**
- 3 requests paralelos
- Network overhead
- Posible race condition (request 1 completa último)

**Solución:**
```typescript
// Agregar AbortController
const abortControllerRef = useRef<AbortController | null>(null);

useEffect(() => {
  return () => {
    // Abort requests previos
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };
}, [searchTrigger]);
```

### Edge Case 30: Editar Medidor Mientras Busca

**Descripción:**
Usuario abre editor mientras ResultadosBusqueda está fetchando.

**Comportamiento:**
```typescript
// MonitorNichos state:
const [results, setResults] = useState([]);  // Viendo viejo
const [isLoading, setIsLoading] = useState(false);

// Usuario abre editor de medidor
const handleRowClick = (medidor) => {
  // Usa `medidor` del estado actual
  setSelectedMedidor(medidor);
  setIsDialogOpen(true);
};

// Si nuevo fetch completa mientras editor abierto:
setResults(newData);  // Datos nuevos, pero editor sigue viejo

// Usuario guarda:
handleSuccess();  // Puede ser medidor diferente si datos refrescaron
```

**Mitigation:**
- Editor guarda ID del medidor
- Reload completo después de guardar
- Lock UI mientras guarda

---

## Límites del Sistema

### Edge Case 31: Muy Muchos Filtros

**Descripción:**
Períodos: 100+, Sectores: 50+, Claves: 100+

**Impacto:**
```typescript
// Render muy muchos SelectItems
<SelectContent>
  {periodos?.map(periodo => (
    <SelectItem key={periodo.IdPeriodo} value={...}>
      {/* 100 items */}
    </SelectItem>
  ))}
</SelectContent>
```

**Solución:**
- Virtualizar select items
- Search/filter en select
- Limit a 50 items por sección

### Edge Case 32: Nombre de Sector Muy Largo

**Descripción:**
`Sector.descripcion` = "Esto es un nombre muy largo que no cabe..."

**Button Comportamiento:**
```tsx
<Button
  className={cn(
    'h-auto p-3 transition-all duration-200 text-center w-full',
    // ...
  )}
>
  <div className='text-center w-full'>
    <div className='font-semibold text-xs sm:text-sm leading-tight'>
      {sector.descripcion}  {/* Puede truncarse */}
    </div>
  </div>
</Button>
```

**UI:**
- Texto se trunca o envuelve
- Button crece para acomodar
- Tooltip muestra texto completo (idealidad)

### Edge Case 33: Búsqueda Retorna 100000+ Medidores

**Descripción:**
Sector muy grande, período muy largo.

**Virtualización en Acción:**
```typescript
<DataTableNichosVirtualized
  data={100000}  // Array enorme
  // Pero:
  // - DOM tiene solo 20 items
  // - Memory: ~5 MB
  // - FPS: 60
/>
```

**Performance:**
- Initial render: < 1s
- Scroll: Smooth
- Storage: Minimized

### Edge Case 34: Componente No Desmontado (Memory Leak)

**Descripción:**
Usuario navega sin desmontar MonitorNichos.

```typescript
// En MonitorNichos
useEffect(() => {
  return () => {
    if (highlightTimeout) {
      clearTimeout(highlightTimeout);  // ✓ Limpia
    }
  };
}, [highlightTimeout]);

useEffect(() => {
  // searchResults, pero sin cleanup
  // API requests pueden completar después de unmount
  searchResults();
}, [searchResults]);
```

**Mejora:**
```typescript
useEffect(() => {
  let isMounted = true;

  const load = async () => {
    const response = await api.get(...);
    if (isMounted) {
      setResults(response.data);  // No set si unmounted
    }
  };

  load();

  return () => {
    isMounted = false;
  };
}, []);
```

---

## Testing Edge Cases

### Casos de Prueba Recomendados

```typescript
describe('MonitorLecturasComponent Edge Cases', () => {

  // Autenticación
  test('handles missing token', () => {
    localStorage.removeItem('token');
    render(<MonitorLecturasPage />);
    expect(screen.getByText(/Error de Carga/)).toBeInTheDocument();
  });

  // Datos
  test('handles empty periods array', () => {
    const props = { periodos: [], sectores: [...], claves: [...] };
    render(<MonitorLecturasComponent {...props} />);
    expect(screen.getByText(/Seleccionar periodo/)).toBeInTheDocument();
  });

  // Búsqueda
  test('disables search when sector missing', () => {
    render(<MonitorLecturasComponent {...props} />);
    const searchButton = screen.getByRole('button', { name: /Iniciar Monitoreo/ });
    expect(searchButton).toBeDisabled();
  });

  // Edición
  test('prevents editing meter in state 5', () => {
    const meter = { ...validMeter, Estado: 5 };
    const { rerender } = render(<MonitorNichos {...props} />);
    // Click on meter
    // Dialog should not open
  });

  // Red
  test('handles network timeout', async () => {
    jest.setTimeout(35000);
    // Mock slow API
    render(<MonitorLecturasPage />);
    // Should show error after 30s
  });
});
```

---

## Checklist de Validación

- [ ] Sin token → Error Alert
- [ ] Períodos vacío → Búsqueda deshabilitada
- [ ] Sectores vacío → Mensaje "sin sectores"
- [ ] Sin período activo → Usuario selecciona manualmente
- [ ] Búsqueda sin resultados → EmptyState
- [ ] API falla → Graceful error handling
- [ ] Largo nombre de sector → Truncado/Tooltip
- [ ] Muchos medidores (100K+) → Virtualización funciona
- [ ] Editor abierto + Refresh → Manejo gracioso
- [ ] Atajos de teclado → Funcionan en contexto
- [ ] Memory leaks → Cleanup correcto en useEffect
- [ ] Race conditions → Last-write-wins o lock

