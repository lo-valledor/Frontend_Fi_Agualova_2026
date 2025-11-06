import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilterSummary } from './filter-summary';

describe('FilterSummary', () => {
  it('should not render if isFiltered is false', () => {
    render(
      <FilterSummary
        totalAcometidas={10}
        filteredAcometidas={5}
        activeFilters={1}
        isFiltered={false}
      />
    );

    expect(screen.queryByText(/mostrando/i)).not.toBeInTheDocument();
  });

  it('should render the summary with the correct data', () => {
    render(
      <FilterSummary
        totalAcometidas={10}
        filteredAcometidas={5}
        activeFilters={1}
        isFiltered={true}
      />
    );

    expect(screen.getByText('Mostrando 5 de 10 acometidas')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('1 filtro aplicado')).toBeInTheDocument();
  });

  it('should show the correct message when the number of filtered items is reduced', () => {
    render(
      <FilterSummary
        totalAcometidas={10}
        filteredAcometidas={5}
        activeFilters={1}
        isFiltered={true}
      />
    );

    expect(screen.getByText(/mostrando/i)).toBeInTheDocument();
  });

  it('should show the correct message when the number of filtered items is not reduced', () => {
    render(
      <FilterSummary
        totalAcometidas={10}
        filteredAcometidas={10}
        activeFilters={1}
        isFiltered={true}
      />
    );

    expect(screen.getByText(/mostrando/i)).toBeInTheDocument();
  });
});
