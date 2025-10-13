[**Enerlova Frontend Documentation**](../../../../README.md)

***

[Enerlova Frontend Documentation](../../../../modules.md) / [hooks/administracion/use-client-filters](../README.md) / useClientFilters

# Function: useClientFilters()

> **useClientFilters**(`clients`, `filters`): `object`

Defined in: [app/hooks/administracion/use-client-filters.ts:20](https://github.com/lo-valledor/front-respaldo/blob/develop/app/hooks/administracion/use-client-filters.ts#L20)

## Parameters

### clients

[`GetClientes`](../../../../types/administracion/interfaces/GetClientes.md)[]

### filters

[`ClientFilters`](../interfaces/ClientFilters.md)

## Returns

`object`

### filteredClients

> **filteredClients**: [`GetClientes`](../../../../types/administracion/interfaces/GetClientes.md)[]

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
