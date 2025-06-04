// eslint-disable no-empty-pattern
import { LoginForm } from "~/components/auth/login-form";
import { useAuth } from "~/context/AuthContext";
import { Navigate } from "react-router";
import { Bolt } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeProvider } from "~/components/theme-provider";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Login" },
    { name: "description", content: "Enerlova | Login" },
  ];
}

const Login = () => {
  const { isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Animación de entrada para los elementos de la página
  useEffect(() => {
    setMounted(true);
  }, []);

  if (isAuthenticated && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <ThemeProvider>
      <div className="relative bg-[url('/fondo.jpg')] dark:bg-[url('/fondo-dark.jpg')] bg-cover bg-center flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/40 to-black/60 dark:from-sky-950/60 dark:to-black/80 backdrop-blur-sm"></div>

        {/* Animated energy particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-sky-400/70 dark:bg-sky-500/70 animate-floatingParticle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${5 + Math.random() * 10}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Company logo for larger screens */}
        <div
          className={`hidden lg:block absolute top-8 left-8 transform transition-all duration-1000 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="bg-white/90 dark:bg-gray-800/90 p-2 rounded-full">
              <Bolt className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            </div>
            <span className="text-white text-xl font-bold">Enerlova</span>
          </div>
        </div>

        {/* Main content */}
        <div className="relative w-full max-w-md mx-auto">
          <LoginForm />

          {/* Footer */}
          <div
            className={`mt-6 text-center text-white/80 text-xs transform transition-all duration-1000 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            © {new Date().getFullYear()} Enerlova. Todos los derechos
            reservados.
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Login;
