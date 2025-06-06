// eslint-disable no-empty-pattern
import { AutoRedirect } from "~/components/auth/auto-redirect";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Inicio" },
    { name: "description", content: "Enerlova | Inicio" },
  ];
}

export default function Home() {
  return <AutoRedirect loadingMessage="Redirigiendo..." />;
}
