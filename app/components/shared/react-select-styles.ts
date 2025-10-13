import { type StylesConfig } from 'react-select';

type Theme = 'dark' | 'light' | 'system';

/**
 * Estilos personalizados para react-select con soporte para modo oscuro
 * Utiliza variables CSS de Tailwind para mantener consistencia con el theme
 * @param theme - El tema actual ('dark', 'light' o 'system')
 * @returns Configuración de estilos para react-select
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
 * Detecta automáticamente el tema actual basándose en la clase 'dark' del documento
 * @template T - Tipo de datos para las opciones del select
 * @returns Configuración de estilos para react-select con fondos sólidos y mejor contraste
 */
export const getTailwindSelectStyles = <T = any>(): StylesConfig<T, false> => {
  // Detectar si estamos en modo oscuro
  const isDark =
    typeof window !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  return {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: isDark ? 'rgb(15 23 42)' : 'rgb(255 255 255)',
      borderColor: state.isFocused
        ? isDark
          ? 'rgb(100 116 139)'
          : 'rgb(148 163 184)'
        : isDark
          ? 'rgb(51 65 85)'
          : 'rgb(226 232 240)',
      boxShadow: state.isFocused
        ? `0 0 0 1px ${isDark ? 'rgb(100 116 139)' : 'rgb(148 163 184)'}`
        : 'none',
      '&:hover': {
        borderColor: state.isFocused
          ? isDark
            ? 'rgb(100 116 139)'
            : 'rgb(148 163 184)'
          : isDark
            ? 'rgb(71 85 105)'
            : 'rgb(203 213 225)'
      },
      borderRadius: '0.5rem',
      minHeight: '40px',
      cursor: 'pointer',
      transition: 'all 0.15s ease'
    }),
    menu: provided => ({
      ...provided,
      backgroundColor: isDark ? 'rgb(15 23 42)' : 'rgb(255 255 255)',
      border: `1px solid ${isDark ? 'rgb(51 65 85)' : 'rgb(226 232 240)'}`,
      borderRadius: '0.5rem',
      boxShadow: isDark
        ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
        : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      zIndex: 9999,
      overflow: 'hidden'
    }),
    menuList: provided => ({
      ...provided,
      backgroundColor: isDark ? 'rgb(15 23 42)' : 'rgb(255 255 255)',
      padding: '4px',
      maxHeight: '200px',
      '::-webkit-scrollbar': {
        width: '8px'
      },
      '::-webkit-scrollbar-track': {
        background: isDark ? 'rgb(30 41 59)' : 'rgb(241 245 249)'
      },
      '::-webkit-scrollbar-thumb': {
        background: isDark ? 'rgb(71 85 105)' : 'rgb(203 213 225)',
        borderRadius: '4px'
      },
      '::-webkit-scrollbar-thumb:hover': {
        background: isDark ? 'rgb(100 116 139)' : 'rgb(148 163 184)'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? isDark
          ? 'rgb(14 165 233)'
          : 'rgb(14 165 233)'
        : state.isFocused
          ? isDark
            ? 'rgb(30 41 59)'
            : 'rgb(241 245 249)'
          : 'transparent',
      color: state.isSelected
        ? 'rgb(255 255 255)'
        : isDark
          ? 'rgb(241 245 249)'
          : 'rgb(15 23 42)',
      '&:hover': {
        backgroundColor: state.isSelected
          ? isDark
            ? 'rgb(14 165 233)'
            : 'rgb(14 165 233)'
          : isDark
            ? 'rgb(30 41 59)'
            : 'rgb(241 245 249)'
      },
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: '0.375rem',
      margin: '1px 0',
      transition: 'all 0.1s ease'
    }),
    singleValue: provided => ({
      ...provided,
      color: isDark ? 'rgb(241 245 249)' : 'rgb(15 23 42)'
    }),
    input: provided => ({
      ...provided,
      color: isDark ? 'rgb(241 245 249)' : 'rgb(15 23 42)',
      margin: '0px'
    }),
    placeholder: provided => ({
      ...provided,
      color: isDark ? 'rgb(148 163 184)' : 'rgb(100 116 139)'
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
      color: isDark ? 'rgb(148 163 184)' : 'rgb(100 116 139)',
      padding: '8px',
      '&:hover': {
        color: isDark ? 'rgb(203 213 225)' : 'rgb(71 85 105)'
      }
    }),
    clearIndicator: provided => ({
      ...provided,
      color: isDark ? 'rgb(148 163 184)' : 'rgb(100 116 139)',
      padding: '8px',
      '&:hover': {
        color: isDark ? 'rgb(239 68 68)' : 'rgb(220 38 38)'
      }
    }),
    noOptionsMessage: provided => ({
      ...provided,
      color: isDark ? 'rgb(148 163 184)' : 'rgb(100 116 139)',
      padding: '12px'
    }),
    loadingMessage: provided => ({
      ...provided,
      color: isDark ? 'rgb(148 163 184)' : 'rgb(100 116 139)',
      padding: '12px'
    })
  };
};
