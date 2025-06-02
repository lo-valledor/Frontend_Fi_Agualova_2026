import { Moon, Sun } from "lucide-react";
import { Switch } from "~/components/ui/switch";
import { useTheme } from "~/components/theme-provider";
import { motion, AnimatePresence } from "motion/react";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-full bg-muted/60 border border-muted-foreground/10 shadow-sm"
      tabIndex={0}
      aria-label="Alternar modo claro/oscuro"
    >
      <motion.div
        key="sun"
        animate={{
          scale: theme === "light" ? 1.2 : 1,
          rotate: theme === "light" ? 15 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Sun
          className={`h-5 w-5 transition-colors duration-300 ${
            theme === "light" ? "text-yellow-400" : "text-muted-foreground"
          }`}
        />
      </motion.div>
      <Switch
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label={
          theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
        }
        className="focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
      />
      <motion.div
        key="moon"
        animate={{
          scale: theme === "dark" ? 1.2 : 1,
          rotate: theme === "dark" ? -15 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Moon
          className={`h-5 w-5 transition-colors duration-300 ${
            theme === "dark" ? "text-sky-400" : "text-muted-foreground"
          }`}
        />
      </motion.div>
    </div>
  );
}
