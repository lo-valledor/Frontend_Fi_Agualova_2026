[**Enerlova Frontend Documentation**](../../../../README.md)

***

[Enerlova Frontend Documentation](../../../../modules.md) / [hooks/administracion/use-export-medidores](../README.md) / useExportMedidores

# Function: useExportMedidores()

> **useExportMedidores**(): `object`

Defined in: [app/hooks/administracion/use-export-medidores.ts:5](https://github.com/lo-valledor/front-respaldo/blob/develop/app/hooks/administracion/use-export-medidores.ts#L5)

## Returns

`object`

### isExporting

> **isExporting**: `boolean`

### exportMedidores()

> **exportMedidores**: (`data`, `format`, `filename`) => `Promise`\<`void`\>

#### Parameters

##### data

[`GetMedidores`](../../../../types/administracion/interfaces/GetMedidores.md)[]

##### format

`"csv"` | `"xlsx"`

##### filename

`string` = `'medidores'`

#### Returns

`Promise`\<`void`\>

### medidorColumns

> **medidorColumns**: [`ExportColumn`](../../../shared/use-export-data/interfaces/ExportColumn.md)[]
