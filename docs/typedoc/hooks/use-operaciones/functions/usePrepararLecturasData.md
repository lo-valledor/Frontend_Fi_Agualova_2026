[**Enerlova Frontend Documentation**](../../../README.md)

***

[Enerlova Frontend Documentation](../../../modules.md) / [hooks/use-operaciones](../README.md) / usePrepararLecturasData

# Function: usePrepararLecturasData()

> **usePrepararLecturasData**(): `object`

Defined in: [app/hooks/use-operaciones.ts:21](https://github.com/lo-valledor/front-respaldo/blob/develop/app/hooks/use-operaciones.ts#L21)

## Returns

`object`

### data

> **data**: \{ `periodoAbierto`: [`PeriodoAbierto`](../../../types/operaciones/interfaces/PeriodoAbierto.md)[]; `lecturasPendientes`: [`ValidarSectoresPendientes`](../../../types/operaciones/interfaces/ValidarSectoresPendientes.md) \| `null`; `sectores`: [`ConsultarSectores`](../../../types/operaciones/interfaces/ConsultarSectores.md)[]; `opcionesPreparar`: [`OpcionesPrepararLecturas`](../../../types/operaciones/interfaces/OpcionesPrepararLecturas.md)[]; \} \| `null`

### loading

> **loading**: `boolean`

### error

> **error**: `string` \| `null`

### refreshData()

> **refreshData**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>
