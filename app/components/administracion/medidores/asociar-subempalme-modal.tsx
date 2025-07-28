import { Gauge, Search } from 'lucide-react';

import { useEffect, useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { ScrollArea } from '~/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import api from '~/lib/api';
import type { GetMedidores, SubempalmeOption } from '~/types/administracion';

interface AsociarSubempalmeModalProps {
  isOpen: boolean;
  onClose: () => void;
  medidor: GetMedidores | null;
  onSuccess: () => void;
}

export function AsociarSubempalmeModal({
  isOpen,
  onClose,
  medidor,
  onSuccess,
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
      console.error('Error al cargar subempalmes:', error);
    } finally {
      setIsLoadingSubempalmes(false);
    }
  };

  // Función para asociar subempalme al medidor
  const handleAsociarSubempalme = async (subempalmeId: number) => {
    if (!medidor) {
      alert('No hay medidor seleccionado');
      return;
    }

    setIsAsociando(true);
    try {
      const payload = {
        codigoMedidor: medidor.codigo,
        subempalmeId: subempalmeId,
      };

      console.log('=== ASOCIANDO SUBEMPALME ===');
      console.log('Endpoint: PUT /modificar-subempalme');
      console.log('Payload:', JSON.stringify(payload, null, 2));

      const response = await api.put('/modificar-subempalme', payload);

      if (response.status === 200) {
        console.log('✅ Subempalme asociado correctamente');
        alert('Subempalme asociado correctamente al medidor');
        onSuccess(); // Recargar la lista de medidores
        onClose();
        setBusquedaSubempalme('');
      }
    } catch (error) {
      console.error('❌ Error al asociar subempalme:', error);
      alert('Error al asociar subempalme al medidor');
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
      <DialogContent className='min-w-6xl max-h-[80vh] overflow-hidden'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
              <Gauge className='h-5 w-5 text-blue-600 dark:text-blue-400' />
            </div>
            <div>
              <DialogTitle className='text-xl font-semibold'>
                Asociar Subempalme al Medidor
              </DialogTitle>
              <DialogDescription>
                Seleccione el subempalme que desea asociar al medidor{' '}
                <span className='font-mono font-semibold'>
                  {medidor?.codigo}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Barra de búsqueda */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Buscar subempalmes por código, ubicación, empalme o nicho...'
              value={busquedaSubempalme}
              onChange={e => setBusquedaSubempalme(e.target.value)}
              className='h-11 pl-10'
            />
          </div>

          {/* Tabla de subempalmes */}
          <div className='border rounded-lg overflow-hidden'>
            <ScrollArea className='h-[50vh]'>
              <Table>
                <TableHeader className='bg-muted/50'>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Contrato ID</TableHead>
                    <TableHead>Empalme</TableHead>
                    <TableHead>Nicho</TableHead>
                    <TableHead className='text-center'>Acción</TableHead>
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
                          <p>Cargando subempalmes...</p>
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
                            <p>
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
                      <TableCell>
                        <Badge variant='outline' className='font-mono'>
                          {subempalme.id}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary' className='font-mono'>
                          {subempalme.codigo}
                        </Badge>
                      </TableCell>
                      <TableCell className='font-medium'>
                        <div className='flex items-center gap-2'>
                          <Gauge className='h-4 w-4 text-muted-foreground' />
                          {subempalme.ubicacion}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline' className='font-mono'>
                          {subempalme.contratoId}
                        </Badge>
                      </TableCell>
                      <TableCell>{subempalme.descripcionEmpalme}</TableCell>
                      <TableCell>{subempalme.descripcionNicho}</TableCell>
                      <TableCell className='text-center'>
                        <Button
                          size='sm'
                          onClick={() => handleAsociarSubempalme(subempalme.id)}
                          disabled={isAsociando}
                          className='bg-blue-600 hover:bg-blue-700 text-white'
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
