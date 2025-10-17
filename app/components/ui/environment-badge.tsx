/**
 * EnvironmentBadge Component
 *
 * Displays a fixed badge indicating the current environment (DEV/PROD)
 * Only visible in development environment
 */

export function EnvironmentBadge() {
  const envMode = import.meta.env.VITE_ENV_MODE || 'production';

  // Only show badge in development
  if (envMode !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-lg font-bold text-sm border-2 border-primary/20 backdrop-blur-sm">
        DEV
      </div>
    </div>
  );
}
