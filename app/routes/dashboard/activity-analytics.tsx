import React from 'react';
import { RecentActivity } from '~/components/dashboard/recent-activity';
import { ActivityStats } from '~/components/dashboard/activity-stats';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Activity, BarChart3, Clock, Users } from 'lucide-react';

export default function ActivityAnalyticsPage() {
  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
          Análisis de Actividad
        </h1>
        <p className="text-muted-foreground">
          Monitorea y analiza la actividad de los usuarios en el sistema
        </p>
      </div>

      {/* Tabs de navegación */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Actividad Reciente
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ActivityStats refreshInterval={30000} />
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivity
              limit={15}
              showUserInfo={true}
              refreshInterval={15000}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Información del Sistema
                </CardTitle>
                <CardDescription>
                  Detalles sobre el rastreo de actividad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div>
                      <div className="font-medium">Almacenamiento Local</div>
                      <div className="text-sm text-muted-foreground">
                        Los datos se almacenan en el navegador
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Seguro</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div>
                      <div className="font-medium">
                        Actualización Automática
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Se actualiza cada 30 segundos
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">En tiempo real</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <div>
                      <div className="font-medium">Retención de Datos</div>
                      <div className="text-sm text-muted-foreground">
                        Se mantienen las últimas 1000 actividades
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">30 días</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">
                    Tipos de Actividad Rastreados:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
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

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Análisis por Usuario
              </CardTitle>
              <CardDescription>
                Estadísticas detalladas de actividad por usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Esta funcionalidad estará disponible próximamente</p>
                <p className="text-sm mt-2">
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
