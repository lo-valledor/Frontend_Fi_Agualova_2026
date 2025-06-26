import { type Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const handleSort = () => {
    const currentSort = column.getIsSorted();
    if (currentSort === 'desc') {
      // Si está descendente, cambia a ascendente
      column.toggleSorting(false); // false para ascendente
    } else if (currentSort === 'asc') {
      // Si está ascendente, cambia a descendente
      column.toggleSorting(true); // true para descendente
    } else {
      // Si no está ordenado, cambia a ascendente (primer clic)
      column.toggleSorting(false); // false para ascendente
    }
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSort}
        className={cn(
          '-ml-3 h-8 hover:bg-accent/50',
          column.getIsSorted() && 'bg-accent', // Mantiene el fondo si está ordenado
        )}
      >
        <span>{title}</span>
        {column.getIsSorted() === 'desc' ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === 'asc' ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          // Cuando no está ordenado, ChevronsUpDown es más neutral
          <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground/70" />
        )}
      </Button>
    </div>
  );
}
