# Guía rápida para desarrolladores (Frontend)

Este documento apunta a que un nuevo desarrollador entienda en minutos cómo poner el proyecto localmente y cómo está organizado.

1) Configuración local
    - Clonar el repo y colocarse en la carpeta `res`:

       ```bash
      # Guía rápida para desarrolladores (Frontend)

      Este documento apunta a que un nuevo desarrollador entienda en minutos cómo poner el proyecto localmente y cómo está organizado.

      1) Configuración local
         - Clonar el repo y colocarse en la carpeta `res`:

            ```bash
            git clone <repo>
            cd enerlova/res
            pnpm install
            ```
         - Variables de entorno mínimas (archivo `.env`):
            - `VITE_API_URL` — URL base del backend

      2) Scripts principales
         - `pnpm dev` — servidor de desarrollo (Vite)
         - `pnpm build` — build de producción
         - `pnpm lint` — ejecutar linter
         - `pnpm test` — ejecutar tests (si existen)

      3) Estructura rápida
         - `app/` — código fuente: `components/`, `services/`, `hooks/`, `routes/`.
         - `docs/` — guías y plantillas para documentar servicios y componentes.

      4) Cómo entender un componente nuevo
         - Busca el archivo en `app/components/<módulo>`.
         - Revisa los tipos en `app/types` o `app/components/<módulo>/types.ts`.
         - Revisa servicios usados en `app/services` para entender llamadas HTTP y shapes de datos.

      5) Evitar que el código parezca generado por IA
         - Frases y comentarios: usa lenguaje natural claro y conciso, evita frases genéricas repetitivas.
         - Comentarios de diseño: explica las decisiones (por qué) más que el cómo.
         - Nombres: usa nombres de variables y funciones específicos del dominio (ej. `clienteId`, `lecturaActual`) en lugar de nombres genéricos como `data`, `item1`.
         - Tests y ejemplos reales: añade tests o historias (Storybook) con datos realistas.

      6) Pull Request checklist (copia en la plantilla del PR):
         - [ ] El branch está basado en `main` actualizado
         - [ ] `pnpm lint` pasó localmente
         - [ ] Agregué/actualicé documentación relevante en `docs/` o JSDoc
         - [ ] No hay cadenas que indiquen uso de IA en el código o comentarios

      7) Contacto
         - Menciona en el PR quién debe revisar según el área (administración, operaciones, etc.)
