import { Button } from './button';
import { Card, CardContent } from './card';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  suggestions?: string[];
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
}

export function EmptyState({
  icon,
  title,
  description,
  suggestions = [],
  primaryAction,
  secondaryAction
}: EmptyStateProps) {
  return (
    <Card className="border-dashed border-2 border-muted-foreground/25 bg-transparent shadow-none">
      <CardContent className="p-8 sm:p-12">
        <div className="flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6">
          {/* Icono */}
          <div className="text-muted-foreground/40">{icon}</div>

          {/* Textos */}
          <div className="space-y-2 max-w-md">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {description}
            </p>
          </div>

          {/* Sugerencias */}
          {suggestions.length > 0 && (
            <div className="w-full max-w-md">
              <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-left">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Sugerencias:
                </p>
                <ul className="space-y-1.5">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-primary mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Acciones */}
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              {primaryAction && (
                <Button
                  onClick={primaryAction.onClick}
                  className="w-full sm:w-auto"
                >
                  {primaryAction.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  variant="outline"
                  onClick={secondaryAction.onClick}
                  className="w-full sm:w-auto"
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
