# Changelog

Todos los cambios notables en este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-06-24

### Added
- Nuevos métodos en `administracionService`:
  - `createAcometida` / `updateAcometida`
  - `modificarContratante`
  - `getMedidorSubempalmes` / `modificarSubempalme`
  - `getCargosTiposContrato`
- Nuevos métodos en `mantencionService`:
  - `createZona` / `updateZona`
  - `deleteClave` / `deleteConcepto` / `deleteParametro` / `deleteTarifa` / `deleteTipoContrato`
- Nuevo helper `extractApiErrorMessage` en `app/utils/administracion/api-error.ts`
  que centraliza la extracción de mensajes de error de Axios con early returns.

### Changed
- **Refactor a servicios**: se eliminaron todas las llamadas directas a `api` en los componentes
  de `app/components/administracion/` y `app/components/mantencion/`. Ahora consumen
  `administracionService` y `mantencionService`.
- **Patrón Props/FormValues**: los modales de creación usan el tipo `*Props` (sin `id`),
  y los de edición usan `*FormValues` (con `id`), según contrato de la API.
- Modal de **Acometida**: el `Límite de Potencia` se envía a la API en formato `123,4`
  (coma decimal). El input acepta coma y muestra el formato esperado.
- Modal de **Acometida**: en modo edición se envía `AcometidaFormValues` con `idAcometida` separado;
  el campo `codigo` ya no se sobreescribe con el id numérico.
- Modal de **Acometida**: la tabla se refetchea automáticamente tras crear/editar
  (además del `revalidator`).
- Modal de **Marcas**: el id ahora es sigla alfabética en mayúsculas (ej. "AGRE"),
  con botón "Generar sigla" que deriva del nombre. Validación contra duplicados.
- Modal de **Claves**: validación de código duplicado con mensaje
  "Este código ya está registrado en el sistema".
- Modal de **Condiciones Contrato**: `tipoCondicion` ahora es `number` (1=porcentual, 0=fijo)
  consistente con el tipo y con `detalles-condiciones-contrato`.
- **Duplicación eliminada**: 5 helpers de extracción de error
  (`extractClienteErrorMessage`, `extractContratoErrorMessage`, etc.) ahora delegan
  en `extractApiErrorMessage`.
- **Componentes**: handlers con `useCallback` consistente, `useEffect` con deps
  completas, `onSubmit` sin doble cierre (padre cierra vía `onSuccess`).

### Removed
- `app/hooks/administracion/REFACTORING_SUMMARY.md` (documentación histórica).

### Fixed
- `condiciones-contrato-component.tsx`: tipo de `onView` corregido de `CondicionContrato`
  a `CondicionesContratoRow` (mismatch con `columns.tsx`).
- `ciclos-facturacion-modal-form.tsx`: schema zod usa los nombres del tipo
  (`idConcepto`, `tipoCondicion`, etc.) en lugar de nombres UI-only.
- `concepto-form-modal.tsx`: campos `conceptoAsociado` consistente entre form
  y payload.

## [1.0.0] - 2026-01-XX

### Added
- Versión inicial del sistema.
