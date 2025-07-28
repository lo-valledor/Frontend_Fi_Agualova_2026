import { ChevronDown, ChevronUp } from 'lucide-react';

import React from 'react';

import { Button } from '~/components/ui/button';
import { CardDescription, CardTitle } from '~/components/ui/card';
import { CollapsibleTrigger } from '~/components/ui/collapsible';

interface CollapsibleHeaderProps {
  isOpen: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  colorScheme: 'sky' | 'blue' | 'green' | 'amber';
}

const colorVariants = {
  sky: {
    container:
      'hover:bg-sky-50/50 border-sky-200/40 dark:hover:bg-sky-900/20 dark:border-sky-800/40',
    iconBg: 'bg-sky-500',
    title: 'text-sky-900 dark:text-sky-100',
    description: 'text-sky-700 dark:text-sky-300',
    button: 'hover:bg-sky-100 dark:hover:bg-sky-900/50',
    chevron: 'text-sky-600 dark:text-sky-400',
  },
  blue: {
    container:
      'hover:bg-blue-50/50 border-blue-200/40 dark:hover:bg-blue-900/20 dark:border-blue-800/40',
    iconBg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    title: 'text-blue-900 dark:text-blue-100',
    description: 'text-blue-700 dark:text-blue-300',
    button: 'hover:bg-blue-100 dark:hover:bg-blue-900/50',
    chevron: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    container:
      'hover:bg-green-50/50 border-green-200/40 dark:hover:bg-green-900/20 dark:border-green-800/40',
    iconBg: 'bg-gradient-to-r from-green-500 to-emerald-500',
    title: 'text-green-900 dark:text-green-100',
    description: 'text-green-700 dark:text-green-300',
    button: 'hover:bg-green-100 dark:hover:bg-green-900/50',
    chevron: 'text-green-600 dark:text-green-400',
  },
  amber: {
    container:
      'hover:bg-amber-50/50 border-amber-200/40 dark:hover:bg-amber-900/20 dark:border-amber-800/40',
    iconBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
    title: 'text-amber-900 dark:text-amber-100',
    description: 'text-amber-700 dark:text-amber-300',
    button: 'hover:bg-amber-100 dark:hover:bg-amber-900/50',
    chevron: 'text-amber-600 dark:text-amber-400',
  },
};

export default function CollapsibleHeader({
  isOpen,
  icon,
  title,
  description,
  colorScheme,
}: CollapsibleHeaderProps) {
  const colors = colorVariants[colorScheme];

  return (
    <CollapsibleTrigger asChild>
      <div
        className={`flex justify-between items-center p-4 cursor-pointer border-b ${colors.container}`}
      >
        <div className='flex items-center gap-3'>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${colors.iconBg} text-white shadow-sm`}
          >
            {icon}
          </div>
          <div>
            <CardTitle className={`text-lg font-semibold ${colors.title}`}>
              {title}
            </CardTitle>
            <CardDescription className={`text-sm ${colors.description}`}>
              {description}
            </CardDescription>
          </div>
        </div>
        <Button
          variant='ghost'
          size='icon'
          className={`h-8 w-8 rounded-full ${colors.button}`}
        >
          {isOpen ? (
            <ChevronUp className={`h-5 w-5 ${colors.chevron}`} />
          ) : (
            <ChevronDown className={`h-5 w-5 ${colors.chevron}`} />
          )}
          <span className='sr-only'>Abrir/Cerrar panel</span>
        </Button>
      </div>
    </CollapsibleTrigger>
  );
}
