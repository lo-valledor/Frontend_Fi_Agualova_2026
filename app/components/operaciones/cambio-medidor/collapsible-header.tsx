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
    container: 'hover:bg-muted/30 border-border',
    iconBg: 'bg-primary',
    title: 'text-foreground',
    description: 'text-muted-foreground',
    button: 'hover:bg-muted',
    chevron: 'text-primary'
  },
  blue: {
    container: 'hover:bg-muted/30 border-border',
    iconBg: 'bg-primary',
    title: 'text-foreground',
    description: 'text-muted-foreground',
    button: 'hover:bg-muted',
    chevron: 'text-primary'
  },
  green: {
    container: 'hover:bg-muted/30 border-border',
    iconBg: 'bg-emerald-500',
    title: 'text-foreground',
    description: 'text-muted-foreground',
    button: 'hover:bg-muted',
    chevron: 'text-primary'
  },
  amber: {
    container: 'hover:bg-muted/30 border-border',
    iconBg: 'bg-secondary',
    title: 'text-foreground',
    description: 'text-muted-foreground',
    button: 'hover:bg-muted',
    chevron: 'text-primary'
  }
};

export default function CollapsibleHeader({
  isOpen,
  title,
  description,
  colorScheme
}: CollapsibleHeaderProps) {
  const colors = colorVariants[colorScheme];

  return (
    <CollapsibleTrigger asChild>
      <div
        className={`flex justify-between items-center p-3 sm:p-4 cursor-pointer border-b ${colors.container}`}
      >
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          {/* <div
            className={`flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full ${colors.iconBg} shadow-sm flex-shrink-0`}
          >
            {React.cloneElement(icon as React.ReactElement, {
              className: 'h-3 w-3 sm:h-4 sm:w-4'
            })}
          </div> */}
          <div className='min-w-0'>
            <CardTitle
              className={`text-sm sm:text-lg font-semibold ${colors.title} truncate`}
            >
              {title}
            </CardTitle>
            <CardDescription
              className={`text-xs sm:text-sm ${colors.description} truncate`}
            >
              {description}
            </CardDescription>
          </div>
        </div>
        <Button
          variant='ghost'
          size='icon'
          className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full ${colors.button} flex-shrink-0`}
        >
          {isOpen ? (
            <ChevronUp className={`h-4 w-4 sm:h-5 sm:w-5 ${colors.chevron}`} />
          ) : (
            <ChevronDown
              className={`h-4 w-4 sm:h-5 sm:w-5 ${colors.chevron}`}
            />
          )}
          <span className='sr-only'>Abrir/Cerrar panel</span>
        </Button>
      </div>
    </CollapsibleTrigger>
  );
}
