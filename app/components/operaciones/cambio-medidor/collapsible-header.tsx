import React from 'react';
import { Button } from '~/components/ui/button';
import { CardTitle, CardDescription } from '~/components/ui/card';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { CollapsibleTrigger } from '~/components/ui/collapsible';

interface CollapsibleHeaderProps {
  isOpen: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  colorScheme: 'amber' | 'blue' | 'green' | 'purple';
}

const colorVariants = {
  amber: {
    container:
      'hover:bg-amber-50/50 border-amber-200/40 dark:hover:bg-amber-900/20 dark:border-amber-800/40',
    iconBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
    title: 'text-amber-900 dark:text-amber-100',
    description: 'text-amber-700 dark:text-amber-300',
    button: 'hover:bg-amber-100 dark:hover:bg-amber-900/50',
    chevron: 'text-amber-600 dark:text-amber-400',
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
  purple: {
    container:
      'hover:bg-purple-50/50 border-purple-200/40 dark:hover:bg-purple-900/20 dark:border-purple-800/40',
    iconBg: 'bg-gradient-to-r from-purple-500 to-indigo-500',
    title: 'text-purple-900 dark:text-purple-100',
    description: 'text-purple-700 dark:text-purple-300',
    button: 'hover:bg-purple-100 dark:hover:bg-purple-900/50',
    chevron: 'text-purple-600 dark:text-purple-400',
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
        <div className="flex items-center gap-3">
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
          variant="ghost"
          size="icon"
          className={`h-8 w-8 rounded-full ${colors.button}`}
        >
          {isOpen ? (
            <ChevronUp className={`h-5 w-5 ${colors.chevron}`} />
          ) : (
            <ChevronDown className={`h-5 w-5 ${colors.chevron}`} />
          )}
          <span className="sr-only">Abrir/Cerrar panel</span>
        </Button>
      </div>
    </CollapsibleTrigger>
  );
}
