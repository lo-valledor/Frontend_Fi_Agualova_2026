import { useVirtualizer } from "@tanstack/react-virtual";
import { Eye, Save, Search, Smartphone, Table, X } from "lucide-react";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { useDebounce } from "~/hooks/shared/use-debounce";
import { rolesPermisosService } from "~/services/rolesPermisosService";
import type { Menus, PermisoRolMenu, Roles } from "~/types/roles-permisos";

interface PermisosTabComponentProps {
  roles: Roles[];
  menus: Menus[];
  permisos: PermisoRolMenu[];
  onDataChange?: () => void;
}

// Componente memoizado para evitar re-renders innecesarios
interface PermisoCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

const PermisoCheckbox = React.memo<PermisoCheckboxProps>(
  ({ checked, onCheckedChange, className }) => (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={className}
    />
  ),
);

PermisoCheckbox.displayName = "PermisoCheckbox";

// Componente auxiliar para grupo de checkboxes de permisos (reduce anidación)
interface PermisoCheckboxGroupProps {
  permiso: PermisoRolMenu | undefined;
  rolId: number;
  menuId: number;
  onTogglePermiso: (
    idRol: number,
    idMenu: number,
    tipoPermiso: string,
    valor: boolean,
  ) => void;
  layout?: "mobile" | "table";
}

const PermisoCheckboxGroup = React.memo<PermisoCheckboxGroupProps>(
  ({ permiso, rolId, menuId, onTogglePermiso, layout = "table" }) => {
    const handleToggle = (tipoPermiso: string, currentValue: boolean) => {
      onTogglePermiso(rolId, menuId, tipoPermiso, !currentValue);
    };

    if (layout === "mobile") {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div
              onClick={() =>
                handleToggle("puedeVer", permiso?.puedeVer || false)
              }
              className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20 p-2 rounded-lg transition-colors"
            >
              <PermisoCheckbox
                checked={permiso?.puedeVer || false}
                onCheckedChange={() => {}}
                className="h-4 w-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 pointer-events-none"
              />
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Ver
              </span>
            </div>
            <div
              onClick={() =>
                handleToggle("puedeCrear", permiso?.puedeCrear || false)
              }
              className="flex items-center gap-2 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/20 p-2 rounded-lg transition-colors"
            >
              <PermisoCheckbox
                checked={permiso?.puedeCrear || false}
                onCheckedChange={() => {}}
                className="h-4 w-4 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 pointer-events-none"
              />
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                Crear
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div
              onClick={() =>
                handleToggle("puedeEditar", permiso?.puedeEditar || false)
              }
              className="flex items-center gap-2 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/20 p-2 rounded-lg transition-colors"
            >
              <PermisoCheckbox
                checked={permiso?.puedeEditar || false}
                onCheckedChange={() => {}}
                className="h-4 w-4 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 pointer-events-none"
              />
              <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                Editar
              </span>
            </div>
            <div
              onClick={() =>
                handleToggle("puedeEliminar", permiso?.puedeEliminar || false)
              }
              className="flex items-center gap-2 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/20 p-2 rounded-lg transition-colors"
            >
              <PermisoCheckbox
                checked={permiso?.puedeEliminar || false}
                onCheckedChange={() => {}}
                className="h-4 w-4 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600 pointer-events-none"
              />
              <span className="text-sm text-rose-600 dark:text-rose-400 font-medium">
                Eliminar
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-4 gap-1">
        {/* Ver */}
        <div
          onClick={() => handleToggle("puedeVer", permiso?.puedeVer || false)}
          className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all
            ${
              permiso?.puedeVer
                ? "bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                : "hover:bg-blue-50 dark:hover:bg-blue-950/20"
            }`}
          title="Ver"
        >
          <PermisoCheckbox
            checked={permiso?.puedeVer || false}
            onCheckedChange={() => {}}
            className="h-5 w-5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 pointer-events-none"
          />
        </div>
        {/* Crear */}
        <div
          onClick={() =>
            handleToggle("puedeCrear", permiso?.puedeCrear || false)
          }
          className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all
            ${
              permiso?.puedeCrear
                ? "bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                : "hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
            }`}
          title="Crear"
        >
          <PermisoCheckbox
            checked={permiso?.puedeCrear || false}
            onCheckedChange={() => {}}
            className="h-5 w-5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 pointer-events-none"
          />
        </div>
        {/* Editar */}
        <div
          onClick={() =>
            handleToggle("puedeEditar", permiso?.puedeEditar || false)
          }
          className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all
            ${
              permiso?.puedeEditar
                ? "bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                : "hover:bg-amber-50 dark:hover:bg-amber-950/20"
            }`}
          title="Editar"
        >
          <PermisoCheckbox
            checked={permiso?.puedeEditar || false}
            onCheckedChange={() => {}}
            className="h-5 w-5 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 pointer-events-none"
          />
        </div>
        {/* Eliminar */}
        <div
          onClick={() =>
            handleToggle("puedeEliminar", permiso?.puedeEliminar || false)
          }
          className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all
            ${
              permiso?.puedeEliminar
                ? "bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-900/50"
                : "hover:bg-rose-50 dark:hover:bg-rose-950/20"
            }`}
          title="Eliminar"
        >
          <PermisoCheckbox
            checked={permiso?.puedeEliminar || false}
            onCheckedChange={() => {}}
            className="h-5 w-5 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600 pointer-events-none"
          />
        </div>
      </div>
    );
  },
);

