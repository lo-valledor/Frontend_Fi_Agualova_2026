import React, { useEffect, useState } from "react";
import { useAdministracion } from "~/hooks/use-administracion";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { UsuarioForm } from "./usuario-form";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
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

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
              Usuarios
            </h1>
          </div>
          <p className="text-muted-foreground">
            Gestión de usuarios del sistema
          </p>
        </div>
        <Button onClick={handleCreateUser} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <DataTable data={usuarios} columns={columns} />

      {/* Modal de formulario */}
      <UsuarioForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        usuario={selectedUsuario}
        isLoading={
          loadingState.createUsuario.isLoading ||
          loadingState.updateUsuario.isLoading
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
        isLoading={loadingState.deleteUsuario.isLoading}
      />
    </div>
  );
}
