[**Enerlova Frontend Documentation**](../../../../README.md)

***

[Enerlova Frontend Documentation](../../../../modules.md) / [hooks/administracion/use-export-acometidas](../README.md) / useExportAcometidas

# Function: useExportAcometidas()

> **useExportAcometidas**(): `object`

Defined in: [app/hooks/administracion/use-export-acometidas.ts:5](https://github.com/lo-valledor/front-respaldo/blob/develop/app/hooks/administracion/use-export-acometidas.ts#L5)

## Returns

`object`

### isExporting

> **isExporting**: `boolean`

### exportAcometidas()

> **exportAcometidas**: (`data`, `format`, `filename`) => `Promise`\<`void`\>

#### Parameters

##### data

[`Acometida`](../../../../types/administracion/interfaces/Acometida.md)[]

##### format

`"csv"` | `"xlsx"`

##### filename

`string` = `'acometidas'`

#### Returns

`Promise`\<`void`\>

### acometidaColumns

> **acometidaColumns**: [`ExportColumn`](../../../shared/use-export-data/interfaces/ExportColumn.md)[]
