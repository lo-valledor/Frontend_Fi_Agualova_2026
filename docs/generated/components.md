# Documentación de Componentes
*Generado automáticamente el 2025-10-21 09:42:00*

## Índice de Componentes

### breadcrumb-setter
**Archivo**: `app/components/breadcrumb-setter.tsx`
⚠️ *Sin documentación JSDoc*


### chart-config
**Archivo**: `app/components/chart-config.tsx`
⚠️ *Sin documentación JSDoc*


### date-picker
**Archivo**: `app/components/date-picker.tsx`
⚠️ *Sin documentación JSDoc*


### error-boundary
**Archivo**: `app/components/error-boundary.tsx`
⚠️ *Sin documentación JSDoc*


### hydrate-fallback
**Archivo**: `app/components/hydrate-fallback.tsx`
⚠️ *Sin documentación JSDoc*


### loading-spinner
**Archivo**: `app/components/loading-spinner.tsx`
⚠️ *Sin documentación JSDoc*


### loading-state
**Archivo**: `app/components/loading-state.tsx`
⚠️ *Sin documentación JSDoc*


### mode-toggle
**Archivo**: `app/components/mode-toggle.tsx`
⚠️ *Sin documentación JSDoc*


### profile-hydrate-fallback
**Archivo**: `app/components/profile-hydrate-fallback.tsx`
⚠️ *Sin documentación JSDoc*


### profile-loading-state
**Archivo**: `app/components/profile-loading-state.tsx`
⚠️ *Sin documentación JSDoc*


### prueba-ai
**Archivo**: `app/components/prueba-ai.tsx`
⚠️ *Sin documentación JSDoc*


### theme-provider
**Archivo**: `app/components/theme-provider.tsx`
⚠️ *Sin documentación JSDoc*


### under-construction
**Archivo**: `app/components/under-construction.tsx`
⚠️ *Sin documentación JSDoc*


### user-profile-example
**Archivo**: `app/components/user-profile-example.tsx`
⚠️ *Sin documentación JSDoc*


### user-profile-test
**Archivo**: `app/components/user-profile-test.tsx`
⚠️ *Sin documentación JSDoc*


### administracion-hydrate-fallback
**Archivo**: `app/components/administracion/administracion-hydrate-fallback.tsx`
⚠️ *Sin documentación JSDoc*


### acometida-component
**Archivo**: `app/components/administracion/acometida/acometida-component.tsx`
**Documentación**:
```typescript
/**
 * Componente principal para Gestión de Acometidas
 *
 * Funcionalidades principales:
 * - Visualización de acometidas con tabla paginada y filtrable
 * - Creación de nuevas acometidas
 * - Edición de acometidas existentes
 * - Filtros avanzados por empalme, nicho, sector, potencia, ubicación y medidor
 * - Exportación de datos a Excel
 * - Resumen de estadísticas de filtrado
 * - Validación de datos antes de guardar
 *
 * Arquitectura:
 * - DataTable con columnas personalizadas
 * - Sistema de filtros con hook useAcometidaFilters
 * - Modal form para CRUD (AcometidaForm)
 * - FilterSummary para mostrar estadísticas
 * - Componentes de filtros colapsables
 * - API endpoints:
 *   * POST /crear-acometida
 *   * PUT /actualizar-acometida
 *
 * Filtros disponibles:
 * - Empalme (select)
 * - Nicho (select)
 * - Sector (select)
 * - Límite de potencia (rango min-max)
 * - Tiene ubicación (sí/no/todos)
 * - Tiene medidor (sí/no/todos)
 * - Tiene límite potencia (sí/no/todos)
 *
 * @param {Object} props - Props del componente
 * @param {Acometida[]} props.acometidas - Lista de acometidas
 * @param {ComboEmpalmes[]} props.comboEmpalmes - Empalmes disponibles para filtros
 * @param {ComboNichos[]} props.comboNichos - Nichos disponibles para filtros
 * @param {ComboSectores[]} props.comboSectores - Sectores disponibles para filtros
 * @param {ContratosDisponibles[]} props.contratosDisponibles - Contratos disponibles
 *
 * @example
 * ```tsx
 * export default function AcometidaRoute({ loaderData }) {
 *   return (
 *     <AcometidaComponent
 *       acometidas={loaderData.acometidas}
 *       comboEmpalmes={loaderData.empalmes}
 *       comboNichos={loaderData.nichos}
 *       comboSectores={loaderData.sectores}
 *       contratosDisponibles={loaderData.contratos}
 *     />
 *   );
 * }
 * ```
 */
```

### acometida-filters
**Archivo**: `app/components/administracion/acometida/acometida-filters.tsx`
⚠️ *Sin documentación JSDoc*


### acometida-form
**Archivo**: `app/components/administracion/acometida/acometida-form.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/administracion/acometida/columns.tsx`
⚠️ *Sin documentación JSDoc*


### detalles-acometida
**Archivo**: `app/components/administracion/acometida/detalles-acometida.tsx`
⚠️ *Sin documentación JSDoc*


### filter-summary
**Archivo**: `app/components/administracion/acometida/filter-summary.tsx`
⚠️ *Sin documentación JSDoc*


### cargo-facturable-component
**Archivo**: `app/components/administracion/cargo-facturable/cargo-facturable-component.tsx`
**Documentación**:
```typescript
/**
 * Componente principal para Gestión de Cargos Facturables
 *
 * Funcionalidades principales:
 * - Visualización de cargos facturables en tabla
 * - Creación de nuevos cargos con selección de concepto, tarifa y tipo medidor
 * - Edición de cargos existentes
 * - Filtros avanzados por tipo, fijo/variable, periódico/eventual, concepto, tarifa y tipo medidor
 * - Exportación de datos a Excel
 * - Resumen de estadísticas de filtrado
 *
 * Flujo de trabajo:
 * 1. Usuario visualiza tabla de cargos facturables
 * 2. Puede aplicar filtros combinados para buscar cargos específicos
 * 3. Acciones disponibles:
 *    - Crear nuevo cargo (modal)
 *    - Editar cargo existente (modal)
 * 4. Sistema valida datos antes de guardar
 * 5. Recarga automática después de operaciones
 *
 * Arquitectura:
 * - DataTable con columnas personalizadas
 * - Hook useCargoFilters para filtrado
 * - Modal CargoFacturableModalForm para CRUD
 * - FilterSummary para estadísticas
 * - API endpoints:
 *   * POST /crear-cargo-facturable
 *   * PUT /actualizar-cargo-facturable/:id
 *
 * Filtros disponibles:
 * - Tipo (todos/1/2/3)
 * - Fijo/Variable (todos/F/V)
 * - Periódico/Eventual (todos/P/E)
 * - Concepto (select de conceptos disponibles)
 * - Tarifa (select de tarifas)
 * - Tipo de medidor (select de tipos)
 *
 * @param {Object} props - Props del componente
 * @param {BuscarCargoFacturable[]} props.cargos - Lista de cargos facturables
 * @param {GeCombosConceptos[]} props.conceptos - Conceptos disponibles
 * @param {GetCombosTarifas[]} props.tarifas - Tarifas disponibles
 * @param {GetCombosTiposMedidor[]} props.tiposMedidor - Tipos de medidor disponibles
 *
 * @example
 * ```tsx
 * export default function CargoFacturableRoute({ loaderData }) {
 *   return (
 *     <CargoFacturableComponent
 *       cargos={loaderData.cargos}
 *       conceptos={loaderData.conceptos}
 *       tarifas={loaderData.tarifas}
 *       tiposMedidor={loaderData.tiposMedidor}
 *     />
 *   );
 * }
 * ```
 */
```

### cargo-facturable-modal-form
**Archivo**: `app/components/administracion/cargo-facturable/cargo-facturable-modal-form.tsx`
⚠️ *Sin documentación JSDoc*


### cargo-filters
**Archivo**: `app/components/administracion/cargo-facturable/cargo-filters.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/administracion/cargo-facturable/columns.tsx`
⚠️ *Sin documentación JSDoc*


### filter-summary
**Archivo**: `app/components/administracion/cargo-facturable/filter-summary.tsx`
⚠️ *Sin documentación JSDoc*


### cargo-tipo-contrato-component
**Archivo**: `app/components/administracion/cargo-tipo-contrato/cargo-tipo-contrato-component.tsx`
**Documentación**:
```typescript
/**
 * Componente principal para Gestión de Cargos por Tipo de Contrato
 *
 * Funcionalidades principales:
 * - Visualización de relación entre cargos y tipos de contrato
 * - Edición de cargos asociados a tipos de contrato (navegación a /edit/:id)
 * - Eliminación de asociaciones con confirmación
 * - Recarga automática de datos después de operaciones
 *
 * Flujo de trabajo:
 * 1. Usuario visualiza tabla de cargos por tipo de contrato
 * 2. Acciones disponibles:
 *    - Editar (navegación a formulario de edición)
 *    - Eliminar (con confirmación)
 * 3. Sistema recarga datos automáticamente
 *
 * Arquitectura:
 * - DataTable con columnas personalizadas
 * - Navegación a ruta para edición
 * - DeleteDialog para eliminación segura
 * - API endpoints:
 *   * GET /cargoTipoContrato-buscar (consulta)
 *   * DELETE /cargoTipoContrato-eliminar/:id (eliminación)
 *
 * Nota:
 * - Funcionalidad de agregar deshabilitada temporalmente
 * - Se recomienda implementar a futuro
 *
 * @param {Object} props - Props del componente
 * @param {GetCargoTipoContrato[]} props.cargoTipoContrato - Lista de asociaciones
 *
 * @example
 * ```tsx
 * export default function CargoTipoContratoRoute({ loaderData }) {
 *   return (
 *     <CargoTipoContratoComponent
 *       cargoTipoContrato={loaderData.cargoTipoContrato}
 *     />
 *   );
 * }
 * ```
 */
```

