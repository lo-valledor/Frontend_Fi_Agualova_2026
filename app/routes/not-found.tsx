/* eslint-disable no-empty-pattern */
import { Link } from 'react-router';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '~/components/ui/card';

import type { Route } from './+types/not-found';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Página no encontrada | Enerlova' },
    { name: 'description', content: 'La página que buscas no existe' }
  ];
}

export default function NotFound() {
  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <Card className='w-full max-w-md text-center'>
        <CardHeader className='pb-4'>
          <div className='mx-auto mb-4 h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center'>
            <svg
              className='h-10 w-10 text-red-600 dark:text-red-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <CardTitle className='text-6xl font-bold  mb-2'>404</CardTitle>
          <CardDescription className='text-xl text-gray-600 dark:text-gray-400'>
            Página no encontrada
          </CardDescription>
        </CardHeader>

        <CardContent className='pb-6'>
          <p className='text-gray-600 dark:text-gray-400 leading-relaxed'>
            Lo sentimos, la página que buscas no existe o ha sido movida.
            Verifica la URL o regresa al inicio para continuar navegando.
          </p>
        </CardContent>

        <CardFooter className='flex flex-col gap-3'>
          <Link to='/' className='w-full'>
            <Button className='w-full' size='lg'>
              Volver al inicio
            </Button>
          </Link>
          <Button
            variant='outline'
            className='w-full'
            onClick={() => window.history.back()}
          >
            Página anterior
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
