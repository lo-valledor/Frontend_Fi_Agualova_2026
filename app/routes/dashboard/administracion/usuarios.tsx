// eslint-disable no-empty-pattern
import React from "react";
import type { Route } from "./+types/usuarios";
import UsuariosComponent from "~/components/administracion/usuarios/usuarios-component";
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Usuarios" },
    { name: "description", content: "Gestión de usuarios del sistema" },
  ];
}

export default function Usuarios() {
  const pageBreadcrumbs = [
    { label: "Administracion" },
    { label: "Usuarios" },
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <UsuariosComponent />
    </div>
  );
}
