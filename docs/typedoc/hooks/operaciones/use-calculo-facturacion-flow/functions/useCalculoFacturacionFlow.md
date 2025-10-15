[**Enerlova Frontend Documentation**](../../../../README.md)

---

[Enerlova Frontend Documentation](../../../../modules.md) / [hooks/operaciones/use-calculo-facturacion-flow](../README.md) / useCalculoFacturacionFlow

# Function: useCalculoFacturacionFlow()

> **useCalculoFacturacionFlow**(`__namedParameters`): `object`

Defined in: [app/hooks/operaciones/use-calculo-facturacion-flow.ts:27](https://github.com/lo-valledor/front-respaldo/blob/develop/app/hooks/operaciones/use-calculo-facturacion-flow.ts#L27)

## Parameters

### \_\_namedParameters

`UseCalculoFacturacionFlowProps`

## Returns

`object`

### currentStep

> **currentStep**: `number`

### isRunning

> **isRunning**: `boolean`

### procesoId

> **procesoId**: `string` \| `null`

### flowSteps

> **flowSteps**: [`FlowStep`](../interfaces/FlowStep.md)[]

### debugMode

> **debugMode**: `boolean`

### setDebugMode

> **setDebugMode**: `Dispatch`\<`SetStateAction`\<`boolean`\>\>

### encabezadoData

> **encabezadoData**: [`CalculoPrefacturaDetalle`](../../../../types/operaciones/interfaces/CalculoPrefacturaDetalle.md)[]

### datosCompletos

> **datosCompletos**: [`CalculoPrefacturaCompleto`](../../../../types/operaciones/interfaces/CalculoPrefacturaCompleto.md)[]

### ejecutarFlujoCompleto()

> **ejecutarFlujoCompleto**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### limpiarFlujo()

> **limpiarFlujo**: () => `void`

#### Returns

`void`

### ejecutarPaso1()

> **ejecutarPaso1**: () => `Promise`\<`boolean`\>

#### Returns

`Promise`\<`boolean`\>

### ejecutarPaso2()

> **ejecutarPaso2**: () => `Promise`\<`boolean`\>

#### Returns

`Promise`\<`boolean`\>

### ejecutarPaso3()

> **ejecutarPaso3**: () => `Promise`\<`boolean`\>

#### Returns

`Promise`\<`boolean`\>

### ejecutarPaso4()

> **ejecutarPaso4**: () => `Promise`\<`boolean`\>

#### Returns

`Promise`\<`boolean`\>

### ejecutarPaso5()

> **ejecutarPaso5**: () => `Promise`\<`boolean`\>

#### Returns

`Promise`\<`boolean`\>
