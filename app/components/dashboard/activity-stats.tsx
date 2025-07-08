import React, { useEffect, useState } from 'react';
import { Activity, Users, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { useActivityTracker } from '~/hooks/useActivityTracker';
import type { ActivitySummary } from '~/services/activityTracker';

interface ActivityStatsProps {
  refreshInterval?: number;
}

export const ActivityStats: React.FC<ActivityStatsProps> = ({
  refreshInterval = 60000 // 1 minuto
}) => {
  const { getActivitySummary  } = useActivityTracker();
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [topUsers, setTopUsers] = useState<Array<{ userId: string; username: string; actions: number }>>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = () => {
    try {
      const activitySummary = getActivitySummary();
      setSummary(activitySummary);

      // Obtener usuarios más activos
      const allActivities = activitySummary.recentActions;
      const userStats: { [key: string]: { username: string; actions: number } } = {};

      allActivities.forEach(activity => {
        if (!userStats[activity.userId]) {
          userStats[activity.userId] = {
            username: activity.username,
            actions: 0
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
      'clientes': 'bg-blue-100 text-blue-800 border-blue-200',
      'contratos': 'bg-green-100 text-green-800 border-green-200',
      'medidores': 'bg-purple-100 text-purple-800 border-purple-200',
      'navegación': 'bg-gray-100 text-gray-800 border-gray-200',
      'formulario': 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[module.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-gray-500">No hay datos de actividad disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Acciones</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalActions}</div>
            <p className="text-xs text-muted-foreground">
              Todas las actividades registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Actividad</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {summary.lastActivity ? formatTimeAgo(summary.lastActivity) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Actividad más reciente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios con actividad reciente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Módulos Usados</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(summary.mostUsedModules).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Diferentes módulos utilizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Módulos más utilizados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Módulos Más Utilizados
          </CardTitle>
          <CardDescription>
            Módulos con mayor actividad en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(summary.mostUsedModules)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([module, count]) => (
                <div key={module} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className={getModuleColor(module)}>
                      {module}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{count}</div>
                    <div className="text-xs text-muted-foreground">acciones</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Usuarios más activos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios Más Activos
          </CardTitle>
          <CardDescription>
            Usuarios con mayor actividad en las últimas 24 horas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-xs text-muted-foreground">Usuario activo</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{user.actions}</div>
                  <div className="text-xs text-muted-foreground">acciones</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botón de actualización */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={loadStats}>
          Actualizar Estadísticas
        </Button>
      </div>
    </div>
  );
};
