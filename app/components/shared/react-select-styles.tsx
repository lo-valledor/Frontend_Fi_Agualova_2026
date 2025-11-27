import type { StylesConfig, GroupBase } from 'react-select';

// Definimos un tipo genérico para las opciones
interface OptionType {
  value: string | number;
  label: string;
}

export function getReactSelectStyles(
  theme: 'light' | 'dark' | string
): StylesConfig<OptionType, false, GroupBase<OptionType>> {
  
  // Nota: Con variables CSS nativas, no necesitamos tanta lógica JS para el tema,
  // pero mantenemos la estructura por si acaso.
  
  return {
    control: (provided, state) => ({
      ...provided,
      // Usamos var() directo porque tu CSS ya tiene el color completo (oklch)
      backgroundColor: 'var(--background)', 
      borderColor: state.isFocused ? 'var(--ring)' : 'var(--border)',
      borderRadius: 'calc(var(--radius) - 2px)',
      borderWidth: '1px',
      boxShadow: state.isFocused ? '0 0 0 2px var(--ring)' : 'none', // Nota: Quitamos la opacidad manual para simplificar
      minHeight: '2.75rem',
      '&:hover': {
        borderColor: 'var(--ring)',
      },
    }),
    input: (provided) => ({
      ...provided,
      color: 'var(--foreground)',
      fontSize: '0.875rem',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'var(--muted-foreground)',
      fontSize: '0.875rem',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--foreground)',
      fontSize: '0.875rem',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--popover)', // Usamos el color de popover de tu tema
      border: '1px solid var(--border)',
      borderRadius: 'calc(var(--radius) - 2px)',
      boxShadow: 'var(--shadow-md)', // Usamos tu variable de sombra
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '0.25rem',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'var(--primary)' // Selección sólida
        : state.isFocused
        ? 'var(--accent)'  // Hover usa tu variable --accent (que es gris suave en light/dark)
        : 'transparent',
      
      color: state.isSelected
        ? 'var(--primary-foreground)' // Texto blanco/contraste al seleccionar
        : state.isFocused
        ? 'var(--accent-foreground)'
        : 'var(--foreground)',
        
      fontSize: '0.875rem',
      padding: '0.5rem 0.75rem',
      borderRadius: 'calc(var(--radius) - 4px)',
      cursor: 'pointer',
      '&:active': {
        // Usamos accent directamente para active también
        backgroundColor: 'var(--accent)', 
      },
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: 'var(--border)',
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: 'var(--muted-foreground)',
      '&:hover': {
        color: 'var(--foreground)',
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'var(--muted-foreground)',
      '&:hover': {
        color: 'var(--foreground)',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'var(--accent)',
      borderRadius: 'calc(var(--radius) - 4px)',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'var(--accent-foreground)',
      fontSize: '0.75rem',
      padding: '0.125rem 0.25rem',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'var(--accent-foreground)',
      '&:hover': {
        backgroundColor: 'var(--destructive)',
        color: 'var(--destructive-foreground)', // Texto blanco en error
      },
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: 'var(--muted-foreground)',
      fontSize: '0.875rem',
    }),
  };
}

// Función alternativa que no usa el parámetro theme (para compatibilidad)
export function getTailwindSelectStyles<T = any>(): StylesConfig<T, false> {
  return {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'var(--background)',
      borderColor: state.isFocused ? 'var(--ring)' : 'var(--border)',
      borderRadius: 'calc(var(--radius) - 2px)',
      borderWidth: '1px',
      boxShadow: state.isFocused ? '0 0 0 2px var(--ring)' : 'none',
      minHeight: '2.75rem',
      '&:hover': {
        borderColor: 'var(--ring)',
      },
    }),
    input: (provided) => ({
      ...provided,
      color: 'var(--foreground)',
      fontSize: '0.875rem',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'var(--muted-foreground)',
      fontSize: '0.875rem',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--foreground)',
      fontSize: '0.875rem',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--popover)',
      border: '1px solid var(--border)',
      borderRadius: 'calc(var(--radius) - 2px)',
      boxShadow: 'var(--shadow-md)',
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '0.25rem',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'var(--primary)'
        : state.isFocused
        ? 'var(--accent)'
        : 'transparent',
      color: state.isSelected
        ? 'var(--primary-foreground)'
        : state.isFocused
        ? 'var(--accent-foreground)'
        : 'var(--foreground)',
      fontSize: '0.875rem',
      padding: '0.5rem 0.75rem',
      borderRadius: 'calc(var(--radius) - 4px)',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: 'var(--accent)',
      },
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: 'var(--border)',
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: 'var(--muted-foreground)',
      '&:hover': {
        color: 'var(--foreground)',
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'var(--muted-foreground)',
      '&:hover': {
        color: 'var(--foreground)',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'var(--accent)',
      borderRadius: 'calc(var(--radius) - 4px)',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'var(--accent-foreground)',
      fontSize: '0.75rem',
      padding: '0.125rem 0.25rem',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'var(--accent-foreground)',
      '&:hover': {
        backgroundColor: 'var(--destructive)',
        color: 'var(--destructive-foreground)',
      },
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: 'var(--muted-foreground)',
      fontSize: '0.875rem',
    }),
  };
}