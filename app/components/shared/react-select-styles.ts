import { type StylesConfig } from 'react-select';

type Theme = 'dark' | 'light' | 'system';

/**
 * Estilos personalizados para react-select con soporte para modo oscuro
 * Utiliza variables CSS de Tailwind para mantener consistencia con el theme
 */
export const getReactSelectStyles = (theme: Theme): StylesConfig<any> => {
  // Convertir 'system' a 'dark' por defecto para evitar errores
  const effectiveTheme = theme === 'system' ? 'dark' : theme;

  return {
    control: styles => ({
      ...styles,
      backgroundColor: effectiveTheme === 'dark' ? '#020617' : '#FFFFFF',
      borderColor: effectiveTheme === 'dark' ? '#334155' : '#E2E8F0',
      color: effectiveTheme === 'dark' ? '#FFFFFF' : '#000000',
      minHeight: '3rem',
      fontSize: '1rem',
      '&:hover': {
        borderColor: effectiveTheme === 'dark' ? '#475569' : '#CBD5E1'
      }
    }),
    menu: styles => ({
      ...styles,
      backgroundColor: effectiveTheme === 'dark' ? '#020617' : '#FFFFFF',
      zIndex: 9999,
      maxHeight: '300px',
      border:
        effectiveTheme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
      boxShadow:
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }),
    menuList: styles => ({
      ...styles,
      maxHeight: '280px',
      overflowY: 'auto',
      padding: '8px 0'
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isSelected
        ? effectiveTheme === 'dark'
          ? '#0ea5e9'
          : '#0ea5e9'
        : isFocused
          ? effectiveTheme === 'dark'
            ? '#1e293b'
            : '#f1f5f9'
          : 'transparent',
      color: isSelected
        ? '#FFFFFF'
        : effectiveTheme === 'dark'
          ? '#f8fafc'
          : '#0f172a',
      padding: '12px 16px',
      cursor: 'pointer',
      fontSize: '0.95rem',
      ':active': {
        ...styles[':active'],
        backgroundColor: effectiveTheme === 'dark' ? '#0ea5e9' : '#0ea5e9'
      }
    }),
    singleValue: styles => ({
      ...styles,
      color: effectiveTheme === 'dark' ? '#FFFFFF' : '#000000'
    }),
    input: styles => ({
      ...styles,
      color: effectiveTheme === 'dark' ? '#FFFFFF' : '#000000'
    }),
    placeholder: styles => ({
      ...styles,
      color: effectiveTheme === 'dark' ? '#94a3b8' : '#6b7280'
    }),
    noOptionsMessage: styles => ({
      ...styles,
      color: effectiveTheme === 'dark' ? '#94a3b8' : '#6b7280',
      padding: '12px 16px',
      textAlign: 'center' as const
    }),
    loadingMessage: styles => ({
      ...styles,
      color: effectiveTheme === 'dark' ? '#94a3b8' : '#6b7280',
      padding: '12px 16px',
      textAlign: 'center' as const
    })
  };
};

/**
 * Estilos personalizados para react-select usando variables CSS de Tailwind
 * Ideal para componentes que necesitan mayor flexibilidad en el theming
 */
export const getTailwindSelectStyles = <T = any>(): StylesConfig<T, false> => ({
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'hsl(var(--background))',
    borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--border))',
    boxShadow: state.isFocused ? '0 0 0 1px hsl(var(--ring))' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--input))'
    },
    borderRadius: 'var(--radius)',
    minHeight: '36px',
    height: '36px'
  }),
  menu: provided => ({
    ...provided,
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius)',
    boxShadow:
      '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    zIndex: 9999
  }),
  menuList: provided => ({
    ...provided,
    backgroundColor: 'hsl(var(--popover))',
    padding: '4px',
    maxHeight: '200px'
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? 'hsl(var(--primary))'
      : state.isFocused
        ? 'hsl(var(--muted))'
        : 'transparent',
    color: state.isSelected
      ? 'hsl(var(--primary-foreground))'
      : 'hsl(var(--foreground))',
    '&:hover': {
      backgroundColor: state.isSelected
        ? 'hsl(var(--primary))'
        : 'hsl(var(--muted))',
      color: state.isSelected
        ? 'hsl(var(--primary-foreground))'
        : 'hsl(var(--foreground))'
    },
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: 'calc(var(--radius) - 2px)',
    margin: '1px 0'
  }),
  singleValue: provided => ({
    ...provided,
    color: 'hsl(var(--foreground))'
  }),
  input: provided => ({
    ...provided,
    color: 'hsl(var(--foreground))',
    margin: '0px'
  }),
  placeholder: provided => ({
    ...provided,
    color: 'hsl(var(--muted-foreground))'
  }),
  indicatorSeparator: () => ({
    display: 'none'
  }),
  valueContainer: provided => ({
    ...provided,
    padding: '0 12px'
  }),
  dropdownIndicator: provided => ({
    ...provided,
    color: 'hsl(var(--muted-foreground))',
    '&:hover': {
      color: 'hsl(var(--foreground))'
    }
  }),
  clearIndicator: provided => ({
    ...provided,
    color: 'hsl(var(--muted-foreground))',
    '&:hover': {
      color: 'hsl(var(--foreground))'
    }
  })
});
