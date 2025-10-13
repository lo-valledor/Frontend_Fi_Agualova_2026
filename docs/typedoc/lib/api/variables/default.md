[**Enerlova Frontend Documentation**](../../../README.md)

***

[Enerlova Frontend Documentation](../../../modules.md) / [lib/api](../README.md) / default

# Variable: default

> `const` **default**: `object`

Defined in: [app/lib/api.ts:15](https://github.com/lo-valledor/front-respaldo/blob/develop/app/lib/api.ts#L15)

## Type Declaration

### auth

> **auth**: `object`

#### auth.login()

> **login**: (`credentials`) => `Promise`\<`AxiosResponse`\<`ApiResponse`\<\{ `token`: `string`; \}\> \| \{ `token`: `string`; \}, `any`\>\>

##### Parameters

###### credentials

###### usuario

`string`

###### contrasena

`string`

##### Returns

`Promise`\<`AxiosResponse`\<`ApiResponse`\<\{ `token`: `string`; \}\> \| \{ `token`: `string`; \}, `any`\>\>

#### auth.logout()

> **logout**: () => `Promise`\<`AxiosResponse`\<`void` \| `ApiResponse`\<`void`\>, `any`\>\>

##### Returns

`Promise`\<`AxiosResponse`\<`void` \| `ApiResponse`\<`void`\>, `any`\>\>

#### auth.refreshToken()

> **refreshToken**: () => `Promise`\<`AxiosResponse`\<`ApiResponse`\<\{ `token`: `string`; \}\> \| \{ `token`: `string`; \}, `any`\>\>

##### Returns

`Promise`\<`AxiosResponse`\<`ApiResponse`\<\{ `token`: `string`; \}\> \| \{ `token`: `string`; \}, `any`\>\>

### get()

> **get**: \<`T`\>(`url`, `config?`) => `Promise`\<`AxiosResponse`\<`T` \| `ApiResponse`\<`T`\>, `any`\>\>

#### Type Parameters

##### T

`T`

#### Parameters

##### url

`string`

##### config?

`AxiosRequestConfig`\<`any`\>

#### Returns

`Promise`\<`AxiosResponse`\<`T` \| `ApiResponse`\<`T`\>, `any`\>\>

### post()

> **post**: \<`T`\>(`url`, `data?`, `config?`) => `Promise`\<`AxiosResponse`\<`T` \| `ApiResponse`\<`T`\>, `any`\>\>

#### Type Parameters

##### T

`T`

#### Parameters

##### url

`string`

##### data?

`any`

##### config?

`AxiosRequestConfig`\<`any`\>

#### Returns

`Promise`\<`AxiosResponse`\<`T` \| `ApiResponse`\<`T`\>, `any`\>\>

### put()

> **put**: \<`T`\>(`url`, `data?`, `config?`) => `Promise`\<`AxiosResponse`\<`T` \| `ApiResponse`\<`T`\>, `any`\>\>

#### Type Parameters

##### T

`T`

#### Parameters

##### url

`string`

##### data?

`any`

##### config?

`AxiosRequestConfig`\<`any`\>

#### Returns

`Promise`\<`AxiosResponse`\<`T` \| `ApiResponse`\<`T`\>, `any`\>\>

### patch()

> **patch**: \<`T`\>(`url`, `data?`, `config?`) => `Promise`\<`AxiosResponse`\<`T` \| `ApiResponse`\<`T`\>, `any`\>\>

#### Type Parameters

##### T

`T`

#### Parameters

##### url

`string`

##### data?

`any`

##### config?

`AxiosRequestConfig`\<`any`\>

#### Returns

`Promise`\<`AxiosResponse`\<`T` \| `ApiResponse`\<`T`\>, `any`\>\>

### delete()

> **delete**: \<`T`\>(`url`, `config?`) => `Promise`\<`AxiosResponse`\<`T` \| `ApiResponse`\<`T`\>, `any`\>\>

#### Type Parameters

##### T

`T`

#### Parameters

##### url

`string`

##### config?

`AxiosRequestConfig`\<`any`\>

#### Returns

`Promise`\<`AxiosResponse`\<`T` \| `ApiResponse`\<`T`\>, `any`\>\>
