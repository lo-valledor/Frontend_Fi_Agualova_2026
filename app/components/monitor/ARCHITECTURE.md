# Monitor de Lecturas - Diagrama de Arquitectura

Documentación visual de la arquitectura del sistema de monitoreo de lecturas.

## Diagrama de Componentes

```mermaid
graph TD
    A["🌐 Browser"] -->|GET /dashboard/monitor/monitor-lecturas| B["Route: monitor-lecturas.tsx"]
    B -->|lazy load| C["MonitorLecturasComponent"]
    B -->|clientLoader| D["MonitorService"]

    D -->|Promise.all| E["GET /Periodos"]
    D -->|Promise.all| F["GET /Sectores"]
    D -->|Promise.all| G["GET /Claves"]

    E & F & G -->|monitorService.getBasicData| H["BasicData"]

    H -->|props| C

    C -->|filters| I["ResultadosBusqueda"]
    I -->|GET /lecturas-nicho?params| J["API Endpoint"]
    J -->|readings| K["Group by Nicho"]
    K -->|map| L["MonitorNichos[]"]

    L -->|onRowClick| M["EditarMedidores"]
    M -->|form| N["Dialog"]

    L -->|detailed view| O["DetallesMedidor"]
    O -->|4 stages| P["API /datos-basicos-medidor"]

    style A fill:#e1f5ff
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e9
    style I fill:#fce4ec
    style M fill:#f1f8e9
    style O fill:#ede7f6
```

## Flujo de Carga Inicial

```mermaid
sequenceDiagram
    participant Browser
    participant Route
    participant Service
    participant API
    participant Component

    Browser->>Route: GET /monitor/monitor-lecturas
    Route->>Route: clientLoader() exec
    Route->>Service: getBasicData()

    par Parallel Load
        Service->>API: GET /Periodos
        Service->>API: GET /Sectores
        Service->>API: GET /Claves
    end

    API-->>Service: [Periodos]
    API-->>Service: [Sectores]
    API-->>Service: [Claves]

    Service-->>Service: findActivePeriodo()
    Service-->>Route: MonitorBasicData
    Route-->>Component: props { periodos, sectores, claves, activePeriodoId }

    Component->>Component: useEffect: init period & dates
    Component-->>Browser: Render with controls
```

## Flujo de Búsqueda

```mermaid
stateDiagram-v2
    [*] --> Filters

    Filters: User selects:<br/>- Sector (required)<br/>- Period (required)<br/>- Dates (optional)<br/>- Advanced filters (optional)

    Filters --> Validation: Click "Iniciar Monitoreo"

    Validation: validateSearchParams()<br/>Check sector & period

    Validation -->|Invalid| ErrorToast: Show error message
    ErrorToast --> Filters

    Validation -->|Valid| Search: setIsSearchActive(true)

    Search: Fetch /lecturas-nicho<br/>with filters

    Search --> Loading: Show spinner<br/>Calculate stats

    Loading --> Results: Display by nicho<br/>Show statistics

    Results --> MonitorNichos: Virtualized table<br/>per nicho

    MonitorNichos --> EditChoice{User<br/>Action}

    EditChoice -->|Edit row| EditDialog: Open EditarMedidores
    EditChoice -->|View details| DetailsDialog: Open DetallesMedidor
    EditChoice -->|Search in nicho| FilteredTable: Debounced search

    EditDialog --> Submit: Save changes
    Submit --> Refresh: setNeedsRefreshOnClose
    Refresh --> Search

    FilteredTable --> Results

    Results -->|Limpiar| Filters
```

## Arquitectura de Estado

