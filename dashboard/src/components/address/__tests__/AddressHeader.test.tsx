/**
 * Integration tests for AddressHeader component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddressHeader } from '../AddressHeader';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

describe('AddressHeader', () => {
  const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render address correctly', () => {
    render(<AddressHeader address={mockAddress} />);

    expect(screen.getByText(mockAddress)).toBeInTheDocument();
  });

  it('should render ENS name when provided', () => {
    render(<AddressHeader address={mockAddress} ensName="vitalik.eth" />);

    expect(screen.getByText('vitalik.eth')).toBeInTheDocument();
  });

  it('should not render ENS badge when not provided', () => {
    render(<AddressHeader address={mockAddress} />);

    expect(screen.queryByText(/\.eth$/)).not.toBeInTheDocument();
  });

  it('should copy address to clipboard when copy button clicked', async () => {
    render(<AddressHeader address={mockAddress} />);

    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockAddress);

    // Should show "Copied" feedback
    await waitFor(() => {
      expect(screen.getByText('Copied')).toBeInTheDocument();
    });
  });

  it('should revert copy button text after 2 seconds', async () => {
    jest.useFakeTimers();
    render(<AddressHeader address={mockAddress} />);

    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);

    // Should show "Copied"
    await waitFor(() => {
      expect(screen.getByText('Copied')).toBeInTheDocument();
    });

    // Fast-forward 2 seconds
    jest.advanceTimersByTime(2000);

    // Should revert to "Copy"
    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('should have Etherscan link with correct URL', () => {
    render(<AddressHeader address={mockAddress} />);

    const etherscanLink = screen.getByRole('link', { name: /etherscan/i });
    expect(etherscanLink).toHaveAttribute(
      'href',
      `https://etherscan.io/address/${mockAddress}`
    );
    expect(etherscanLink).toHaveAttribute('target', '_blank');
    expect(etherscanLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should display description text', () => {
    render(<AddressHeader address={mockAddress} />);

    expect(
      screen.getByText(/View all transactions and statistics/i)
    ).toBeInTheDocument();
  });
});
