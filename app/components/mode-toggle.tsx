import { Moon, Sun } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { useTheme } from '~/components/theme-provider';
import { Button } from '~/components/ui/button';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const iconVariants = {
    initial: { y: -20, opacity: 0, rotate: -180 },
    animate: {
      y: 0,
      opacity: 1,
      rotate: 0,
      transition: { type: 'spring', stiffness: 260, damping: 20 },
    },
    exit: {
      y: 20,
      opacity: 0,
      rotate: 180,
      transition: { duration: 0.2 },
    },
  };

  return (
    <Button
      variant='outline'
      size='icon'
      onClick={toggleTheme}
      aria-label='Alternar modo claro/oscuro'
      className='relative overflow-hidden rounded-full border-2 border-muted-foreground/20 w-12 h-12'
    >
      <AnimatePresence mode='wait' initial={false}>
        {theme === 'light' ? (
          <motion.div
            key='sun'
            variants={iconVariants}
            initial='initial'
            animate='animate'
            exit='exit'
          >
            <Sun className='h-6 w-6 text-yellow-500' />
          </motion.div>
        ) : (
          <motion.div
            key='moon'
            variants={iconVariants}
            initial='initial'
            animate='animate'
            exit='exit'
          >
            <Moon className='h-6 w-6 text-sky-400' />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
