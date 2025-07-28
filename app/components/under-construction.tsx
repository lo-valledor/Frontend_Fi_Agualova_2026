import { ArrowLeft, Construction } from 'lucide-react';

import React from 'react';

import { Link } from 'react-router';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

interface UnderConstructionProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
}

export default function UnderConstruction({
  title = 'Página en Construcción',
  description = 'Estamos trabajando arduamente para traerte esta funcionalidad. ¡Vuelve pronto!',
  showBackButton = true,
}: UnderConstructionProps) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background p-4'>
      <div className='w-full max-w-sm'>
        <Card className='border-0 shadow-lg'>
          <CardHeader className='text-center pb-6'>
            <div className='flex justify-center mb-6'>
              <div className='bg-muted rounded-full p-3'>
                <Construction className='h-6 w-6 text-muted-foreground' />
              </div>
            </div>

            <CardTitle className='text-xl font-medium text-foreground mb-3'>
              {title}
            </CardTitle>

            <CardDescription className='text-muted-foreground text-sm leading-relaxed'>
              {description}
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-4'>
            {/* Simple progress indicator */}
            <div className='flex justify-center'>
              <div className='flex space-x-1'>
                <div className='w-2 h-2 bg-muted-foreground rounded-full animate-pulse' />
                <div
                  className='w-2 h-2 bg-muted-foreground rounded-full animate-pulse'
                  style={{ animationDelay: '0.2s' }}
                />
                <div
                  className='w-2 h-2 bg-muted-foreground rounded-full animate-pulse'
                  style={{ animationDelay: '0.4s' }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className='flex flex-col space-y-3 pt-2'>
              {showBackButton && (
                <Button asChild variant='outline' className='w-full'>
                  <Link to='/dashboard'>
                    <ArrowLeft className='h-4 w-4 mr-2' />
                    Volver al Dashboard
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
