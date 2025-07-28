import {
  Activity,
  Clock,
  FileText,
  Package,
  Settings,
  User,
  Users,
} from 'lucide-react';

import React, { useEffect, useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { useActivityTracker } from '~/hooks/useActivityTracker';
import type { UserActivity } from '~/services/activityTracker';

const getModuleIcon = (module: string) => {
  switch (module.toLowerCase()) {
    case 'contratos':
      return <FileText className='h-4 w-4' />;
    case 'clientes':
      return <Users className='h-4 w-4' />;
    case 'medidores':
      return <Package className='h-4 w-4' />;
    case 'configuración':
    case 'settings':
      return <Settings className='h-4 w-4' />;
    default:
      return <Activity className='h-4 w-4' />;
  }
};

const getActionColor = (action: string): string => {
  const actionLower = action.toLowerCase();
  if (
    actionLower.includes('crear') ||
    actionLower.includes('nuevo') ||
    actionLower.includes('agregar')
  ) {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  if (
    actionLower.includes('editar') ||
    actionLower.includes('modificar') ||
    actionLower.includes('actualizar')
  ) {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  if (
    actionLower.includes('eliminar') ||
    actionLower.includes('borrar') ||
    actionLower.includes('anular')
  ) {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  if (
    actionLower.includes('ver') ||
    actionLower.includes('consultar') ||
    actionLower.includes('buscar')
  ) {
    return 'bg-gray-100 text-gray-800 border-gray-200';
  }
  return 'bg-purple-100 text-purple-800 border-purple-200';
};

const formatTimestamp = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Hace un momento';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours} h`;
  if (days < 7) return `Hace ${days} días`;

  return new Date(timestamp).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface RecentActivityProps {
  limit?: number;
  showUserInfo?: boolean;
  refreshInterval?: number; // en milisegundos
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  limit = 10,
  showUserInfo = true,
  refreshInterval = 30000, // 30 segundos
}) => {
  const { getRecentActivities, getActivitySummary } = useActivityTracker();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadActivities = () => {
    try {
      const recentActivities = getRecentActivities(24); // Últimas 24 horas
      setActivities(recentActivities.slice(0, limit));
      setSummary(getActivitySummary());
    } catch (error) {
      console.error('Error al cargar actividades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();

    // Actualizar cada cierto tiempo
    const interval = setInterval(loadActivities, refreshInterval);

    return () => clearInterval(interval);
  }, [limit, refreshInterval]);

  const exportData = () => {
    const { exportActivities } = useActivityTracker();
    const data = exportActivities();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `actividad_usuarios_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className='rounded-2xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4'>
        <div className='flex items-center gap-2 mb-4'>
          <Activity className='h-5 w-5 opacity-70' />
          <span className='font-semibold text-sm'>Actividad Reciente</span>
        </div>
        <div className='space-y-3'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='flex items-center space-x-3 animate-pulse'>
              <div className='w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full'></div>
              <div className='flex-1 space-y-2'>
                <div className='h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4'></div>
                <div className='h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-2xl border border-border dark:border-slate-800 bg-white dark:bg-slate-900/80'>
      <div className='p-4'>
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-2'>
            <Activity className='h-5 w-5 opacity-70' />
            <span className='font-semibold text-sm'>Actividad Reciente</span>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={exportData}
            className='rounded-full px-3'
          >
            Exportar
          </Button>
        </div>
        <div className='text-xs text-muted-foreground mb-4'>
          Últimas actividades de los usuarios en las últimas 24 horas
        </div>
        {summary && (
          <div className='mb-4 p-3 bg-muted/50 dark:bg-slate-800/40 rounded-lg'>
            <div className='grid grid-cols-2 gap-4 text-xs'>
              <div>
                <span className='font-medium'>Total acciones:</span>{' '}
                {summary.totalActions}
              </div>
              <div>
                <span className='font-medium'>Última actividad:</span>{' '}
                {summary.lastActivity
                  ? formatTimestamp(summary.lastActivity)
                  : 'N/A'}
              </div>
            </div>
          </div>
        )}

        {activities.length === 0 ? (
          <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
            <Activity className='h-12 w-12 mx-auto mb-3 opacity-50' />
            <p>No hay actividad reciente</p>
          </div>
        ) : (
          <div className='space-y-2'>
            {activities.map(activity => (
              <div
                key={activity.id}
                className='flex items-start space-x-3 p-2 rounded-lg border border-border dark:border-slate-800 bg-muted/50 dark:bg-slate-800/40 hover:bg-muted transition-colors'
              >
                <div className='flex-shrink-0'>
                  <div className='w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center'>
                    {getModuleIcon(activity.module)}
                  </div>
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <Badge
                        variant='outline'
                        className={
                          getActionColor(activity.action) +
                          ' text-xs px-2 py-0.5'
                        }
                      >
                        {activity.action}
                      </Badge>
                      <span className='text-xs font-medium text-gray-900 dark:text-gray-100'>
                        {activity.module}
                      </span>
                    </div>
                    <div className='flex items-center text-xs text-gray-500 dark:text-gray-400'>
                      <Clock className='h-3 w-3 mr-1' />
                      {formatTimestamp(activity.timestamp)}
                    </div>
                  </div>

                  {showUserInfo && (
                    <div className='flex items-center mt-1 text-xs text-gray-600 dark:text-gray-300'>
                      <User className='h-3 w-3 mr-1' />
                      {activity.username}
                    </div>
                  )}

                  {activity.details && (
                    <p className='text-xs text-gray-600 dark:text-gray-300 mt-1 truncate'>
                      {activity.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activities.length > 0 && (
          <div className='mt-4 pt-4 border-t border-border dark:border-slate-800'>
            <Button
              variant='ghost'
              size='sm'
              className='w-full rounded-full'
              onClick={loadActivities}
            >
              Actualizar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
