import {
  ExportAllButton,
  ExportFilteredButton
} from '~/components/shared/export-button';
import { useExportContratos } from '~/hooks/administracion/use-export-contratos';
import type { ContratosRow } from '~/types/administracion';

interface ExportButtonsProps {
  allContratos: ContratosRow[];
  filteredContratos: ContratosRow[];
  isFiltered: boolean;
}

export function ExportButtons({
  allContratos,
  filteredContratos,
  isFiltered
}: ExportButtonsProps) {
  const { contractColumns } = useExportContratos();

  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
      {/* Exportar Todos */}
      <ExportAllButton
        data={allContratos}
        columns={contractColumns}
        filename="contratos_completos"
        className="w-full sm:w-auto  bg-emerald-600 hover:bg-emerald-700 text-white"
      />

      {/* Exportar Filtrados */}
      {isFiltered && (
        <ExportFilteredButton
          data={filteredContratos}
          columns={contractColumns}
          filename="contratos_filtrados"
          variant="outline"
          className="border-green-200 text-green-700 hover:bg-green-50 w-full sm:w-auto"
        />
      )}
    </div>
  );
}
