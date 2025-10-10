# Cambios en Editar Contrato Component

## Resumen
Se removió la obligatoriedad del campo "Local" en el formulario de edición de contratos.

## Cambios Realizados

### 1. Campo de Formulario
- **Archivo**: `app/components/administracion/contratos/route/editar-contrato-component.tsx`
- **Cambio**: Removido el asterisco (*) del label "Local"
- **Antes**: `<Label htmlFor='local'>Local *</Label>`
- **Después**: `<Label htmlFor='local'>Local</Label>`

### 2. Atributo Required
- **Cambio**: Removido el atributo `required` del input del local
- **Antes**: `<Input ... required readOnly />`
- **Después**: `<Input ... readOnly />`

### 3. Validación de Submit
- **Cambio**: Removida la validación que impedía enviar el formulario sin local
- **Removido**:
  ```typescript
  if (!formData.local) {
    toast.error('El local es obligatorio');
    return;
  }
  ```

### 4. Datos de Envío
- **Cambio**: Agregados valores por defecto para campos opcionales
- **Antes**: `localId: formData.local`
- **Después**: `localId: formData.local || ''`
- **Antes**: `lugar: formData.local`
- **Después**: `lugar: formData.local || ''`

## Impacto
- Los usuarios ahora pueden crear/editar contratos sin especificar un local
- El formulario seguirá funcionando normalmente enviando string vacío cuando no se seleccione local
- La interfaz de usuario refleja claramente que el campo es opcional (sin asterisco)
- Se mantiene la funcionalidad de selección de local a través del modal

## Validación
- ✅ TypeScript compilation successful
- ✅ ESLint passed without errors on modified file
- ✅ No breaking changes introduced