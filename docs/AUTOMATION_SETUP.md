# Configuración para automatizar JSDoc con ESLint

# Instalar plugins de JSDoc

pnpm add -D eslint-plugin-jsdoc @typescript-eslint/parser

# Agregar reglas automáticas a eslint.config.js:

## Reglas recomendadas para JSDoc automático:

```javascript
import jsdoc from 'eslint-plugin-jsdoc';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      jsdoc
    },
    rules: {
      // Requerir JSDoc en funciones exportadas
      'jsdoc/require-jsdoc': [
        'warn',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false
          },
          contexts: [
            'ExportNamedDeclaration:has(FunctionDeclaration)',
            'ExportNamedDeclaration:has(VariableDeclaration)',
            'ExportDefaultDeclaration:has(FunctionDeclaration)'
          ]
        }
      ],

      // Validar parámetros en JSDoc
      'jsdoc/require-param': 'warn',
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-param-type': 'off', // TypeScript ya maneja tipos

      // Validar returns
      'jsdoc/require-returns': [
        'warn',
        {
          exemptedBy: ['inheritdoc', 'override']
        }
      ],
      'jsdoc/require-returns-description': 'warn',
      'jsdoc/require-returns-type': 'off', // TypeScript ya maneja tipos

      // Validaciones de sintaxis
      'jsdoc/valid-types': 'warn',
      'jsdoc/check-syntax': 'warn',
      'jsdoc/check-tag-names': 'warn',

      // Evitar JSDoc redundante con TypeScript
      'jsdoc/no-types': 'warn',
      'jsdoc/require-description': 'warn'
    }
  }
];
```

## Scripts adicionales en package.json:

```json
{
  "scripts": {
    "lint:jsdoc": "eslint . --ext .ts,.tsx --rule 'jsdoc/require-jsdoc: error'",
    "lint:jsdoc-fix": "eslint . --ext .ts,.tsx --rule 'jsdoc/require-jsdoc: error' --fix"
  }
}
```

## VSCode Settings para auto-completar JSDoc:

Crear `.vscode/settings.json`:

```json
{
  "typescript.suggest.jsdoc.generateReturns": true,
  "typescript.suggest.completeJSDocs": true,
  "typescript.suggest.includeAutomaticOptionalChainCompletions": true
}
```
