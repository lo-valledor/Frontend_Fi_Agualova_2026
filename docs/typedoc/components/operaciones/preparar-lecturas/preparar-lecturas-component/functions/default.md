[**Enerlova Frontend Documentation**](../../../../../README.md)

---

[Enerlova Frontend Documentation](../../../../../modules.md) / [components/operaciones/preparar-lecturas/preparar-lecturas-component](../README.md) / default

# Function: default()

> **default**(`__namedParameters`): `Element`

Defined in: [app/components/operaciones/preparar-lecturas/preparar-lecturas-component.tsx:45](https://github.com/lo-valledor/front-respaldo/blob/develop/app/components/operaciones/preparar-lecturas/preparar-lecturas-component.tsx#L45)

## Parameters

### \_\_namedParameters

#### periodoAbierto

[`PeriodoAbierto`](../../../../../types/operaciones/interfaces/PeriodoAbierto.md)[]

#### lecturasPendientes

[`ValidarSectoresPendientes`](../../../../../types/operaciones/interfaces/ValidarSectoresPendientes.md) \| `null`

#### sectores

[`ConsultarSectores`](../../../../../types/operaciones/interfaces/ConsultarSectores.md)[]

#### opcionesPreparar

[`OpcionesPrepararLecturas`](../../../../../types/operaciones/interfaces/OpcionesPrepararLecturas.md)[]

#### asignacionSectores

[`ConsultarAsignacionSectores`](../../../../../types/operaciones/interfaces/ConsultarAsignacionSectores.md)[]

#### setAsignacionSectores

`Dispatch`\<`SetStateAction`\<[`ConsultarAsignacionSectores`](../../../../../types/operaciones/interfaces/ConsultarAsignacionSectores.md)[]\>\>

#### isLoadingAsignacion

`boolean`

#### onRecargarAsignacionSectores

(`cicloFacturable`, `periodo`) => `Promise`\<`void`\>

## Returns

`Element`
