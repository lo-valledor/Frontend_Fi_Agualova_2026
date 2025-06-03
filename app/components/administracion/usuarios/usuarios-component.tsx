import React, { useEffect, useState } from "react";
import { useAdministracion } from "~/hooks/use-administracion";
import { DataTable } from "~/components/data-table/data-table";
import { createColumns } from "./columns";
import { UsuarioForm } from "./usuario-form";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Plus,
  Users,
  RefreshCw,
  UserCheck,
  UserX,
  AlertCircleIcon,
} from "lucide-react";
import type {
  Usuarios,
  CrearUsuarioProps,
  ActualizarUsuarioProps,
} from "~/types/administracion";
import { toast } from "sonner";

export default function UsuariosComponent() {
  const {
    usuarios,
    fetchUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    loadingState,
  } = useAdministracion();

  // Estados para modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuarios | null>(null);
  const [userToDelete, setUserToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const isMainLoading = loadingState.usuarios?.isLoading || false;

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // Handlers para crear usuario
  const handleCreateUser = () => {
    setSelectedUsuario(null);
    setIsFormOpen(true);
  };

  // Handlers para editar usuario
  const handleEditUser = (usuario: Usuarios) => {
    setSelectedUsuario(usuario);
    setIsFormOpen(true);
  };

  // Handlers para eliminar usuario
  const handleDeleteUser = (id: number) => {
    const usuario = usuarios.find((u) => u.idUsuario === id);
    if (usuario) {
      setUserToDelete({
        id,
        name: `${usuario.nombres} ${usuario.apellidos}`,
      });
      setIsDeleteDialogOpen(true);
    }
  };

  // Función para actualizar datos
  const handleRefreshData = async () => {
    toast.info("Actualizando usuarios...");
    await fetchUsuarios();
  };

  // Submit del formulario
  const handleFormSubmit = async (
    data: CrearUsuarioProps | ActualizarUsuarioProps
  ) => {
    try {
      if (selectedUsuario) {
        // Actualizar usuario existente
        await updateUsuario(
          selectedUsuario.idUsuario,
          data as ActualizarUsuarioProps
        );
        toast.success("El usuario ha sido actualizado correctamente.");
      } else {
        // Crear nuevo usuario
        await createUsuario(data as CrearUsuarioProps);
        toast.success("El usuario ha sido creado correctamente.");
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      toast.error("Ha ocurrido un error al guardar el usuario.");
    }
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUsuario(userToDelete.id);
        toast.success("El usuario ha sido eliminado correctamente.");
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        toast.error("Ha ocurrido un error al eliminar el usuario.");
      }
    }
  };

  // Crear columnas con handlers
  const columns = createColumns({
    onEdit: handleEditUser,
    onDelete: handleDeleteUser,
  });

  // Estadísticas de usuarios
  const usuariosActivos = usuarios.filter((u) => u.activo).length;
  const usuariosInactivos = usuarios.filter((u) => !u.activo).length;
  const totalUsuarios = usuarios.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Encabezado con título, descripción e información */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-50">
            Gestión de Usuarios
          </h1>
          <p className="text-muted-foreground">
            Administra usuarios, perfiles y permisos del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800"
          >
            Total: {totalUsuarios} usuarios
          </Badge>
        </div>
      </div>

      {/* Estadísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 rounded-lg border border-sky-200 dark:border-sky-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 dark:bg-sky-800/50 rounded-lg">
              <Users className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-sky-700 dark:text-sky-300">
                {totalUsuarios}
              </div>
              <div className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                Total Usuarios
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
                {usuariosActivos}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Usuarios Activos
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
                {usuariosInactivos}
              </div>
              <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                Usuarios Inactivos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <Card className="shadow-sm border border-border/60">
        <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg shadow-sm">
                <Users className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                  Lista de Usuarios
                </CardTitle>
                <CardDescription className="text-sm">
                  {totalUsuarios > 0
                    ? `${totalUsuarios} usuarios registrados en el sistema`
                    : "No hay usuarios registrados"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefreshData}
                variant="outline"
                size="sm"
                disabled={isMainLoading}
                className="gap-2 hover:bg-muted/50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isMainLoading ? "animate-spin" : ""}`}
                />
                Actualizar
              </Button>
              <Button
                onClick={handleCreateUser}
                size="sm"
                className="gap-2 bg-sky-600 hover:bg-sky-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Nuevo Usuario
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isMainLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-sky-200 dark:border-sky-800"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-sky-600 border-t-transparent animate-spin"></div>
                </div>
                <div className="text-center">
                  <p className="text-sky-700 dark:text-sky-300 font-medium">
                    Cargando usuarios...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Por favor espere mientras cargamos los datos
                  </p>
                </div>
              </div>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-4 text-muted-foreground">
              <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-full">
                <Users className="h-8 w-8 text-sky-500 dark:text-sky-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  No hay usuarios registrados
                </p>
                <p className="text-sm mt-1">
                  Haz clic en "Nuevo Usuario" para agregar el primer usuario
                </p>
              </div>
            </div>
          ) : (
            <DataTable data={usuarios} columns={columns} />
          )}
        </CardContent>
      </Card>

      {/* Modal de formulario */}
      <UsuarioForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        usuario={selectedUsuario}
        isLoading={
          loadingState.createUsuario?.isLoading ||
          loadingState.updateUsuario?.isLoading ||
          false
        }
      />

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        userName={userToDelete?.name || ""}
        isLoading={loadingState.deleteUsuario?.isLoading || false}
      />
    </div>
  );
}
