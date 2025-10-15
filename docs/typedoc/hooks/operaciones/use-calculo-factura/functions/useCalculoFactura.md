[**Enerlova Frontend Documentation**](../../../../README.md)

---

[Enerlova Frontend Documentation](../../../../modules.md) / [hooks/operaciones/use-calculo-factura](../README.md) / useCalculoFactura

# Function: useCalculoFactura()

> **useCalculoFactura**(`__namedParameters`): `object`

Defined in: [app/hooks/operaciones/use-calculo-factura.ts:18](https://github.com/lo-valledor/front-respaldo/blob/develop/app/hooks/operaciones/use-calculo-factura.ts#L18)

## Parameters

### \_\_namedParameters

`UseCalculoFacturaProps`

## Returns

`object`

### data

> **data**: [`CalculoPrefacturaCompleto`](../../../../types/operaciones/interfaces/CalculoPrefacturaCompleto.md)[]

### filteredData

> **filteredData**: [`CalculoPrefacturaCompleto`](../../../../types/operaciones/interfaces/CalculoPrefacturaCompleto.md)[]

### isLoading

> **isLoading**: `boolean`

### error

> **error**: `string` \| `null`

### searchTerm

> **searchTerm**: `string`

### setSearchTerm

> **setSearchTerm**: `Dispatch`\<`SetStateAction`\<`string`\>\>

### handleRevisarCalculo()

> **handleRevisarCalculo**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### setData

> **setData**: `Dispatch`\<`SetStateAction`\<[`CalculoPrefacturaCompleto`](../../../../types/operaciones/interfaces/CalculoPrefacturaCompleto.md)[]\>\>
