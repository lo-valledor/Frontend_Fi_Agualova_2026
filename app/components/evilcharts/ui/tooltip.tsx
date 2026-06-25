'use client';

import * as React from 'react';
import { Tooltip as RechartsTooltip } from 'recharts';
import type {
  NameType,
  ValueType
} from 'recharts/types/component/DefaultTooltipContent';

import {
  type ChartConfig,
  resolveChartColor
} from '~/components/evilcharts/ui/chart';
import { cn } from '~/lib/utils';

export type TooltipRoundness = 'sm' | 'md' | 'lg' | 'xl';
export type TooltipVariant = 'default' | 'frosted-glass';

type TooltipProps = React.ComponentProps<typeof RechartsTooltip> & {
  chartConfig: ChartConfig;
  indicator?: 'line' | 'dot' | 'dashed';
  hideLabel?: boolean;
  hideIndicator?: boolean;
  roundness?: TooltipRoundness;
  variant?: TooltipVariant;
  selected?: string | null;
};

const roundnessMap: Record<TooltipRoundness, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl'
};

const variantMap: Record<TooltipVariant, string> = {
  default: 'bg-background',
  'frosted-glass': 'bg-background/70 backdrop-blur-sm'
};

export function Tooltip({
  chartConfig,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  roundness = 'lg',
  variant = 'default',
  selected = null,
  ...props
}: TooltipProps) {
  return (
    <RechartsTooltip
      animationDuration={200}
      {...props}
      content={tooltipProps => (
        <TooltipContent
          {...(tooltipProps as unknown as TooltipContentProps)}
          chartConfig={chartConfig}
          indicator={indicator}
          hideLabel={hideLabel}
          hideIndicator={hideIndicator}
          roundness={roundness}
          variant={variant}
          selected={selected}
        />
      )}
    />
  );
}

type TooltipContentProps = React.ComponentProps<typeof RechartsTooltip> & {
  active?: boolean;
  payload?: Array<{
    type?: string;
    dataKey?: string | number;
    name?: string | number;
    value?: unknown;
    payload?: unknown;
  }>;
  label?: unknown;
  chartConfig: ChartConfig;
  indicator: 'line' | 'dot' | 'dashed';
  hideLabel: boolean;
  hideIndicator: boolean;
  roundness: TooltipRoundness;
  variant: TooltipVariant;
  selected?: string | null;
};

function TooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  formatter,
  chartConfig,
  indicator,
  hideLabel,
  hideIndicator,
  roundness,
  variant,
  selected
}: TooltipContentProps) {
  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) return null;

    if (labelFormatter) {
      return (
        <div className="font-medium">
          {labelFormatter(label as never, payload as never)}
        </div>
      );
    }

    return <div className="font-medium">{String(label ?? '')}</div>;
  }, [hideLabel, label, labelFormatter, payload]);

  if (!active || !payload?.length) {
    return <span className="p-4" />;
  }

  const nestLabel = payload.length === 1 && indicator !== 'dot';

  return (
    <div
      className={cn(
        'border-border/50 grid min-w-32 items-start gap-1.5 border px-2.5 py-1.5 text-xs shadow-xl',
        roundnessMap[roundness],
        variantMap[variant]
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter(item => item.type !== 'none')
          .map((item, index) => {
            const key = String(item.dataKey ?? item.name ?? 'value');
            const itemConfig = chartConfig[key];
            const color = resolveColor(itemConfig);

            return (
              <div
                key={`${key}-${index}`}
                className={cn(
                  'flex w-full flex-wrap items-stretch gap-2',
                  indicator === 'dot' && 'items-center',
                  selected != null &&
                    selected !== key &&
                    'opacity-30 transition-opacity'
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(
                    item.value as ValueType,
                    item.name as NameType,
                    item as never,
                    index,
                    item.payload as never
                  )
                ) : (
                  <>
                    {!hideIndicator && (
                      <Indicator
                        indicator={indicator}
                        color={color}
                        nestLabel={nestLabel}
                      />
                    )}
                    <div
                      className={cn(
                        'flex flex-1 justify-between gap-4 leading-none',
                        nestLabel ? 'items-end' : 'items-center'
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label ?? item.name}
                        </span>
                      </div>
                      {item.value != null && (
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {typeof item.value === 'number'
                            ? item.value.toLocaleString('es-CL')
                            : String(item.value)}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

function Indicator({
  indicator,
  color,
  nestLabel
}: {
  indicator: 'line' | 'dot' | 'dashed';
  color: string;
  nestLabel: boolean;
}) {
  return (
    <div
      className={cn('shrink-0 rounded-[2px]', {
        'h-2.5 w-2.5': indicator === 'dot',
        'w-1': indicator === 'line',
        'w-0 border-[1.5px] border-dashed bg-transparent':
          indicator === 'dashed',
        'my-0.5': nestLabel && indicator === 'dashed'
      })}
      style={
        indicator === 'dashed'
          ? { borderColor: color }
          : { backgroundColor: color }
      }
    />
  );
}

function resolveColor(config?: ChartConfig[string]) {
  return resolveChartColor(config);
}
