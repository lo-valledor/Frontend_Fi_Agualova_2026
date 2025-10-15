import { type StylesConfig } from 'react-select';

type Theme = 'dark' | 'light' | 'system';

/**
 * Obtiene el valor de una variable CSS del sistema de diseño
 * @param variable - Nombre de la variable CSS (ej: '--background')
 * @returns El valor de la variable en formato OKLCH
 */
const getCSSVariable = (variable: string): string => {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
};

/**
 * Convierte una variable CSS a un color CSS válido
 * @param variable - Nombre de la variable CSS
 * @returns String de color con el valor completo de la variable CSS
 */
const getColor = (variable: string): string => {
  if (typeof window === 'undefined') return 'transparent';

  const value = getCSSVariable(variable);

  // Si la variable ya contiene oklch(), devolverla tal cual
  if (value.startsWith('oklch(')) {
    return value;
  }

  // Si es solo los valores, envolver en oklch()
  if (value) {
    return `oklch(${value})`;
  }

  return 'transparent';
};

/**
 * Estilos personalizados para react-select con soporte para modo oscuro
 * Utiliza variables CSS del sistema de diseño definidas en app.css
 * @param _theme - El tema actual ('dark', 'light' o 'system') - No usado, los estilos se adaptan automáticamente
 * @returns Configuración de estilos para react-select
 */
export const getReactSelectStyles = (_theme: Theme): StylesConfig<any> => {
  return {
    control: styles => ({
      ...styles,
      backgroundColor: getColor('--background'),
      borderColor: getColor('--border'),
      color: getColor('--foreground'),
      minHeight: '3rem',
      fontSize: '1rem',
      '&:hover': {
        borderColor: getColor('--input')
      }
    }),
    menu: styles => ({
      ...styles,
      backgroundColor: getColor('--popover'),
      zIndex: 9999,
      maxHeight: '300px',
      border: `1px solid ${getColor('--border')}`,
      boxShadow: getCSSVariable('--shadow-lg')
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
        ? getColor('--primary')
        : isFocused
          ? getColor('--accent')
          : 'transparent',
      color: isSelected
        ? getColor('--primary-foreground')
        : getColor('--popover-foreground'),
      padding: '12px 16px',
      cursor: 'pointer',
      fontSize: '0.95rem',
      ':active': {
        ...styles[':active'],
        backgroundColor: getColor('--primary')
      }
    }),
    singleValue: styles => ({
      ...styles,
      color: getColor('--foreground')
    }),
    input: styles => ({
      ...styles,
      color: getColor('--foreground')
    }),
    placeholder: styles => ({
      ...styles,
      color: getColor('--muted-foreground')
    }),
    noOptionsMessage: styles => ({
      ...styles,
      color: getColor('--muted-foreground'),
      padding: '12px 16px',
      textAlign: 'center' as const
    }),
    loadingMessage: styles => ({
      ...styles,
      color: getColor('--muted-foreground'),
      padding: '12px 16px',
      textAlign: 'center' as const
    })
  };
};

/**
 * Estilos personalizados para react-select usando variables CSS del sistema de diseño
 * Ideal para componentes que necesitan mayor flexibilidad en el theming
 * Los estilos se adaptan automáticamente al tema mediante las variables CSS
 * @template T - Tipo de datos para las opciones del select
 * @returns Configuración de estilos para react-select con fondos sólidos y mejor contraste
 */
export const getTailwindSelectStyles = <T = any>(): StylesConfig<T, false> => {
  return {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: getColor('--background'),
      borderColor: state.isFocused ? getColor('--ring') : getColor('--border'),
      boxShadow: state.isFocused ? `0 0 0 1px ${getColor('--ring')}` : 'none',
      '&:hover': {
        borderColor: state.isFocused ? getColor('--ring') : getColor('--input')
      },
      borderRadius: 'calc(var(--radius) - 2px)',
      minHeight: '40px',
      cursor: 'pointer',
      transition: 'all 0.15s ease'
    }),
    menu: provided => ({
      ...provided,
      backgroundColor: getColor('--popover'),
      border: `1px solid ${getColor('--border')}`,
      borderRadius: 'calc(var(--radius) - 2px)',
      boxShadow: getCSSVariable('--shadow-lg'),
      zIndex: 9999,
      overflow: 'hidden'
    }),
    menuList: provided => ({
      ...provided,
      backgroundColor: getColor('--popover'),
      padding: '4px',
      maxHeight: '200px',
      '::-webkit-scrollbar': {
        width: '8px'
      },
      '::-webkit-scrollbar-track': {
        background: getColor('--muted')
      },
      '::-webkit-scrollbar-thumb': {
        background: getColor('--muted-foreground'),
        borderRadius: '4px'
      },
      '::-webkit-scrollbar-thumb:hover': {
        background: getColor('--foreground')
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? getColor('--primary')
        : state.isFocused
          ? getColor('--accent')
          : 'transparent',
      color: state.isSelected
        ? getColor('--primary-foreground')
        : getColor('--popover-foreground'),
      '&:hover': {
        backgroundColor: state.isSelected
          ? getColor('--primary')
          : getColor('--accent')
      },
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: 'calc(var(--radius) - 4px)',
      margin: '1px 0',
      transition: 'all 0.1s ease'
    }),
    singleValue: provided => ({
      ...provided,
      color: getColor('--foreground')
    }),
    input: provided => ({
      ...provided,
      color: getColor('--foreground'),
      margin: '0px'
    }),
    placeholder: provided => ({
      ...provided,
      color: getColor('--muted-foreground')
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
      color: getColor('--muted-foreground'),
      padding: '8px',
      '&:hover': {
        color: getColor('--foreground')
      }
    }),
    clearIndicator: provided => ({
      ...provided,
      color: getColor('--muted-foreground'),
      padding: '8px',
      '&:hover': {
        color: getColor('--destructive')
      }
    }),
    noOptionsMessage: provided => ({
      ...provided,
      color: getColor('--muted-foreground'),
      padding: '12px'
    }),
    loadingMessage: provided => ({
      ...provided,
      color: getColor('--muted-foreground'),
      padding: '12px'
    })
  };
};
