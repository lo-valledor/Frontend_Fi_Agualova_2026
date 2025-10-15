[**Enerlova Frontend Documentation**](../../../README.md)

---

[Enerlova Frontend Documentation](../../../modules.md) / [services/administracionService](../README.md) / AdministracionServiceResponse

# Interface: AdministracionServiceResponse\<T\>

Defined in: [app/services/administracionService.ts:42](https://github.com/lo-valledor/front-respaldo/blob/develop/app/services/administracionService.ts#L42)

Interfaz estándar para respuestas del servicio de administración
Encapsula el resultado exitoso o error de operaciones

## Type Parameters

### T

`T`

Tipo de datos que retorna la operación exitosa

## Properties

### data

> **data**: `T` \| `null`

Defined in: [app/services/administracionService.ts:44](https://github.com/lo-valledor/front-respaldo/blob/develop/app/services/administracionService.ts#L44)

Datos devueltos en caso de éxito, null si hay error

---

### error

> **error**: `string` \| `null`

Defined in: [app/services/administracionService.ts:46](https://github.com/lo-valledor/front-respaldo/blob/develop/app/services/administracionService.ts#L46)

Mensaje de error si falla la operación, null si es exitosa