### columns
**Archivo**: `app/components/administracion/cargo-tipo-contrato/columns.tsx`
⚠️ *Sin documentación JSDoc*


### delete-dialog
**Archivo**: `app/components/administracion/cargo-tipo-contrato/delete-dialog.tsx`
⚠️ *Sin documentación JSDoc*


### form-modal
**Archivo**: `app/components/administracion/cargo-tipo-contrato/form-modal.tsx`
⚠️ *Sin documentación JSDoc*


### crear-tipo-contrato-component
**Archivo**: `app/components/administracion/cargo-tipo-contrato/form/crear-tipo-contrato-component.tsx`
⚠️ *Sin documentación JSDoc*


### editar-tipo-contrato
**Archivo**: `app/components/administracion/cargo-tipo-contrato/form/editar-tipo-contrato.tsx`
⚠️ *Sin documentación JSDoc*


### client-filters
**Archivo**: `app/components/administracion/clientes/client-filters.tsx`
⚠️ *Sin documentación JSDoc*


### clientes-component
**Archivo**: `app/components/administracion/clientes/clientes-component.tsx`
**Documentación**:
```typescript
/**
 * Componente principal para Gestión de Clientes
 *
 * Funcionalidades principales:
 * - Visualización de clientes (personas y empresas) en tabla
 * - Creación de nuevos clientes (navegación a ruta /crear)
 * - Edición de clientes existentes (navegación a ruta /:rut)
 * - Visualización de detalles completos en modal
 * - Filtros avanzados por tipo, comuna, contacto, teléfono y email
 * - Exportación de datos a Excel
 * - Resumen de estadísticas de filtrado
 *
 * Flujo de trabajo:
 * 1. Usuario visualiza tabla de clientes
 * 2. Puede aplicar filtros para buscar clientes específicos
 * 3. Acciones disponibles por cliente:
 *    - Ver detalles completos (modal)
 *    - Editar (navegación a formulario de edición)
 *    - Crear nuevo (navegación a formulario de creación)
 * 4. Sistema muestra estadísticas de filtrado
 *
 * Arquitectura:
 * - DataTable con columnas personalizadas
 * - Hook useClientFilters para filtrado
 * - Modal ClienteDetailsModal para visualización
 * - Navegación a rutas para crear/editar
 * - FilterSummary para estadísticas
 * - API endpoint: getClienteByRut para detalles
 *
 * Filtros disponibles:
 * - Es empresa (sí/no/todos)
 * - Comuna (select)
 * - Código comuna (select)
 * - Tiene contacto (sí/no/todos)
 * - Tiene teléfono (sí/no/todos)
 * - Tiene email (sí/no/todos)
 *
 * @param {Object} props - Props del componente
 * @param {GetClientes[]} props.clientes - Lista de clientes
 * @param {GetGiros[]} props.giros - Giros comerciales disponibles
 * @param {GetComunas[]} props.comunas - Comunas disponibles
 *
 * @example
 * ```tsx
 * export default function ClientesRoute({ loaderData }) {
 *   return (
 *     <ClientesComponent
 *       clientes={loaderData.clientes}
 *       giros={loaderData.giros}
 *       comunas={loaderData.comunas}
 *     />
 *   );
 * }
 * ```
 */
```

### columns
**Archivo**: `app/components/administracion/clientes/columns.tsx`
⚠️ *Sin documentación JSDoc*


### detalles-cliente
**Archivo**: `app/components/administracion/clientes/detalles-cliente.tsx`
⚠️ *Sin documentación JSDoc*


### filter-summary
**Archivo**: `app/components/administracion/clientes/filter-summary.tsx`
⚠️ *Sin documentación JSDoc*


### crear-cliente-component
**Archivo**: `app/components/administracion/clientes/form/crear-cliente-component.tsx`
⚠️ *Sin documentación JSDoc*


### editar-cliente-component
**Archivo**: `app/components/administracion/clientes/form/editar-cliente-component.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/administracion/condiciones-contrato/columns.tsx`
⚠️ *Sin documentación JSDoc*


### condiciones-contrato-component
**Archivo**: `app/components/administracion/condiciones-contrato/condiciones-contrato-component.tsx`
**Documentación**:
```typescript
/**
 * Componente principal para Gestión de Condiciones de Contrato
 *
 * Funcionalidades principales:
 * - Visualización de condiciones de contrato en tabla
 * - Creación de nuevas condiciones con selección de concepto
 * - Edición de condiciones existentes
 * - Visualización de detalles completos en modal
 * - Asociación de conceptos a condiciones
 *
 * Flujo de trabajo:
 * 1. Usuario visualiza tabla de condiciones de contrato
 * 2. Acciones disponibles:
 *    - Crear nueva condición (modal)
 *    - Editar condición existente (modal)
 *    - Ver detalles completos (modal)
 * 3. Sistema valida datos antes de guardar
 * 4. Recarga automática después de operaciones
 *
 * Arquitectura:
 * - DataTable con columnas personalizadas
 * - Modal CondicionesContratoModalForm para CRUD
 * - Modal DetallesCondicionesContrato para visualización
 * - Dialog para detalles con ScrollArea
 * - Recarga con useRevalidator
 *
 * Conceptos asociables:
 * - Lista completa de conceptos disponibles
 * - Selección mediante react-select
 * - Asociación múltiple por condición
 *
 * @param {Object} props - Props del componente
 * @param {GetCondicionesContrato[]} props.condicionesContrato - Lista de condiciones
 * @param {Conceptos[]} props.conceptos - Conceptos disponibles para asociar
 *
 * @example
 * ```tsx
 * export default function CondicionesContratoRoute({ loaderData }) {
 *   return (
 *     <CondicionesContratoComponent
 *       condicionesContrato={loaderData.condiciones}
 *       conceptos={loaderData.conceptos}
 *     />
 *   );
 * }
 * ```
 */
```

### condiciones-contrato-modal-form
**Archivo**: `app/components/administracion/condiciones-contrato/condiciones-contrato-modal-form.tsx`
⚠️ *Sin documentación JSDoc*


### detalles-condiciones-contrato
**Archivo**: `app/components/administracion/condiciones-contrato/detalles-condiciones-contrato.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/administracion/contratantes/columns.tsx`
⚠️ *Sin documentación JSDoc*


### contratante-filters
**Archivo**: `app/components/administracion/contratantes/contratante-filters.tsx`
⚠️ *Sin documentación JSDoc*


### contratantes-component
**Archivo**: `app/components/administracion/contratantes/contratantes-component.tsx`
**Documentación**:
```typescript
/**
 * Componente principal para Gestión de Contratantes
 *
 * Funcionalidades principales:
 * - Visualización de contratantes (personas y empresas) en tabla
 * - Creación de nuevos contratantes (navegación a /crear)
 * - Edición de contratantes existentes (navegación a /:rut)
 * - Visualización de detalles completos en modal
 * - Filtros avanzados por tipo, comuna, contacto, teléfono y email
 * - Exportación de datos a Excel
 * - Resumen de estadísticas de filtrado
 *
 * Flujo de trabajo:
 * 1. Usuario visualiza tabla de contratantes
 * 2. Puede aplicar filtros para buscar contratantes específicos
 * 3. Acciones disponibles:
 *    - Ver detalles completos (modal)
 *    - Editar (navegación a formulario)
 *    - Crear nuevo (navegación a formulario)
 * 4. Sistema muestra estadísticas de filtrado
 *
 * Arquitectura:
 * - DataTable con columnas personalizadas
 * - Filtros dinámicos con opciones extraídas de datos
 * - Modal ContratanteDetailsModal para visualización
 * - Navegación a rutas para crear/editar
 * - FilterSummary para estadísticas
 * - ExportButton para exportación
 *
 * Filtros disponibles:
 * - Es empresa (sí/no/todos)
 * - Comuna (select dinámico)
 * - Tiene contacto (sí/no/todos)
 * - Tiene teléfono (sí/no/todos)
 * - Tiene email (sí/no/todos)
 *
 * @param {Object} props - Props del componente
 * @param {GetContratante[]} props.contratantes - Lista de contratantes
 * @param {GetComunas[]} props.comunas - Comunas disponibles
 * @param {GetGiros[]} props.giros - Giros comerciales disponibles
 *
 * @example
 * ```tsx
 * export default function ContratantesRoute({ loaderData }) {
 *   return (
 *     <ContratantesComponent
 *       contratantes={loaderData.contratantes}
 *       comunas={loaderData.comunas}
 *       giros={loaderData.giros}
 *     />
 *   );
 * }
 * ```
 */
```

### detalles-contratante
**Archivo**: `app/components/administracion/contratantes/detalles-contratante.tsx`
⚠️ *Sin documentación JSDoc*


### filter-summary
**Archivo**: `app/components/administracion/contratantes/filter-summary.tsx`
⚠️ *Sin documentación JSDoc*


### crear-contratante-component
**Archivo**: `app/components/administracion/contratantes/form/crear-contratante-component.tsx`
⚠️ *Sin documentación JSDoc*


