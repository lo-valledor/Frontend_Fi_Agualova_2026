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
  className = '',
}: Readonly<ModernHeaderProps>) {
  return (
    <div
      className={`flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60 ${className}`}
    >
      <div>
        <h1 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
          {title}
        </h1>
        <p className='text-sm text-slate-600 dark:text-slate-400'>
          {description}
        </p>
      </div>
      {actions && <div className='flex items-center gap-2'>{actions}</div>}
    </div>
  );
}
