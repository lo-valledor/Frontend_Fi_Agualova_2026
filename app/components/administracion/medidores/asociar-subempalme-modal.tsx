import { Gauge, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type {
  MedidorListItem,
  SubempalmeOption
} from '~/components/administracion/medidores/medidores-types';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { ScrollArea } from '~/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import { administracionService } from '~/services/administracionService';

interface AsociarSubempalmeModalProps {
  isOpen: boolean;
  onClose: () => void;
  medidor: MedidorListItem | null;
  onSuccess: (codigo?: string) => void;
}

export function AsociarSubempalmeModal({
  isOpen,
  onClose,
  medidor,
  onSuccess
}: AsociarSubempalmeModalProps) {
  const [subempalmes, setSubempalmes] = useState<SubempalmeOption[]>([]);
  const [busquedaSubempalme, setBusquedaSubempalme] = useState('');
  const [isLoadingSubempalmes, setIsLoadingSubempalmes] = useState(false);
  const [isAsociando, setIsAsociando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarSubempalmes();
    }
  }, [isOpen]);

  const cargarSubempalmes = async () => {
    setIsLoadingSubempalmes(true);
    try {
      const result = await administracionService.getMedidorSubempalmes();
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.data) {
        setSubempalmes(result.data as SubempalmeOption[]);
      }
    } catch (error) {
      toast.error('Error al cargar subempalmes', error as any);
    } finally {
      setIsLoadingSubempalmes(false);
    }
  };

  const handleAsociarSubempalme = async (
    subempalmeId: number,
    subempalmeCodigo: string
  ) => {
    if (!medidor) {
      toast.error('No hay medidor seleccionado');
      return;
    }

    setIsAsociando(true);
    try {
      const payload = {
        codigoMedidor: medidor.idMedidor,
        subempalmeId
      };

      const result =
        await administracionService.modificarSubempalme(payload);

      if (!result.error) {
        toast.success('Subempalme asociado correctamente');
        onSuccess(subempalmeCodigo);
        onClose();
        setBusquedaSubempalme('');
      }
    } catch (error) {
      toast.error('Error al asociar subempalme al medidor', error as any);
    } finally {
      setIsAsociando(false);
    }
  };

  const subempalmesFiltrados = subempalmes.filter(subempalme => {
    const texto =
      `${subempalme.codigo} ${subempalme.ubicacion} ${subempalme.descripcionEmpalme} ${subempalme.descripcionNicho}`.toLowerCase();
    return texto.includes(busquedaSubempalme.toLowerCase());
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:min-w-full md:min-w-full lg:min-w-[800px] xl:min-w-[1000px] max-h-[90vh] overflow-auto">
        <DialogHeader className="space-y-3 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Gauge className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg sm:text-xl font-semibold">
                Asociar Subempalme al Medidor
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base mt-1">
                Seleccione el subempalme que desea asociar al medidor{' '}
                <span className="font-mono font-semibold">
                  {medidor?.idMedidor}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar subempalmes por código, ubicación, empalme o nicho..."
              value={busquedaSubempalme}
              onChange={e => setBusquedaSubempalme(e.target.value)}
              className="h-11 pl-10 text-sm sm:text-base"
            />
          </div>

          <div className="border rounded-xl overflow-hidden">
            <ScrollArea className="h-[50vh] sm:h-[60vh]">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Ubicación
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Contrato ID
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Empalme
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Nicho
                    </TableHead>
                    <TableHead className="text-center">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingSubempalmes && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Cargando subempalmes...
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoadingSubempalmes &&
                    subempalmesFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No se encontraron subempalmes con los criterios de
                          búsqueda.
                        </TableCell>
                      </TableRow>
                    )}
                  {subempalmesFiltrados.map(subempalme => (
                    <TableRow
                      key={subempalme.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>{subempalme.id}</TableCell>
                      <TableCell>{subempalme.codigo}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {subempalme.ubicacion}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {subempalme.contratoId}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {subempalme.descripcionEmpalme}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {subempalme.descripcionNicho}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleAsociarSubempalme(
                              subempalme.id,
                              subempalme.codigo
                            )
                          }
                          disabled={isAsociando}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isAsociando ? 'Asociando...' : 'Asociar'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
