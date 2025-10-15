[**Enerlova Frontend Documentation**](../../../../README.md)

---

[Enerlova Frontend Documentation](../../../../modules.md) / [hooks/administracion/use-contract-filters](../README.md) / useContractFilters

# Function: useContractFilters()

> **useContractFilters**(`contracts`, `filters`): `object`

Defined in: [app/hooks/administracion/use-contract-filters.ts:13](https://github.com/lo-valledor/front-respaldo/blob/develop/app/hooks/administracion/use-contract-filters.ts#L13)

## Parameters

### contracts

[`GetContratos`](../../../../types/administracion/interfaces/GetContratos.md)[]

### filters

[`ContractFilters`](../../../../components/administracion/contratos/contract-filters/interfaces/ContractFilters.md)

## Returns

`object`

### filteredContracts

> **filteredContracts**: [`GetContratos`](../../../../types/administracion/interfaces/GetContratos.md)[]

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