```mermaid
graph LR
    subgraph "MonitorLecturasComponent State"
        SF["selectedSector<br/>(Sector | null)"]
        SP["selectedPeriodo<br/>(Periodo | null)"]
        SC["selectedClave<br/>(Clave | null)"]
        SM["meterSerial<br/>(string)"]
        SS["selectedStatusFilter<br/>(number)"]
        FI["fechaInicio<br/>(string)"]
        FF["fechaFin<br/>(string)"]
        SA["isSearchActive<br/>(boolean)"]
        FO["isFiltersOpen<br/>(boolean)"]
    end

    SF & SP & SC & SM & SS & FI & FF -->|passed to| VL["validation"]
    SA -->|controls| RES["results visibility"]
    FO -->|controls| COLL["filters collapse"]

    VL -->|check valid| HS["handleSearch()"]
    HS -->|invalid| ERR["toast.error()"]
    HS -->|valid| TRG["setSearchTrigger()"]

    style SF fill:#ffebee
    style SP fill:#ffebee
    style FI fill:#fff3e0
    style FF fill:#fff3e0
    style SC fill:#f3e5f5
    style SM fill:#f3e5f5
    style SS fill:#f3e5f5
    style SA fill:#e8f5e9
    style FO fill:#e8f5e9
```

## Ciclo de Vida de Edición de Medidor

```mermaid
sequenceDiagram
    participant Table as MonitorNichos
    participant Dialog as Dialog Component
    participant Form as EditarMedidores
    participant API as API
    participant State as Component State

    Table->>Dialog: onRowClick(medidor)
    Dialog->>Dialog: setSelectedMedidor(medidor)
    Dialog->>Dialog: setIsDialogOpen(true)
    Dialog->>Form: render with selected medidor

    User->>Form: fill form fields
    User->>Form: click submit

    Form->>API: POST /actualizar-lectura
    API-->>Form: success

    Form->>State: handleSuccess(id)
    State->>State: setIsDialogOpen(false)
    State->>State: setNeedsRefreshOnClose(true)
    State->>State: setLastEditedId(id)

    State->>State: setTimeout 4.2s
    State->>State: setLastEditedId(null)

    Dialog->>Dialog: onOpenChange triggers
    Dialog->>Dialog: isDialogOpen=false & needsRefresh=true
    Dialog->>Table: searchResults() refresh

    Table->>API: GET /lecturas-nicho?params
    API-->>Table: [updated medidores]
    Table->>Table: setResults(data)
    Table->>Table: Highlight lastEditedId row
    Table-->>User: Display updated data
```

## Estructura de Datos - Flujo de Lectura

```mermaid
graph TD
    subgraph "API Response Structure"
        A["GET /lecturas-nicho<br/>Response"]
        A -->|grouped| B["NichoBusqueda"]
        B -->|array of| C["Medidor"]
        C -->|array of| D["Lectura"]
    end

    subgraph "Processing"
        E["calculateTotalStats()"]
        F["calculateNichoStats()"]
        G["calculatePercentage()"]
    end

    B --> E
    C --> F
    F --> G

    subgraph "Display"
        H["ResultadosBusqueda"]
        I["MonitorNichos"]
        J["DetallesMedidor"]
    end

    E & F & G --> H
    H --> I
    I --> J

    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style C fill:#fff3e0
    style D fill:#e8f5e9
```

## Validación y Manejo de Errores

```mermaid
flowchart TD
    A["Start Search"] -->|Check Auth| B{Token exists?}

    B -->|No| C["❌ Error: No token"]
    B -->|Yes| D{"Sector<br/>selected?"}

    D -->|No| E["❌ Error: Select sector"]
    D -->|Yes| F{"Period<br/>selected?"}

    F -->|No| G["❌ Error: Select period"]
    F -->|Yes| H["Fetch Data"]

    H -->|Network Error| I["❌ Error: Network"]
    H -->|API Error| J["❌ Error: API"]
    H -->|Success| K["✅ Display Results"]

    C --> L["toast.error()"]
    E --> L
    G --> L
    I --> L
    J --> L

    K --> M["End"]
    L --> N["Return to Filters"]
    N --> A

    style A fill:#e8f5e9
    style K fill:#c8e6c9
    style C fill:#ffcdd2
    style E fill:#ffcdd2
    style G fill:#ffcdd2
    style I fill:#ffcdd2
    style J fill:#ffcdd2
```

