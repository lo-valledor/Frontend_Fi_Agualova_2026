'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { Activity, Eye, MousePointer, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

interface Metric {
  label: string;
  value: number;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function RealTimeMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      label: 'Usuarios Online',
      value: 1234,
      change: 0,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      label: 'Páginas Vistas',
      value: 5678,
      change: 0,
      icon: Eye,
      color: 'text-green-600',
    },
    {
      label: 'Clics Totales',
      value: 890,
      change: 0,
      icon: MousePointer,
      color: 'text-purple-600',
    },
    {
      label: 'Tasa de Actividad',
      value: 67,
      change: 0,
      icon: Activity,
      color: 'text-orange-600',
    },
  ]);

  // Simular actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value: metric.value + Math.floor(Math.random() * 10) - 5,
          change: Math.floor(Math.random() * 20) - 10,
        })),
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Métricas en Tiempo Real
        </CardTitle>
        <CardDescription>Datos actualizados cada 3 segundos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
            >
              <div className={`p-2 rounded-lg bg-background ${metric.color}`}>
                <metric.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{metric.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    {metric.label === 'Tasa de Actividad'
                      ? `${metric.value}%`
                      : metric.value.toLocaleString()}
                  </span>
                  <span
                    className={`text-xs ${
                      metric.change > 0
                        ? 'text-green-600'
                        : metric.change < 0
                          ? 'text-red-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {metric.change > 0 ? '+' : ''}
                    {metric.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
