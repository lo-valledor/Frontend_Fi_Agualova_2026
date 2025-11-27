import type { StylesConfig } from 'react-select';

// Función para obtener estilos de react-select basados en el tema
export function getReactSelectStyles(theme: 'light' | 'dark' | string) {
  const isDark = theme === 'dark';

  return {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: isDark ? 'hsl(var(--background))' : 'hsl(var(--background))',
      borderColor: state.isFocused
        ? 'hsl(var(--ring))'
        : 'hsl(var(--border))',
      borderRadius: 'calc(var(--radius) - 2px)',
      borderWidth: '1px',
      boxShadow: state.isFocused
        ? '0 0 0 2px hsl(var(--ring) / 0.2)'
        : 'none',
      minHeight: '2.75rem',
      '&:hover': {
        borderColor: 'hsl(var(--ring))',
      },
    }),
    input: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
      fontSize: '0.875rem',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      fontSize: '0.875rem',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
      fontSize: '0.875rem',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: 'hsl(var(--popover))',
      border: '1px solid hsl(var(--border))',
      borderRadius: 'calc(var(--radius) - 2px)',
      boxShadow: 'hsl(var(--shadow) / 0.1) 0px 4px 6px -1px, hsl(var(--shadow) / 0.1) 0px 2px 4px -2px',
      zIndex: 9999,
    }),
    menuList: (provided: any) => ({
      ...provided,
      padding: '0.25rem',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'hsl(var(--accent))'
        : state.isFocused
        ? 'hsl(var(--accent) / 0.1)'
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
    indicatorSeparator: (provided: any) => ({
      ...provided,
      backgroundColor: 'hsl(var(--border))',
    }),
    clearIndicator: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      '&:hover': {
        color: 'hsl(var(--foreground))',
      },
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      '&:hover': {
        color: 'hsl(var(--foreground))',
      },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: 'hsl(var(--accent))',
      borderRadius: 'calc(var(--radius) - 4px)',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--accent-foreground))',
      fontSize: '0.75rem',
      padding: '0.125rem 0.25rem',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--accent-foreground))',
      '&:hover': {
        backgroundColor: 'hsl(var(--destructive))',
        color: 'hsl(var(--destructive-foreground))',
      },
    }),
    noOptionsMessage: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      fontSize: '0.875rem',
    }),
  };
}

// Función para obtener estilos de react-select usando Tailwind CSS variables (sin tema específico)
export function getTailwindSelectStyles<T = any>(): StylesConfig<T, false> {
  return {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'hsl(var(--background))',
      borderColor: state.isFocused
        ? 'hsl(var(--ring))'
        : 'hsl(var(--border))',
      borderRadius: 'calc(var(--radius) - 2px)',
      borderWidth: '1px',
      boxShadow: state.isFocused
        ? '0 0 0 2px hsl(var(--ring) / 0.2)'
        : 'none',
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
      backgroundColor: 'hsl(var(--popover))',
      border: '1px solid hsl(var(--border))',
      borderRadius: 'calc(var(--radius) - 2px)',
      boxShadow: 'hsl(var(--shadow) / 0.1) 0px 4px 6px -1px, hsl(var(--shadow) / 0.1) 0px 2px 4px -2px',
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '0.25rem',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'hsl(var(--accent))'
        : state.isFocused
        ? 'hsl(var(--accent) / 0.1)'
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