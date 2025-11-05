# ⚡ SonarQube Quick Reference

Guía rápida de patrones comunes y sus soluciones.

## 🔄 Patrones de Refactorización

### 1. forEach → for...of

```typescript
// ❌ Evitar
data.forEach(item => {
  console.log(item);
});

// ✅ Preferir
for (const item of data) {
  console.log(item);
}

// Con índice
for (const [index, item] of data.entries()) {
  console.log(index, item);
}
```

### 2. parseInt → Number.parseInt

```typescript
// ❌ Evitar
const num = parseInt(value);
const num2 = parseInt(value, 10);

// ✅ Preferir
const num = Number.parseInt(value);
const num2 = Number.parseInt(value, 10);
```

### 3. Parámetros No Usados

```typescript
// ❌ Evitar
array.map((item, index) => item.name);

// ✅ Preferir - Opción 1: Remover
array.map(item => item.name);

// ✅ Preferir - Opción 2: Usar underscore si es necesario
array.map((item, _index) => item.name);
```

### 4. Reducir Anidamiento

```typescript
// ❌ Evitar (>4 niveles)
function process(data) {
  if (data) {
    if (data.items) {
      data.items.forEach(item => {
        if (item.valid) {
          if (item.value > 0) {
            // mucho anidamiento
          }
        }
      });
    }
  }
}

// ✅ Preferir (early returns + helper)
const isValidItem = item => item?.valid && item?.value > 0;

function process(data) {
  if (!data?.items) return;

  for (const item of data.items) {
    if (!isValidItem(item)) continue;
    // lógica principal
  }
}
```

### 5. Complejidad Cognitiva

```typescript
// ❌ Evitar (alta complejidad)
function complexLogic(user, data, options) {
  if (user && user.isActive) {
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].type === 'special') {
          if (options.processSpecial) {
            // más lógica...
          }
        } else {
          // otra lógica...
        }
      }
    }
  }
}

// ✅ Preferir (baja complejidad)
const isActiveUser = user => user?.isActive;
const hasData = data => data?.length > 0;
const isSpecialType = item => item.type === 'special';

function processSpecialItem(item, options) {
  if (!options.processSpecial) return;
  // lógica específica
}

function processNormalItem(item) {
  // lógica específica
}

function complexLogic(user, data, options) {
  if (!isActiveUser(user) || !hasData(data)) return;

  for (const item of data) {
    if (isSpecialType(item)) {
      processSpecialItem(item, options);
    } else {
      processNormalItem(item);
    }
  }
}
```

## 🎯 React Patterns

### 1. Componentes Grandes

```typescript
// ❌ Evitar (componente de 300+ líneas)
export function LargeComponent() {
  // mucha lógica...
  // muchos estados...
  // muchos efectos...
  return (
    <div>
      {/* mucho JSX */}
    </div>
  );
}

// ✅ Preferir (dividir en sub-componentes)
export function MainComponent() {
  const logic = useMainLogic();

  return (
    <div>
      <Header {...logic.headerProps} />
      <Content {...logic.contentProps} />
      <Footer {...logic.footerProps} />
    </div>
  );
}
```

### 2. Lógica en Custom Hooks

```typescript
// ❌ Evitar (lógica mezclada con UI)
export function Component() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // mucha lógica de fetch...
  }, []);

  const handleAction = () => {
    // mucha lógica...
  };

  return <div>{/* UI */}</div>;
}

// ✅ Preferir (lógica separada)
function useComponentLogic() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // lógica de fetch
  }, []);

  const handleAction = useCallback(() => {
    // lógica
  }, []);

  return { data, loading, handleAction };
}

export function Component() {
  const { data, loading, handleAction } = useComponentLogic();
  return <div>{/* UI limpio */}</div>;
}
```

## 🛠️ Utilidades Comunes

### Helper para Arrays

```typescript
// Helpers reutilizables
export const isEmpty = <T>(arr: T[]): boolean => arr.length === 0;
export const isNotEmpty = <T>(arr: T[]): boolean => arr.length > 0;
export const hasItems = <T>(arr: T[] | undefined | null): boolean =>
  arr !== undefined && arr !== null && arr.length > 0;

// Uso
if (hasItems(data)) {
  for (const item of data) {
    // procesar
  }
}
```

### Helper para Validaciones

```typescript
// Helpers de validación
export const isValidString = (str: unknown): str is string =>
  typeof str === 'string' && str.trim().length > 0;

export const isValidNumber = (num: unknown): num is number =>
  typeof num === 'number' && !Number.Number.isNaN(num);

export const isValidId = (id: unknown): boolean =>
  isValidNumber(id) || isValidString(id);
```

## 📏 Reglas de Oro

1. **Funciones pequeñas**: Max 50 líneas, ideal <30
2. **Un solo propósito**: Cada función hace una cosa
3. **Nombres descriptivos**: `calculateTotal` > `calc`
4. **Early returns**: Validar condiciones primero
5. **Extraer helpers**: Reutilizar lógica común
6. **Tipos explícitos**: Evitar `any` sin justificación
7. **Tests siempre**: Cobertura >80%

## 🚀 Comandos Rápidos

```bash
# Verificar calidad
pnpm run quality:check

# Fix automático
pnpm run lint:fix

# Optimizar para SonarQube
pnpm run sonar:optimize

# Ver cobertura
pnpm run coverage
```

## 📚 Lecturas Recomendadas

- [Clean Code](https://github.com/ryanmcdermott/clean-code-javascript)
- [SonarQube Rules](https://rules.sonarsource.com/typescript/)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

**Pro Tip:** Configura tu editor para mostrar warnings de SonarQube en tiempo real!
