# 🧪 Testing Guide - Enerlova Frontend

Este documento describe la estrategia de testing implementada en el proyecto.

## 📋 Tabla de Contenidos

- [Stack de Testing](#stack-de-testing)
- [Estructura de Tests](#estructura-de-tests)
- [Scripts Disponibles](#scripts-disponibles)
- [Escribir Tests](#escribir-tests)
- [Coverage](#coverage)
- [CI/CD Integration](#cicd-integration)

---

## Stack de Testing

### Frameworks y Herramientas

- **Vitest 3.2** - Test runner (compatible con Vite)
- **@testing-library/react 16.3** - Testing de componentes React
- **@testing-library/user-event 14.6** - Simulación de interacciones de usuario
- **@testing-library/jest-dom 6.9** - Matchers adicionales para DOM
- **jsdom 27** - Entorno DOM para tests
- **MSW 2.11** - Mock Service Worker para APIs
- **@vitest/ui** - UI interactiva para tests
- **@vitest/coverage-v8** - Reportes de cobertura

### Configuración

- **vitest.config.ts** - Configuración principal de Vitest
- **test/setup.ts** - Setup global para tests (mocks, matchers, etc.)

---

## Estructura de Tests

Los tests están organizados junto a los archivos que testean:

```
app/
├── utils/
│   ├── rut-utils.ts
│   ├── rut-utils.test.ts          ✅ 24 tests
│   ├── date-formatter.ts
│   ├── date-formatter.test.ts     ✅ 11 tests
│   ├── auth-utils.ts
│   └── auth-utils.test.ts         ✅ 3 tests
├── hooks/
│   ├── use-mobile.ts
│   └── use-mobile.test.ts         ✅ 4 tests
├── services/
│   └── [pendiente]
└── components/
    └── [pendiente]
```

### Tests Implementados

#### ✅ Utils (38 tests)
- **rut-utils.test.ts** - Validación y formateo de RUT chileno
  - cleanRut, formatRut, isValidRutFormat
  - calculateRutVerifier, isValidRut
  - formatRutWithDots, edge cases

- **date-formatter.test.ts** - Formateo de fechas
  - formatToDate (DD-MM-YYYY)
  - formatToTime (HH:mm:ss)
  - formatToYYYYMMDD

- **auth-utils.test.ts** - Utilidades de autenticación
  - getAuthenticatedUser
  - Validación de tokens
  - Limpieza de localStorage

#### ✅ Hooks (4 tests)
- **use-mobile.test.ts** - Hook de detección de dispositivos móviles
  - Breakpoint de 768px
  - Responsive behavior

---

## Scripts Disponibles

### Ejecutar Tests

```bash
# Modo watch (recomendado para desarrollo)
pnpm test

# Ejecutar una vez
pnpm test:run

# UI interactiva
pnpm test:ui

# Watch mode explícito
pnpm test:watch
```

### Coverage

```bash
# Generar reporte de cobertura
pnpm test:coverage

# O usar el alias
pnpm coverage
```

Los reportes se generan en:
- `coverage/` - Reportes HTML, JSON, LCOV
- Terminal - Resumen de cobertura

### CI/CD

```bash
# Script usado en CI (incluye tests)
pnpm ci
```

---

## Escribir Tests

### Estructura Básica

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './my-module';

describe('myFunction', () => {
  it('debe hacer algo específico', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Testing de Utils

```typescript
// app/utils/my-util.test.ts
import { describe, it, expect } from 'vitest';
import { myUtil } from './my-util';

describe('myUtil', () => {
  it('debe manejar casos normales', () => {
    expect(myUtil('test')).toBe('TEST');
  });

  it('debe manejar edge cases', () => {
    expect(myUtil('')).toBe('');
    expect(myUtil(null)).toBe('-');
  });
});
```

### Testing de Hooks

```typescript
// app/hooks/use-my-hook.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from './use-my-hook';

describe('useMyHook', () => {
  it('debe retornar valor inicial', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current).toBe(initialValue);
  });

  it('debe actualizar cuando cambia', () => {
    const { result } = renderHook(() => useMyHook());
    
    act(() => {
      result.current.update('new value');
    });

    expect(result.current.value).toBe('new value');
  });
});
```

### Testing de Componentes

```typescript
// app/components/MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('debe renderizar correctamente', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('debe manejar clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(<MyComponent onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

### Testing de Servicios con MSW

```typescript
// app/services/my-service.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { myService } from './my-service';

const server = setupServer(
  http.get('/api/data', () => {
    return HttpResponse.json({ data: 'test' });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('myService', () => {
  it('debe obtener datos de la API', async () => {
    const result = await myService.getData();
    expect(result.data).toBe('test');
  });

  it('debe manejar errores', async () => {
    server.use(
      http.get('/api/data', () => {
        return HttpResponse.error();
      })
    );

    await expect(myService.getData()).rejects.toThrow();
  });
});
```

---

## Coverage

### Configuración de Coverage

El coverage está configurado en `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  exclude: [
    'node_modules/',
    'build/',
    '.react-router/',
    '**/*.d.ts',
    '**/*.config.*',
    '**/mockData',
    'test/',
    '**/*.test.{ts,tsx}',
    '**/*.spec.{ts,tsx}'
  ]
}
```

### Objetivos de Coverage

| Tipo | Objetivo | Actual |
|------|----------|--------|
| Statements | 80% | En progreso |
| Branches | 75% | En progreso |
| Functions | 80% | En progreso |
| Lines | 80% | En progreso |

### Ver Reportes

```bash
# Generar y abrir reporte HTML
pnpm test:coverage
# Abrir coverage/index.html en el navegador
```

---

## CI/CD Integration

### GitHub Actions

Los tests se ejecutan automáticamente en:

1. **Pull Requests** - Todos los tests deben pasar
2. **Push a main/develop** - Tests + Deploy
3. **Workflow manual** - Ejecución bajo demanda

### Workflow CI/CD

```yaml
# .github/workflows/ci-cd.yml
- name: 🧪 Run tests
  run: pnpm run test:run

- name: 📊 Upload coverage
  uses: codecov/codecov-action@v4
  with:
    files: ./coverage/lcov.info
```

### Requisitos para Merge

- ✅ Todos los tests deben pasar
- ✅ Type checking sin errores
- ✅ Linting sin errores
- ✅ Build exitoso

---

## Mejores Prácticas

### 1. Nombrar Tests Descriptivamente

```typescript
// ❌ Malo
it('test 1', () => {});

// ✅ Bueno
it('debe retornar error cuando el RUT es inválido', () => {});
```

### 2. Arrange-Act-Assert (AAA)

```typescript
it('debe formatear fecha correctamente', () => {
  // Arrange
  const input = '2024-01-15T10:30:00';
  
  // Act
  const result = formatToDate(input);
  
  // Assert
  expect(result).toBe('15-01-2024');
});
```

### 3. Un Concepto por Test

```typescript
// ❌ Malo - múltiples conceptos
it('debe validar y formatear RUT', () => {
  expect(isValidRut('12345678-5')).toBe(true);
  expect(formatRut('123456785')).toBe('12345678-5');
});

// ✅ Bueno - un concepto por test
it('debe validar RUT correcto', () => {
  expect(isValidRut('12345678-5')).toBe(true);
});

it('debe formatear RUT sin guión', () => {
  expect(formatRut('123456785')).toBe('12345678-5');
});
```

### 4. Usar beforeEach para Setup

```typescript
describe('MyComponent', () => {
  let mockData;

  beforeEach(() => {
    mockData = { id: 1, name: 'Test' };
  });

  it('test 1', () => {
    // usa mockData
  });

  it('test 2', () => {
    // usa mockData
  });
});
```

### 5. Limpiar después de Tests

```typescript
afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
```

---

## Próximos Pasos

### Tests Pendientes

- [ ] **Servicios** - authService, userService, administracionService
- [ ] **Componentes UI** - Buttons, Inputs, Dialogs
- [ ] **Componentes de Negocio** - Forms, Tables, Dashboards
- [ ] **Integration Tests** - Flujos completos
- [ ] **E2E Tests** - Playwright (futuro)

### Mejoras Planificadas

- [ ] Aumentar coverage a 80%+
- [ ] Configurar Codecov para reportes visuales
- [ ] Agregar tests de performance
- [ ] Implementar visual regression testing
- [ ] Agregar mutation testing

---

## Recursos

### Documentación

- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW](https://mswjs.io/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

### Ejemplos

Ver los tests existentes en:
- `app/utils/*.test.ts`
- `app/hooks/*.test.ts`

---

## Troubleshooting

### Tests Fallan Localmente pero Pasan en CI

- Verificar versiones de Node.js
- Limpiar `node_modules` y reinstalar
- Verificar variables de entorno

### Coverage Bajo

- Identificar archivos sin tests: `pnpm test:coverage`
- Priorizar código crítico de negocio
- Agregar tests incrementalmente

### Tests Lentos

- Usar `it.only()` para ejecutar tests específicos
- Verificar mocks de API
- Considerar paralelización

---

**Última actualización**: Octubre 2025  
**Mantenedor**: Equipo Enerlova
