import { Moon, Sun } from "lucide-react";
import { Switch } from "~/components/ui/switch";
import { useTheme } from "~/components/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Sun
        className={`h-5 w-5 ${
          theme === "light" ? "text-yellow-400" : "text-muted-foreground"
        }`}
      />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Alternar modo oscuro"
      />
      <Moon
        className={`h-5 w-5 ${
          theme === "dark" ? "text-sky-400" : "text-muted-foreground"
        }`}
      />
    </div>
  );
}
