'use client';

import type React from 'react';

import {
  type ChartConfig as BaseChartConfig,
  ChartContainer as BaseChartContainer
} from '~/components/ui/chart';

type EvilChartConfigItem = {
  label?: React.ReactNode;
  icon?: React.ComponentType;
  colors: {
    light: string[];
    dark: string[];
  };
};

export type ChartConfig = Record<string, EvilChartConfigItem>;

export function ChartContainer({
  config,
  ...props
}: React.ComponentProps<typeof BaseChartContainer> & {
  config: ChartConfig;
}) {
  return <BaseChartContainer {...props} config={toBaseChartConfig(config)} />;
}

export function resolveChartColor(config?: ChartConfig[string]) {
  if (!config) return 'var(--muted-foreground)';

  return (
    config.colors.light[0] ?? config.colors.dark[0] ?? 'var(--muted-foreground)'
  );
}

function toBaseChartConfig(config: ChartConfig): BaseChartConfig {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => [
      key,
      {
        label: value.label,
        icon: value.icon,
        theme: {
          light: value.colors.light[0] ?? value.colors.dark[0] ?? '#64748b',
          dark: value.colors.dark[0] ?? value.colors.light[0] ?? '#94a3b8'
        }
      }
    ])
  );
}
