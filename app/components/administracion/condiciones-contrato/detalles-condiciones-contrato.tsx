import {
  Building,
  Calculator,
  CheckCircle,
  DollarSign,
  FileText,
  Hash,
  Info,
  Percent,
  Settings,
  TrendingUp,
  XCircle
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import React, { useEffect, useState } from 'react';

import { Badge } from '~/components/ui/badge';
import api from '~/lib/api';
import type { GetCondicionesContratoPorId } from '~/types/administracion';

interface DetallesCondicionesContratoProps {
  condicionId: number;
  onClose: () => void;
}

const DetailItem = ({
  label,
  value,
  icon: Icon,
  className = ''
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) => (
  <div
    className={`flex items-start gap-3 p-3 sm:gap-4 sm:p-4 rounded-xl transition-all duration-200 ${className}`}
  >
    {Icon && (
      <div className='flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 dark:bg-primary/5 flex items-center justify-center'>
        <Icon className='w-4 h-4 sm:w-5 sm:h-5 text-primary' />
      </div>
    )}
    <div className='flex-1 min-w-0'>
      <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1'>
        {label}
      </p>
      <div className='text-sm font-medium text-foreground break-words'>
        {typeof value === 'string' && value ? (
          value
        ) : typeof value === 'number' ? (
          value.toString()
        ) : typeof value === 'boolean' ? (
          value ? (
            'Activo'
          ) : (
            'Inactivo'
          )
        ) : (
          <span className='text-muted-foreground italic'>No especificado</span>
        )}
      </div>
    </div>
  </div>
);

const SectionTitle = ({
  icon: Icon,
  title
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) => (
  <div className='flex items-center gap-2 mb-4'>
    <div className='p-2 rounded-xl bg-primary/10 dark:bg-primary/5'>
      <Icon className='w-5 h-5 text-primary' />
    </div>
    <h3 className='text-lg font-semibold text-foreground'>{title}</h3>
  </div>
);

export default function DetallesCondicionesContrato({
  condicionId
}: DetallesCondicionesContratoProps) {
  const [condicion, setCondicion] =
    useState<GetCondicionesContratoPorId | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCondicion = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `condicion-contrato/obtieneDatosEdicion/${condicionId}`
        );
        setCondicion(response.data as GetCondicionesContratoPorId);
        setError(null);
      } catch (err) {
        console.error(
          'Error al cargar los detalles de la condición de contrato:',
          err
        );
        setError('Error al cargar los detalles de la condición de contrato');
        toast.error('Error al cargar los detalles');
      } finally {
        setLoading(false);
      }
    };

    if (condicionId) {
      fetchCondicion();
    }
  }, [condicionId]);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex items-center gap-2'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span>Cargando detalles...</span>
        </div>
      </div>
    );
  }

  if (error || !condicion) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
        <XCircle className='h-12 w-12 text-destructive' />
        <div className='text-center'>
          <h3 className='text-lg font-semibold text-destructive mb-2'>
            Error al cargar los detalles
          </h3>
          <p className='text-muted-foreground mb-4'>
            {error ||
              'No se pudieron cargar los detalles de la condición de contrato'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 pb-6'>
      {/* Header con información principal */}
      <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/10 dark:border-primary/5'>
        <div className='absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50'></div>
        <div className='relative p-4 sm:p-6'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
            <div className='w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/10 dark:to-primary/5 flex items-center justify-center shadow-lg'>
              <FileText className='w-8 h-8 sm:w-10 sm:h-10 text-primary' />
            </div>
            <div className='flex-1'>
              <h2 className='text-xl sm:text-2xl font-bold text-foreground mb-2'>
                {condicion.descripcion}
              </h2>
              <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
                <Badge
                  variant={condicion.estado ? 'default' : 'secondary'}
                  className='rounded-xl px-3 py-1'
                >
                  {condicion.estado ? 'Activo' : 'Inactivo'}
                </Badge>
                <span className='text-sm text-muted-foreground'>
                  ID: {condicion.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
        {/* Información General */}
        <div className='space-y-4'>
          <SectionTitle icon={Info} title='Información General' />
          <div className='rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden'>
            <div className='divide-y divide-border'>
              <DetailItem
                label='Descripción'
                value={condicion.descripcion}
                icon={FileText}
              />
              <DetailItem
                label='ID de Concepto'
                value={condicion.conceptoId}
                icon={Hash}
              />
              <DetailItem label='Tipo' value={condicion.tipo} icon={Settings} />
              <DetailItem
                label='Estado'
                value={condicion.estado}
                icon={condicion.estado ? CheckCircle : XCircle}
              />
            </div>
          </div>
        </div>

        {/* Información de Valores */}
        <div className='space-y-4'>
          <SectionTitle icon={Calculator} title='Configuración de Valores' />
          <div className='rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden'>
            <div className='divide-y divide-border'>
              <DetailItem
                label='Tipo de Cálculo'
                value={condicion.usaPorcentaje ? 'Porcentual' : 'Valor Fijo'}
                icon={condicion.usaPorcentaje ? Percent : DollarSign}
              />
              <DetailItem
                label='Valor Principal'
                value={condicion.valor}
                icon={TrendingUp}
              />
              <DetailItem
                label='Factor Porcentual'
                value={condicion.factorPorcentual}
                icon={Percent}
              />
              <DetailItem
                label='Valor Fijo'
                value={condicion.valorFijo}
                icon={DollarSign}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Información Adicional */}
      <div className='space-y-4'>
        <SectionTitle icon={Building} title='Información Adicional' />
        <div className='rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden'>
          <div className='p-4 sm:p-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <p className='text-sm font-medium text-muted-foreground'>
                  Tipo de Cálculo
                </p>
                <div className='flex items-center gap-2'>
                  {condicion.usaPorcentaje ? (
                    <>
                      <Percent className='w-4 h-4 text-green-600' />
                      <span className='text-sm font-medium'>
                        Porcentual ({condicion.valor}%)
                      </span>
                    </>
                  ) : (
                    <>
                      <DollarSign className='w-4 h-4 text-blue-600' />
                      <span className='text-sm font-medium'>
                        Valor Fijo ({condicion.valor})
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                <p className='text-sm font-medium text-muted-foreground'>
                  Estado del Sistema
                </p>
                <div className='flex items-center gap-2'>
                  {condicion.estado ? (
                    <>
                      <CheckCircle className='w-4 h-4 text-green-600' />
                      <span className='text-sm font-medium text-green-600'>
                        Activo y Operativo
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className='w-4 h-4 text-red-600' />
                      <span className='text-sm font-medium text-red-600'>
                        Inactivo
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
