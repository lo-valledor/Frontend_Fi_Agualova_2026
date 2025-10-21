import { useState } from 'react';
import { useAuth } from '~/context/AuthContext';
import { useLocation } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Componente de debugging para visualizar permisos del usuario
 * Solo para desarrollo - remover en producción
 */
export function PermissionsDebug() {
  const [isOpen, setIsOpen] = useState(false);
  const { permissions, permissionsLoading, user } = useAuth();
  const location = useLocation();

  const currentPermission = permissions.find(p => p.ruta === location.pathname);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader
          className="cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">🔐 Debug Permisos</CardTitle>
              <CardDescription className="text-xs">
                {user?.username || 'No autenticado'}
              </CardDescription>
            </div>
            {isOpen ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </div>
        </CardHeader>

        {isOpen && (
          <CardContent className="space-y-3 text-xs">
            {/* Estado de carga */}
            <div>
              <strong>Estado:</strong>{' '}
              {permissionsLoading ? (
                <span className="text-yellow-600">⏳ Cargando...</span>
              ) : (
                <span className="text-green-600">✅ Cargado</span>
              )}
            </div>

            {/* Usuario */}
            <div>
              <strong>Usuario ID:</strong> {user?.id || 'N/A'}
            </div>

            {/* Ruta actual */}
            <div>
              <strong>Ruta actual:</strong>
              <code className="block bg-muted p-1 rounded mt-1 text-[10px]">
                {location.pathname}
              </code>
            </div>

            {/* Permisos de la ruta actual */}
            <div>
              <strong>Permisos en esta ruta:</strong>
              {currentPermission ? (
                <div className="mt-1 space-y-1 bg-muted p-2 rounded">
                  <div>Ver: {currentPermission.puedeVer ? '✅' : '❌'}</div>
                  <div>Crear: {currentPermission.puedeCrear ? '✅' : '❌'}</div>
                  <div>Editar: {currentPermission.puedeEditar ? '✅' : '❌'}</div>
                  <div>Eliminar: {currentPermission.puedeEliminar ? '✅' : '❌'}</div>
                </div>
              ) : (
                <div className="mt-1 text-red-600">
                  ⚠️ Sin permisos configurados para esta ruta
                </div>
              )}
            </div>

            {/* Total de permisos */}
            <div>
              <strong>Total rutas permitidas:</strong> {permissions.length}
            </div>

            {/* Lista de rutas permitidas */}
            <details className="cursor-pointer">
              <summary className="font-semibold">Ver todas las rutas permitidas</summary>
              <div className="mt-2 max-h-60 overflow-y-auto space-y-1">
                {permissions.map((perm, idx) => (
                  <div
                    key={idx}
                    className="bg-muted p-1 rounded text-[10px]"
                  >
                    <div className="font-mono">{perm.ruta}</div>
                    <div className="text-muted-foreground">
                      V:{perm.puedeVer ? '✓' : '✗'}{' '}
                      C:{perm.puedeCrear ? '✓' : '✗'}{' '}
                      E:{perm.puedeEditar ? '✓' : '✗'}{' '}
                      D:{perm.puedeEliminar ? '✓' : '✗'}
                    </div>
                  </div>
                ))}
              </div>
            </details>

            {/* Botón para copiar permisos */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(permissions, null, 2));
                alert('Permisos copiados al portapapeles');
              }}
            >
              📋 Copiar JSON de permisos
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
