export interface Usuarios {
  idUsuario: number;
  nombreDeUsuario: string;
  perfilId: number;
  nombres: string;
  apellidos: string;
  departamento: number;
  activo: boolean;
  fechaCreacion: string;
}

export interface CrearUsuarioProps {
  nombreDeUsuario: string;
  contrasena: string;
  perfilId: number;
  nombres: string;
  apellidos: string;
  departamento: number;
  activo: boolean;
}

export interface ActualizarUsuarioProps {
  nombreDeUsuario: string;
  contrasena: string;
  nuevaContrasena?: string;
  nombres: string;
  apellidos: string;
  departamento: number;
  activo: boolean;
}
