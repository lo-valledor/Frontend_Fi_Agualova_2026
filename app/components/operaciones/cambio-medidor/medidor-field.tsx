import React from 'react';

import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

interface MedidorFieldProps {
  id: string;
  label: string;
  value: string | number;
  colorScheme?: 'amber' | 'blue' | 'green' | 'purple';
}

const colorVariants = {
  amber: {
    label: 'text-amber-800 dark:text-amber-200',
    input:
      'bg-amber-50/50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
  },
  blue: {
    label: 'text-blue-800 dark:text-blue-200',
    input:
      'bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  },
  green: {
    label: 'text-green-800 dark:text-green-200',
    input:
      'bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
  },
  purple: {
    label: 'text-purple-800 dark:text-purple-200',
    input:
      'bg-purple-50/50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
  },
};

export default function MedidorField({
  id,
  label,
  value,
  colorScheme = 'amber',
}: MedidorFieldProps) {
  const colors = colorVariants[colorScheme];

  return (
    <div className='space-y-2'>
      <Label htmlFor={id} className={`text-sm ${colors.label} font-medium`}>
        {label}
      </Label>
      <Input
        id={id}
        placeholder=''
        value={value}
        readOnly
        className={`h-9 ${colors.input}`}
      />
    </div>
  );
}
