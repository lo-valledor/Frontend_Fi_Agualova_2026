import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function Zonas() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-center items-center h-[70vh]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              Abrir Menú <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            sideOffset={4}
            align="center"
            className="w-56 p-0"
          >
            <DropdownMenuLabel className="px-2 py-1.5">
              Mi Cuenta
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="m-0" />
            <DropdownMenuItem className="px-2 py-1.5 cursor-pointer">
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="px-2 py-1.5 cursor-pointer">
              Facturación
            </DropdownMenuItem>
            <DropdownMenuItem className="px-2 py-1.5 cursor-pointer">
              Equipo
            </DropdownMenuItem>
            <DropdownMenuItem className="px-2 py-1.5 cursor-pointer">
              Suscripción
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
