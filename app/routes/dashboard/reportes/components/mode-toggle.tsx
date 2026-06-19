import { Moon, Sun } from 'lucide-react';
import { AnimatePresence, motion, type Variants } from 'motion/react';

import { useTheme } from '~/components/theme-provider';
import { Button } from '~/components/ui/button';

const iconVariants: Variants = {
  initial: { y: -10, opacity: 0, rotate: -90 },
  animate: {
    y: 0,
    opacity: 1,
    rotate: 0,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }
  },
  exit: {
    y: 10,
    opacity: 0,
    rotate: 90,
    transition: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }
  }
};

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Alternar modo claro/oscuro"
      className="relative overflow-hidden rounded-md h-7 w-7 hover:bg-accent/60 transition-colors duration-150"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'light' ? (
          <motion.div
            key="sun"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Sun className="h-3.5 w-3.5 text-energy" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Moon className="h-3.5 w-3.5 text-chart-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
