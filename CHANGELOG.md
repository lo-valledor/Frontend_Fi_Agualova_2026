# Changelog

Todos los cambios notables del proyecto ENERLOVA RES se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [1.0.0] - 2026-03-04

### Added

- Regla de Cursor (`.cursor/rules/release-protocol.mdc`) con protocolo de release: changelog, versionado, verificación, commit y push a test.

### Fixed

- Test "debería manejar período vacío correctamente" en Revisar Cálculo de Factura: uso de `data-testid='sin-periodo-abierto'` y aserción de texto "Sin periodo abierto" para evitar fallos en CI.

### Changed

- Mejoras en componentes de administración (acometida, cargo facturable, clientes, contratos, medidores, propietarios, usuarios, etc.).
- Mejoras en componentes de mantención (ciclos, claves, conceptos, empalmes, marcas, nichos, parámetros, sector, tarifas, tipos contratos, zonas).
- Mejoras en data-table y virtual-data-table.
- Mejoras en reportes (consultar contrato, resumen facturación) y en importar lecturas.