### editar-contratante-component
**Archivo**: `app/components/administracion/contratantes/form/editar-contratante-component.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/administracion/contratos/columns.tsx`
**Documentación**:
```typescript
/**
 * export interface GetContratos {
  codigoContrato: string;
  acometida: string;
  tipoContrato: string;
  tarifa: string;
  nombrePropietario: string;
  nombreCliente: string;
  local: string;
  fechaInicio: string;
  activo: boolean;
  fechaTermino: string;
  comunaEnvio: string;
  direccionEnvio: string;
  limiteInvierno: number;
  promedioAnual: string;
  cicloFacturacion: string;
  potenciaContratada: string;
  liberadoCorte: boolean;
}
 */
```

### contract-details-modal
**Archivo**: `app/components/administracion/contratos/contract-details-modal.tsx`
⚠️ *Sin documentación JSDoc*


### contract-filters
**Archivo**: `app/components/administracion/contratos/contract-filters.tsx`
⚠️ *Sin documentación JSDoc*


### contract-form-modal
**Archivo**: `app/components/administracion/contratos/contract-form-modal.tsx`
⚠️ *Sin documentación JSDoc*


### contract-hydrate-fallback
**Archivo**: `app/components/administracion/contratos/contract-hydrate-fallback.tsx`
⚠️ *Sin documentación JSDoc*


### contratos-component
**Archivo**: `app/components/administracion/contratos/contratos-component.tsx`
**Documentación**:
```typescript
/**
 * Componente principal para Gestión de Contratos
 *
 * Funcionalidades principales:
 * - Visualización de contratos en tabla con columnas personalizadas
 * - Creación de nuevos contratos (navegación a /crear)
 * - Edición de contratos existentes (navegación a /:codigoContrato)
 * - Eliminación de contratos con confirmación
 * - Visualización de detalles completos en modal
 * - Filtros avanzados por tipo, ciclo, tarifa, comuna, estado
 * - Exportación a Excel (2 formatos: simple y completo)
 * - Resumen de estadísticas de filtrado
 *
 * Flujo de trabajo:
 * 1. Usuario visualiza tabla de contratos
 * 2. Puede aplicar múltiples filtros combinados
 * 3. Acciones disponibles por contrato:
 *    - Ver detalles (modal con información completa)
 *    - Editar (navegación a formulario)
 *    - Eliminar (con diálogo de confirmación)
 * 4. Exportación en formato simple o completo
 *
 * Arquitectura:
 * - DataTable con columnas personalizadas
 * - Hook useContractFilters para filtrado avanzado
 * - Modal ContractDetailsModal para visualización
 * - Navegación a rutas para crear/editar
 * - DeleteConfirmationDialog para eliminación segura
 * - ExportButtons con opciones múltiples
 * - FilterSummary con estadísticas en tiempo real
 *
 * Filtros disponibles:
 * - Tipo de contrato (select)
 * - Ciclo de facturación (select)
 * - Tarifa (select)
 * - Comuna (select)
 * - Liberado de corte (sí/no/todos)
 * - Fecha término (rango desde-hasta)
 * - Activo (sí/no/todos)
 *
 * @param {Object} props - Props del componente
 * @param {GetContratos[]} props.contratos - Lista de contratos
 *
 * @example
 * ```tsx
 * export default function ContratosRoute({ loaderData }) {
 *   return <ContratosComponent contratos={loaderData.contratos} />;
 * }
 * ```
 */
```

### delete-confirmation-dialog
**Archivo**: `app/components/administracion/contratos/delete-confirmation-dialog.tsx`
⚠️ *Sin documentación JSDoc*


### export-buttons
**Archivo**: `app/components/administracion/contratos/export-buttons.tsx`
⚠️ *Sin documentación JSDoc*


### filter-summary
**Archivo**: `app/components/administracion/contratos/filter-summary.tsx`
⚠️ *Sin documentación JSDoc*


### crear-contrato-component
**Archivo**: `app/components/administracion/contratos/route/crear-contrato-component.tsx`
⚠️ *Sin documentación JSDoc*


### editar-contrato-component
**Archivo**: `app/components/administracion/contratos/route/editar-contrato-component.tsx`
⚠️ *Sin documentación JSDoc*


### asociar-subempalme-modal
**Archivo**: `app/components/administracion/medidores/asociar-subempalme-modal.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/administracion/medidores/columns.tsx`
⚠️ *Sin documentación JSDoc*


### delete-confirm-dialog
**Archivo**: `app/components/administracion/medidores/delete-confirm-dialog.tsx`
⚠️ *Sin documentación JSDoc*


### filter-summary
**Archivo**: `app/components/administracion/medidores/filter-summary.tsx`
⚠️ *Sin documentación JSDoc*


### medidor-filters
**Archivo**: `app/components/administracion/medidores/medidor-filters.tsx`
⚠️ *Sin documentación JSDoc*


### medidor-form
**Archivo**: `app/components/administracion/medidores/medidor-form.tsx`
⚠️ *Sin documentación JSDoc*


### medidores-component
**Archivo**: `app/components/administracion/medidores/medidores-component.tsx`
**Documentación**:
```typescript
/**
 * Componente principal para Gestión de Medidores
 *
 * Funcionalidades principales:
 * - Visualización de medidores con tabla paginada y filtrable
 * - Creación de nuevos medidores (navegación a /crear)
 * - Edición de medidores existentes (navegación a /:id)
 * - Eliminación de medidores con confirmación
 * - Asociación de medidor a subempalme
 * - Filtros avanzados por marca, tipo, modelo, estado, dígitos, multiplicador
 * - Exportación de datos a Excel
 * - Resumen de estadísticas de filtrado
 *
 * Flujo de trabajo:
 * 1. Usuario visualiza tabla de medidores
 * 2. Puede aplicar filtros por múltiples criterios
 * 3. Acciones disponibles por medidor:
 *    - Editar (navegación a formulario)
 *    - Eliminar (con confirmación)
 *    - Asociar a subempalme (modal específico)
 * 4. Recarga automática después de cada operación
 *
 * Arquitectura:
 * - DataTable con columnas personalizadas y acciones
 * - Hook useMedidorFilters para filtrado
 * - Navegación a rutas para crear/editar
 * - Modal AsociarSubempalmeModal para asociación
 * - DeleteConfirmationDialog para eliminación segura
 * - FilterSummary para estadísticas
 * - API endpoints:
 *   * POST /crear-medidor
 *   * PUT /actualizar-medidor/:id
 *   * DELETE /eliminar-medidor/:id
 *   * GET /medidores (revalidación)
 *
 * Filtros disponibles:
 * - Marca (select)
 * - Tipo (select: Monofásico/Trifásico)
 * - Modelo (select)
 * - Estado (select)
 * - Número de dígitos (rango min-max)
 * - Constante multiplicar (rango min-max)
 * - Fecha inicio (rango desde-hasta)
 * - Tiene ubicación (sí/no/todos)
 * - Tiene acometida (sí/no/todos)
 *
 * @param {Object} props - Props del componente
 * @param {GetMedidores[]} props.medidores - Lista de medidores
 * @param {Marca[]} props.marcas - Marcas disponibles para filtros y formularios
 *
 * @example
 * ```tsx
 * export default function MedidoresRoute({ loaderData }) {
 *   return (
 *     <MedidoresComponent
 *       medidores={loaderData.medidores}
 *       marcas={loaderData.marcas}
 *     />
 *   );
 * }
 * ```
 */
```

### crear-medidor-component
**Archivo**: `app/components/administracion/medidores/form/crear-medidor-component.tsx`
⚠️ *Sin documentación JSDoc*


### editar-medidor-component
**Archivo**: `app/components/administracion/medidores/form/editar-medidor-component.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/administracion/propietarios/columns.tsx`
⚠️ *Sin documentación JSDoc*


### detalles-propietario
**Archivo**: `app/components/administracion/propietarios/detalles-propietario.tsx`
⚠️ *Sin documentación JSDoc*


### filter-summary
**Archivo**: `app/components/administracion/propietarios/filter-summary.tsx`
⚠️ *Sin documentación JSDoc*


### propietario-filters
**Archivo**: `app/components/administracion/propietarios/propietario-filters.tsx`
⚠️ *Sin documentación JSDoc*


### propietarios-component
**Archivo**: `app/components/administracion/propietarios/propietarios-component.tsx`
**Documentación**:
```typescript
/**
 * Componente principal para Gestión de Propietarios
 *
 * Funcionalidades principales:
 * - Visualización de propietarios en tabla
 * - Sincronización de datos con servicio externo
 * - Visualización de detalles completos en modal
 * - Filtros avanzados por comuna, teléfono, celular y email
 * - Exportación de datos a Excel
 * - Resumen de estadísticas de filtrado
 *
 * Flujo de trabajo:
 * 1. Usuario visualiza tabla de propietarios
 * 2. Puede aplicar filtros para buscar propietarios específicos
 * 3. Acciones disponibles:
 *    - Ver detalles completos (modal)
 *    - Sincronizar datos (botón de recarga)
 * 4. Sistema muestra estadísticas de filtrado
 *
 * Sincronización:
 * - Botón de sincronización manual con icono RefreshCw
 * - Llama a administracionService.sincronizarPropietarios()
 * - Feedback visual con estado de carga
 * - Toast notifications de éxito/error
 * - Recarga automática después de sincronizar
 *
 * Arquitectura:
 * - DataTable con columnas personalizadas
 * - Filtros dinámicos con opciones extraídas de datos
 * - Modal PropietarioDetailsModal para visualización
 * - FilterSummary para estadísticas
 * - ExportButton para exportación
 * - Hook useMemo para optimización de filtros
 *
 * Filtros disponibles:
 * - Comuna (select dinámico)
 * - Tiene teléfono (sí/no/todos)
 * - Tiene celular (sí/no/todos)
 * - Tiene email (sí/no/todos)
 *
 * @param {Object} props - Props del componente
 * @param {GetPropietario[]} props.propietarios - Lista de propietarios
 * @param {GetContratante[]} props.contratantes - Contratantes relacionados
 *
 * @example
 * ```tsx
 * export default function PropietariosRoute({ loaderData }) {
 *   return (
 *     <PropietariosComponent
 *       propietarios={loaderData.propietarios}
 *       contratantes={loaderData.contratantes}
 *     />
 *   );
 * }
 * ```
 */
```

