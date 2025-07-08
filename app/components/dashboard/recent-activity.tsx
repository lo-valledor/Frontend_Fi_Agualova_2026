import React, { useEffect, useState } from 'react';
import { Activity, Clock, User, FileText, Settings, Users, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { useActivityTracker } from '~/hooks/useActivityTracker';
import type { UserActivity } from '~/services/activityTracker';

const getModuleIcon = (module: string) => {
  switch (module.toLowerCase()) {
    case 'contratos':
      return <FileText className="h-4 w-4" />;
    case 'clientes':
      return <Users className="h-4 w-4" />;
    case 'medidores':
      return <Package className="h-4 w-4" />;
    case 'configuración':
    case 'settings':
      return <Settings className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getActionColor = (action: string): string => {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('crear') || actionLower.includes('nuevo') || actionLower.includes('agregar')) {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  if (actionLower.includes('editar') || actionLower.includes('modificar') || actionLower.includes('actualizar')) {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  if (actionLower.includes('eliminar') || actionLower.includes('borrar') || actionLower.includes('anular')) {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  if (actionLower.includes('ver') || actionLower.includes('consultar') || actionLower.includes('buscar')) {
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
    minute: '2-digit'
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
  refreshInterval = 30000 // 30 segundos
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Últimas actividades de los usuarios en las últimas 24 horas
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportData}>
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {summary && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Total acciones:</span> {summary.totalActions}
              </div>
              <div>
                <span className="font-medium">Última actividad:</span> {summary.lastActivity ? formatTimestamp(summary.lastActivity) : 'N/A'}
              </div>
            </div>
          </div>
        )}

        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay actividad reciente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    {getModuleIcon(activity.module)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getActionColor(activity.action)}>
                        {activity.action}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900">
                        {activity.module}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimestamp(activity.timestamp)}
                    </div>
                  </div>

                  {showUserInfo && (
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <User className="h-3 w-3 mr-1" />
                      {activity.username}
                    </div>
                  )}

                  {activity.details && (
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {activity.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activities.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="ghost" size="sm" className="w-full" onClick={loadActivities}>
              Actualizar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
