import { FileText, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import type { ContratosRow } from '~/types/administracion';

const DETAILS_FETCH_DELAY_MS = 300;

interface ContractDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: ContratosRow | null;
}

export function ContractDetailsModal({
  isOpen,
  onClose,
  contract
}: Readonly<ContractDetailsModalProps>) {
  const [detailsData, setDetailsData] = useState<ContratosRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!contract) return;

      try {
        setIsLoading(true);
        setError(null);
        await new Promise(resolve =>
          setTimeout(resolve, DETAILS_FETCH_DELAY_MS)
        );
        setDetailsData(contract);
      } catch (err) {
        console.error('Error al cargar los detalles del contrato:', err);
        setError('Error al cargar los detalles del contrato');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && contract) {
      fetchDetails();
    }
  }, [isOpen, contract]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <DialogTitle>Detalles del contrato</DialogTitle>
          </div>
          {contract && (
            <DialogDescription>
              Información del contrato {contract.subEmpalme}
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center gap-3 py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Cargando detalles del contrato...
            </span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 py-12 text-destructive">
            <XCircle className="h-6 w-6" />
            <p className="text-sm">{error}</p>
          </div>
        ) : detailsData ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos del contrato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID Contrato</span>
                <span className="font-mono">{detailsData.idContrato}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sub Empalme</span>
                <span className="font-mono">{detailsData.subEmpalme}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo Contrato</span>
                <span className="text-right">{detailsData.tipoContrato}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado</span>
                <Badge variant="secondary">
                  {detailsData.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
