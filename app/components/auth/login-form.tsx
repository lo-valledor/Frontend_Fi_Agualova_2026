import type React from 'react';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { useState, useEffect } from 'react';
import { useAuth } from '~/context/AuthContext';
import { useLocation } from 'react-router';
import { Lock, Moon, Sun, User, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '~/components/theme-provider';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [input, setInput] = useState({
    usuario: '',
    contrasena: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Animación de entrada
  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para alternar entre temas claro y oscuro
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSubmitEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null); // Limpiar error anterior

    if (input.usuario && input.contrasena) {
      try {
        // Obtener la ruta desde donde vino el usuario, o usar dashboard por defecto
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        await login(input.usuario, input.contrasena, from);
        // La redirección se maneja en el contexto de autenticación
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Error desconocido al iniciar sesión';
        // Simplificar mensaje genérico si la API no da uno claro
        setErrorMessage(
          message.includes('Failed to fetch')
            ? 'Error de conexión. Inténtalo de nuevo.'
            : message,
        );
      }
    } else {
      setErrorMessage('El usuario y la contraseña son obligatorios.');
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl transition-all duration-500 ease-in-out',
        'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
        'shadow-xl border border-sky-100 dark:border-sky-900/30',
        'transform opacity-0 translate-y-4',
        mounted && 'opacity-100 translate-y-0',
        className,
      )}
      {...props}
    >
      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-sky-400 to-sky-600 dark:from-sky-600 dark:to-sky-800 rounded-full opacity-20 blur-2xl animate-pulse"></div>
      <div
        className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-sky-500 to-teal-400 dark:from-sky-700 dark:to-teal-600 rounded-full opacity-20 blur-2xl animate-pulse"
        style={{ animationDuration: '8s' }}
      ></div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </button>

      {/* Logo and header */}
      <div className="pt-8 pb-4 px-8">
        <div className="flex justify-center mb-6 transform transition-transform duration-700 hover:scale-110">
          <div className="bg-gradient-to-r from-slate-500 to-teal-600 dark:from-slate-600 dark:to-teal-700 p-2 rounded-full shadow-lg">
            {/* <Bolt className="h-8 w-8 text-white animate-pulse"  /> */}
            <img
              src="/logo-enerlova.png"
              alt="Enerlova"
              className="h-10"
              style={{ animationDuration: '3s' }}
            />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-sky-600 to-teal-700 dark:from-sky-400 dark:to-teal-500 bg-clip-text text-transparent">
          Bienvenido a Enerlova
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-2 text-sm">
          Ingrese sus credenciales para acceder al sistema
        </p>
      </div>

      {/* Form */}
      <div className="p-8 pt-2">
        <form onSubmit={handleSubmitEvent} className="space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-fadeIn">
              {errorMessage}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="usuario"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Usuario
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-sky-500 dark:group-focus-within:text-sky-400 transition-colors duration-200" />
                </div>
                <Input
                  id="usuario"
                  name="usuario"
                  type="text"
                  placeholder="Nombre de Usuario"
                  value={input.usuario}
                  onChange={handleInput}
                  required
                  className="pl-10 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 focus:border-sky-500 dark:focus:border-sky-600 focus:ring-sky-500 dark:focus:ring-sky-600 rounded-lg transition-all duration-200 focus:shadow-md dark:focus:shadow-sky-900/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="contrasena"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Contraseña
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-sky-500 dark:group-focus-within:text-sky-400 transition-colors duration-200" />
                </div>
                <Input
                  id="contrasena"
                  name="contrasena"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={input.contrasena}
                  onChange={handleInput}
                  required
                  className="pl-10 pr-10 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 focus:border-sky-500 dark:focus:border-sky-600 focus:ring-sky-500 dark:focus:ring-sky-600 rounded-lg transition-all duration-200 focus:shadow-md dark:focus:shadow-sky-900/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 rounded-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-teal-600 dark:from-sky-600 dark:to-teal-700 transition-all duration-300 group-hover:scale-105"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white dark:bg-black transition-opacity duration-300"></div>
            <span className="relative text-white font-medium">
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar sesión'
              )}
            </span>
          </Button>
        </form>
      </div>
    </div>
  );
}
