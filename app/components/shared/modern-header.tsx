interface ModernHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
}

export function ModernHeader({
  title,
  description,
  actions,
  className = ''
}: Readonly<ModernHeaderProps>) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-4 sm:pb-3 border-b border-slate-200/60 dark:border-slate-700/60 ${className}`}
    >
      <div className='min-w-0 flex-1'>
        <h1 className='text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 dark:text-slate-100 truncate'>
          {title}
        </h1>
        <p className='text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed'>
          {description}
        </p>
      </div>
      {actions && (
        <div className='flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2 lg:gap-3 shrink-0'>
          {actions}
        </div>
      )}
    </div>
  );
}
