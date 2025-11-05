/**
 * Componente de indicador de fortaleza de contraseña
 * Muestra visualmente qué tan segura es una contraseña
 */

import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { motion } from 'motion/react';

import { Alert, AlertDescription } from '~/components/ui/alert';
import {
  calculatePasswordStrength,
  PASSWORD_RULES,
  validatePassword
} from '~/utils/password-validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRules?: boolean;
  showWarnings?: boolean;
}

export function PasswordStrengthIndicator({
  password,
  showRules = true,
  showWarnings = true
}: PasswordStrengthIndicatorProps) {
  const strength = calculatePasswordStrength(password);
  const validation = validatePassword(password);

  if (!password) {
    return null;
  }

  return (
    <div className='space-y-3'>
      {/* Barra de progreso de fortaleza */}
      <div className='space-y-1.5'>
        <div className='flex items-center justify-between text-xs'>
          <span className='text-muted-foreground'>
            Fortaleza de la contraseña:
          </span>
          <span
            className={`font-semibold ${getStrengthTextColor(strength.score)}`}
          >
            {strength.label}
          </span>
        </div>
        <div className='relative h-2 bg-background rounded-full overflow-hidden'>
          <motion.div
            className={`h-full ${strength.color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${strength.percentage}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Reglas de validación */}
      {showRules && (
        <div className='space-y-1.5'>
          <p className='text-xs font-medium text-muted-foreground'>
            Requisitos:
          </p>
          <div className='grid gap-1'>
            {PASSWORD_RULES.map(rule => {
              const isPassed = rule.validator(password);
              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className='flex items-center gap-2 text-xs'
                >
                  {isPassed ? (
                    <CheckCircle2 className='h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0' />
                  ) : (
                    <AlertCircle className='h-3.5 w-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0' />
                  )}
                  <span
                    className={
                      isPassed
                        ? 'text-green-700 dark:text-green-400 font-medium'
                        : 'text-muted-foreground'
                    }
                  >
                    {rule.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Advertencias */}
      {showWarnings && validation.warnings.length > 0 && (
        <Alert
          variant='default'
          className='border-amber-200 bg-amber-50 dark:bg-amber-950/30'
        >
          <Info className='h-4 w-4 text-amber-600 dark:text-amber-500' />
          <AlertDescription className='text-xs text-amber-800 dark:text-amber-300'>
            <ul className='space-y-1 mt-1'>
              {validation.warnings.map((warning, idx) => (
                <li key={idx}>• {warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function getStrengthTextColor(score: number): string {
  const colorMap: Record<number, string> = {
    0: 'text-red-600 dark:text-red-400',
    1: 'text-orange-600 dark:text-orange-400',
    2: 'text-yellow-600 dark:text-yellow-400',
    3: 'text-lime-600 dark:text-lime-400',
    4: 'text-green-600 dark:text-green-400'
  };
  return colorMap[score] || 'text-slate-600';
}
