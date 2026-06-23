import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Switch } from '~/components/ui/switch';
import { administracionService } from '~/services/administracionService';
import type { ContratoFormValues } from '~/types/administracion';

const emptyContrato: ContratoFormValues = {
  idTipoContrato: 0,
  idTarifa: 0,
  rutPropietario: '',
  rutCliente: '',
  idLocal: '',
  fechaInicio: '',
  activo: true,
  direccion: '',
  codigoComuna: '',
  limiteInvierno: 0,
  idCiclo: 0,
  potencia: '',
  crearClienteDesdePropietario: false,
  esMadre: false,
  idContratoMadre: '',
  lugarEntrega: '',
  liberadoCorte: false,
  idContrato: '',
  fechaTermino: ''
};

export default function EditarContratoComponent({
  id
}: {
  readonly id: string;
}) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ContratoFormValues>(emptyContrato);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    field: keyof ContratoFormValues,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error('Falta el identificador del contrato');
      return;
    }

    setIsSubmitting(true);
    try {
      await administracionService.putDataActualizarContrato({
        ...formData,
        idContrato: id
      });
      toast.success('Contrato actualizado exitosamente');
      navigate('/dashboard/administracion/contratos');
    } catch (_error) {
      toast.error('No fue posible actualizar el contrato');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <BreadcrumbSetter
        items={[{ label: 'Administración' }, { label: 'Editar contrato' }]}
      />
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos del contrato</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="idTipoContrato">Id tipo contrato</Label>
              <Input
                id="idTipoContrato"
                type="number"
                value={formData.idTipoContrato}
                onChange={e =>
                  handleInputChange('idTipoContrato', Number(e.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idTarifa">Id tarifa</Label>
              <Input
                id="idTarifa"
                type="number"
                value={formData.idTarifa}
                onChange={e =>
                  handleInputChange('idTarifa', Number(e.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idCiclo">Id ciclo</Label>
              <Input
                id="idCiclo"
                type="number"
                value={formData.idCiclo}
                onChange={e =>
                  handleInputChange('idCiclo', Number(e.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idLocal">Id local</Label>
              <Input
                id="idLocal"
                value={formData.idLocal}
                onChange={e => handleInputChange('idLocal', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rutPropietario">RUT propietario</Label>
              <Input
                id="rutPropietario"
                value={formData.rutPropietario}
                onChange={e =>
                  handleInputChange('rutPropietario', e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rutCliente">RUT cliente</Label>
              <Input
                id="rutCliente"
                value={formData.rutCliente}
                onChange={e => handleInputChange('rutCliente', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idContratoMadre">Id contrato madre</Label>
              <Input
                id="idContratoMadre"
                value={formData.idContratoMadre}
                onChange={e =>
                  handleInputChange('idContratoMadre', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigoComuna">Código comuna</Label>
              <Input
                id="codigoComuna"
                value={formData.codigoComuna}
                onChange={e =>
                  handleInputChange('codigoComuna', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha de inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={formData.fechaInicio}
                onChange={e => handleInputChange('fechaInicio', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaTermino">Fecha de término</Label>
              <Input
                id="fechaTermino"
                type="date"
                value={formData.fechaTermino}
                onChange={e =>
                  handleInputChange('fechaTermino', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={e => handleInputChange('direccion', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lugarEntrega">Lugar de entrega</Label>
              <Input
                id="lugarEntrega"
                value={formData.lugarEntrega}
                onChange={e =>
                  handleInputChange('lugarEntrega', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="potencia">Potencia</Label>
              <Input
                id="potencia"
                value={formData.potencia}
                onChange={e => handleInputChange('potencia', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="limiteInvierno">Límite invierno</Label>
              <Input
                id="limiteInvierno"
                type="number"
                value={formData.limiteInvierno}
                onChange={e =>
                  handleInputChange('limiteInvierno', Number(e.target.value))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={value => handleInputChange('activo', value)}
              />
              <Label htmlFor="activo">Contrato activo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="liberadoCorte"
                checked={formData.liberadoCorte}
                onCheckedChange={value =>
                  handleInputChange('liberadoCorte', value)
                }
              />
              <Label htmlFor="liberadoCorte">Liberado de corte</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="esMadre"
                checked={formData.esMadre}
                onCheckedChange={value => handleInputChange('esMadre', value)}
              />
              <Label htmlFor="esMadre">Es contrato madre</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="crearClienteDesdePropietario"
                checked={formData.crearClienteDesdePropietario}
                onCheckedChange={value =>
                  handleInputChange('crearClienteDesdePropietario', value)
                }
              />
              <Label htmlFor="crearClienteDesdePropietario">
                Crear cliente desde propietario
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/administracion/contratos')}
            disabled={isSubmitting}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