## Virtualización de Tabla

```mermaid
graph TD
    A["MonitorNichos<br/>receives array"] -->|full dataset| B["DataTableNichosVirtualized"]

    B -->|viewport| C["Calculate<br/>visible range"]

    C -->|only render| D["Visible Rows<br/>10-20 per screen"]

    B -->|user scroll| E["Update<br/>visible range"]

    E --> D

    D -->|interactive| F["Edit Dialog"]
    D -->|search| G["useDebounce<br/>searchTerm"]

    G -->|filter| H["filteredResults<br/>useMemo"]
    H -->|re-render| D

    style A fill:#fff3e0
    style B fill:#f3e5f5
    style D fill:#e8f5e9
    style F fill:#fce4ec
    style H fill:#e1f5fe
```

## Búsqueda Debounced en Tabla

```mermaid
sequenceDiagram
    participant User
    participant Input as Search Input
    participant Debounce as useDebounce
    participant Filter as useMemo
    participant Table as MonitorNichos

    User->>Input: type "S"
    Input->>Debounce: emit "S"
    Debounce->>Debounce: wait 300ms

    User->>Input: type "e"
    Input->>Debounce: emit "Se"
    Debounce->>Debounce: wait 300ms (reset)

    User->>Input: type "rial"
    Input->>Debounce: emit "Serial"
    Debounce->>Debounce: wait 300ms (reset)

    Debounce->>Filter: value="Serial"
    Filter->>Filter: filter results
    Filter->>Table: filtered results
    Table-->>User: show matches only

    Note over Debounce,Table: After 300ms inactivity:<br/>Filter executes once
```

## Estado de Carga de Datos

```mermaid
stateDiagram-v2
    [*] --> Fetching

    Fetching: Promise.allSettled<br/>3 requests

    Fetching --> CheckSuccess: All settled

    CheckSuccess: Verify each response<br/>is array

    CheckSuccess -->|Some failed| Partial: Combine results<br/>partial data OK
    CheckSuccess -->|All success| Success: Full data

    Success -->|initial render| Ready: Set component<br/>state
    Ready -->|user action| Active: Interactive

    Active --> Search: User searches
    Search --> Loading: Fetch with filters
    Loading -->|error| ErrorState: Display error<br/>retry available
    Loading -->|success| Results: Show data

    Results --> Active
    ErrorState --> Active

    style Fetching fill:#fff3e0
    style Ready fill:#c8e6c9
    style Active fill:#e8f5e9
    style ErrorState fill:#ffcdd2
```

## Integración de Tour Interactivo

```mermaid
flowchart TD
    A["User clicks ?"] --> B["startTour()"]
    B --> C["driver() instance"]
    C --> D["setSteps()<br/>5 steps"]
    D --> E["drive()"]

    E --> F["Paso 1<br/>Sector Selector"]
    F -->|next| G["Paso 2<br/>Periodo Selector"]
    G -->|next| H["Paso 3<br/>Fecha Fin"]
    H -->|next| I["Paso 4<br/>Filtros Avanzados"]
    I -->|next| J["Paso 5<br/>Search Button"]

    J -->|done| K["End Tour"]
    K --> A

    F -->|prev| E
    G -->|prev| F
    H -->|prev| G
    I -->|prev| H
    J -->|prev| I

    F -->|close| K

    E -->|smoothScroll| L["Scroll to element"]
    E -->|highlight| M["Show popover"]

    style A fill:#e1f5fe
    style B fill:#b3e5fc
    style K fill:#81d4fa
    style L fill:#fff3e0
    style M fill:#fce4ec
```

## Componentes Secundarios - Detalles Medidor

