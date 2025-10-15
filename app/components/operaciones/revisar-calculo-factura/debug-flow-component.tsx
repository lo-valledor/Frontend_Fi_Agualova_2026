import React from 'react';
import { CheckCircle, Clock, AlertCircle, Circle } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '~/components/ui/collapsible';

import type { FlowStep } from '~/hooks/operaciones/use-calculo-facturacion-flow';

interface DebugFlowComponentProps {
  steps: FlowStep[];
  currentStep: number;
  procesoId: string | null;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export function DebugFlowComponent({
  steps,
  currentStep,
  procesoId,
  isOpen = false,
  onToggle
}: DebugFlowComponentProps) {
  const getStepIcon = (step: FlowStep, isCurrent: boolean) => {
    if (step.status === 'completed') {
      return <CheckCircle className='w-5 h-5 text-green-500' />;
    }
    if (step.status === 'loading' || isCurrent) {
      return <Clock className='w-5 h-5 text-blue-500 animate-spin' />;
    }
    if (step.status === 'error') {
      return <AlertCircle className='w-5 h-5 text-red-500' />;
    }
    return <Circle className='w-5 h-5 text-gray-400' />;
  };

  const getStepBadge = (step: FlowStep) => {
    switch (step.status) {
      case 'completed':
        return (
          <Badge variant='default' className='bg-green-100 text-green-800'>
            Completado
          </Badge>
        );
      case 'loading':
        return (
          <Badge variant='default' className='bg-blue-100 text-blue-800'>
            Ejecutando
          </Badge>
        );
      case 'error':
        return <Badge variant='destructive'>Error</Badge>;
      default:
        return <Badge variant='secondary'>Pendiente</Badge>;
    }
  };

  return (
    <Card className='border border-border'>
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className='cursor-pointer hover:bg-muted transition-colors'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg flex items-center gap-3'>
                <div className='w-8 h-8 bg-background rounded-xl flex items-center justify-center'>
                  <Clock className='w-4 h-4' />
                </div>
                Debug del Flujo de Cálculo
              </CardTitle>
              <div className='flex items-center gap-2'>
                {procesoId && (
                  <Badge variant='outline' className='text-xs'>
                    Proceso ID: {procesoId}
                  </Badge>
                )}
                <Badge variant='outline' className='text-xs'>
                  Paso {currentStep}/5
                </Badge>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className='pt-0'>
            <div className='space-y-4'>
              {steps.map(step => {
                const isCurrent = currentStep === step.id;
                const isActive = step.status !== 'pending' || isCurrent;

                let borderClass =
                  'border-slate-100 bg-slate-25 dark:border-slate-700 dark:bg-slate-900/30';
                if (isCurrent) {
                  borderClass =
                    'border-blue-300 bg-blue-50/50 dark:border-blue-600 dark:bg-blue-900/20';
                } else if (isActive) {
                  borderClass =
                    'border-slate-200 bg-slate-50/50 dark:border-slate-600 dark:bg-slate-800/50';
                }

                return (
                  <div
                    key={step.id}
                    className={`p-4 rounded-xl border transition-all ${borderClass}`}
                  >
                    {/* Encabezado del paso */}
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center gap-3'>
                        {getStepIcon(step, isCurrent)}
                        <div>
                          <h4 className='font-medium text-sm'>
                            {step.id}. {step.name}
                          </h4>
                          <p className='text-xs text-muted-foreground'>
                            {step.description}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        {step.timestamp && (
                          <span className='text-xs text-muted-foreground'>
                            {step.timestamp}
                          </span>
                        )}
                        {getStepBadge(step)}
                      </div>
                    </div>

                    {/* Error del paso */}
                    {step.error && (
                      <div className='mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs'>
                        <p className='text-red-700 dark:text-red-300 font-medium'>
                          Error:
                        </p>
                        <p className='text-red-600 dark:text-red-400'>
                          {step.error}
                        </p>
                      </div>
                    )}

                    {/* Datos del paso */}
                    {step.data && (
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <button className='mt-2 text-xs  hover:underline'>
                            Ver datos de respuesta
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className='mt-2 p-2 bg-background rounded text-xs'>
                            <pre className='text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap'>
                              {step.data}
                            </pre>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