### columns
**Archivo**: `app/components/administracion/usuarios/columns.tsx`
⚠️ *Sin documentación JSDoc*


### delete-confirmation-dialog
**Archivo**: `app/components/administracion/usuarios/delete-confirmation-dialog.tsx`
⚠️ *Sin documentación JSDoc*


### user-form-modal
**Archivo**: `app/components/administracion/usuarios/user-form-modal.tsx`
⚠️ *Sin documentación JSDoc*


### usuarios-component
**Archivo**: `app/components/administracion/usuarios/usuarios-component.tsx`
**Documentación**:
```typescript
/**
 * Componente principal para Gestión de Usuarios
 *
 * Funcionalidades principales:
 * - Visualización de usuarios del sistema en tabla
 * - Creación de nuevos usuarios con validación de contraseña
 * - Edición de usuarios existentes
 * - Eliminación de usuarios con confirmación
 * - Asignación de perfiles y departamentos
 * - Gestión de estado activo/inactivo
 * - Validación de contraseñas seguras (ver password-validation.ts)
 *
 * Flujo de trabajo:
 * 1. Usuario visualiza tabla de usuarios del sistema
 * 2. Acciones disponibles:
 *    - Crear nuevo usuario (modal con validación de contraseña)
 *    - Editar usuario existente (modal)
 *    - Eliminar usuario (con confirmación)
 * 3. Sistema valida:
 *    - Contraseña segura (8+ caracteres, mayúsculas, minúsculas, números, especiales)
 *    - Coincidencia de contraseñas
 *    - Datos requeridos
 * 4. Recarga automática de lista después de operaciones
 *
 * Arquitectura:
 * - DataTable con columnas: nombre, usuario, perfil, departamento, estado, acciones
 * - Modal UserFormModal con dos modos (add/edit)
 * - Hook useAdministracion para operaciones CRUD
 * - DeleteConfirmationDialog para eliminación segura
 * - Validación de contraseñas con password-validation utils
 * - API endpoints:
 *   * POST /crear (creación de usuario)
 *   * PUT /actualizar/:id (actualización)
 *   * DELETE /eliminar/:id (eliminación)
 *   * GET /listar (revalidación)
 *
 * Perfiles disponibles:
 * - Administrador
 * - Lectura
 * - Supervisor Operativo
 * - Administrativo Facturación
 * - Supervisor Facturación
 * - Usuario Consulta
 * - Autorizador Límite Invierno
 *
 * Departamentos:
 * - Gerencia
 * - Tecnología
 * - Recaudación
 * - Seguridad
 * - RR.HH
 * - Enerlova
 *
 * @param {Object} props - Props del componente
 * @param {Usuarios[]} props.usuarios - Lista de usuarios del sistema
 *
 * @example
 * ```tsx
 * export default function UsuariosRoute({ loaderData }) {
 *   return <UsuariosComponent usuarios={loaderData.usuarios} />;
 * }
 * ```
 */
```

### auto-redirect
**Archivo**: `app/components/auth/auto-redirect.tsx`
**Documentación**:
```typescript
/** Ruta a la que redirigir si el usuario está autenticado */
/** Ruta a la que redirigir si el usuario no está autenticado */
/** Mensaje de carga personalizado */
```

### forgot-form
**Archivo**: `app/components/auth/forgot-form.tsx`
⚠️ *Sin documentación JSDoc*


### login-form
**Archivo**: `app/components/auth/login-form.tsx`
⚠️ *Sin documentación JSDoc*


### reset-form
**Archivo**: `app/components/auth/reset-form.tsx`
⚠️ *Sin documentación JSDoc*


### permisos-usuarios-component
**Archivo**: `app/components/configuracion/permisos-usuarios/permisos-usuarios-component.tsx`
⚠️ *Sin documentación JSDoc*


### menus-tab-component
**Archivo**: `app/components/configuracion/roles-permisos/menus-tab-component.tsx`
⚠️ *Sin documentación JSDoc*


### permisos-tab-component
**Archivo**: `app/components/configuracion/roles-permisos/permisos-tab-component.tsx`
⚠️ *Sin documentación JSDoc*


### roles-permisos-component
**Archivo**: `app/components/configuracion/roles-permisos/roles-permisos-component.tsx`
⚠️ *Sin documentación JSDoc*


### roles-tab-component
**Archivo**: `app/components/configuracion/roles-permisos/roles-tab-component.tsx`
⚠️ *Sin documentación JSDoc*


### menus-columns
**Archivo**: `app/components/configuracion/roles-permisos/columns/menus-columns.tsx`
⚠️ *Sin documentación JSDoc*


### roles-columns
**Archivo**: `app/components/configuracion/roles-permisos/columns/roles-columns.tsx`
⚠️ *Sin documentación JSDoc*


### admin-analytics
**Archivo**: `app/components/dashboard/admin-analytics.tsx`
⚠️ *Sin documentación JSDoc*


### advanced-charts
**Archivo**: `app/components/dashboard/advanced-charts.tsx`
⚠️ *Sin documentación JSDoc*


### dashboard-component
**Archivo**: `app/components/dashboard/dashboard-component.tsx`
⚠️ *Sin documentación JSDoc*


### real-time-metrics
**Archivo**: `app/components/dashboard/real-time-metrics.tsx`
⚠️ *Sin documentación JSDoc*


### advanced-pagination
**Archivo**: `app/components/data-table/advanced-pagination.tsx`
⚠️ *Sin documentación JSDoc*


### data-table-column-header
**Archivo**: `app/components/data-table/data-table-column-header.tsx`
⚠️ *Sin documentación JSDoc*


### data-table-pagination
**Archivo**: `app/components/data-table/data-table-pagination.tsx`
⚠️ *Sin documentación JSDoc*


### data-table
**Archivo**: `app/components/data-table/data-table.tsx`
⚠️ *Sin documentación JSDoc*


### table-helpers
**Archivo**: `app/components/data-table/table-helpers.tsx`
⚠️ *Sin documentación JSDoc*


### mantencion-hydrate-fallback
**Archivo**: `app/components/mantencion/mantencion-hydrate-fallback.tsx`
⚠️ *Sin documentación JSDoc*


### ciclos-facturacion-component
**Archivo**: `app/components/mantencion/ciclos-facturacion/ciclos-facturacion-component.tsx`
⚠️ *Sin documentación JSDoc*


### ciclos-facturacion-modal-form
**Archivo**: `app/components/mantencion/ciclos-facturacion/ciclos-facturacion-modal-form.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/mantencion/ciclos-facturacion/columns.tsx`
⚠️ *Sin documentación JSDoc*


### clave-form-modal
**Archivo**: `app/components/mantencion/claves/clave-form-modal.tsx`
⚠️ *Sin documentación JSDoc*


### claves-component
**Archivo**: `app/components/mantencion/claves/claves-component.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/mantencion/claves/columns.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/mantencion/conceptos/columns.tsx`
⚠️ *Sin documentación JSDoc*


### concepto-form-modal
**Archivo**: `app/components/mantencion/conceptos/concepto-form-modal.tsx`
⚠️ *Sin documentación JSDoc*


### conceptos-component
**Archivo**: `app/components/mantencion/conceptos/conceptos-component.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/mantencion/empalmes/columns.tsx`
⚠️ *Sin documentación JSDoc*


### empalmes-component
**Archivo**: `app/components/mantencion/empalmes/empalmes-component.tsx`
⚠️ *Sin documentación JSDoc*


### empalmes-modal-form
**Archivo**: `app/components/mantencion/empalmes/empalmes-modal-form.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/mantencion/marcas/columns.tsx`
⚠️ *Sin documentación JSDoc*


### marca-form-modal
**Archivo**: `app/components/mantencion/marcas/marca-form-modal.tsx`
⚠️ *Sin documentación JSDoc*


### marcas-component
**Archivo**: `app/components/mantencion/marcas/marcas-component.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/mantencion/nichos/columns.tsx`
⚠️ *Sin documentación JSDoc*


### nichos-component
**Archivo**: `app/components/mantencion/nichos/nichos-component.tsx`
⚠️ *Sin documentación JSDoc*


### nichos-form-modal
**Archivo**: `app/components/mantencion/nichos/nichos-form-modal.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/mantencion/parametros/columns.tsx`
⚠️ *Sin documentación JSDoc*


### parametro-form-modal
**Archivo**: `app/components/mantencion/parametros/parametro-form-modal.tsx`
⚠️ *Sin documentación JSDoc*


### parametros-component
**Archivo**: `app/components/mantencion/parametros/parametros-component.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/mantencion/sector/columns.tsx`
⚠️ *Sin documentación JSDoc*


### sector-component
**Archivo**: `app/components/mantencion/sector/sector-component.tsx`
⚠️ *Sin documentación JSDoc*


### sector-form-modal
**Archivo**: `app/components/mantencion/sector/sector-form-modal.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/mantencion/tarifas/columns.tsx`
⚠️ *Sin documentación JSDoc*


### tarifa-form-modal
**Archivo**: `app/components/mantencion/tarifas/tarifa-form-modal.tsx`
⚠️ *Sin documentación JSDoc*


