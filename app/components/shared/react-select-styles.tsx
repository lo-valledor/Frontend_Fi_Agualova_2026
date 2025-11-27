import type { StylesConfig, GroupBase } from 'react-select';

// Definimos un tipo genérico para las opciones
interface OptionType {
  value: string | number;
  label: string;
}

// Tipamos explícitamente el retorno como StylesConfig
export function getReactSelectStyles(
  theme: 'light' | 'dark' | string
): StylesConfig<OptionType, false, GroupBase<OptionType>> {
  const isDark = theme === 'dark';

  return {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: isDark ? 'hsl(var(--background))' : 'hsl(var(--background))',
      borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--border))',
      borderRadius: 'calc(var(--radius) - 2px)',
      borderWidth: '1px',
      boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring) / 0.2)' : 'none',
      minHeight: '2.75rem',
      '&:hover': {
        borderColor: 'hsl(var(--ring))',
      },
    }),
    input: (provided) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
      fontSize: '0.875rem',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      fontSize: '0.875rem',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
      fontSize: '0.875rem',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDark ? '#09090b' : '#ffffff',
      border: '1px solid hsl(var(--border))',
      borderRadius: 'calc(var(--radius) - 2px)',
      boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)',
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '0.25rem',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'hsl(var(--hover) / 0.5)'
        : state.isFocused
        ? 'hsl(var(--background) / 0.3)' // Hover más intenso
        : 'transparent',
      color: state.isSelected
        ? 'hsl(var(--accent-foreground))'
        : 'hsl(var(--popover-foreground))',
      fontSize: '0.875rem',
      padding: '0.5rem 0.75rem',
      borderRadius: 'calc(var(--radius) - 4px)',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: 'hsl(var(--accent) / 0.2)',
      },
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: 'hsl(var(--border))',
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      '&:hover': {
        color: 'hsl(var(--foreground))',
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      '&:hover': {
        color: 'hsl(var(--foreground))',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'hsl(var(--accent))',
      borderRadius: 'calc(var(--radius) - 4px)',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'hsl(var(--accent-foreground))',
      fontSize: '0.75rem',
      padding: '0.125rem 0.25rem',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'hsl(var(--accent-foreground))',
      '&:hover': {
        backgroundColor: 'hsl(var(--destructive))',
        color: 'hsl(var(--destructive-foreground))',
      },
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      fontSize: '0.875rem',
    }),
  };
}