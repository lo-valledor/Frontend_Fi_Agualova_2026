# Guía para documentar componentes

Objetivo: que cada componente tenga documentación clara y ejemplos que muestren intención humana y diseño pensado.

1. Encabezado
   - Título del componente con ruta del archivo.
   - Propósito breve (1-2 frases) explicando el porqué.

2. Props / Types
   - Mostrar la interfaz TypeScript completa.
   - Explicar props no triviales (ej. formato de callbacks, flags con efectos laterales).

3. Ejemplo de uso
   - Incluir un ejemplo mínimo pero realista.
   - Evitar ejemplos abstractos; usar nombres y datos del dominio.

4. Accesibilidad
   - Indicar requerimientos ARIA si aplica y cómo el componente los satisface.

5. Performance y límites
   - Advertir sobre render loops, listas largas y cuándo usar virtualization.

6. Notas de implementación
   - Explicar atajos, trade-offs y decisiones importantes que ayuden a entender el código.

7. Q&A humana (opcional)
   - Añade una breve sección con preguntas que un revisor humano debería hacerse, por ejemplo: "¿Este componente debería manejar estado local o recibirlo por props?"

Plantillas y ejemplos están en `docs/templates/COMPONENT_TEMPLATE.md`.