### tarifas-component
**Archivo**: `app/components/mantencion/tarifas/tarifas-component.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/mantencion/tipos-contratos/columns.tsx`
⚠️ *Sin documentación JSDoc*


### tipo-contrato-form-modal
**Archivo**: `app/components/mantencion/tipos-contratos/tipo-contrato-form-modal.tsx`
⚠️ *Sin documentación JSDoc*


### tipos-contratos-component
**Archivo**: `app/components/mantencion/tipos-contratos/tipos-contratos-component.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/mantencion/zonas/columns.tsx`
⚠️ *Sin documentación JSDoc*


### zona-form-modal
**Archivo**: `app/components/mantencion/zonas/zona-form-modal.tsx`
⚠️ *Sin documentación JSDoc*


### zonas-component
**Archivo**: `app/components/mantencion/zonas/zonas-component.tsx`
⚠️ *Sin documentación JSDoc*


### exportar-lecturas-component
**Archivo**: `app/components/monitor/exportar-lecturas-component.tsx`
⚠️ *Sin documentación JSDoc*


### monitor-hydrate-fallback
**Archivo**: `app/components/monitor/monitor-hydrate-fallback.tsx`
⚠️ *Sin documentación JSDoc*


### monitor-lecturas-component
**Archivo**: `app/components/monitor/monitor-lecturas-component.tsx`
⚠️ *Sin documentación JSDoc*


### importar-lecturas-component
**Archivo**: `app/components/monitor/importar-lecturas/importar-lecturas-component.tsx`
⚠️ *Sin documentación JSDoc*


### resultado-procesamiento-modal
**Archivo**: `app/components/monitor/importar-lecturas/resultado-procesamiento-modal.tsx`
⚠️ *Sin documentación JSDoc*


### columns-nichos
**Archivo**: `app/components/monitor/monitor-lecturas/columns-nichos.tsx`
⚠️ *Sin documentación JSDoc*


### data-table-nichos
**Archivo**: `app/components/monitor/monitor-lecturas/data-table-nichos.tsx`
⚠️ *Sin documentación JSDoc*


### detalle-lectura-bt43
**Archivo**: `app/components/monitor/monitor-lecturas/detalle-lectura-bt43.tsx`
⚠️ *Sin documentación JSDoc*


### detalles-medidor
**Archivo**: `app/components/monitor/monitor-lecturas/detalles-medidor.tsx`
⚠️ *Sin documentación JSDoc*


### editar-medidores
**Archivo**: `app/components/monitor/monitor-lecturas/editar-medidores.tsx`
⚠️ *Sin documentación JSDoc*


### insercion-automatica-dialog
**Archivo**: `app/components/monitor/monitor-lecturas/insercion-automatica-dialog.tsx`
**Documentación**:
```typescript
/**
 * Componente de diálogo para inserción automática de lecturas
 * Muestra resumen de validación y procesa inserciones en lote
 */
```

### monitor-nichos
**Archivo**: `app/components/monitor/monitor-lecturas/monitor-nichos.tsx`
⚠️ *Sin documentación JSDoc*


### resultados-busqueda
**Archivo**: `app/components/monitor/monitor-lecturas/resultados-busqueda.tsx`
⚠️ *Sin documentación JSDoc*


### analisis-consumo
**Archivo**: `app/components/monitor/monitor-lecturas/detalles-medidor/analisis-consumo.tsx`
⚠️ *Sin documentación JSDoc*


### claves-lectura
**Archivo**: `app/components/monitor/monitor-lecturas/detalles-medidor/claves-lectura.tsx`
⚠️ *Sin documentación JSDoc*


### informacion-lectura
**Archivo**: `app/components/monitor/monitor-lecturas/detalles-medidor/informacion-lectura.tsx`
⚠️ *Sin documentación JSDoc*


### informacion-medidor
**Archivo**: `app/components/monitor/monitor-lecturas/detalles-medidor/informacion-medidor.tsx`
⚠️ *Sin documentación JSDoc*


### confirmation-dialog
**Archivo**: `app/components/monitor/monitor-lecturas/dialogs/confirmation-dialog.tsx`
⚠️ *Sin documentación JSDoc*


### bt1-bt2-form
**Archivo**: `app/components/monitor/monitor-lecturas/form-sections/bt1-bt2-form.tsx`
⚠️ *Sin documentación JSDoc*


### bt4-3-form
**Archivo**: `app/components/monitor/monitor-lecturas/form-sections/bt4-3-form.tsx`
⚠️ *Sin documentación JSDoc*


### reapertura-form
**Archivo**: `app/components/monitor/monitor-lecturas/form-sections/reapertura-form.tsx`
⚠️ *Sin documentación JSDoc*


### anular-factura-impresa-component
**Archivo**: `app/components/operaciones/anular-factura-impresa/anular-factura-impresa-component.tsx`
**Documentación**:
```typescript
/**
 * Componente para Anulación de Facturas Impresas
 * 
 * Funcionalidades principales:
 * - Anulación de facturas impresas por número de folio
 * - Opción de anulación con o sin nueva toma de lectura
 * - Validación de datos antes de procesar
 * - Confirmación mediante diálogo antes de ejecutar
 * - Retroalimentación visual del resultado de la operación
 * 
 * Flujo de trabajo:
 * 1. Usuario ingresa número de factura
 * 2. Usuario selecciona si requiere nueva toma de lectura (toggle)
 * 3. Sistema valida que hay número de factura
 * 4. Usuario confirma la anulación en diálogo modal
 * 5. Sistema procesa la anulación vía API
 * 6. Sistema muestra resultado (éxito o error)
 * 
 * Arquitectura:
 * - Usa Shadcn/ui components (Card, Dialog, Alert, Input, Switch)
 * - Estados locales para manejo del formulario
 * - API call con axios via lib/api
 * - Feedback con sonner toast y alertas visuales
 * 
 * @example
 * ```tsx
 * // Usado en app/routes/operaciones/anular-factura.tsx
 * export default function AnularFacturaRoute() {
 *   return <AnularFacturaImpresaComponent />;
 * }
 * ```
 */
```

### antiguo-medidor-form
**Archivo**: `app/components/operaciones/cambio-medidor/antiguo-medidor-form.tsx`
⚠️ *Sin documentación JSDoc*


### cambio-medidor-component
**Archivo**: `app/components/operaciones/cambio-medidor/cambio-medidor-component.tsx`
**Documentación**:
```typescript
/**
 * Componente principal para Cambio de Medidor
 * 
 * Funcionalidades principales:
 * - Búsqueda y visualización de medidor antiguo a reemplazar
 * - Configuración del medidor antiguo (lecturas actuales y finales)
 * - Búsqueda y configuración de medidor nuevo
 * - Registro del cambio de medidor en el sistema
 * - Flujo paso a paso (wizard) con 4 etapas
 * 
 * Flujo de trabajo (4 pasos):
 * 1. **Medidor Antiguo**: Búsqueda por acometida o número de serie
 * 2. **Detalles Antiguo**: Revisión y ajuste de lecturas del medidor a reemplazar
 * 3. **Medidor Nuevo**: Búsqueda y configuración del medidor de reemplazo
 * 4. **Confirmar Cambio**: Revisión final y registro del cambio
 * 
 * Arquitectura:
 * - Wizard con stepper visual (Progress + indicadores de paso)
 * - Componentes especializados para cada paso:
 *   * AntiguoMedidorForm: Formulario de búsqueda medidor antiguo
 *   * DetalleMedidorAntiguoComponent: Detalles y lecturas del medidor antiguo
 *   * NuevoMedidorForm: Formulario de búsqueda medidor nuevo
 *   * DetalleMedidorNuevoComponent: Detalles del medidor nuevo
 * - Estados locales para cada tipo de medidor
 * - Validaciones en cada paso antes de avanzar
 * - API calls para consultas y registro final
 * 
 * @example
 * ```tsx
 * // Usado en app/routes/operaciones/cambio-medidor.tsx
 * export default function CambioMedidorRoute() {
 *   return <CambioMedidorComponent />;
 * }
 * ```
 */
```

### collapsible-header
**Archivo**: `app/components/operaciones/cambio-medidor/collapsible-header.tsx`
⚠️ *Sin documentación JSDoc*


### detalle-medidor-antiguo
**Archivo**: `app/components/operaciones/cambio-medidor/detalle-medidor-antiguo.tsx`
⚠️ *Sin documentación JSDoc*


### detalle-medidor-nuevo
**Archivo**: `app/components/operaciones/cambio-medidor/detalle-medidor-nuevo.tsx`
⚠️ *Sin documentación JSDoc*


### medidor-field
**Archivo**: `app/components/operaciones/cambio-medidor/medidor-field.tsx`
⚠️ *Sin documentación JSDoc*


### medidor-fields-group
**Archivo**: `app/components/operaciones/cambio-medidor/medidor-fields-group.tsx`
⚠️ *Sin documentación JSDoc*


### nuevo-contrato-form
**Archivo**: `app/components/operaciones/cambio-medidor/nuevo-contrato-form.tsx`
⚠️ *Sin documentación JSDoc*


### nuevo-medidor-form
**Archivo**: `app/components/operaciones/cambio-medidor/nuevo-medidor-form.tsx`
⚠️ *Sin documentación JSDoc*


### alert-cerrar-lecturas
**Archivo**: `app/components/operaciones/cerrar-lecturas/alert-cerrar-lecturas.tsx`
⚠️ *Sin documentación JSDoc*


