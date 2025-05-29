// eslint-disable no-empty-pattern
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Inicio" },
    { name: "description", content: "Enerlova | Inicio" },
  ];
}

export default function Home() {
  return <Welcome />;
}
