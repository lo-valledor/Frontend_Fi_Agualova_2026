import { AlertCircle, AlertTriangle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';

interface ErrorAlertAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive';
}

interface ErrorAlertProps {
  title: string;
  message: string;
  actions?: ErrorAlertAction[];
  variant?: 'destructive' | 'warning';
}

export function ErrorAlert({
  title,
  message,
  actions = [],
  variant = 'destructive'
}: ErrorAlertProps) {
  const isWarning = variant === 'warning';

  return (
    <Alert
      variant='destructive'
      className={`${
        isWarning
          ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300'
          : ''
      }`}
    >
      {isWarning ? (
        <AlertTriangle className='h-4 w-4' />
      ) : (
        <AlertCircle className='h-4 w-4' />
      )}
      <AlertTitle className='text-sm sm:text-base font-semibold'>
        {title}
      </AlertTitle>
      <AlertDescription className='space-y-3'>
        <p className='text-xs sm:text-sm'>{message}</p>

        {/* Botones de acción */}
        {actions.length > 0 && (
          <div className='flex flex-col sm:flex-row gap-2 pt-2'>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size='sm'
                onClick={action.onClick}
                className='w-full sm:w-auto text-xs sm:text-sm'
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
