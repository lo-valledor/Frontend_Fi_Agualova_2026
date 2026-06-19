import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from '~/components/data-table/data-table';
import type { Acometida } from '~/types/administracion';
import { columns } from './columns';

const mockOnEdit = vi.fn();

const mockAcometidas: Acometida[] = [
  {
    acometidaId: 1,
    codigo: 'ACO-001',
    ubicacion: 'Ubicacion 1',
    contratoId: 'CON-001',
    empalmeDescripcion: 'Empalme 1',
    nichoDescripcion: 'Nicho 1',
    sectorDescripcion: 'Sector 1',
    limitePotencia: 100,
    numeroMedidor: 'MED-001'
  }
];

describe('Acometida Columns', () => {
  it('should call onEdit when the edit button is clicked', async () => {
    const user = userEvent.setup();
    const tableColumns = columns({ onEdit: mockOnEdit });

    render(
      <DataTable
        columns={tableColumns}
        data={mockAcometidas}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        globalFilter={{
          value: '',
          onChange: () => {}
        }}
      />
    );

    const editButton = screen.getByRole('button', { name: /editar/i });
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockAcometidas[0]);
  });
});
