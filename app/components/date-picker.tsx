import * as React from "react";
import { format, parseISO, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export function DatePicker({
  date,
  setDate,
}: {
  date?: Date | string;
  setDate: (date: Date | undefined) => void;
}) {
  // Convertir string a Date si es necesario y validar
  const dateValue = React.useMemo(() => {
    if (!date) {
      return undefined;
    }
    if (date instanceof Date) {
      return isValid(date) ? date : undefined;
    }
    try {
      // Primero intentar parsear directamente
      let parsedDate = parseISO(date);

      // Si no es válido, intentar convertir de DD-MM-YYYY a YYYY-MM-DD
      if (!isValid(parsedDate)) {
        const [day, month, year] = date.split("-");
        if (day && month && year) {
          const isoDate = `${year}-${month}-${day}`;
          parsedDate = parseISO(isoDate);
        }
      }

      return isValid(parsedDate) ? parsedDate : undefined;
    } catch (error) {
      console.error("Error al parsear la fecha:", error);
      return undefined;
    }
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full px-3 py-2 justify-start text-left font-normal",
            !dateValue && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue && isValid(dateValue) ? (
            format(dateValue, "dd-MM-yyyy")
          ) : (
            <span>Seleccionar fecha</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
