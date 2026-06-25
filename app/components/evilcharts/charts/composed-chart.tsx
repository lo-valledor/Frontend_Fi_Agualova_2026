'use client';

import {
  Children,
  createContext,
  isValidElement,
  type ReactNode,
  useContext,
  useState
} from 'react';
import {
  CartesianGrid,
  Bar as RechartsBar,
  Brush as RechartsBrush,
  ComposedChart as RechartsComposedChart,
  Line as RechartsLine,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  ResponsiveContainer
} from 'recharts';

import {
  Background,
  type BackgroundVariant
} from '~/components/evilcharts/ui/background';
import {
  type ChartConfig,
  ChartContainer,
  resolveChartColor
} from '~/components/evilcharts/ui/chart';
import {
  Legend as EvilLegend,
  type LegendVariant
} from '~/components/evilcharts/ui/legend';
import {
  Tooltip as EvilTooltip,
  type TooltipRoundness,
  type TooltipVariant
} from '~/components/evilcharts/ui/tooltip';

type EvilComposedChartProps<TData extends Record<string, unknown>> = {
  data: TData[];
  config: ChartConfig;
  xDataKey?: keyof TData & string;
  className?: string;
  children: ReactNode;
  showBrush?: boolean;
  brushFormatLabel?: (value: unknown) => string;
};

type EvilComposedChartContextValue = {
  config: ChartConfig;
  selectedDataKey: string | null;
  setSelectedDataKey: React.Dispatch<React.SetStateAction<string | null>>;
};

const EvilComposedChartContext =
  createContext<EvilComposedChartContextValue | null>(null);

function useEvilComposedChart() {
  const context = useContext(EvilComposedChartContext);
  if (!context) {
    throw new Error(
      'Los componentes de EvilComposedChart deben usarse dentro de <EvilComposedChart />'
    );
  }

  return context;
}

export function EvilComposedChart<TData extends Record<string, unknown>>({
  data,
  config,
  xDataKey,
  className,
  children,
  showBrush = false,
  brushFormatLabel
}: EvilComposedChartProps<TData>) {
  const [selectedDataKey, setSelectedDataKey] = useState<string | null>(null);
  const xDataKeyValue = xDataKey;

  return (
    <EvilComposedChartContext.Provider
      value={{
        config,
        selectedDataKey,
        setSelectedDataKey
      }}
    >
      <ChartContainer config={config} className={className}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsComposedChart data={data}>
            {children}
            {showBrush && xDataKeyValue ? (
              <RechartsBrush
                dataKey={xDataKeyValue}
                height={28}
                travellerWidth={12}
                tickFormatter={brushFormatLabel}
                fill="var(--card)"
                stroke="var(--border)"
                className="[&_text]:fill-foreground/80 [&_.recharts-brush-slide]:fill-primary/30 [&_.recharts-brush-slide]:stroke-primary/60 [&_.recharts-brush-slide]:stroke-1 [&_.recharts-brush-traveller_rect]:fill-primary [&_.recharts-brush-traveller_rect]:stroke-border [&_.recharts-brush-traveller_rect]:stroke-1 [&_.recharts-brush-traveller_line]:stroke-primary-foreground [&_.recharts-brush-traveller_line]:stroke-[1.5] [&_.recharts-brush-texts]:font-medium"
              />
            ) : null}
          </RechartsComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
    </EvilComposedChartContext.Provider>
  );
}

export function Grid() {
  return <CartesianGrid vertical={false} strokeDasharray="3 3" />;
}

export { Background };

export function XAxis(props: React.ComponentProps<typeof RechartsXAxis>) {
  return <RechartsXAxis tickLine={false} axisLine={false} {...props} />;
}

export function YAxis(props: React.ComponentProps<typeof RechartsYAxis>) {
  return <RechartsYAxis axisLine={false} tickLine={false} {...props} />;
}

