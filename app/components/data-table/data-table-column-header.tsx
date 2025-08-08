import { type Column } from '@tanstack/react-table';
import { cn } from '~/lib/utils';

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
    return <div className={cn('text-muted-foreground', className)}>{title}</div>;
  }

  const handleSort = () => {
    const currentSort = column.getIsSorted();
    if (currentSort === 'desc') {
      column.toggleSorting(false);
    } else if (currentSort === 'asc') {
      column.toggleSorting(true);
    } else {
      column.toggleSorting(false);
    }
  };

  const getSortIndicator = () => {
    const sortDirection = column.getIsSorted();
    if (sortDirection === 'asc') return ' ↑';
    if (sortDirection === 'desc') return ' ↓';
    return '';
  };

  return (
    <button
      onClick={handleSort}
      className={cn(
        'flex items-center text-left font-medium text-muted-foreground hover:text-foreground transition-colors',
        column.getIsSorted() && 'text-foreground',
        className
      )}
    >
      {title}
      <span className='ml-1 text-xs'>{getSortIndicator()}</span>
    </button>
  );
}
