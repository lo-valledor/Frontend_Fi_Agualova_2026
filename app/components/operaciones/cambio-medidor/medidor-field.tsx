import React from 'react';

import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

interface MedidorFieldProps {
  id: string;
  label: string;
  value: string | number;
  colorScheme?: 'amber' | 'blue' | 'green' | 'purple';
  readOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  children?: React.ReactNode;
}

const colorVariants = {
  amber: {
    label: 'text-foreground',
    input: 'bg-muted/30 border-border'
  },
  blue: {
    label: 'text-foreground',
    input: 'bg-muted/30 border-border'
  },
  green: {
    label: 'text-foreground',
    input: 'bg-muted/30 border-border'
  },
  purple: {
    label: 'text-foreground',
    input: 'bg-muted/30 border-border'
  }
};

export default function MedidorField({
  id,
  label,
  value,
  colorScheme = 'amber',
  readOnly = true,
  onChange,
  required = false,
  placeholder = '',
  children
}: Readonly<MedidorFieldProps>) {
  const colors = colorVariants[colorScheme];

  return (
    <div className='space-y-1 sm:space-y-2'>
      <Label
        htmlFor={id}
        className={`text-xs sm:text-sm ${colors.label} font-medium`}
      >
        {label}
        {children}
      </Label>
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        readOnly={readOnly}
        onChange={onChange}
        required={required}
        type={!readOnly && required ? 'number' : 'text'}
        min={!readOnly && required ? '0' : undefined}
        className={`h-8 sm:h-9 text-sm sm:text-base ${colors.input}`}
      />
    </div>
  );
}
