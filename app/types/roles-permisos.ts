export type Roles = {
  id: string;
  name: string;
  normalizedName: string;
  concurrencyStamp: string | null;
};
export type Permisos = {
  id: number;
  nombre: string;
  descripcion: string;
  modulo: string;
};

export type UpdateRolePermissions = {
  roleId: string;
  permisos: Permisos[];
};

export type CreateRolUser = {
  email: string;
  rol: string;
};
