[**Enerlova Frontend Documentation**](../../../README.md)

---

[Enerlova Frontend Documentation](../../../modules.md) / [services/mantencionService](../README.md) / MantencionServiceResponse

# Interface: MantencionServiceResponse\<T\>

Defined in: [app/services/mantencionService.ts:25](https://github.com/lo-valledor/front-respaldo/blob/develop/app/services/mantencionService.ts#L25)

Interfaz estándar para respuestas del servicio de mantención
Encapsula el resultado exitoso o error de operaciones

## Type Parameters

### T

`T`

Tipo de datos que retorna la operación exitosa

## Properties

### data

> **data**: `T` \| `null`

Defined in: [app/services/mantencionService.ts:27](https://github.com/lo-valledor/front-respaldo/blob/develop/app/services/mantencionService.ts#L27)

Datos devueltos en caso de éxito, null si hay error

---

### error

> **error**: `string` \| `null`

Defined in: [app/services/mantencionService.ts:29](https://github.com/lo-valledor/front-respaldo/blob/develop/app/services/mantencionService.ts#L29)

Mensaje de error si falla la operación, null si es exitosa
