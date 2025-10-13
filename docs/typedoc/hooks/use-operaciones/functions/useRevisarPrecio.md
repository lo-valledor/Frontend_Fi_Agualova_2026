[**Enerlova Frontend Documentation**](../../../README.md)

***

[Enerlova Frontend Documentation](../../../modules.md) / [hooks/use-operaciones](../README.md) / useRevisarPrecio

# Function: useRevisarPrecio()

> **useRevisarPrecio**(`dia`): `object`

Defined in: [app/hooks/use-operaciones.ts:171](https://github.com/lo-valledor/front-respaldo/blob/develop/app/hooks/use-operaciones.ts#L171)

## Parameters

### dia

`string` = `'15'`

## Returns

`object`

### data

> **data**: \{ `dataPeriodoAbierto`: [`PeriodoAbierto`](../../../types/operaciones/interfaces/PeriodoAbierto.md)[]; `dataConsultarPreciosUno`: [`RevisarPrecioUno`](../../../types/operaciones/interfaces/RevisarPrecioUno.md)[]; `dataConsultarPreciosDos`: [`RevisarPrecioDos`](../../../types/operaciones/interfaces/RevisarPrecioDos.md)[]; `ciclosFacturacion`: `object`[]; \} \| `null`

### loading

> **loading**: `boolean`

### error

> **error**: `string` \| `null`

### refreshPrecios()

> **refreshPrecios**: (`nuevoCiclo?`) => `Promise`\<`void`\>

#### Parameters

##### nuevoCiclo?

`string`

#### Returns

`Promise`\<`void`\>