### cerrar-lecturas-component
**Archivo**: `app/components/operaciones/cerrar-lecturas/cerrar-lecturas-component.tsx`
**Documentación**:
```typescript
/**
 * Componente principal para Cierre de Lecturas
 *
 * Funcionalidades principales:
 * - Consulta de estado de cierre de lecturas por ciclo de facturación
 * - Visualización de lecturas OK, con claves (rojas/naranjas) y corregidas
 * - Selección múltiple de nichos para cerrar lecturas
 * - Validación de claves críticas que bloquean el cierre
 * - Advertencias de claves de alerta antes de proceder
 * - Cierre masivo de lecturas seleccionadas
 *
 * Flujo de trabajo:
 * 1. Usuario selecciona ciclo de facturación (15 o 30)
 * 2. Sistema carga lecturas pendientes de cierre para ese ciclo
 * 3. Sistema muestra tabla con estado por nicho:
 *    - Lecturas OK (sin problemas)
 *    - Claves Rojas (críticas - bloquean cierre)
 *    - Claves Naranjas (alertas - permiten cierre con advertencia)
 *    - Lecturas Corregidas
 * 4. Usuario selecciona nichos a cerrar (checkboxes en tabla)
 * 5. Sistema valida que no haya claves críticas
 * 6. Usuario confirma cierre en diálogo
 * 7. Sistema procesa cierre y actualiza estado
 *
 * Validaciones de seguridad:
 * - **Claves Rojas (Críticas)**: Bloquean completamente el cierre
 * - **Claves Naranjas (Alertas)**: Permiten cierre pero muestran advertencia
 * - Sistema muestra contador de lecturas críticas y de alerta
 * - Botón de cierre se deshabilita si hay claves críticas
 *
 * Arquitectura:
 * - Usa DataTable con selección múltiple (checkboxes)
 * - Componente AlertCerrarLecturas para confirmación
 * - Validación checkCriticalBlockers antes de permitir cierre
 * - Estados para periodo, ciclo, lecturas y selección
 * - API endpoints: /estado-cierre-lecturas
 *
 * @param {Object} props - Props del componente
 * @param {PeriodoAbierto[]} props.periodoAbierto - Periodo activo de facturación
 * @param {Ciclo[]} props.ciclosFacturacion - Ciclos disponibles (15/30)
 *
 * @example
 * ```tsx
 * // Usado en app/routes/operaciones/cerrar-lecturas.tsx
 * export default function CerrarLecturasRoute({ loaderData }) {
 *   return (
 *     <CerrarLecturasComponent
 *       periodoAbierto={loaderData.periodoAbierto}
 *       ciclosFacturacion={loaderData.ciclosFacturacion}
 *     />
 *   );
 * }
 * ```
 */
```

### columns
**Archivo**: `app/components/operaciones/cerrar-lecturas/columns.tsx`
⚠️ *Sin documentación JSDoc*


### dialog-informacion
**Archivo**: `app/components/operaciones/cerrar-lecturas/dialog-informacion.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/operaciones/corte-reposicion/columns.tsx`
⚠️ *Sin documentación JSDoc*


### corte-registrado-dialog
**Archivo**: `app/components/operaciones/corte-reposicion/corte-registrado-dialog.tsx`
⚠️ *Sin documentación JSDoc*


### corte-reposicion-component
**Archivo**: `app/components/operaciones/corte-reposicion/corte-reposicion-component.tsx`
**Documentación**:
```typescript
/**
 * Componente principal para Corte y Reposición de Servicios
 *
 * Funcionalidades principales:
 * - Visualización de estados de corte y reposición por cliente
 * - Gestión del ciclo completo: Pendiente → Liberado → Cortado → Reposición
 * - Exportación de datos a Excel (2 formatos)
 * - Control del proceso de revisión (Activar, Iniciar, Finalizar)
 * - Estadísticas rápidas de estados
 * - Tour interactivo para nuevos usuarios (driver.js)
 *
 * Flujo del proceso de corte:
 * 1. **Activar Actualización**: Prepara el sistema para revisar
 * 2. **Iniciar**: Comienza proceso de revisión de cortes
 * 3. **Buscar**: Carga datos del mantenedor de revisión
 * 4. **Gestión por estado**:
 *    - NULL/Pendiente: Cliente pendiente de revisión
 *    - 1/Liberado: Cliente liberado de corte
 *    - 2/Cortado: Cliente con servicio cortado
 *    - 3/Reposición Solicitada: Solicitud de reconexión
 * 5. **Finalizar**: Cierra el proceso de revisión
 *
 * Características especiales:
 * - **Tour Interactivo**: Guía paso a paso con driver.js (7 pasos)
 * - **Estadísticas en tiempo real**: Cards con totales por estado
 * - **Exportación dual**: Mantenedor completo y Revisión de corte
 * - **Tabla con acciones**: Marcar/Liberar, Registrar corte, Solicitar reposición
 * - **Modales especializados**: Confirmación de cada acción
 *
 * Arquitectura:
 * - Usa DataTable con columnas personalizadas
 * - Componentes modales:
 *   * CorteRegistradoDialog: Registrar corte ejecutado
 *   * MarcarLiberarDialog: Liberar cliente de corte
 *   * ReposicionSolicitadaDialog: Solicitar reconexión
 * - Estados para datos, búsqueda y selección
 * - API endpoints:
 *   * GET /consulta-mantenedor-revision-corte
 *   * POST /modificar-revision
 *   * POST /ingresar-revision
 *   * POST /finalizar-revision
 *   * GET /exportar-* (para Excel)
 *
 * @param {Object} props - Props del componente
 * @param {TotalesCorteReposicion[]} props.totalesData - Totales por estado
 * @param {ConsultarMantenedorRevisionCorte[]} props.mantenedorCorteData - Datos de revisión
 *
 * @example
 * ```tsx
 * // Usado en app/routes/operaciones/corte-reposicion.tsx
 * export default function CorteReposicionRoute({ loaderData }) {
 *   return (
 *     <CorteReposicionComponent
 *       totalesData={loaderData.totales}
 *       mantenedorCorteData={loaderData.mantenedor}
 *     />
 *   );
 * }
 * ```
 */
```

### marcar-liberar-dialog
**Archivo**: `app/components/operaciones/corte-reposicion/marcar-liberar-dialog.tsx`
⚠️ *Sin documentación JSDoc*


### reposicion-solicitada-dialog
**Archivo**: `app/components/operaciones/corte-reposicion/reposicion-solicitada-dialog.tsx`
⚠️ *Sin documentación JSDoc*


### crear-archivos-sap-component
**Archivo**: `app/components/operaciones/crear-archivos-sap/crear-archivos-sap-component.tsx`
**Documentación**:
```typescript
/**
 * Componente para Creación y Descarga de Archivos SAP
 * 
 * Funcionalidades principales:
 * - Generación de archivo de encabezado de factura (FAC)
 * - Generación de archivo de detalle de factura (DET)
 * - Descarga directa de archivos CSV con formato SAP
 * - Nombres de archivo con timestamp automático
 * - Manejo de errores de generación y descarga
 * 
 * Archivos generados:
 * 1. **Encabezado Factura (FAC)**:
 *    - Formato: FAC-DDMMYYYY-HHMM.csv
 *    - Contenido: Headers de facturas para integración SAP
 *    - Endpoint: GET /exportar-encabezado
 * 
 * 2. **Detalle Factura (DET)**:
 *    - Formato: DET-DDMMYYYY-HHMM.csv
 *    - Contenido: Líneas de detalle de facturas
 *    - Endpoint: GET /exportar-detalle
 * 
 * Características técnicas:
 * - Descarga como blob con tipo text/csv;charset=utf-8
 * - Extracción de filename desde Content-Disposition header
 * - Fallback a filename con timestamp si no viene en header
 * - Limpieza de URLs y elementos DOM después de descarga
 * - Estados de carga independientes para cada archivo
 * 
 * Arquitectura:
 * - Componente sin estado de datos (solo UI)
 * - Botones independientes para cada archivo
 * - Helper functions:
 *   * extractFilenameFromHeaders: Extrae nombre del header
 *   * generateFallbackFilename: Genera nombre con timestamp
 * - Feedback visual con toast notifications
 * - Estados de loading por botón
 * 
 * @example
 * ```tsx
 * // Usado en app/routes/operaciones/crear-archivos-sap.tsx
 * export default function CrearArchivosSapRoute() {
 *   return <CrearArchivosSapComponent />;
 * }
 * ```
 */
```

### cerrar-periodo
**Archivo**: `app/components/operaciones/periodo-facturacion/cerrar-periodo.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/operaciones/periodo-facturacion/columns.tsx`
⚠️ *Sin documentación JSDoc*


### dialog-abrir-periodo
**Archivo**: `app/components/operaciones/periodo-facturacion/dialog-abrir-periodo.tsx`
⚠️ *Sin documentación JSDoc*


### dialog-nuevo-periodo
**Archivo**: `app/components/operaciones/periodo-facturacion/dialog-nuevo-periodo.tsx`
⚠️ *Sin documentación JSDoc*


### periodo-facturacion-component
**Archivo**: `app/components/operaciones/periodo-facturacion/periodo-facturacion-component.tsx`
⚠️ *Sin documentación JSDoc*


### columns-enel
**Archivo**: `app/components/operaciones/precios-cargo/columns-enel.tsx`
⚠️ *Sin documentación JSDoc*


### columns-enerlova
**Archivo**: `app/components/operaciones/precios-cargo/columns-enerlova.tsx`
⚠️ *Sin documentación JSDoc*


### data-table-precios
**Archivo**: `app/components/operaciones/precios-cargo/data-table-precios.tsx`
⚠️ *Sin documentación JSDoc*


