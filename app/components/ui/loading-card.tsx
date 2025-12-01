import { Loader2 } from 'lucide-react';

import { Card, CardContent } from './card';
import { Progress } from './progress';

interface LoadingCardProps {
  message?: string;
  progress?: {
    current: number;
    total: number;
  };
  stage?: string;
}

export function LoadingCard({
  message = 'Cargando...',
  progress,
  stage
}: LoadingCardProps) {
  const progressPercentage = progress
    ? (progress.current / progress.total) * 100
    : undefined;

  return (
    <Card className='border-0 shadow-lg bg-card/80 backdrop-blur-sm'>
      <CardContent className='p-6 sm:p-8'>
        <div className='flex flex-col items-center justify-center space-y-4'>
          {/* Spinner animado */}
          <div className='relative'>
            <Loader2 className='h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary' />
          </div>

          {/* Mensaje principal */}
          <div className='text-center space-y-2'>
            <p className='text-sm sm:text-base font-medium text-foreground'>
              {message}
            </p>

            {/* Stage opcional */}
            {stage && (
              <p className='text-xs sm:text-sm text-muted-foreground'>
                {stage}
              </p>
            )}

            {/* Progress opcional */}
            {progress && (
              <div className='w-full max-w-xs space-y-2 pt-2'>
                <Progress value={progressPercentage} className='h-2' />
                <p className='text-xs text-muted-foreground text-center'>
                  {progress.current} de {progress.total} completados
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
