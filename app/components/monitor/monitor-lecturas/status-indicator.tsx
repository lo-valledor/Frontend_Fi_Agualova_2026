import { motion } from 'motion/react';

import type { MeterStatusInfo } from '~/utils/monitor/monitor-status';

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4'
};

interface StatusIndicatorProps {
  status: MeterStatusInfo;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusIndicator({ status, size = 'md' }: StatusIndicatorProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`rounded-full ${status.bgColor} ${SIZE_CLASSES[size]} shrink-0`}
    />
  );
}
