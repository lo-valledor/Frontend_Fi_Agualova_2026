import type { PermisoRolMenu } from '~/types/roles-permisos';

import { PermisoCheckbox } from './permiso-checkbox';

interface PermisoCheckboxGroupProps {
  permiso: PermisoRolMenu | undefined;
  rolId: number;
  menuId: number;
  onTogglePermiso: (
    idRol: number,
    idMenu: number,
    tipoPermiso: string,
    valor: boolean
  ) => void;
  layout?: 'mobile' | 'table';
}

type PermissionOption = {
  key: 'puedeVer' | 'puedeCrear' | 'puedeEditar' | 'puedeEliminar';
  label: string;
  mobileClassName: string;
  tableClassName: string;
  checkboxClassName: string;
};

const permissionOptions: PermissionOption[] = [
  {
    key: 'puedeVer',
    label: 'Ver',
    mobileClassName:
      'hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-600 dark:text-blue-400',
    tableClassName:
      'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50',
    checkboxClassName:
      'data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600'
  },
  {
    key: 'puedeCrear',
    label: 'Crear',
    mobileClassName:
      'hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
    tableClassName:
      'bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50',
    checkboxClassName:
      'data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600'
  },
  {
    key: 'puedeEditar',
    label: 'Editar',
    mobileClassName:
      'hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-600 dark:text-amber-400',
    tableClassName:
      'bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50',
    checkboxClassName:
      'data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600'
  },
  {
    key: 'puedeEliminar',
    label: 'Eliminar',
    mobileClassName:
      'hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400',
    tableClassName:
      'bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-900/50',
    checkboxClassName:
      'data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600'
  }
];

export function PermisoCheckboxGroup({
  permiso,
  rolId,
  menuId,
  onTogglePermiso,
  layout = 'table'
}: Readonly<PermisoCheckboxGroupProps>) {
  const handleToggle = (tipoPermiso: string, currentValue: boolean) => {
    onTogglePermiso(rolId, menuId, tipoPermiso, !currentValue);
  };

  if (layout === 'mobile') {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {permissionOptions.slice(0, 2).map(option => {
            const checked = permiso?.[option.key] ?? false;

            return (
              <PermissionButton
                key={option.key}
                checked={checked}
                label={option.label}
                onPress={() => handleToggle(option.key, checked)}
                checkboxClassName={option.checkboxClassName}
                className={`gap-2 rounded-lg p-2 ${option.mobileClassName}`}
              />
            );
          })}
        </div>

        <div className="space-y-2">
          {permissionOptions.slice(2).map(option => {
            const checked = permiso?.[option.key] ?? false;

            return (
              <PermissionButton
                key={option.key}
                checked={checked}
                label={option.label}
                onPress={() => handleToggle(option.key, checked)}
                checkboxClassName={option.checkboxClassName}
                className={`gap-2 rounded-lg p-2 ${option.mobileClassName}`}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-1">
      {permissionOptions.map(option => {
        const checked = permiso?.[option.key] ?? false;

        return (
          <PermissionButton
            key={option.key}
            checked={checked}
            label={option.label}
            onPress={() => handleToggle(option.key, checked)}
            checkboxClassName={option.checkboxClassName}
            className={`justify-center rounded-lg p-2 ${getTableButtonClass(
              checked,
              option
            )}`}
            iconOnly
          />
        );
      })}
    </div>
  );
}

interface PermissionButtonProps {
  checked: boolean;
  label: string;
  onPress: () => void;
  checkboxClassName: string;
  className: string;
  iconOnly?: boolean;
}

function PermissionButton({
  checked,
  label,
  onPress,
  checkboxClassName,
  className,
  iconOnly = false
}: Readonly<PermissionButtonProps>) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`flex min-h-9 items-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      aria-pressed={checked}
      aria-label={label}
      title={label}
    >
      <PermisoCheckbox
        checked={checked}
        onCheckedChange={() => {}}
        className={`pointer-events-none ${iconOnly ? 'h-5 w-5' : 'h-4 w-4'} ${checkboxClassName}`}
      />

      {!iconOnly ? (
        <span className="text-sm font-medium">{label}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </button>
  );
}

function getTableButtonClass(checked: boolean, option: PermissionOption) {
  if (checked) return option.tableClassName;

  return option.mobileClassName
    .split(' ')
    .filter(
      token => token.startsWith('hover:') || token.startsWith('dark:hover:')
    )
    .join(' ');
}

PermisoCheckboxGroup.displayName = 'PermisoCheckboxGroup';
