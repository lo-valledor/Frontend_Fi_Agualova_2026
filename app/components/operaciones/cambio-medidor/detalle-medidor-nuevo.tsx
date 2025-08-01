import { Zap } from 'lucide-react';

import React from 'react';

import { Badge } from '~/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { type DetalleMedidorNuevoProps } from '~/types/operaciones';

export default function DetalleMedidorNuevo({
  detalleMedidorNuevo,
  onDetalleMedidorChange,
}: DetalleMedidorNuevoProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    // Convertir valores numéricos
    if (id === 'constante_multiplicar' || id === 'estado_medidor') {
      const numValue = value === '' ? 0 : Number(value);
      if (!isNaN(numValue)) {
        onDetalleMedidorChange({
          target: {
            id,
            value: numValue.toString(),
          },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    } else {
      onDetalleMedidorChange(e);
    }
  };

  return (
    <Card className='w-full rounded-xl border border-emerald-200/40 bg-white/50 backdrop-blur-sm shadow-lg dark:border-emerald-800/40 dark:bg-gray-900/50'>
      <CardHeader className='bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-b border-emerald-200/40 dark:border-emerald-800/40 p-3 sm:p-6'>
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <div className='flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm flex-shrink-0'>
            <Zap className='h-3 w-3 sm:h-4 sm:w-4' />
          </div>
          <div className='min-w-0'>
            <CardTitle className='text-emerald-900 dark:text-emerald-100 text-sm sm:text-lg truncate'>
              <span className='hidden sm:inline'>Detalle del Nuevo Medidor</span>
              <span className='sm:hidden'>Nuevo Medidor</span>
            </CardTitle>
            <CardDescription className='text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm truncate'>
              <span className='hidden sm:inline'>Información detallada del medidor a instalar</span>
              <span className='sm:hidden'>Medidor a instalar</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-3 sm:p-6'>
        <div className='grid gap-3 sm:gap-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
            <div className='space-y-1 sm:space-y-2'>
              <Label
                htmlFor='numero_serie'
                className='text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-200'
              >
                Número de Serie
              </Label>
              <Input
                id='numero_serie'
                value={detalleMedidorNuevo.numero_serie}
                onChange={handleInputChange}
                placeholder='Ingrese el número de serie'
                readOnly
                className='bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 text-sm sm:text-base h-8 sm:h-10'
              />
            </div>
            <div className='space-y-1 sm:space-y-2'>
              <Label
                htmlFor='tipo_medidor'
                className='text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-200'
              >
                Tipo de Medidor
              </Label>
              <Input
                id='tipo_medidor'
                value={detalleMedidorNuevo.tipo_medidor}
                onChange={handleInputChange}
                placeholder='Ingrese el tipo de medidor'
                readOnly
                className='bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 text-sm sm:text-base h-8 sm:h-10'
              />
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
            <div className='space-y-1 sm:space-y-2'>
              <Label
                htmlFor='constante_multiplicar'
                className='text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-200'
              >
                Constante
              </Label>
              <Input
                id='constante_multiplicar'
                type='number'
                value={detalleMedidorNuevo.constante_multiplicar}
                onChange={handleInputChange}
                placeholder='Ingrese la constante'
                readOnly
                className='bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 text-sm sm:text-base h-8 sm:h-10'
              />
            </div>
            <div className='space-y-1 sm:space-y-2'>
              <Label
                htmlFor='marca'
                className='text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-200'
              >
                Marca
              </Label>
              <Input
                id='marca'
                value={detalleMedidorNuevo.marca}
                onChange={handleInputChange}
                placeholder='Ingrese la marca'
                readOnly
                className='bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 text-sm sm:text-base h-8 sm:h-10'
              />
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
            <div className='space-y-1 sm:space-y-2'>
              <Label
                htmlFor='modelo'
                className='text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-200'
              >
                Modelo
              </Label>
              <Input
                id='modelo'
                value={detalleMedidorNuevo.modelo}
                onChange={handleInputChange}
                placeholder='Ingrese el modelo'
                readOnly
                className='bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 text-sm sm:text-base h-8 sm:h-10'
              />
            </div>
            <div className='space-y-1 sm:space-y-2'>
              <Label
                htmlFor='estado_medidor'
                className='text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-200'
              >
                Estado
              </Label>
              <div className='flex items-center gap-2'>
                <Input
                  id='estado_medidor'
                  type='number'
                  value={detalleMedidorNuevo.estado_medidor}
                  onChange={handleInputChange}
                  placeholder='Ingrese el estado'
                  readOnly
                  className='w-16 sm:w-24 bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 text-sm sm:text-base h-8 sm:h-10'
                />
                <Badge
                  variant={
                    detalleMedidorNuevo.estado_medidor === 1
                      ? 'default'
                      : 'destructive'
                  }
                  className={
                    detalleMedidorNuevo.estado_medidor === 1
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-800 text-xs sm:text-sm'
                      : 'text-xs sm:text-sm'
                  }
                >
                  {detalleMedidorNuevo.estado_medidor === 1
                    ? 'Activo'
                    : 'Inactivo'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
