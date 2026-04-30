/**
 * Integration tests for AddressStats component
 */

import { render, screen } from '@testing-library/react';
import { AddressStats } from '../AddressStats';

describe('AddressStats', () => {
  it('should render all three stat cards', () => {
    render(
      <AddressStats
        totalSent="1000000000000000000"
        totalReceived="2000000000000000000"
        transactionCount={50}
      />
    );

    expect(screen.getByText('Total Sent')).toBeInTheDocument();
    expect(screen.getByText('Total Received')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  it('should format sent value correctly', () => {
    // 1 ETH in Wei
    render(
      <AddressStats
        totalSent="1000000000000000000"
        totalReceived="0"
        transactionCount={0}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should format large values with compact notation', () => {
    // 1.5M ETH in Wei
    const largeValue = (1500000n * 10n ** 18n).toString();
    render(
      <AddressStats
        totalSent={largeValue}
        totalReceived="0"
        transactionCount={0}
      />
    );

    expect(screen.getByText('1.5M')).toBeInTheDocument();
  });

  it('should handle zero values', () => {
    render(
      <AddressStats
        totalSent="0"
        totalReceived="0"
        transactionCount={0}
      />
    );

    const zeroValues = screen.getAllByText('0');
    expect(zeroValues.length).toBeGreaterThanOrEqual(2);
  });

  it('should format transaction count', () => {
    render(
      <AddressStats
        totalSent="0"
        totalReceived="0"
        transactionCount={1234}
      />
    );

    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('should use custom decimals when provided', () => {
    // 1 USDC (6 decimals) in smallest unit
    render(
      <AddressStats
        totalSent="1000000"
        totalReceived="0"
        transactionCount={0}
        decimals={6}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should display helper text', () => {
    render(
      <AddressStats
        totalSent="0"
        totalReceived="0"
        transactionCount={0}
      />
    );

    expect(screen.getAllByText('ETH equivalent')).toHaveLength(2);
    expect(screen.getByText('Total transfers')).toBeInTheDocument();
  });
});
