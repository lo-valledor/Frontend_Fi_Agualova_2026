[**Enerlova Frontend Documentation**](../../../README.md)

***

[Enerlova Frontend Documentation](../../../modules.md) / [services/aiService](../README.md) / LecturaFaltanteResponse

# Interface: LecturaFaltanteResponse

Defined in: [app/services/aiService.ts:79](https://github.com/lo-valledor/front-respaldo/blob/develop/app/services/aiService.ts#L79)

## Properties

### valorPredicho

> **valorPredicho**: `number`

Defined in: [app/services/aiService.ts:80](https://github.com/lo-valledor/front-respaldo/blob/develop/app/services/aiService.ts#L80)

***

### confianza

> **confianza**: `"Alta"` \| `"Media"` \| `"Baja"` \| `"Muy Baja"`

Defined in: [app/services/aiService.ts:81](https://github.com/lo-valledor/front-respaldo/blob/develop/app/services/aiService.ts#L81)

***

### metodoUsado

> **metodoUsado**: `string`

Defined in: [app/services/aiService.ts:82](https://github.com/lo-valledor/front-respaldo/blob/develop/app/services/aiService.ts#L82)

***

### basadoEn

> **basadoEn**: `object`

Defined in: [app/services/aiService.ts:83](https://github.com/lo-valledor/front-respaldo/blob/develop/app/services/aiService.ts#L83)

#### historicoMedidor

> **historicoMedidor**: `number`

#### promedioMedidor?

> `optional` **promedioMedidor**: `number`

#### promedioNicho?

> `optional` **promedioNicho**: `number`

#### pesoHistorico

> **pesoHistorico**: `number`

***

### metadata

> **metadata**: `object`

Defined in: [app/services/aiService.ts:89](https://github.com/lo-valledor/front-respaldo/blob/develop/app/services/aiService.ts#L89)

#### medidorId

> **medidorId**: `number`

#### nichoId

> **nichoId**: `number`

#### periodo

> **periodo**: `string`
