// eslint-disable no-empty-pattern
import React from "react";
import type { Route } from "./+types/usuarios";
import UsuariosComponent from "~/components/administracion/usuarios/usuarios-component";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Usuarios" },
    { name: "description", content: "Gestión de usuarios del sistema" },
  ];
}

export default function Usuarios() {
  return <UsuariosComponent />;
}
