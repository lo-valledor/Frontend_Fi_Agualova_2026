[**Enerlova Frontend Documentation**](../../../../README.md)

***

[Enerlova Frontend Documentation](../../../../modules.md) / [hooks/administracion/use-export-contratos](../README.md) / useExportContratos

# Function: useExportContratos()

> **useExportContratos**(): `object`

Defined in: [app/hooks/administracion/use-export-contratos.ts:13](https://github.com/lo-valledor/front-respaldo/blob/develop/app/hooks/administracion/use-export-contratos.ts#L13)

## Returns

`object`

### isExporting

> **isExporting**: `boolean`

### exportAllContratos()

> **exportAllContratos**: (`allData`, `format`) => `Promise`\<`void`\>

#### Parameters

##### allData

[`GetContratos`](../../../../types/administracion/interfaces/GetContratos.md)[]

##### format

`"csv"` | `"xlsx"`

#### Returns

`Promise`\<`void`\>

### exportFilteredContratos()

> **exportFilteredContratos**: (`filteredData`, `format`) => `Promise`\<`void`\>

#### Parameters

##### filteredData

[`GetContratos`](../../../../types/administracion/interfaces/GetContratos.md)[]

##### format

`"csv"` | `"xlsx"`

#### Returns

`Promise`\<`void`\>

### exportData()

> **exportData**: (`data`, `options`, `isFiltered`) => `Promise`\<`void`\>

#### Parameters

##### data

[`GetContratos`](../../../../types/administracion/interfaces/GetContratos.md)[]

##### options

`ExportOptions`

##### isFiltered

`boolean` = `false`

#### Returns

`Promise`\<`void`\>
