import { Activity, BarChart3, Clock, TrendingUp, Users } from 'lucide-react';

import React, { useEffect, useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { useActivityTracker } from '~/hooks/useActivityTracker';
import type { ActivitySummary } from '~/services/activityTracker';

interface ActivityStatsProps {
  refreshInterval?: number;
}

export const ActivityStats: React.FC<ActivityStatsProps> = ({
  refreshInterval = 60000, // 1 minuto
}) => {
  const { getActivitySummary } = useActivityTracker();
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [topUsers, setTopUsers] = useState<
    Array<{ userId: string; username: string; actions: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  const loadStats = () => {
    try {
      const activitySummary = getActivitySummary();
      setSummary(activitySummary);

      // Obtener usuarios más activos
      const allActivities = activitySummary.recentActions;
      const userStats: {
        [key: string]: { username: string; actions: number };
      } = {};

      allActivities.forEach(activity => {
        if (!userStats[activity.userId]) {
          userStats[activity.userId] = {
            username: activity.username,
            actions: 0,
          };
        }
        userStats[activity.userId].actions++;
      });

      const sortedUsers = Object.entries(userStats)
        .map(([userId, data]) => ({ userId, ...data }))
        .sort((a, b) => b.actions - a.actions)
        .slice(0, 5);

      setTopUsers(sortedUsers);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();

    const interval = setInterval(loadStats, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getModuleColor = (module: string): string => {
    const colors: { [key: string]: string } = {
      clientes: 'bg-blue-100 text-blue-800 border-blue-200',
      contratos: 'bg-green-100 text-green-800 border-green-200',
      medidores: 'bg-purple-100 text-purple-800 border-purple-200',
      navegación: 'bg-gray-100 text-gray-800 border-gray-200',
      formulario: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return (
      colors[module.toLowerCase()] ||
      'bg-gray-100 text-gray-800 border-gray-200'
    );
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} días`;

    return new Date(timestamp).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className='rounded-2xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 animate-pulse'
          >
            <div className='h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-2'></div>
            <div className='h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-4'></div>
            <div className='h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3'></div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className='rounded-2xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900/80'>
        <div className='text-center py-8'>
          <Activity className='h-12 w-12 mx-auto mb-3 opacity-50' />
          <p className='text-gray-500 dark:text-gray-400'>
            No hay datos de actividad disponibles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Métricas principales */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Card métrica */}
        <div className='rounded-2xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium text-muted-foreground'>
              Total Acciones
            </span>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </div>
          <div className='text-2xl font-bold'>{summary.totalActions}</div>
          <span className='text-xs text-muted-foreground'>
            Todas las actividades registradas
          </span>
        </div>
        <div className='rounded-2xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium text-muted-foreground'>
              Última Actividad
            </span>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </div>
          <div className='text-sm font-medium'>
            {summary.lastActivity ? formatTimeAgo(summary.lastActivity) : 'N/A'}
          </div>
          <span className='text-xs text-muted-foreground'>
            Actividad más reciente
          </span>
        </div>
        <div className='rounded-2xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium text-muted-foreground'>
              Usuarios Activos
            </span>
            <Users className='h-4 w-4 text-muted-foreground' />
          </div>
          <div className='text-2xl font-bold'>{topUsers.length}</div>
          <span className='text-xs text-muted-foreground'>
            Usuarios con actividad reciente
          </span>
        </div>
        <div className='rounded-2xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium text-muted-foreground'>
              Módulos Usados
            </span>
            <BarChart3 className='h-4 w-4 text-muted-foreground' />
          </div>
          <div className='text-2xl font-bold'>
            {Object.keys(summary.mostUsedModules).length}
          </div>
          <span className='text-xs text-muted-foreground'>
            Diferentes módulos utilizados
          </span>
        </div>
      </div>

      {/* Módulos más utilizados */}
      <div className='rounded-2xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900/80'>
        <div className='p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <TrendingUp className='h-5 w-5 opacity-70' />
            <span className='font-semibold text-sm'>
              Módulos Más Utilizados
            </span>
          </div>
          <div className='space-y-2'>
            {Object.entries(summary.mostUsedModules)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([module, count]) => (
                <div
                  key={module}
                  className='flex items-center justify-between p-2 rounded-lg border border-border dark:border-slate-800 bg-muted/50 dark:bg-slate-800/40'
                >
                  <Badge
                    variant='outline'
                    className={getModuleColor(module) + ' text-xs px-2 py-0.5'}
                  >
                    {module}
                  </Badge>
                  <div className='text-right'>
                    <div className='text-base font-semibold'>{count}</div>
                    <div className='text-xs text-muted-foreground'>
                      acciones
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Usuarios más activos */}
      <div className='rounded-2xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900/80'>
        <div className='p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Users className='h-5 w-5 opacity-70' />
            <span className='font-semibold text-sm'>Usuarios Más Activos</span>
          </div>
          <div className='space-y-2'>
            {topUsers.map((user, index) => (
              <div
                key={user.userId}
                className='flex items-center justify-between p-2 rounded-lg border border-border dark:border-slate-800 bg-muted/50 dark:bg-slate-800/40'
              >
                <div className='flex items-center gap-2'>
                  <div className='w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium'>
                    {index + 1}
                  </div>
                  <div>
                    <div className='font-medium text-sm'>{user.username}</div>
                    <div className='text-xs text-muted-foreground'>
                      Usuario activo
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-base font-semibold'>{user.actions}</div>
                  <div className='text-xs text-muted-foreground'>acciones</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botón de actualización */}
      <div className='flex justify-center'>
        <Button
          variant='ghost'
          size='sm'
          onClick={loadStats}
          className='rounded-full px-4'
        >
          Actualizar Estadísticas
        </Button>
      </div>
    </div>
  );
};
