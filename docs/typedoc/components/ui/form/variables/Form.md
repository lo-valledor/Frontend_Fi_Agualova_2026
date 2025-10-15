[**Enerlova Frontend Documentation**](../../../../README.md)

---

[Enerlova Frontend Documentation](../../../../modules.md) / [components/ui/form](../README.md) / Form

# Variable: Form()

> `const` **Form**: \<`TFieldValues`, `TContext`, `TTransformedValues`\>(`props`) => `Element` = `FormProvider`

Defined in: [app/components/ui/form.tsx:19](https://github.com/lo-valledor/front-respaldo/blob/develop/app/components/ui/form.tsx#L19)

A provider component that propagates the `useForm` methods to all children components via [React Context](https://reactjs.org/docs/context.html) API. To be used with useFormContext.

## Type Parameters

### TFieldValues

`TFieldValues` _extends_ `FieldValues`

### TContext

`TContext` = `any`

### TTransformedValues

`TTransformedValues` = `TFieldValues`

## Parameters

### props

`FormProviderProps`\<`TFieldValues`, `TContext`, `TTransformedValues`\>

all useForm methods

## Returns

`Element`

## Remarks

[API](https://react-hook-form.com/docs/useformcontext) • [Demo](https://codesandbox.io/s/react-hook-form-v7-form-context-ytudi)

## Example

```tsx
function App() {
  const methods = useForm();
  const onSubmit = data => console.log(data);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <NestedInput />
        <input type="submit" />
      </form>
    </FormProvider>
  );
}

function NestedInput() {
  const { register } = useFormContext(); // retrieve all hook methods
  return <input {...register('test')} />;
}
```
