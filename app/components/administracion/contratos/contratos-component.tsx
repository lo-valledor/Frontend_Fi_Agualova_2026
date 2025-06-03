import React, { useState, useMemo } from "react";
import type { ContratosDisponibles } from "~/types/administracion";
import { DataTable } from "../../data-table/data-table";
import { columns } from "./columns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  FileText,
  UserCheck,
  UserX,
  RefreshCw,
  SearchIcon,
  Building,
} from "lucide-react";

export default function ContratosComponent({
  contratos,
}: {
  contratos: ContratosDisponibles[];
}) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtrar contratos en tiempo real
  const filteredContratos = useMemo(() => {
    if (!searchTerm) return contratos;

    return contratos.filter((contrato) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        contrato.contratoId.toLowerCase().includes(searchLower) ||
        contrato.local.toLowerCase().includes(searchLower) ||
        contrato.clienteNombre.toLowerCase().includes(searchLower) ||
        contrato.clienteApellidos.toLowerCase().includes(searchLower) ||
        contrato.propietario.toLowerCase().includes(searchLower) ||
        contrato.empresa.toLowerCase().includes(searchLower) ||
        contrato.direccionEnvio.toLowerCase().includes(searchLower)
      );
    });
  }, [contratos, searchTerm]);

  // Estadísticas de contratos
  const contratosActivos = contratos.filter((c) => c.estadoActivo).length;
  const contratosInactivos = contratos.filter((c) => !c.estadoActivo).length;
  const totalContratos = contratos.length;

  // Tipos de contrato únicos
  const tiposContrato = [...new Set(contratos.map((c) => c.tipoContrato))]
    .length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular refresh - en una app real esto triggearía el refetch
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Encabezado con título, descripción e información */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-50">
            Gestión de Contratos
          </h1>
          <p className="text-muted-foreground">
            Administra contratos, clientes y propiedades del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800"
          >
            Total: {totalContratos} contratos
          </Badge>
        </div>
      </div>

      {/* Estadísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 rounded-lg border border-sky-200 dark:border-sky-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 dark:bg-sky-800/50 rounded-lg">
              <FileText className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-sky-700 dark:text-sky-300">
                {totalContratos}
              </div>
              <div className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                Total Contratos
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg">
              <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {contratosActivos}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Contratos Activos
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/30 dark:to-red-900/30 rounded-lg border border-rose-200 dark:border-rose-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-800/50 rounded-lg">
              <UserX className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">
                {contratosInactivos}
              </div>
              <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                Contratos Inactivos
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-800/50 rounded-lg">
              <Building className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {tiposContrato}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                Tipos de Contrato
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de contratos */}
      <Card className="shadow-sm border border-border/60">
        <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg shadow-sm">
                <FileText className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                  Lista de Contratos
                </CardTitle>
                <CardDescription className="text-sm">
                  {filteredContratos.length > 0
                    ? `${filteredContratos.length} contratos ${
                        searchTerm ? "filtrados" : "registrados"
                      } en el sistema`
                    : "No hay contratos registrados"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="gap-2 hover:bg-muted/50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {contratos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-4 text-muted-foreground">
              <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-full">
                <FileText className="h-8 w-8 text-sky-500 dark:text-sky-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  No hay contratos disponibles
                </p>
                <p className="text-sm mt-1">
                  Los contratos aparecerán aquí cuando estén disponibles
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Barra de búsqueda */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="🔍 Buscar por contrato, cliente, propietario, dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                />
                {searchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                    {filteredContratos.length} de {contratos.length}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                    <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                    {filteredContratos.length} contratos{" "}
                    {searchTerm
                      ? `encontrados de ${contratos.length} total`
                      : "disponibles"}
                  </span>
                </div>
              </div>

              <DataTable columns={columns} data={filteredContratos} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
