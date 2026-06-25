import { Checkbox } from '~/components/ui/checkbox';
import { cn } from '~/lib/utils';

interface PermisoCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export const PermisoCheckbox = ({
  checked,
  onCheckedChange,
  className
}: PermisoCheckboxProps) => (
  <Checkbox
    checked={checked}
    onCheckedChange={onCheckedChange}
    className={cn(className)}
  />
);
PermisoCheckbox.displayName = 'PermisoCheckbox';
