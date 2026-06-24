'use client';

import * as React from 'react';
import type { DefaultLegendContentProps } from 'recharts';
import { Legend as RechartsLegend } from 'recharts';

import {
  type ChartConfig,
  resolveChartColor
} from '~/components/evilcharts/ui/chart';
import { cn } from '~/lib/utils';

export type LegendVariant =
  | 'square'
  | 'circle'
  | 'circle-outline'
  | 'rounded-square'
  | 'rounded-square-outline'
  | 'vertical-bar'
  | 'horizontal-bar';

type LegendProps = React.ComponentProps<typeof RechartsLegend> & {
  chartConfig: ChartConfig;
  variant?: LegendVariant;
  hideIcon?: boolean;
  isClickable?: boolean;
  selected?: string | null;
  onSelectChange?: (selected: string | null) => void;
  align?: 'left' | 'center' | 'right';
};

export function Legend({
  chartConfig,
  variant = 'rounded-square',
  hideIcon = false,
  isClickable = false,
  selected = null,
  onSelectChange,
  align = 'right',
  ...props
}: LegendProps) {
  return (
    <RechartsLegend
      {...props}
      content={legendProps => (
        <LegendContent
          {...legendProps}
          chartConfig={chartConfig}
          variant={variant}
          hideIcon={hideIcon}
          isClickable={isClickable}
          selected={selected}
          onSelectChange={onSelectChange}
          align={align}
        />
      )}
    />
  );
}

type LegendContentProps = DefaultLegendContentProps & {
  chartConfig: ChartConfig;
  variant: LegendVariant;
  hideIcon: boolean;
  isClickable: boolean;
  selected: string | null;
  onSelectChange?: (selected: string | null) => void;
  align: 'left' | 'center' | 'right';
};

function LegendContent({
  chartConfig,
  payload,
  verticalAlign,
  variant,
  hideIcon,
  isClickable,
  selected,
  onSelectChange,
  align
}: LegendContentProps) {
  if (!payload?.length) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-4 select-none text-xs',
        align === 'left' && 'justify-start',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end',
        verticalAlign === 'top' ? 'pb-4' : 'pt-4'
      )}
    >
      {payload
        .filter(item => item.type !== 'none')
        .map(item => {
          const key = String(item.dataKey ?? item.value ?? 'value');
          const itemConfig = chartConfig[key];
          const color = resolveColor(itemConfig);
          const isSelected = selected === null || selected === key;

          return (
            <button
              key={key}
              type="button"
              className={cn(
                'flex items-center gap-1.5 transition-opacity',
                !isSelected && 'opacity-30',
                !isClickable && 'cursor-default',
                isClickable && 'cursor-pointer'
              )}
              onClick={() => {
                if (!isClickable) return;
                onSelectChange?.(selected === key ? null : key);
              }}
            >
              {!hideIcon && <LegendIndicator variant={variant} color={color} />}
              <span>{itemConfig?.label ?? item.value}</span>
            </button>
          );
        })}
    </div>
  );
}

function LegendIndicator({
  variant,
  color
}: {
  variant: LegendVariant;
  color: string;
}) {
  switch (variant) {
    case 'square':
      return (
        <div className="h-2 w-2 shrink-0" style={{ backgroundColor: color }} />
      );
    case 'circle':
      return (
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      );
    case 'circle-outline':
      return (
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-full border"
          style={{ borderColor: color }}
        />
      );
    case 'vertical-bar':
      return (
        <div
          className="h-3 w-1 shrink-0 rounded-[2px]"
          style={{ backgroundColor: color }}
        />
      );
    case 'horizontal-bar':
      return (
        <div
          className="h-1 w-3 shrink-0 rounded-[2px]"
          style={{ backgroundColor: color }}
        />
      );
    case 'rounded-square-outline':
      return (
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-[3px] border"
          style={{ borderColor: color }}
        />
      );
    case 'rounded-square':
    default:
      return (
        <div
          className="h-2 w-2 shrink-0 rounded-[2px]"
          style={{ backgroundColor: color }}
        />
      );
  }
}

function resolveColor(config?: ChartConfig[string]) {
  return resolveChartColor(config);
}
