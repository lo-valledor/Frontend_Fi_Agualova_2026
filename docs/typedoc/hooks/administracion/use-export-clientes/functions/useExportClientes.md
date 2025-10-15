[**Enerlova Frontend Documentation**](../../../../README.md)

---

[Enerlova Frontend Documentation](../../../../modules.md) / [hooks/administracion/use-export-clientes](../README.md) / useExportClientes

# Function: useExportClientes()

> **useExportClientes**(): `object`

Defined in: [app/hooks/administracion/use-export-clientes.ts:5](https://github.com/lo-valledor/front-respaldo/blob/develop/app/hooks/administracion/use-export-clientes.ts#L5)

## Returns

`object`

### isExporting

> **isExporting**: `boolean`

### exportClientes()

> **exportClientes**: (`data`, `format`, `filename`) => `Promise`\<`void`\>

#### Parameters

##### data

[`GetClientes`](../../../../types/administracion/interfaces/GetClientes.md)[]

##### format

`"csv"` | `"xlsx"`

##### filename

`string` = `'clientes'`

#### Returns

`Promise`\<`void`\>

### clientColumns

> **clientColumns**: [`ExportColumn`](../../../shared/use-export-data/interfaces/ExportColumn.md)[]
