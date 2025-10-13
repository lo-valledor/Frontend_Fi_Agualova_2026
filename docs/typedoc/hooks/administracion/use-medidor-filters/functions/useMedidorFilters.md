[**Enerlova Frontend Documentation**](../../../../README.md)

***

[Enerlova Frontend Documentation](../../../../modules.md) / [hooks/administracion/use-medidor-filters](../README.md) / useMedidorFilters

# Function: useMedidorFilters()

> **useMedidorFilters**(`medidores`, `filters`): `object`

Defined in: [app/hooks/administracion/use-medidor-filters.ts:13](https://github.com/lo-valledor/front-respaldo/blob/develop/app/hooks/administracion/use-medidor-filters.ts#L13)

## Parameters

### medidores

[`GetMedidores`](../../../../types/administracion/interfaces/GetMedidores.md)[]

### filters

[`MedidorFilters`](../../../../components/administracion/medidores/medidor-filters/interfaces/MedidorFilters.md)

## Returns

`object`

### filteredMedidores

> **filteredMedidores**: [`GetMedidores`](../../../../types/administracion/interfaces/GetMedidores.md)[]

### filterStats

> **filterStats**: `object`

#### filterStats.total

> **total**: `number`

#### filterStats.filtered

> **filtered**: `number`

#### filterStats.activeFilters

> **activeFilters**: `number`

#### filterStats.isFiltered

> **isFiltered**: `boolean`

### filterOptions

> **filterOptions**: [`FilterOptions`](../interfaces/FilterOptions.md)