export function Tooltip(
  props: Omit<React.ComponentProps<typeof EvilTooltip>, 'chartConfig'>
) {
  const { config, selectedDataKey } = useEvilComposedChart();
  return (
    <EvilTooltip chartConfig={config} selected={selectedDataKey} {...props} />
  );
}

export function Legend(
  props: Omit<React.ComponentProps<typeof EvilLegend>, 'chartConfig'>
) {
  const { config, selectedDataKey, setSelectedDataKey } =
    useEvilComposedChart();
  return (
    <EvilLegend
      chartConfig={config}
      selected={selectedDataKey}
      onSelectChange={setSelectedDataKey}
      {...props}
    />
  );
}

export function Bar(
  props: React.ComponentProps<typeof RechartsBar> & {
    isClickable?: boolean;
  }
) {
  const { config, selectedDataKey, setSelectedDataKey } =
    useEvilComposedChart();
  const dataKey = typeof props.dataKey === 'string' ? props.dataKey : undefined;
  const isSelected = selectedDataKey === null || selectedDataKey === dataKey;

  return (
    <RechartsBar
      radius={[4, 4, 0, 0]}
      fill={
        props.fill ?? resolveChartColor(dataKey ? config[dataKey] : undefined)
      }
      fillOpacity={isSelected ? 1 : 0.3}
      onClick={() => {
        if (!props.isClickable || !dataKey) return;
        setSelectedDataKey(current => (current === dataKey ? null : dataKey));
      }}
      cursor={props.isClickable ? 'pointer' : props.cursor}
      {...props}
    />
  );
}

export function Line(
  props: React.ComponentProps<typeof RechartsLine> & {
    isClickable?: boolean;
    children?: ReactNode;
  }
) {
  const { config, selectedDataKey, setSelectedDataKey } =
    useEvilComposedChart();
  const dataKey = typeof props.dataKey === 'string' ? props.dataKey : undefined;
  const isSelected = selectedDataKey === null || selectedDataKey === dataKey;
  const { dot, activeDot, children } = resolveLineDecorators(props.children);

  return (
    <RechartsLine
      dot={props.dot ?? dot}
      activeDot={props.activeDot ?? activeDot}
      strokeWidth={2}
      stroke={
        props.stroke ?? resolveChartColor(dataKey ? config[dataKey] : undefined)
      }
      strokeOpacity={isSelected ? 1 : 0.3}
      onClick={() => {
        if (!props.isClickable || !dataKey) return;
        setSelectedDataKey(current => (current === dataKey ? null : dataKey));
      }}
      cursor={props.isClickable ? 'pointer' : props.cursor}
      {...props}
    >
      {children}
    </RechartsLine>
  );
}

export type {
  BackgroundVariant,
  LegendVariant,
  TooltipRoundness,
  TooltipVariant
};

type DotVariant = 'default' | 'colored-border';

export function Dot({ variant = 'default' }: { variant?: DotVariant }) {
  return null;
}

Dot.displayName = 'EvilChartDot';

export function ActiveDot({ variant = 'default' }: { variant?: DotVariant }) {
  return null;
}

ActiveDot.displayName = 'EvilChartActiveDot';

function resolveLineDecorators(children: ReactNode) {
  let dot: React.ComponentProps<typeof RechartsLine>['dot'] = { r: 3 };
  let activeDot: React.ComponentProps<typeof RechartsLine>['activeDot'] = {
    r: 5
  };

  Children.forEach(children, child => {
    if (!isValidElement<{ variant?: DotVariant }>(child)) return;

    const variant = child.props.variant ?? 'default';

    if (child.type === Dot) {
      dot =
        variant === 'colored-border'
          ? {
              r: 3,
              fill: 'var(--background)',
              strokeWidth: 2
            }
          : { r: 3 };
    }

    if (child.type === ActiveDot) {
      activeDot =
        variant === 'colored-border'
          ? {
              r: 5,
              fill: 'var(--background)',
              strokeWidth: 2
            }
          : { r: 5 };
    }
  });

  return { dot, activeDot, children: null };
}
