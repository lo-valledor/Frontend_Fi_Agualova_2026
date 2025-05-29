import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { InfoIcon } from "lucide-react";
import { cn } from "~/lib/utils";

export default function DialogInformacion() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/40"
        >
          <InfoIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <InfoIcon className="h-5 w-5" />
            Información del Periodo de Facturación
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="space-y-4 py-4">
          {[
            "Selecciona un mes y año para gestionar el periodo de facturación.",
            'Para abrir un nuevo periodo, haz clic en "Abrir Periodo".',
            "Para cerrar un periodo, utiliza la acción correspondiente en la tabla.",
            "Los periodos cerrados no pueden ser reabiertos sin autorización.",
          ].map((text, index) => (
            <div key={index} className="flex gap-3 items-start">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                )}
              >
                {index + 1}
              </span>
              <p className="text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </DialogDescription>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Entendido
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