### detalle-precios-enerlova
**Archivo**: `app/components/operaciones/precios-cargo/detalle-precios-enerlova.tsx`
**Documentación**:
```typescript
/**
   * Calcula la fecha siguiente a la fecha dada y la devuelve en formato DD-MM-YYYY.
   * Asume que la fecha de entrada está en formato DD-MM-YYYY.
   * @param ultimaFechaFin - La última fecha de fin en formato DD-MM-YYYY (ej: "31-01-2025").
   * @returns La fecha siguiente en formato DD-MM-YYYY (ej: "01-02-2025") o una cadena vacía si hay error.
   */
```

### dialog-agregar-precios
**Archivo**: `app/components/operaciones/precios-cargo/dialog-agregar-precios.tsx`
⚠️ *Sin documentación JSDoc*


### dialog-nuevo-valor-enerlova
**Archivo**: `app/components/operaciones/precios-cargo/dialog-nuevo-valor-enerlova.tsx`
⚠️ *Sin documentación JSDoc*


### precios-cargo-component
**Archivo**: `app/components/operaciones/precios-cargo/precios-cargo-component.tsx`
**Documentación**:
```typescript
/**
 * Componente principal para Gestión de Precios de Cargo
 *
 * Funcionalidades principales:
 * - Visualización de precios de cargo ENEL y Enerlova
 * - Filtros por mes y año para consultas históricas
 * - Tabs para alternar entre precios ENEL y Enerlova
 * - Exportación de datos a Excel
 * - Actualización de valores de precios
 * - Visualización de detalles expandidos
 *
 * Arquitectura:
 * - Tabs component con 2 pestañas (ENEL / Enerlova)
 * - DataTablePrecios con columnas especializadas para cada tipo
 * - Filtros de período (mes/año)
 * - Estados locales para filtros y datos cargados
 * - API endpoints:
 *   * POST /consulta-precios-enel
 *   * POST /consulta-precios-enerlova
 *
 * Pestañas disponibles:
 * 1. **ENEL**: Precios de cargo de la distribuidora ENEL
 * 2. **Enerlova**: Precios propios de Enerlova
 *
 * @param {Object} props - Props del componente
 * @param {PreciosCargoEnel[]} props.tablaEnel - Datos iniciales de precios ENEL
 * @param {PreciosCargoEnerlova[]} props.tablaEnerlova - Datos iniciales de precios Enerlova
 * @param {string} props.initialMes - Mes inicial del filtro
 * @param {string} props.initialAnio - Año inicial del filtro
 * @param {string | null} props.error - Error de carga inicial
 *
 * @example
 * ```tsx
 * // Usado en app/routes/operaciones/precios-cargo.tsx
 * export default function PreciosCargoRoute({ loaderData }) {
 *   return (
 *     <PreciosCargoComponent
 *       tablaEnel={loaderData.tablaEnel}
 *       tablaEnerlova={loaderData.tablaEnerlova}
 *       initialMes={loaderData.mes}
 *       initialAnio={loaderData.anio}
 *       error={loaderData.error}
 *     />
 *   );
 * }
 * ```
 */
```

### dialog-lecturas-pendientes
**Archivo**: `app/components/operaciones/preparar-lecturas/dialog-lecturas-pendientes.tsx`
⚠️ *Sin documentación JSDoc*


### preparar-lecturas-component
**Archivo**: `app/components/operaciones/preparar-lecturas/preparar-lecturas-component.tsx`
⚠️ *Sin documentación JSDoc*


### tabla-asignacion-sectores
**Archivo**: `app/components/operaciones/preparar-lecturas/tabla-asignacion-sectores.tsx`
⚠️ *Sin documentación JSDoc*


### tabla-lecturas-pendientes
**Archivo**: `app/components/operaciones/preparar-lecturas/tabla-lecturas-pendientes.tsx`
⚠️ *Sin documentación JSDoc*


### columnsPrecalculo
**Archivo**: `app/components/operaciones/revisar-calculo-factura/columnsPrecalculo.tsx`
⚠️ *Sin documentación JSDoc*


### data-table
**Archivo**: `app/components/operaciones/revisar-calculo-factura/data-table.tsx`
⚠️ *Sin documentación JSDoc*


### debug-flow-component
**Archivo**: `app/components/operaciones/revisar-calculo-factura/debug-flow-component.tsx`
⚠️ *Sin documentación JSDoc*


### hierarchical-data-table
**Archivo**: `app/components/operaciones/revisar-calculo-factura/hierarchical-data-table.tsx`
⚠️ *Sin documentación JSDoc*


### revisar-calculo-factura-component
**Archivo**: `app/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component.tsx`
**Documentación**:
```typescript
/**
 * Componente principal para Revisión de Cálculo de Facturas (OPTIMIZADO)
 *
 * Optimizaciones implementadas:
 * - useCallback para funciones que se pasan como props
 * - useMemo para cálculos pesados
 * - Lazy loading de componentes pesados
 * - Virtualización de lista (preparado para React Window)
 * - Reducción de re-renders innecesarios
 */
```

### columns-enel
**Archivo**: `app/components/operaciones/revisar-precio/columns-enel.tsx`
⚠️ *Sin documentación JSDoc*


### columns-enerlova
**Archivo**: `app/components/operaciones/revisar-precio/columns-enerlova.tsx`
⚠️ *Sin documentación JSDoc*


### data-table
**Archivo**: `app/components/operaciones/revisar-precio/data-table.tsx`
⚠️ *Sin documentación JSDoc*


### dialog-modificar-precio
**Archivo**: `app/components/operaciones/revisar-precio/dialog-modificar-precio.tsx`
⚠️ *Sin documentación JSDoc*


### revisar-precio-component
**Archivo**: `app/components/operaciones/revisar-precio/revisar-precio-component.tsx`
**Documentación**:
```typescript
/**
 * Componente principal para Revisión de Precios de Facturación
 *
 * Funcionalidades principales:
 * - Visualización de precios aplicados ENEL vs Enerlova
 * - Validación de permisos de usuario para modificación
 * - Modificación de precios individuales por contrato
 * - Filtros por ciclo de facturación y periodo
 * - Tabs para alternar entre ENEL y Enerlova
 * - Sistema de autorización con clave maestra
 *
 * Flujo de trabajo:
 * 1. Usuario accede al componente
 * 2. Sistema valida permisos del usuario
 * 3. Usuario selecciona ciclo de facturación
 * 4. Sistema carga precios aplicados para el periodo
 * 5. Usuario puede:
 *    - Ver detalles de precios ENEL/Enerlova en tabs
 *    - Modificar precio individual (si tiene permisos)
 *    - Ingresar clave maestra para modificaciones sensibles
 * 6. Sistema actualiza precios vía API
 *
 * Sistema de autorización:
 * - Validación inicial de usuario (/validar-usuario-precio)
 * - Clave maestra requerida para modificar
 * - Diálogo modal para ingreso de clave
 * - Validación de clave antes de permitir edición
 *
 * Arquitectura:
 * - Tabs component con 2 pestañas (ENEL / Enerlova)
 * - DataTables con columnas especializadas:
 *   * TablaValoresEnel: Precios ENEL por contrato
 *   * TablaValoresEnerlova: Precios Enerlova por contrato
 * - Modal DialogModificarPrecio para ediciones
 * - Estados para validación, filtros y datos
 * - API endpoints:
 *   * GET /validar-usuario-precio
 *   * POST /consulta-precio-uno (ENEL)
 *   * POST /consulta-precio-dos (Enerlova)
 *   * PUT /modificar-precio
 *
 * @param {Object} props - Props del componente
 * @param {PeriodoAbierto[]} props.periodoAbierto - Periodo activo
 * @param {Ciclo[]} props.ciclosFacturacion - Ciclos disponibles
 * @param {RevisarPrecioUno[]} props.precioUnoData - Datos iniciales ENEL
 * @param {RevisarPrecioDos[]} props.precioDosData - Datos iniciales Enerlova
 *
 * @example
 * ```tsx
 * // Usado en app/routes/operaciones/revisar-precio.tsx
 * export default function RevisarPrecioRoute({ loaderData }) {
 *   return (
 *     <RevisarPrecioComponent
 *       periodoAbierto={loaderData.periodoAbierto}
 *       ciclosFacturacion={loaderData.ciclos}
 *       precioUnoData={loaderData.precioUno}
 *       precioDosData={loaderData.precioDos}
 *     />
 *   );
 * }
 * ```
 */
```

### tabla-valores-enel
**Archivo**: `app/components/operaciones/revisar-precio/tabla-valores-enel.tsx`
⚠️ *Sin documentación JSDoc*


### tabla-valores-enerlova
**Archivo**: `app/components/operaciones/revisar-precio/tabla-valores-enerlova.tsx`
⚠️ *Sin documentación JSDoc*


### profile-component
**Archivo**: `app/components/profile/profile-component.tsx`
⚠️ *Sin documentación JSDoc*


### reporte-hydrate-fallback
**Archivo**: `app/components/reportes/reporte-hydrate-fallback.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/reportes/consultar-contrato/columns.tsx`
⚠️ *Sin documentación JSDoc*


### consultar-contrato-component
**Archivo**: `app/components/reportes/consultar-contrato/consultar-contrato-component.tsx`
⚠️ *Sin documentación JSDoc*


### columns-facturas
**Archivo**: `app/components/reportes/consultar-contrato/contrato/columns-facturas.tsx`
⚠️ *Sin documentación JSDoc*


### columns-lecturas
**Archivo**: `app/components/reportes/consultar-contrato/contrato/columns-lecturas.tsx`
⚠️ *Sin documentación JSDoc*


