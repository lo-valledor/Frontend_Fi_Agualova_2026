[**Enerlova Frontend Documentation**](../../../../README.md)

---

[Enerlova Frontend Documentation](../../../../modules.md) / [hooks/administracion/use-export-contratos-new](../README.md) / useExportContratos

# Function: useExportContratos()

> **useExportContratos**(): `object`

Defined in: [app/hooks/administracion/use-export-contratos-new.ts:5](https://github.com/lo-valledor/front-respaldo/blob/develop/app/hooks/administracion/use-export-contratos-new.ts#L5)

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

### contractColumns

> **contractColumns**: [`ExportColumn`](../../../shared/use-export-data/interfaces/ExportColumn.md)[]