```mermaid
graph TD
    A["DetallesMedidor<br/>lecturaId"] -->|Promise.allSettled| B["Etapa 1:<br/>Información"]
    A -->|Promise.allSettled| C["Etapa 2:<br/>Lectura"]
    A -->|Promise.allSettled| D["Etapa 3:<br/>Claves"]
    A -->|Promise.allSettled| E["Etapa 4:<br/>Consumo"]

    B --> F["InformacionMedidor<br/>Component"]
    C --> G["InformacionLectura<br/>Component"]
    D --> H["ClavesLectura<br/>Component"]
    E --> I["AnalisisConsumo<br/>Component"]

    F & G & H & I -->|render| J["Tabbed View"]

    B -->|error| K["Handle 404<br/>Show default message"]
    C -->|error| K
    D -->|error| K
    E -->|error| K

    K -->|display| J

    style A fill:#f3e5f5
    style B fill:#fff3e0
    style C fill:#fff3e0
    style D fill:#fff3e0
    style E fill:#fff3e0
    style F fill:#e8f5e9
    style G fill:#e8f5e9
    style H fill:#e8f5e9
    style I fill:#e8f5e9
```

## Keyboard Shortcuts Dispatch

```mermaid
flowchart TD
    A["useMonitorKeyboardShortcuts()"] --> B{Detect Keydown}

    B -->|Ctrl+K| C["onSearch()"]
    B -->|Ctrl+Enter| D["onRefresh()"]
    B -->|Esc| E["onEscape()"]
    B -->|Other| F["Ignore"]

    C --> G["setIsFiltersOpen(true)"]
    G --> H["Focus meterSerial input"]
    H --> I["User can type filter"]

    D --> J["handleSearch()"]
    J --> K["Execute current search"]

    E --> L["setIsFiltersOpen(false)"]
    L --> M["Hide filter panel"]

    F --> N["Continue"]

    style C fill:#a5d6a7
    style D fill:#a5d6a7
    style E fill:#ffb74d
    style F fill:#ef9a9a
```

## Request Caching Strategy

```mermaid
graph LR
    A["Client Request"] -->|check cache| B{Cached?}

    B -->|Yes<br/>Fresh| C["Return cached"]
    B -->|No| D["Fetch from API"]
    B -->|Yes<br/>Stale| E["Return cached +<br/>Revalidate"]

    D -->|network| F["Save to localStorage"]
    E -->|network| F

    F --> G["Component receives data"]
    G -->|success| H["Update state"]
    H -->|render| I["Display to user"]

    D -->|error| J["Use cached if<br/>available"]
    J -->|fallback| K["Empty arrays"]
    K --> L["Show empty state"]

    style C fill:#c8e6c9
    style D fill:#fff3e0
    style E fill:#ffe0b2
    style I fill:#e8f5e9
    style L fill:#ffcdd2
```

## Performance Optimization Timeline

```mermaid
timeline
    title Page Load Performance

    section Initial Load
        0ms : Page request
        100ms : Route loader start
        200ms : API parallel requests
        300ms : Hydration fallback shows

    section Component Init
        500ms : Component mount
        600ms : useEffect executes
        700ms : Period & dates initialized
        800ms : Component ready for interaction

    section User Action
        1000ms : User clicks Iniciar Monitoreo
        1100ms : Validation runs
        1200ms : API request sent
        1500ms : Data received
        1600ms : Results rendered
        1700ms : Animations complete
```

## Data Flow Summary

```mermaid
graph TB
    A["User Browser"] -->|URL| B["Route Handler"]
    B -->|clientLoader| C["MonitorService"]
    C -->|parallel| D["API Calls"]
    D -->|data| E["Component Props"]
    E -->|render| F["Monitor Interface"]
    F -->|user input| G["Handle Functions"]
    G -->|validation| H{Valid?}
    H -->|no| I["Toast Error"]
    H -->|yes| J["Fetch Results"]
    J -->|data| K["ResultadosBusqueda"]
    K -->|group| L["MonitorNichos"]
    L -->|interact| M["Edit/View Actions"]
    M -->|update| J

    style A fill:#e1f5fe
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style E fill:#e8f5e9
    style F fill:#fce4ec
    style I fill:#ffcdd2
    style M fill:#fff9c4
```