### contrato-component
**Archivo**: `app/components/reportes/consultar-contrato/contrato/contrato-component.tsx`
⚠️ *Sin documentación JSDoc*


### facturas-analytics-simple
**Archivo**: `app/components/reportes/consultar-contrato/contrato/facturas-analytics-simple.tsx`
⚠️ *Sin documentación JSDoc*


### informacion-contrato
**Archivo**: `app/components/reportes/consultar-contrato/contrato/informacion-contrato.tsx`
⚠️ *Sin documentación JSDoc*


### lecturas-analytics-simple
**Archivo**: `app/components/reportes/consultar-contrato/contrato/lecturas-analytics-simple.tsx`
⚠️ *Sin documentación JSDoc*


### proyecciones-avanzadas
**Archivo**: `app/components/reportes/consultar-contrato/contrato/proyecciones-avanzadas.tsx`
⚠️ *Sin documentación JSDoc*


### columns
**Archivo**: `app/components/reportes/resumen-facturacion/columns.tsx`
**Documentación**:
```typescript
/**
 * cargoDescripcion: string;
  totalEnergiaPeriodoAnterior: string;
  totalFacturaPeriodoAnterior: string;
  cantidadCargosPeriodoAnterior: string;
  totalEnergiaPeriodoActual: string;
  totalFacturaPeriodoActual: string;
  cantidadCargosPeriodoActual: string;
  diferenciaPeriodos: string;
 */
```

### resumen-facturacion-component
**Archivo**: `app/components/reportes/resumen-facturacion/resumen-facturacion-component.tsx`
⚠️ *Sin documentación JSDoc*


### export-button
**Archivo**: `app/components/shared/export-button.tsx`
⚠️ *Sin documentación JSDoc*


### modern-header-refactor-guide
**Archivo**: `app/components/shared/modern-header-refactor-guide.tsx`
⚠️ *Sin documentación JSDoc*


### modern-header
**Archivo**: `app/components/shared/modern-header.tsx`
⚠️ *Sin documentación JSDoc*


### app-sidebar
**Archivo**: `app/components/sidebar/app-sidebar.tsx`
⚠️ *Sin documentación JSDoc*


### nav-documents
**Archivo**: `app/components/sidebar/nav-documents.tsx`
⚠️ *Sin documentación JSDoc*


### nav-user
**Archivo**: `app/components/sidebar/nav-user.tsx`
⚠️ *Sin documentación JSDoc*


### search-form
**Archivo**: `app/components/sidebar/search-form.tsx`
⚠️ *Sin documentación JSDoc*


### site-header
**Archivo**: `app/components/sidebar/site-header.tsx`
⚠️ *Sin documentación JSDoc*


### accordion
**Archivo**: `app/components/ui/accordion.tsx`
⚠️ *Sin documentación JSDoc*


### alert-dialog
**Archivo**: `app/components/ui/alert-dialog.tsx`
⚠️ *Sin documentación JSDoc*


### alert
**Archivo**: `app/components/ui/alert.tsx`
⚠️ *Sin documentación JSDoc*


### aspect-ratio
**Archivo**: `app/components/ui/aspect-ratio.tsx`
⚠️ *Sin documentación JSDoc*


### avatar
**Archivo**: `app/components/ui/avatar.tsx`
⚠️ *Sin documentación JSDoc*


### badge
**Archivo**: `app/components/ui/badge.tsx`
⚠️ *Sin documentación JSDoc*


### breadcrumb
**Archivo**: `app/components/ui/breadcrumb.tsx`
⚠️ *Sin documentación JSDoc*


### button-group
**Archivo**: `app/components/ui/button-group.tsx`
⚠️ *Sin documentación JSDoc*


### button
**Archivo**: `app/components/ui/button.tsx`
⚠️ *Sin documentación JSDoc*


### calendar
**Archivo**: `app/components/ui/calendar.tsx`
⚠️ *Sin documentación JSDoc*


### card
**Archivo**: `app/components/ui/card.tsx`
⚠️ *Sin documentación JSDoc*


### carousel
**Archivo**: `app/components/ui/carousel.tsx`
⚠️ *Sin documentación JSDoc*


### chart
**Archivo**: `app/components/ui/chart.tsx`
⚠️ *Sin documentación JSDoc*


### checkbox
**Archivo**: `app/components/ui/checkbox.tsx`
⚠️ *Sin documentación JSDoc*


### collapsible
**Archivo**: `app/components/ui/collapsible.tsx`
⚠️ *Sin documentación JSDoc*


### combobox
**Archivo**: `app/components/ui/combobox.tsx`
⚠️ *Sin documentación JSDoc*


### command
**Archivo**: `app/components/ui/command.tsx`
⚠️ *Sin documentación JSDoc*


### context-menu
**Archivo**: `app/components/ui/context-menu.tsx`
⚠️ *Sin documentación JSDoc*


### dialog
**Archivo**: `app/components/ui/dialog.tsx`
⚠️ *Sin documentación JSDoc*


### drawer
**Archivo**: `app/components/ui/drawer.tsx`
⚠️ *Sin documentación JSDoc*


### dropdown-menu
**Archivo**: `app/components/ui/dropdown-menu.tsx`
⚠️ *Sin documentación JSDoc*


### empty
**Archivo**: `app/components/ui/empty.tsx`
⚠️ *Sin documentación JSDoc*


### environment-badge
**Archivo**: `app/components/ui/environment-badge.tsx`
**Documentación**:
```typescript
/**
 * EnvironmentBadge Component
 *
 * Displays a fixed badge indicating the current environment (DEV/PROD)
 * Only visible in development environment
 */
```

### field
**Archivo**: `app/components/ui/field.tsx`
⚠️ *Sin documentación JSDoc*


### form
**Archivo**: `app/components/ui/form.tsx`
⚠️ *Sin documentación JSDoc*


### hover-card
**Archivo**: `app/components/ui/hover-card.tsx`
⚠️ *Sin documentación JSDoc*


### input-group
**Archivo**: `app/components/ui/input-group.tsx`
⚠️ *Sin documentación JSDoc*


### input-otp
**Archivo**: `app/components/ui/input-otp.tsx`
⚠️ *Sin documentación JSDoc*


### input
**Archivo**: `app/components/ui/input.tsx`
⚠️ *Sin documentación JSDoc*


### item
**Archivo**: `app/components/ui/item.tsx`
⚠️ *Sin documentación JSDoc*


### kbd
**Archivo**: `app/components/ui/kbd.tsx`
⚠️ *Sin documentación JSDoc*


### label
**Archivo**: `app/components/ui/label.tsx`
⚠️ *Sin documentación JSDoc*


### menubar
**Archivo**: `app/components/ui/menubar.tsx`
⚠️ *Sin documentación JSDoc*


### navigation-menu
**Archivo**: `app/components/ui/navigation-menu.tsx`
⚠️ *Sin documentación JSDoc*


### pagination
**Archivo**: `app/components/ui/pagination.tsx`
⚠️ *Sin documentación JSDoc*


### password-strength-indicator
**Archivo**: `app/components/ui/password-strength-indicator.tsx`
**Documentación**:
```typescript
/**
 * Componente de indicador de fortaleza de contraseña
 * Muestra visualmente qué tan segura es una contraseña
 */
/**
 * Obtiene el color de texto según el score de fortaleza
 * @param score
 */
```

### popover
**Archivo**: `app/components/ui/popover.tsx`
⚠️ *Sin documentación JSDoc*


### progress
**Archivo**: `app/components/ui/progress.tsx`
⚠️ *Sin documentación JSDoc*


### radio-group
**Archivo**: `app/components/ui/radio-group.tsx`
⚠️ *Sin documentación JSDoc*


### resizable
**Archivo**: `app/components/ui/resizable.tsx`
⚠️ *Sin documentación JSDoc*


### scroll-area
**Archivo**: `app/components/ui/scroll-area.tsx`
⚠️ *Sin documentación JSDoc*


### select
**Archivo**: `app/components/ui/select.tsx`
⚠️ *Sin documentación JSDoc*


### separator
**Archivo**: `app/components/ui/separator.tsx`
⚠️ *Sin documentación JSDoc*


### sheet
**Archivo**: `app/components/ui/sheet.tsx`
⚠️ *Sin documentación JSDoc*


### sidebar
**Archivo**: `app/components/ui/sidebar.tsx`
⚠️ *Sin documentación JSDoc*


### skeleton
**Archivo**: `app/components/ui/skeleton.tsx`
⚠️ *Sin documentación JSDoc*


### slider
**Archivo**: `app/components/ui/slider.tsx`
⚠️ *Sin documentación JSDoc*


### sonner
**Archivo**: `app/components/ui/sonner.tsx`
⚠️ *Sin documentación JSDoc*


### spinner
**Archivo**: `app/components/ui/spinner.tsx`
⚠️ *Sin documentación JSDoc*


### switch
**Archivo**: `app/components/ui/switch.tsx`
⚠️ *Sin documentación JSDoc*


### table
**Archivo**: `app/components/ui/table.tsx`
⚠️ *Sin documentación JSDoc*


### tabs
**Archivo**: `app/components/ui/tabs.tsx`
⚠️ *Sin documentación JSDoc*


### textarea
**Archivo**: `app/components/ui/textarea.tsx`
⚠️ *Sin documentación JSDoc*


### toggle-group
**Archivo**: `app/components/ui/toggle-group.tsx`
⚠️ *Sin documentación JSDoc*


### toggle
**Archivo**: `app/components/ui/toggle.tsx`
⚠️ *Sin documentación JSDoc*


### tooltip
**Archivo**: `app/components/ui/tooltip.tsx`
⚠️ *Sin documentación JSDoc*


