import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Hash,
  Briefcase,
  Store,
  Building,
  MapPinned,
} from 'lucide-react';
import type { GetClientesByRut } from '~/types/administracion';

interface DetallesClienteProps {
  cliente: GetClientesByRut;
}

const DetailItem = ({
  label,
  value,
  icon: Icon,
  className = '',
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) => (
  <div
    className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-200 ${className}`}
  >
    {Icon && (
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/5 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="text-sm font-medium text-foreground break-words">
        {typeof value === 'string' && value ? (
          value
        ) : (
          <span className="text-muted-foreground italic">No especificado</span>
        )}
      </div>
    </div>
  </div>
);

const SectionTitle = ({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/5">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
  </div>
);

export default function DetallesCliente({ cliente }: DetallesClienteProps) {
  // Construir el nombre completo
  const nombreCompleto = cliente.esEmpresa
    ? cliente.nombre
    : `${cliente.nombre} ${cliente.apellido}`.trim();

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4">
      {/* Header con información principal */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/10 dark:border-primary/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
        <div className="relative p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/10 dark:to-primary/5 flex items-center justify-center shadow-lg">
              {cliente.esEmpresa ? (
                <Building2 className="w-10 h-10 text-primary" />
              ) : (
                <User className="w-10 h-10 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {nombreCompleto}
              </h2>
              <div className="flex items-center gap-3">
                <Badge
                  variant={cliente.esEmpresa ? 'default' : 'secondary'}
                  className="rounded-lg px-3 py-1"
                >
                  {cliente.esEmpresa ? 'Empresa' : 'Persona Natural'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  RUT: {cliente.rut}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información de Contacto */}
        <div className="space-y-6">
          <SectionTitle icon={UserCheck} title="Información de Contacto" />
          <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              <DetailItem
                label="Persona de Contacto"
                value={cliente.contacto}
                icon={UserCheck}
              />
              <DetailItem
                label="Teléfono"
                value={cliente.telefono}
                icon={Phone}
              />
              <DetailItem
                label="Correo Electrónico"
                value={cliente.correo}
                icon={Mail}
              />
            </div>
          </div>
        </div>

        {/* Información de Ubicación */}
        <div className="space-y-6">
          <SectionTitle icon={MapPinned} title="Información de Ubicación" />
          <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              <DetailItem
                label="Dirección"
                value={cliente.direccion}
                icon={MapPin}
              />
              <DetailItem
                label="Comuna"
                value={cliente.comuna}
                icon={Building}
              />
              <DetailItem
                label="Código Comuna"
                value={cliente.codComuna}
                icon={Hash}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Información Comercial (solo para empresas) */}
      {cliente.esEmpresa && cliente.giro && (
        <div className="space-y-6">
          <SectionTitle icon={Store} title="Información Comercial" />
          <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              <DetailItem
                label="Código de Giro"
                value={cliente.codigoGiro}
                icon={Hash}
              />
              <DetailItem
                label="Giro Comercial"
                value={cliente.giro}
                icon={Briefcase}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
