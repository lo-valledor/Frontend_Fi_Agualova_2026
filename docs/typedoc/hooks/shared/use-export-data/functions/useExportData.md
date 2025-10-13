[**Enerlova Frontend Documentation**](../../../../README.md)

***

[Enerlova Frontend Documentation](../../../../modules.md) / [hooks/shared/use-export-data](../README.md) / useExportData

# Function: useExportData()

> **useExportData**\<`T`\>(): `object`

Defined in: [app/hooks/shared/use-export-data.ts:19](https://github.com/lo-valledor/front-respaldo/blob/develop/app/hooks/shared/use-export-data.ts#L19)

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `any`\>

## Returns

`object`

### isExporting

> **isExporting**: `boolean`

### exportData()

> **exportData**: (`data`, `columns`, `options`) => `Promise`\<`void`\>

#### Parameters

##### data

`T`[]

##### columns

[`ExportColumn`](../interfaces/ExportColumn.md)[]

##### options

[`ExportOptions`](../interfaces/ExportOptions.md)

#### Returns

`Promise`\<`void`\>

### formatDateForExport()

> **formatDateForExport**: (`date`) => `string`

#### Parameters

##### date

`string` | `null` | `undefined`

#### Returns

`string`
