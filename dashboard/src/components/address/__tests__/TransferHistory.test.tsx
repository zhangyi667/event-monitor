/**
 * Integration tests for TransferHistory component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { TransferHistory } from '../TransferHistory';
import type { TransferEvent } from '@/types';

// Mock EventCard component
jest.mock('@/components/events/EventCard', () => ({
  EventCard: ({ event }: { event: TransferEvent }) => (
    <div data-testid={`event-${event.id}`}>{event.id}</div>
  ),
}));

describe('TransferHistory', () => {
  const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9';

  const mockEvents: TransferEvent[] = [
    {
      id: '1',
      transactionHash: '0xabc123',
      blockNumber: 18000000,
      timestamp: '2024-01-15T10:30:00Z',
      from: testAddress,
      to: '0x1111111111111111111111111111111111111111',
      value: '1000000000000000000',
      token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      tokenSymbol: 'USDC',
      decimals: 6,
    },
    {
      id: '2',
      transactionHash: '0xdef456',
      blockNumber: 18000001,
      timestamp: '2024-01-15T10:31:00Z',
      from: '0x2222222222222222222222222222222222222222',
      to: testAddress,
      value: '2000000000000000000',
      token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      tokenSymbol: 'USDC',
      decimals: 6,
    },
    {
      id: '3',
      transactionHash: '0xghi789',
      blockNumber: 18000002,
      timestamp: '2024-01-15T10:32:00Z',
      from: testAddress,
      to: '0x3333333333333333333333333333333333333333',
      value: '500000000000000000',
      token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      tokenSymbol: 'USDC',
      decimals: 6,
    },
  ];

  it('should render all tabs', () => {
    render(
      <TransferHistory address={testAddress} events={mockEvents} />
    );

    expect(screen.getByRole('button', { name: /All/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sent/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Received/i })).toBeInTheDocument();
  });

  it('should show correct counts in tabs', () => {
    render(
      <TransferHistory address={testAddress} events={mockEvents} />
    );

    // All: 3 events
    const allButton = screen.getByRole('button', { name: /All/i });
    expect(allButton).toHaveTextContent('All');
    expect(allButton).toHaveTextContent('3');

    // Sent: 2 events (id 1 and 3)
    const sentButton = screen.getByRole('button', { name: /Sent/i });
    expect(sentButton).toHaveTextContent('Sent');
    expect(sentButton).toHaveTextContent('2');

    // Received: 1 event (id 2)
    const receivedButton = screen.getByRole('button', { name: /Received/i });
    expect(receivedButton).toHaveTextContent('Received');
    expect(receivedButton).toHaveTextContent('1');
  });

  it('should display all events by default', () => {
    render(
      <TransferHistory address={testAddress} events={mockEvents} />
    );

    expect(screen.getByTestId('event-1')).toBeInTheDocument();
    expect(screen.getByTestId('event-2')).toBeInTheDocument();
    expect(screen.getByTestId('event-3')).toBeInTheDocument();
  });

  it('should filter to sent events when Sent tab clicked', () => {
    render(
      <TransferHistory address={testAddress} events={mockEvents} />
    );

    const sentTab = screen.getByRole('button', { name: /Sent/i });
    fireEvent.click(sentTab);

    // Should show events 1 and 3 (sent from testAddress)
    expect(screen.getByTestId('event-1')).toBeInTheDocument();
    expect(screen.queryByTestId('event-2')).not.toBeInTheDocument();
    expect(screen.getByTestId('event-3')).toBeInTheDocument();
  });

  it('should filter to received events when Received tab clicked', () => {
    render(
      <TransferHistory address={testAddress} events={mockEvents} />
    );

    const receivedTab = screen.getByRole('button', { name: /Received/i });
    fireEvent.click(receivedTab);

    // Should show only event 2 (received by testAddress)
    expect(screen.queryByTestId('event-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('event-2')).toBeInTheDocument();
    expect(screen.queryByTestId('event-3')).not.toBeInTheDocument();
  });

  it('should highlight active tab', () => {
    render(
      <TransferHistory address={testAddress} events={mockEvents} />
    );

    const allTab = screen.getByRole('button', { name: /All/i });
    const sentTab = screen.getByRole('button', { name: /Sent/i });

    // All should be active by default
    expect(allTab).toHaveClass('bg-primary'); // or whatever your active class is

    // Click Sent tab
    fireEvent.click(sentTab);

    // Sent should now be active
    expect(sentTab).toHaveClass('bg-primary');
  });

  it('should show empty state when no events', () => {
    render(
      <TransferHistory address={testAddress} events={[]} />
    );

    expect(screen.getByText(/No.*transfers found/i)).toBeInTheDocument();
  });

  it('should show empty state for filtered tab with no results', () => {
    const onlyReceivedEvents: TransferEvent[] = [mockEvents[1]];

    render(
      <TransferHistory address={testAddress} events={onlyReceivedEvents} />
    );

    // Click Sent tab
    const sentTab = screen.getByRole('button', { name: /Sent/i });
    fireEvent.click(sentTab);

    expect(screen.getByText(/No sent transfers found/i)).toBeInTheDocument();
  });

  it('should show Load More button when hasMore is true', () => {
    render(
      <TransferHistory
        address={testAddress}
        events={mockEvents}
        hasMore={true}
      />
    );

    expect(screen.getByRole('button', { name: /Load More/i })).toBeInTheDocument();
  });

  it('should not show Load More button when hasMore is false', () => {
    render(
      <TransferHistory
        address={testAddress}
        events={mockEvents}
        hasMore={false}
      />
    );

    expect(screen.queryByRole('button', { name: /Load More/i })).not.toBeInTheDocument();
  });

  it('should call onLoadMore when Load More clicked', () => {
    const onLoadMore = jest.fn();

    render(
      <TransferHistory
        address={testAddress}
        events={mockEvents}
        hasMore={true}
        onLoadMore={onLoadMore}
      />
    );

    const loadMoreButton = screen.getByRole('button', { name: /Load More/i });
    fireEvent.click(loadMoreButton);

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('should disable Load More button when loading', () => {
    render(
      <TransferHistory
        address={testAddress}
        events={mockEvents}
        hasMore={true}
        isLoading={true}
      />
    );

    const loadMoreButton = screen.getByRole('button', { name: /Loading/i });
    expect(loadMoreButton).toBeDisabled();
  });

  it('should be case-insensitive when filtering', () => {
    const mixedCaseAddress = '0x742D35cc6634c0532925A3b844bc9E7595f0bEb9';

    render(
      <TransferHistory address={mixedCaseAddress} events={mockEvents} />
    );

    const sentTab = screen.getByRole('button', { name: /Sent/i });
    fireEvent.click(sentTab);

    // Should still filter correctly despite case differences
    expect(screen.getByTestId('event-1')).toBeInTheDocument();
    expect(screen.getByTestId('event-3')).toBeInTheDocument();
  });
});
