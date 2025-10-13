[**Enerlova Frontend Documentation**](../../../../README.md)

***

[Enerlova Frontend Documentation](../../../../modules.md) / [hooks/administracion/use-acometida-filters](../README.md) / useAcometidaFilters

# Function: useAcometidaFilters()

> **useAcometidaFilters**(`acometidas`, `filters`): `object`

Defined in: [app/hooks/administracion/use-acometida-filters.ts:12](https://github.com/lo-valledor/front-respaldo/blob/develop/app/hooks/administracion/use-acometida-filters.ts#L12)

## Parameters

### acometidas

[`Acometida`](../../../../types/administracion/interfaces/Acometida.md)[]

### filters

[`AcometidaFilters`](../../../../components/administracion/acometida/acometida-filters/interfaces/AcometidaFilters.md)

## Returns

`object`

### filteredAcometidas

> **filteredAcometidas**: [`Acometida`](../../../../types/administracion/interfaces/Acometida.md)[]

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
