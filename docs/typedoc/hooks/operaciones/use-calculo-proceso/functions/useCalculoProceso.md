[**Enerlova Frontend Documentation**](../../../../README.md)

---

[Enerlova Frontend Documentation](../../../../modules.md) / [hooks/operaciones/use-calculo-proceso](../README.md) / useCalculoProceso

# Function: useCalculoProceso()

> **useCalculoProceso**(`__namedParameters`): `object`

Defined in: [app/hooks/operaciones/use-calculo-proceso.ts:13](https://github.com/lo-valledor/front-respaldo/blob/develop/app/hooks/operaciones/use-calculo-proceso.ts#L13)

## Parameters

### \_\_namedParameters

`UseCalculoProcesoProps`

## Returns

`object`

### isLaunching

> **isLaunching**: `boolean`

### isAccepting

> **isAccepting**: `boolean`

### selectedContratos

> **selectedContratos**: `number`[]

### setSelectedContratos

> **setSelectedContratos**: `Dispatch`\<`SetStateAction`\<`number`[]\>\>

### isCalculoPreparado

> **isCalculoPreparado**: `boolean`

### handleLanzarCalculo()

> **handleLanzarCalculo**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### handleAceptarCalculo()

> **handleAceptarCalculo**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### setIsCalculoPreparado

> **setIsCalculoPreparado**: `Dispatch`\<`SetStateAction`\<`boolean`\>\>
