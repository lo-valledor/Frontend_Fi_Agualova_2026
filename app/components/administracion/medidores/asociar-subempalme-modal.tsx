import { Gauge, Search } from 'lucide-react';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';

import { Badge } from '~/components/ui/badge';
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
import api from '~/lib/api';
import type { GetMedidores, SubempalmeOption } from '~/types/administracion';

interface AsociarSubempalmeModalProps {
  isOpen: boolean;
  onClose: () => void;
  medidor: GetMedidores | null;
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

  // Cargar subempalmes al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarSubempalmes();
    }
  }, [isOpen]);

  const cargarSubempalmes = async () => {
    setIsLoadingSubempalmes(true);
    try {
      const response = await api.get('/MedidorSubempalmes');
      if (response.data) {
        setSubempalmes(response.data as SubempalmeOption[]);
      }
    } catch (error) {
      toast.error('Error al cargar subempalmes', error as any);
    } finally {
      setIsLoadingSubempalmes(false);
    }
  };

  // Función para asociar subempalme al medidor
  const handleAsociarSubempalme = async (
    subempalmeId: number,
    subempalmeCodigo: string
  ) => {
    if (!medidor) {
      alert('No hay medidor seleccionado');
      return;
    }

    setIsAsociando(true);
    try {
      const payload = {
        codigoMedidor: medidor.codigo,
        subempalmeId: subempalmeId
      };

      const response = await api.put('/modificar-subempalme', payload);

      if (response.status === 200) {
        toast.success('Subempalme asociado correctamente');
        onSuccess(subempalmeCodigo); // Entregar el código asociado
        onClose();
        setBusquedaSubempalme('');
      }
    } catch (error) {
      toast.error('Error al asociar subempalme al medidor', error as any);
    } finally {
      setIsAsociando(false);
    }
  };

  // Filtrar subempalmes
  const subempalmesFiltrados = subempalmes.filter(subempalme => {
    const texto =
      `${subempalme.codigo} ${subempalme.ubicacion} ${subempalme.descripcionEmpalme} ${subempalme.descripcionNicho}`.toLowerCase();
    return texto.includes(busquedaSubempalme.toLowerCase());
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:min-w-full md:min-w-full lg:min-w-[800px] xl:min-w-[1000px] max-h-[90vh] overflow-auto'>
        <DialogHeader className='space-y-3 pb-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl'>
              <Gauge className='h-5 w-5 ' />
            </div>
            <div className='min-w-0 flex-1'>
              <DialogTitle className='text-lg sm:text-xl font-semibold'>
                Asociar Subempalme al Medidor
              </DialogTitle>
              <DialogDescription className='text-sm sm:text-base mt-1'>
                Seleccione el subempalme que desea asociar al medidor{' '}
                <span className='font-mono font-semibold '>
                  {medidor?.codigo}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Barra de búsqueda mejorada */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Buscar subempalmes por código, ubicación, empalme o nicho...'
              value={busquedaSubempalme}
              onChange={e => setBusquedaSubempalme(e.target.value)}
              className='h-11 pl-10 text-sm sm:text-base'
            />
          </div>

          {/* Tabla de subempalmes con mejor responsividad */}
          <div className='border rounded-xl overflow-hidden'>
            <ScrollArea className='h-[50vh] sm:h-[60vh]'>
              <Table>
                <TableHeader className='bg-muted/50'>
                  <TableRow>
                    <TableHead className='text-xs sm:text-sm font-medium'>
                      ID
                    </TableHead>
                    <TableHead className='text-xs sm:text-sm font-medium'>
                      Código
                    </TableHead>
                    <TableHead className='text-xs sm:text-sm font-medium hidden sm:table-cell'>
                      Ubicación
                    </TableHead>
                    <TableHead className='text-xs sm:text-sm font-medium hidden lg:table-cell'>
                      Contrato ID
                    </TableHead>
                    <TableHead className='text-xs sm:text-sm font-medium hidden md:table-cell'>
                      Empalme
                    </TableHead>
                    <TableHead className='text-xs sm:text-sm font-medium hidden lg:table-cell'>
                      Nicho
                    </TableHead>
                    <TableHead className='text-xs sm:text-sm font-medium text-center'>
                      Acción
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingSubempalmes && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className='text-center py-8 text-muted-foreground'
                      >
                        <div className='flex flex-col items-center gap-2'>
                          <div className='h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent' />
                          <p className='text-sm'>Cargando subempalmes...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoadingSubempalmes &&
                    subempalmesFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className='text-center py-8 text-muted-foreground'
                        >
                          <div className='flex flex-col items-center gap-2'>
                            <Search className='h-8 w-8 opacity-50' />
                            <p className='text-sm'>
                              No se encontraron subempalmes con los criterios de
                              búsqueda.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  {subempalmesFiltrados.map(subempalme => (
                    <TableRow
                      key={subempalme.id}
                      className='hover:bg-muted/50 transition-colors'
                    >
                      <TableCell className='text-xs sm:text-sm'>
                        <Badge variant='outline' className='font-mono text-xs'>
                          {subempalme.id}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-xs sm:text-sm'>
                        <Badge
                          variant='secondary'
                          className='font-mono text-xs'
                        >
                          {subempalme.codigo}
                        </Badge>
                      </TableCell>
                      <TableCell className='font-medium text-xs sm:text-sm hidden sm:table-cell'>
                        <div className='flex items-center gap-2'>
                          <Gauge className='h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground' />
                          <span
                            className='truncate max-w-[120px] lg:max-w-[150px]'
                            title={subempalme.ubicacion}
                          >
                            {subempalme.ubicacion}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='text-xs sm:text-sm hidden lg:table-cell'>
                        <Badge variant='outline' className='font-mono text-xs'>
                          {subempalme.contratoId}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-xs sm:text-sm hidden md:table-cell'>
                        <span
                          className='truncate max-w-[100px] lg:max-w-[120px] block'
                          title={subempalme.descripcionEmpalme}
                        >
                          {subempalme.descripcionEmpalme}
                        </span>
                      </TableCell>
                      <TableCell className='text-xs sm:text-sm hidden lg:table-cell'>
                        <span
                          className='truncate max-w-[100px] lg:max-w-[120px] block'
                          title={subempalme.descripcionNicho}
                        >
                          {subempalme.descripcionNicho}
                        </span>
                      </TableCell>
                      <TableCell className='text-center'>
                        <Button
                          size='sm'
                          onClick={() =>
                            handleAsociarSubempalme(
                              subempalme.id,
                              subempalme.codigo
                            )
                          }
                          disabled={isAsociando}
                          className='bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3'
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