PermisoCheckboxGroup.displayName = "PermisoCheckboxGroup";

// Componente MobileView extraído
interface MobileViewProps {
  filteredMenus: Menus[];
  visibleRoles: Roles[];
  getPermiso: (idRol: number, idMenu: number) => PermisoRolMenu | undefined;
  onTogglePermiso: (
    idRol: number,
    idMenu: number,
    tipoPermiso: string,
    valor: boolean,
  ) => void;
}

const MobileView = React.memo<MobileViewProps>(
  ({ filteredMenus, visibleRoles, getPermiso, onTogglePermiso }) => (
    <div className="space-y-4">
      {filteredMenus.map((menu) => (
        <Card key={menu.idMenu} className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    #{menu.idMenu}
                  </Badge>
                  <span className="font-medium text-sm">{menu.nombreMenu}</span>
                </div>
                {menu.ruta && (
                  <div className="text-xs text-slate-500 font-mono">
                    {menu.ruta}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {visibleRoles.map((rol) => {
                const permiso = getPermiso(rol.idRol, menu.idMenu);
                return (
                  <div
                    key={rol.idRol}
                    className="border border-slate-100 dark:border-slate-700 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs"
                        >
                          #{rol.idRol}
                        </Badge>
                        <span className="font-medium text-sm">
                          {rol.nombreRol}
                        </span>
                      </div>
                    </div>
                    <PermisoCheckboxGroup
                      permiso={permiso}
                      rolId={rol.idRol}
                      menuId={menu.idMenu}
                      onTogglePermiso={onTogglePermiso}
                      layout="mobile"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
);

MobileView.displayName = "MobileView";

const PermisosTabComponent: React.FC<PermisosTabComponentProps> = ({
  roles,
  menus,
  permisos,
  onDataChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "mobile">("table");
  const [compactView, setCompactView] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [_bannerCollapsed, setBannerCollapsed] = useState(false);

  // Ref para el contenedor scrollable (virtualización)
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // ✅ OPTIMIZACIÓN: Estado local de cambios pendientes
  const [pendingChanges, setPendingChanges] = useState<
    Map<string, PermisoRolMenu>
  >(new Map());

  // ✅ OPTIMIZACIÓN: Map de permisos para búsqueda O(1) en lugar de O(n)
  const permisosMap = useMemo(() => {
    const map = new Map<string, PermisoRolMenu>();
    for (const p of permisos) {
      const key = `${p.idRol}-${p.idMenu}`;
      map.set(key, p);
    }
    return map;
  }, [permisos]);

  // Función para obtener permisos de un rol y menú específico - Ahora O(1)
  // Si hay cambios pendientes, los devuelve; si no, devuelve el permiso original
  const getPermiso = useCallback(
    (idRol: number, idMenu: number) => {
      const key = `${idRol}-${idMenu}`;
      const pendingChange = pendingChanges.get(key);
      return pendingChange || permisosMap.get(key);
    },
    [permisosMap, pendingChanges],
  );

  // Filtrar menús por búsqueda
  const filteredMenus = useMemo(
    () =>
      menus.filter(
        (menu) =>
          menu.nombreMenu
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase()) ||
          menu.ruta?.toLowerCase().includes(debouncedSearch.toLowerCase()),
      ),
    [menus, debouncedSearch],
  );

  // Filtrar roles seleccionados
  const visibleRoles = useMemo(
    () =>
      selectedRoles.length > 0
        ? roles.filter((role) => selectedRoles.includes(role.idRol))
        : roles,
    [roles, selectedRoles],
  );

  // ✅ VIRTUALIZACIÓN: Solo renderizar filas visibles en el viewport
  const rowVirtualizer = useVirtualizer({
    count: filteredMenus.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => (compactView ? 50 : 70), // Altura estimada por fila
    overscan: 5, // Renderizar 5 filas extra arriba/abajo para scroll suave
  });

  // ✅ NUEVA FUNCIÓN: Actualizar permiso localmente (sin guardar en BD)
  const handleTogglePermiso = useCallback(
    (idRol: number, idMenu: number, tipoPermiso: string, valor: boolean) => {
      const key = `${idRol}-${idMenu}`;

      // Obtener el permiso ORIGINAL de la BD (no los cambios pendientes)
      const permisoOriginal = permisosMap.get(key);

      // Obtener el permiso actual (puede incluir cambios pendientes)
      const permisoActual = getPermiso(idRol, idMenu);

      // Crear el nuevo estado del permiso
      const nuevoPermiso: PermisoRolMenu = {
        idRol,
        idMenu,
        puedeVer: permisoActual?.puedeVer || false,
        puedeCrear: permisoActual?.puedeCrear || false,
        puedeEditar: permisoActual?.puedeEditar || false,
        puedeEliminar: permisoActual?.puedeEliminar || false,
        [tipoPermiso]: valor,
        fechaAsignacion: new Date().toISOString().split(".")[0],
      };

      setPendingChanges((prev) => {
        const newMap = new Map(prev);

        // Verificar si el nuevo permiso es IGUAL al original
        const esIgualAlOriginal =
          nuevoPermiso.puedeVer === (permisoOriginal?.puedeVer || false) &&
          nuevoPermiso.puedeCrear === (permisoOriginal?.puedeCrear || false) &&
          nuevoPermiso.puedeEditar ===
            (permisoOriginal?.puedeEditar || false) &&
          nuevoPermiso.puedeEliminar ===
            (permisoOriginal?.puedeEliminar || false);

        if (esIgualAlOriginal) {
          // Si volvió al estado original, QUITAR de cambios pendientes
          newMap.delete(key);
        } else {
          // Si es diferente al original, agregarlo a cambios pendientes
          newMap.set(key, nuevoPermiso);
        }

        return newMap;
      });
    },
    [getPermiso, permisosMap],
  );

  // ✅ NUEVA FUNCIÓN: Guardar todos los cambios pendientes
  const handleSaveChanges = useCallback(async () => {
    if (pendingChanges.size === 0) {
      toast.info("No hay cambios pendientes para guardar");
      return;
    }

    setIsSaving(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Procesar todos los cambios en paralelo
      const promises = Array.from(pendingChanges.values()).map(
        async (permiso) => {
          const result =
            await rolesPermisosService.asignarPermisoDirecto(permiso);
          if (result.error) {
            errorCount++;
            return { success: false, error: result.error };
          } else {
            successCount++;
            return { success: true };
          }
        },
      );

      await Promise.all(promises);

      if (errorCount === 0) {
        toast.success(`✅ ${successCount} permisos guardados exitosamente`);
        setPendingChanges(new Map()); // Limpiar cambios pendientes
        onDataChange?.(); // Recargar datos
      } else if (successCount > 0) {
        toast.warning(
          `⚠️ ${successCount} permisos guardados, ${errorCount} fallaron`,
        );
        // No limpiar pendingChanges para que el usuario pueda reintentar
      } else {
        toast.error(`❌ Error al guardar los ${errorCount} permisos`);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('guardarPermisos', error);
      toast.error("Error inesperado al guardar cambios");
    } finally {
      setIsSaving(false);
    }
  }, [pendingChanges, onDataChange]);

  const handleDiscardChanges = useCallback(() => {
    setPendingChanges(new Map());
    setBannerCollapsed(false);
    toast.info("Cambios descartados");
  }, []);

  // REFACTOR: Extraer handlers para reducir anidación
  const handleToggleRole = useCallback((roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  }, []);

  const handleToggleAllRoles = useCallback(() => {
    setSelectedRoles(
      selectedRoles.length === roles.length ? [] : roles.map((r) => r.idRol),
    );
  }, [selectedRoles.length, roles]);

  if (roles.length === 0 || menus.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-background backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <p>No hay roles o menús disponibles para configurar permisos.</p>
            <p className="text-sm mt-2">
              Primero debe crear roles y menús en las pestañas correspondientes.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-background backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-4">
          {/* Header principal */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <CardTitle className="text-base sm:text-lg">
              Matriz de Permisos
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Toggle de vista */}
              <div className="flex items-center border-border rounded-xl p-1">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="hidden sm:flex items-center gap-2 h-8 px-3"
                >
                  <Table className="h-4 w-4" />
                  Tabla
                </Button>
                <Button
                  variant={viewMode === "mobile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("mobile")}
                  className="flex items-center gap-2 h-8 px-3"
                >
                  <Smartphone className="h-4 w-4" />
                  Cards
                </Button>
              </div>

              {/* Toggle vista compacta */}
              {viewMode === "table" && (
                <Button
                  variant={compactView ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCompactView(!compactView)}
                  className="hidden md:flex items-center gap-2 h-8 px-3"
                >
                  <Eye className="h-4 w-4" />
                  Compacta
                </Button>
              )}
            </div>
          </div>

          {/* Controles de filtrado */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Búsqueda de menús */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar menús por nombre o ruta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selector de roles */}
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-sm mr-2">Roles:</span>
              {roles.slice(0, 3).map((role) => (
                <Button
                  key={role.idRol}
                  variant={
                    selectedRoles.includes(role.idRol) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleToggleRole(role.idRol)}
                  className="h-7 px-2 text-xs"
                >
                  {role.nombreRol}
                </Button>
              ))}
              {roles.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleAllRoles}
                  className="h-7 px-2 text-xs"
                >
                  {selectedRoles.length === roles.length
                    ? "Ninguno"
                    : `+${roles.length - 3} más`}
                </Button>
              )}
            </div>
          </div>

          {/* Leyenda */}
          <div className="flex flex-wrap gap-4 text-xs bg-muted/50 p-3 rounded-xl border border-border">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Ver
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-emerald-600 rounded-sm"></div>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Crear
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-amber-600 rounded-sm"></div>
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Editar
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-rose-600 rounded-sm"></div>
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                Eliminar
              </span>
            </div>
          </div>

          {/* Información de filtros activos */}
          {(searchTerm || selectedRoles.length > 0) && (
            <div className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded-xl">
              Mostrando {filteredMenus.length} menús
              {selectedRoles.length > 0 &&
                ` para ${visibleRoles.length} roles seleccionados`}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* ✅ Botón flotante (FAB) para guardar cambios */}
        {pendingChanges.size > 0 && (
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end animate-in slide-in-from-bottom-5 duration-300">
            {/* Tooltip con contador */}
            <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg animate-in fade-in zoom-in duration-200">
              {pendingChanges.size} cambio{pendingChanges.size !== 1 ? "s" : ""}{" "}
              pendiente{pendingChanges.size !== 1 ? "s" : ""}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button
                onClick={handleDiscardChanges}
                disabled={isSaving}
                size="lg"
                variant="outline"
                className="h-14 w-14 rounded-full shadow-2xl border-2 hover:scale-110 transition-transform"
                title="Descartar cambios"
              >
                <X className="h-6 w-6" />
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                size="lg"
                className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:scale-110 transition-transform relative"
                title="Guardar cambios"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent" />
                ) : (
                  <>
                    <Save className="h-6 w-6" />
                    {/* Badge con contador */}
                    <div className="absolute -top-1 -right-1 h-7 w-7 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ring-2 ring-white dark:ring-slate-900">
                      {pendingChanges.size > 99 ? "99+" : pendingChanges.size}
                    </div>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {viewMode === "mobile" ? (
          <MobileView
            filteredMenus={filteredMenus}
            visibleRoles={visibleRoles}
            getPermiso={getPermiso}
            onTogglePermiso={handleTogglePermiso}
          />
        ) : (
          <div className="relative">
            {/* Indicador de scroll */}
            <div className="absolute top-0 right-0 z-20 bg-linear-to-l from-white dark:from-slate-900 to-transparent w-8 h-full pointer-events-none opacity-50" />
            <div className="absolute top-0 left-64 z-20 bg-linear-to-r from-white dark:from-slate-900 to-transparent w-8 h-full pointer-events-none opacity-50" />

            <div
              ref={tableContainerRef}
              className="overflow-auto border rounded-xl bg-background max-h-[80vh]"
            >
              <table className="w-full border-collapse relative" style={{}}>
                <thead className="sticky top-0 bg-background z-10">
                  <tr>
                    <th
                      className="text-left p-3 border-b font-medium sticky left-0 bg-background z-20 shadow-r"
                      style={{
                        width: "280px",
                        minWidth: "280px",
                        maxWidth: "280px",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>Menú</span>
                        <Badge variant="outline" className="text-xs">
                          {filteredMenus.length}
                        </Badge>
                      </div>
                    </th>
                    {visibleRoles.map((rol) => (
                      <th
                        key={rol.idRol}
                        style={{
                          width: compactView ? "160px" : "200px",
                          minWidth: compactView ? "160px" : "200px",
                          maxWidth: compactView ? "160px" : "200px",
                        }}
                        className={`text-center border-b border-l font-medium ${
                          compactView ? "p-2" : "p-3"
                        }`}
                      >
                        <div className={`space-y-${compactView ? "1" : "2"}`}>
                          <div className="flex items-center justify-center gap-2">
                            <Badge
                              variant="secondary"
                              className="font-mono text-xs"
                              title={`ID del Rol: ${rol.idRol}`}
                            >
                              #{rol.idRol}
                            </Badge>
                            <div
                              className={`font-semibold text-sm truncate ${
                                compactView ? "max-w-[100px]" : "max-w-[120px]"
                              }`}
                              title={rol.nombreRol}
                            >
                              {rol.nombreRol}
                            </div>
                          </div>
                          {!compactView && (
                            <div className="grid grid-cols-4 gap-1 text-xs">
                              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1 rounded text-center">
                                V
                              </div>
                              <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-1 rounded text-center">
                                C
                              </div>
                              <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-1 rounded text-center">
                                E
                              </div>
                              <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 p-1 rounded text-center">
                                D
                              </div>
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    position: "relative",
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const menu = filteredMenus[virtualRow.index];
                    const rowHeight = compactView ? 50 : 70;
                    return (
                      <tr
                        key={menu.idMenu}
                        data-index={virtualRow.index}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: `${rowHeight}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                          display: "table",
                        }}
                        className="hover:muted"
                      >
                        <td
                          style={{
                            width: "280px",
                            minWidth: "280px",
                            maxWidth: "280px",
                          }}
                          className={`border-b font-medium sticky left-0 bg-background z-10 shadow-r ${
                            compactView ? "p-2" : "p-3"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="font-mono text-xs"
                              >
                                #{menu.idMenu}
                              </Badge>
                              <div
                                className={`font-medium truncate ${
                                  compactView ? "max-w-40" : "max-w-45"
                                }`}
                                title={menu.nombreMenu}
                              >
                                {menu.nombreMenu}
                              </div>
                            </div>
                            {menu.ruta && (
                              <div
                                className={`text-xs text-slate-500 font-mono truncate ${
                                  compactView
                                    ? "max-w-[180px]"
                                    : "max-w-[200px]"
                                }`}
                                title={menu.ruta}
                              >
                                {menu.ruta}
                              </div>
                            )}
                          </div>
                        </td>
                        {visibleRoles.map((rol) => {
                          const permiso = getPermiso(rol.idRol, menu.idMenu);
                          return (
                            <td
                              key={`${rol.idRol}-${menu.idMenu}`}
                              style={{
                                width: compactView ? "160px" : "200px",
                                minWidth: compactView ? "160px" : "200px",
                                maxWidth: compactView ? "160px" : "200px",
                              }}
                              className={`border-b border-l ${compactView ? "p-1" : "p-3"}`}
                            >
                              <PermisoCheckboxGroup
                                permiso={permiso}
                                rolId={rol.idRol}
                                menuId={menu.idMenu}
                                onTogglePermiso={handleTogglePermiso}
                                layout="table"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PermisosTabComponent;
