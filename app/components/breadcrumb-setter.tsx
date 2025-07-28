// src/components/breadcrumb-setter.tsx
import { useEffect } from 'react';

import { useBreadcrumbs } from '~/context/BreadcrumbContext';

// Ajusta la ruta

// Reutiliza la interfaz
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbSetterProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSetter({ items }: BreadcrumbSetterProps) {
  const { setBreadcrumbItems } = useBreadcrumbs();

  useEffect(() => {
    // Actualiza los breadcrumbs cuando el componente se monta o los 'items' cambian
    setBreadcrumbItems(items);

    // Opcional: Limpia los breadcrumbs cuando el componente se desmonta
    // Esto es útil si quieres que los breadcrumbs desaparezcan al navegar a otra página
    // que no use BreadcrumbSetter. Si quieres que persistan hasta que otra página
    // los actualice, puedes omitir la función de limpieza.
    return () => {
      // setBreadcrumbItems([]); // Descomenta si necesitas limpiar al desmontar
    };
  }, [items, setBreadcrumbItems]); // Dependencias del efecto

  // Este componente no renderiza nada en el DOM
  return null;
}
