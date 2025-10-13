[**Enerlova Frontend Documentation**](../../../README.md)

***

[Enerlova Frontend Documentation](../../../modules.md) / [hooks/use-administracion](../README.md) / useAdministracion

# Function: useAdministracion()

> **useAdministracion**(): `object`

Defined in: [app/hooks/use-administracion.ts:383](https://github.com/lo-valledor/front-respaldo/blob/develop/app/hooks/use-administracion.ts#L383)

## Returns

`object`

### createUsuario()

> **createUsuario**: (`userData`) => `Promise`\<`unknown`\>

#### Parameters

##### userData

`any`

#### Returns

`Promise`\<`unknown`\>

### updateUsuario()

> **updateUsuario**: (`idUsuario`, `userData`) => `Promise`\<`unknown`\>

#### Parameters

##### idUsuario

`number`

##### userData

`any`

#### Returns

`Promise`\<`unknown`\>

### deleteUsuario()

> **deleteUsuario**: (`idUsuario`) => `Promise`\<`unknown`\>

#### Parameters

##### idUsuario

`number`

#### Returns

`Promise`\<`unknown`\>

### fetchUsuarios()

> **fetchUsuarios**: () => `Promise`\<`unknown`\>

#### Returns

`Promise`\<`unknown`\>

### loadingState

> **loadingState**: `object`

#### loadingState.createUsuario

> **createUsuario**: `object`

#### loadingState.createUsuario.isLoading

> **isLoading**: `boolean` = `false`

#### loadingState.updateUsuario

> **updateUsuario**: `object`

#### loadingState.updateUsuario.isLoading

> **isLoading**: `boolean` = `false`

#### loadingState.deleteUsuario

> **deleteUsuario**: `object`

#### loadingState.deleteUsuario.isLoading

> **isLoading**: `boolean` = `false`

#### loadingState.fetchUsuarios

> **fetchUsuarios**: `object`

#### loadingState.fetchUsuarios.isLoading

> **isLoading**: `boolean` = `false`
