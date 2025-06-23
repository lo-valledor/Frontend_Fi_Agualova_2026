import * as React from 'react';
import {
  format,
  parseISO,
  isValid,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface DatePickerProps {
  date?: Date | string;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  setDate,
  placeholder = 'Seleccionar fecha',
  className = '',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Convertir string a Date si es necesario y validar
  const dateValue = React.useMemo(() => {
    if (!date) return undefined;
    if (date instanceof Date) return isValid(date) ? date : undefined;

    try {
      let parsedDate = parseISO(date);
      if (!isValid(parsedDate)) {
        const [day, month, year] = date.split('-');
        if (day && month && year) {
          const isoDate = `${year}-${month}-${day}`;
          parsedDate = parseISO(isoDate);
        }
      }
      return isValid(parsedDate) ? parsedDate : undefined;
    } catch (error) {
      console.error('Error al parsear la fecha:', error);
      return undefined;
    }
  }, [date]);

  // Cerrar al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Obtener días del mes
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Obtener días de la semana para el header
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Calcular offset para el primer día del mes
  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startDayOfWeek).fill(null);

  const handleDateSelect = (selectedDate: Date) => {
    setDate(selectedDate);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate(undefined);
  };

  const previousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200 flex items-center justify-between"
      >
        <div className="flex items-center">
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span
            className={
              dateValue
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-500 dark:text-gray-400'
            }
          >
            {dateValue && isValid(dateValue)
              ? format(dateValue, 'dd-MM-yyyy')
              : placeholder}
          </span>
        </div>
        {dateValue && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[280px]"
          style={{
            left: 0,
            top: '100%',
          }}
        >
          {/* Header con navegación */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={previousMonth}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h2>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendario de días */}
          <div className="grid grid-cols-7 gap-1">
            {/* Días vacíos para el offset */}
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="p-2" />
            ))}

            {/* Días del mes */}
            {days.map((day) => {
              const isSelected = dateValue && isSameDay(day, dateValue);
              const isTodayDate = isToday(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`
                    p-2 text-sm rounded-md transition-colors duration-150 relative
                    ${
                      isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : isCurrentMonth
                          ? 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                          : 'text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                    ${
                      isTodayDate && !isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                        : ''
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                  `}
                >
                  {format(day, 'd')}
                  {isTodayDate && !isSelected && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer con botón limpiar */}
          {dateValue && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setDate(undefined);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
              >
                Limpiar selección
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
