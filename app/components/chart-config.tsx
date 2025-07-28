import { BarChart3, LayoutDashboard, Monitor } from 'lucide-react';

import { type ChartConfig } from '~/components/ui/chart';

export const chartConfig = {
  detallesMedidor: {
    label: 'Consumo por Periodo',
    icon: BarChart3,
    theme: {
      light: 'oklch(0.50 0.134 242.749)', // Sky-700
      dark: 'oklch(0.60 0.134 242.749)', // Sky-500 para modo oscuro
    },
  },
  monitor: {
    label: 'Detalles del Medidor',
    icon: Monitor,
    theme: {
      light: 'oklch(0.5 0.134 242.749)',
      dark: 'oklch(0.5 0.134 242.749)',
    },
  },
  dashboard: {
    label: 'Dashboard',
    icon: LayoutDashboard,
    theme: {
      light: 'oklch(0.5 0.134 242.749)',
      dark: 'oklch(0.5 0.134 242.749)',
    },
  },
} satisfies ChartConfig;
