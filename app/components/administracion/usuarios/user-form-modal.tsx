import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  UserCircle,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { PasswordStrengthIndicator } from "~/components/ui/password-strength-indicator";
import { Separator } from "~/components/ui/separator";
import { useAdministracion } from "~/hooks/use-administracion";
import type { UpdateUsuario, Usuarios } from "~/types/administracion";
import { isPasswordSecure, passwordsMatch } from "~/utils/password-validation";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user?: Usuarios | null;
  mode: "add" | "edit";
}

export function UserFormModal({
  isOpen,
  onClose,
  onSuccess,
  user,
  mode,
}: UserFormModalProps) {
  const { createUsuario, updateUsuario, loadingState } = useAdministracion();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string>("");

  const [formData, setFormData] = useState<UpdateUsuario>({
    nombre: "",
    apellido: "",
    email: "",
    username: "",
    newPassword: "",
  });

  const [updateData, setUpdateData] = useState<UpdateUsuario>({
    nombre: "",
    apellido: "",
    email: "",
    username: "",
    newPassword: "",
  });

  useEffect(() => {
    if (user && mode === "edit") {
      setUpdateData({
        nombre: user.nombre_Usuario,
        apellido: user.apellidos_Usuario,
        email: user.email,
        username: user.userName,
        newPassword: "",
      });
      setFormData({
        username: user.userName,
        newPassword: "",
        email: user.email || "",
        nombre: user.nombre_Usuario,
        apellido: user.apellidos_Usuario,
      });
    } else {
      setFormData({
        username: "",
        newPassword: "",
        email: "",
        nombre: "",
        apellido: "",
      });
      setUpdateData({
        username: "",
        newPassword: "",
        nombre: "",
        apellido: "",
        email: "",
      });
    }
    // Resetear estados de contraseña
    setConfirmPassword("");
    setPasswordError("");
  }, [user, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    try {
      // Validaciones de contraseña
      if (mode === "add") {
        // Modo crear: contraseña es obligatoria
        if (!formData.newPassword || !formData.newPassword.trim()) {
          setPasswordError("La contraseña es requerida para crear un usuario");
          toast.error("La contraseña es requerida");
          return;
        }

        // Validar que la contraseña sea segura
        const passwordCheck = isPasswordSecure(formData.newPassword);
        if (!passwordCheck.isSecure) {
          setPasswordError(
            passwordCheck.reason ||
              "La contraseña no cumple con los requisitos de seguridad",
          );
          toast.error("La contraseña no es suficientemente segura");
          return;
        }

        // Validar que las contraseñas coincidan
        if (!passwordsMatch(formData.newPassword, confirmPassword)) {
          setPasswordError("Las contraseñas no coinciden");
          toast.error("Las contraseñas no coinciden");
          return;
        }

        await createUsuario(formData);
        toast.success("Usuario creado exitosamente");
      } else if (mode === "edit" && user) {
        // Modo editar
        const updatePayload: UpdateUsuario = {
          username: updateData.username,
          newPassword: "", // No se requiere contraseña actual para actualizar
          nombre: updateData.nombre,
          apellido: updateData.apellido,
          email: updateData.email,
        };

        // Si se proporciona una nueva contraseña, validarla
        if (formData.newPassword && formData.newPassword.trim()) {
          // Validar que la nueva contraseña sea segura
          const passwordCheck = isPasswordSecure(formData.newPassword);
          if (!passwordCheck.isSecure) {
            setPasswordError(
              passwordCheck.reason ||
                "La contraseña no cumple con los requisitos de seguridad",
            );
            toast.error("La nueva contraseña no es suficientemente segura");
            return;
          }

          // Validar que las contraseñas coincidan
          if (!passwordsMatch(formData.newPassword, confirmPassword)) {
            setPasswordError("Las contraseñas no coinciden");
            toast.error("Las contraseñas no coinciden");
            return;
          }

          updatePayload.newPassword = formData.newPassword;
        }

        await updateUsuario(Number(user.id), updatePayload);
        toast.success("Usuario actualizado exitosamente");
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al procesar la solicitud";
      toast.error(errorMessage);
    }
  };

  const handleInputChange = (
    field: keyof UpdateUsuario,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // También actualizar updateData para modo edición
    if (mode === "edit") {
      setUpdateData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const isLoading =
    loadingState.createUsuario.isLoading ||
    loadingState.updateUsuario.isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-sky-900 dark:text-sky-100">
            <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-xl">
              <User className="h-6 w-6" />
            </div>
            {mode === "add" ? "Crear Nuevo Usuario" : "Editar Usuario"}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {mode === "add"
              ? "Complete toda la información requerida para crear un nuevo usuario en el sistema."
              : "Modifique los campos que desee actualizar. Los campos vacíos mantendrán su valor actual."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Sección: Información Personal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <UserCircle className="h-4 w-4" />
              <span>Información Personal</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombres" className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Nombres
                </Label>
                <Input
                  id="nombres"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder="Ej: Juan Carlos"
                  required
                  disabled={isLoading}
                  className="transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos" className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Apellidos
                </Label>
                <Input
                  id="apellidos"
                  value={formData.apellido}
                  onChange={(e) =>
                    handleInputChange("apellido", e.target.value)
                  }
                  placeholder="Ej: Pérez García"
                  required
                  disabled={isLoading}
                  className="transition-all"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Sección: Credenciales */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Credenciales de Acceso</span>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="nombreDeUsuario"
                className="flex items-center gap-2"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Nombre de Usuario
              </Label>
              <Input
                id="nombreDeUsuario"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="Ej: jperez"
                required
                disabled={isLoading}
                className="transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Ej: jperez@lovalledor.cl"
                required={mode === "add"}
                disabled={isLoading || mode === "edit"}
                className="transition-all"
              />
              {mode === "edit" && (
                <p className="text-xs text-muted-foreground">
                  El correo electrónico no se puede modificar
                </p>
              )}
            </div>

            {/* Contraseña / Nueva Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="contrasena" className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                {mode === "add" ? "Contraseña" : "Nueva Contraseña (opcional)"}
              </Label>
              <div className="relative">
                <Input
                  id="contrasena"
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => {
                    handleInputChange("newPassword", e.target.value);
                    setPasswordError("");
                  }}
                  placeholder={
                    mode === "add"
                      ? "Ingresa una contraseña segura"
                      : "Dejar vacío para mantener la actual"
                  }
                  required={mode === "add"}
                  disabled={isLoading}
                  className="pr-10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Indicador de fortaleza */}
              {formData.newPassword && (
                <PasswordStrengthIndicator
                  password={formData.newPassword}
                  showRules={true}
                  showWarnings={true}
                />
              )}
            </div>

            {/* Confirmar Contraseña */}
            {(mode === "add" ||
              (formData.newPassword && formData.newPassword.trim())) && (
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="flex items-center gap-2"
                >
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError("");
                    }}
                    placeholder="Confirma tu contraseña"
                    required={
                      mode === "add" || Boolean(formData.newPassword?.trim())
                    }
                    disabled={isLoading}
                    className="pr-10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Validación de coincidencia */}
                {confirmPassword && formData.newPassword && (
                  <div className="flex items-center gap-2 text-xs">
                    {passwordsMatch(formData.newPassword, confirmPassword) ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                        <span className="text-green-700 dark:text-green-400 font-medium">
                          Las contraseñas coinciden
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                        <span className="text-red-700 dark:text-red-400">
                          Las contraseñas no coinciden
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Error de contraseña */}
            {passwordError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Sección: Configuración */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>Configuración</span>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="min-w-24"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading}
              className="min-w-32"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {mode === "add" ? "Creando..." : "Guardando..."}
                </span>
              ) : (
                <span>
                  {mode === "add" ? "Crear Usuario" : "Guardar Cambios"}
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
