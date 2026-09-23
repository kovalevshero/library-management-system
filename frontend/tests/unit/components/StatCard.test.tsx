import { render, screen } from '@testing-library/react';
import { StatCard } from '../../../src/presentation/components/StatCard';

describe('StatCard Component', () => {
  it('renders title, value, and subtitle accurately', () => {
    render(
      <StatCard
        title="Available Stock"
        value={5}
        subtitle="Ready to loan"
      />
    );

    expect(screen.getByText('Available Stock')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Ready to loan')).toBeInTheDocument();
  });
});
