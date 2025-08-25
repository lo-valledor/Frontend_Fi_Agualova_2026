import { Search, X } from 'lucide-react';

import { useCallback, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput
} from '~/components/ui/sidebar';

interface SearchFormProps extends React.ComponentProps<'form'> {
  onSearchChange?: (searchTerm: string) => void;
  searchTerm?: string;
}

export function SearchForm({
  onSearchChange,
  searchTerm = '',
  ...props
}: SearchFormProps) {
  const [inputValue, setInputValue] = useState(searchTerm);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      onSearchChange?.(value);
    },
    [onSearchChange]
  );

  const handleClear = useCallback(() => {
    setInputValue('');
    onSearchChange?.('');
  }, [onSearchChange]);

  return (
    <form {...props} onSubmit={e => e.preventDefault()}>
      <SidebarGroup className='py-0'>
        <SidebarGroupContent className='relative'>
          <Label htmlFor='search' className='sr-only'>
            Buscar en el menú
          </Label>
          <SidebarInput
            id='search'
            placeholder='Buscar...'
            value={inputValue}
            onChange={handleInputChange}
            className='pl-7 sm:pl-8 pr-7 sm:pr-8 h-8 sm:h-9 text-xs sm:text-sm bg-background/50 border-border/50 focus:bg-background focus:border-border transition-all duration-200'
          />
          <Search className='pointer-events-none absolute top-1/2 left-2 sm:left-2.5 size-3 sm:size-4 -translate-y-1/2 opacity-40 select-none' />
          {inputValue && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={handleClear}
              className='absolute top-1/2 right-0.5 sm:right-1 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 p-0 opacity-60 hover:opacity-100'
            >
              <X className='size-2.5 sm:size-3' />
              <span className='sr-only'>Limpiar búsqueda</span>
            </Button>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}
