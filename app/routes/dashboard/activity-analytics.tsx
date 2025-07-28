/* eslint-disable no-empty-pattern */
import { Activity, BarChart3, Clock, Users } from 'lucide-react';

import React from 'react';

import { ActivityStats } from '~/components/dashboard/activity-stats';
import { RecentActivity } from '~/components/dashboard/recent-activity';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

import type { Route } from './+types/activity-analytics';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Análisis de Actividad' },
    {
      name: 'description',
      content: 'Monitorea y analiza la actividad de los usuarios en el sistema',
    },
  ];
}

export default function ActivityAnalyticsPage() {
  return (
    <div className='container mx-auto p-3 md:p-8 space-y-8'>
      {/* Header */}
      <div className='space-y-1'>
        <h1 className='text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100'>
          Análisis de Actividad
        </h1>
        <p className='text-base text-muted-foreground font-light'>
          Monitorea y analiza la actividad de los usuarios en el sistema
        </p>
      </div>

      {/* Tabs de navegación */}
      <Tabs defaultValue='overview' className='space-y-8'>
        <TabsList className='flex w-full gap-2 bg-transparent p-0 border-b border-border dark:border-slate-800'>
          <TabsTrigger
            value='overview'
            className='flex-1 flex flex-col items-center gap-1 px-0 py-2 border-b-2 border-transparent data-[state=active]:border-sky-500 data-[state=active]:text-sky-700 dark:data-[state=active]:text-sky-200 transition-all'
          >
            <BarChart3 className='h-4 w-4 opacity-70' />
            <span className='text-xs font-medium'>Resumen</span>
          </TabsTrigger>
          <TabsTrigger
            value='recent'
            className='flex-1 flex flex-col items-center gap-1 px-0 py-2 border-b-2 border-transparent data-[state=active]:border-sky-500 data-[state=active]:text-sky-700 dark:data-[state=active]:text-sky-200 transition-all'
          >
            <Clock className='h-4 w-4 opacity-70' />
            <span className='text-xs font-medium'>Actividad Reciente</span>
          </TabsTrigger>
          <TabsTrigger
            value='users'
            className='flex-1 flex flex-col items-center gap-1 px-0 py-2 border-b-2 border-transparent data-[state=active]:border-sky-500 data-[state=active]:text-sky-700 dark:data-[state=active]:text-sky-200 transition-all'
          >
            <Users className='h-4 w-4 opacity-70' />
            <span className='text-xs font-medium'>Usuarios</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <Card className='rounded-2xl shadow-none border border-border dark:border-slate-800 bg-white dark:bg-slate-900/80'>
            <CardContent className='p-6'>
              <ActivityStats refreshInterval={30000} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='recent' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card className='rounded-2xl shadow-none border border-border dark:border-slate-800 bg-white dark:bg-slate-900/80'>
              <CardContent className='p-6'>
                <RecentActivity
                  limit={15}
                  showUserInfo={true}
                  refreshInterval={15000}
                />
              </CardContent>
            </Card>

            <Card className='rounded-2xl shadow-none border border-border dark:border-slate-800 bg-white dark:bg-slate-900/80'>
              <CardHeader className='pb-2'>
                <CardTitle className='flex items-center gap-2 text-base font-semibold'>
                  <Activity className='h-5 w-5 opacity-70' />
                  Información del Sistema
                </CardTitle>
                <CardDescription className='text-xs font-light'>
                  Detalles sobre el rastreo de actividad
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4 pt-0'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20'>
                    <div>
                      <div className='font-medium text-sm'>
                        Almacenamiento Local
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Los datos se almacenan en el navegador
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-xs font-medium'>Seguro</div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20'>
                    <div>
                      <div className='font-medium text-sm'>
                        Actualización Automática
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Se actualiza cada 30 segundos
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-xs font-medium'>En tiempo real</div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20'>
                    <div>
                      <div className='font-medium text-sm'>
                        Retención de Datos
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Se mantienen las últimas 1000 actividades
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-xs font-medium'>30 días</div>
                    </div>
                  </div>
                </div>

                <div className='pt-4 border-t border-border dark:border-slate-800'>
                  <h4 className='font-medium mb-2 text-sm'>
                    Tipos de Actividad Rastreados:
                  </h4>
                  <ul className='text-xs text-muted-foreground space-y-1'>
                    <li>• Navegación entre páginas</li>
                    <li>• Acciones en formularios</li>
                    <li>• Operaciones CRUD</li>
                    <li>• Consultas y búsquedas</li>
                    <li>• Exportación de datos</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='users' className='space-y-6'>
          <Card className='rounded-2xl shadow-none border border-border dark:border-slate-800 bg-white dark:bg-slate-900/80'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-base font-semibold'>
                <Users className='h-5 w-5 opacity-70' />
                Análisis por Usuario
              </CardTitle>
              <CardDescription className='text-xs font-light'>
                Estadísticas detalladas de actividad por usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8 text-muted-foreground'>
                <Users className='h-12 w-12 mx-auto mb-3 opacity-50' />
                <p className='text-sm'>
                  Esta funcionalidad estará disponible próximamente
                </p>
                <p className='text-xs mt-2'>
                  Incluirá análisis detallado de patrones de uso por usuario
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
