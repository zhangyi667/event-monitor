'use client';

import { useState } from 'react';
import {
  formatAddress,
  formatTokenAmount,
  formatUSD,
  formatDate,
  formatRelativeTime,
  formatTxHash,
  formatCompact,
} from '@/lib/utils/format';
import {
  isValidAddress,
  isValidTxHash,
  isValidENS,
} from '@/lib/utils/validation';
import { fetchEvents, fetchEventsByAddress } from '@/lib/api/events';

export default function PlaygroundPage() {
  const [apiResult, setApiResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test data
  const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9';
  const testTxHash =
    '0xa1b2c3d4e5f67890123456789012345678901234567890123456789012345678';
  const testTokenAmount = '1500000000000000000'; // 1.5 ETH in wei
  const testDate = new Date();

  const testFetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEvents({ page: 0, size: 5 });
      setApiResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const testFetchByAddress = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEventsByAddress(testAddress, 0, 5);
      setApiResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events by address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8">Feature Testing Playground</h1>
      <p className="text-muted-foreground mb-8">
        Manually test all utilities and API functions built so far.
      </p>

      {/* Format Utilities */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">🎨 Format Utilities</h2>
        <div className="space-y-4">
          <TestItem
            label="formatAddress"
            input={testAddress}
            output={formatAddress(testAddress)}
            description="Shortens Ethereum addresses"
          />
          <TestItem
            label="formatAddress (custom length)"
            input={`${testAddress} (6 chars)`}
            output={formatAddress(testAddress, 6)}
          />
          <TestItem
            label="formatTxHash"
            input={testTxHash}
            output={formatTxHash(testTxHash)}
            description="Shortens transaction hashes"
          />
          <TestItem
            label="formatTokenAmount (18 decimals)"
            input={testTokenAmount}
            output={formatTokenAmount(testTokenAmount, 18)}
            description="Converts Wei to ETH"
          />
          <TestItem
            label="formatTokenAmount (6 decimals - USDC)"
            input="1000000"
            output={formatTokenAmount('1000000', 6)}
          />
          <TestItem
            label="formatUSD"
            input="1234.56"
            output={formatUSD(1234.56)}
            description="Formats USD currency"
          />
          <TestItem
            label="formatDate"
            input={testDate.toISOString()}
            output={formatDate(testDate)}
            description="Formats dates"
          />
          <TestItem
            label="formatRelativeTime"
            input="5 minutes ago"
            output={formatRelativeTime(new Date(Date.now() - 5 * 60 * 1000))}
          />
          <TestItem
            label="formatCompact (1.5M)"
            input="1500000"
            output={formatCompact(1500000)}
            description="Compacts large numbers"
          />
          <TestItem
            label="formatCompact (2.3K)"
            input="2300"
            output={formatCompact(2300)}
          />
        </div>
      </section>

      {/* Validation Utilities */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">✅ Validation Utilities</h2>
        <div className="space-y-4">
          <ValidationItem
            label="isValidAddress (valid)"
            input={testAddress}
            isValid={isValidAddress(testAddress)}
          />
          <ValidationItem
            label="isValidAddress (invalid)"
            input="not-an-address"
            isValid={isValidAddress('not-an-address')}
          />
          <ValidationItem
            label="isValidTxHash (valid)"
            input={testTxHash}
            isValid={isValidTxHash(testTxHash)}
          />
          <ValidationItem
            label="isValidTxHash (invalid)"
            input="0x123"
            isValid={isValidTxHash('0x123')}
          />
          <ValidationItem
            label="isValidENS (valid)"
            input="vitalik.eth"
            isValid={isValidENS('vitalik.eth')}
          />
          <ValidationItem
            label="isValidENS (invalid)"
            input="vitalik.com"
            isValid={isValidENS('vitalik.com')}
          />
        </div>
      </section>

      {/* API Functions */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">🌐 API Functions</h2>
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            ⚠️ Note: Backend must be running on{' '}
            <code className="bg-muted px-2 py-1 rounded">
              http://localhost:8080
            </code>
          </p>

          <div className="flex gap-4">
            <button
              onClick={testFetchEvents}
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Test fetchEvents()'}
            </button>

            <button
              onClick={testFetchByAddress}
              disabled={loading}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Test fetchEventsByAddress()'}
            </button>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
              <strong>Error:</strong> {error}
            </div>
          )}

          {apiResult && (
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-semibold mb-2">API Response:</h3>
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(apiResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </section>

      {/* Browser Console Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          💻 Browser Console Examples
        </h2>
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Open DevTools Console (F12) and try these commands:
          </p>
          <CodeBlock
            code={`// Test format utilities
import { formatAddress } from '@/lib/utils/format';
formatAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9');

// Test API client
import { fetchEvents } from '@/lib/api/events';
const events = await fetchEvents({ page: 0, size: 10 });
console.log(events);`}
          />
        </div>
      </section>
    </div>
  );
}

// Helper Components
function TestItem({
  label,
  input,
  output,
  description,
}: {
  label: string;
  input: string;
  output: string;
  description?: string;
}) {
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">{label}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mb-2">{description}</p>
          )}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Input:</span>
              <code className="ml-2 bg-muted px-2 py-1 rounded text-xs">
                {input}
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">Output:</span>
              <code className="ml-2 bg-muted px-2 py-1 rounded text-xs font-semibold">
                {output}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ValidationItem({
  label,
  input,
  isValid,
}: {
  label: string;
  input: string;
  isValid: boolean;
}) {
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm mb-1">{label}</h3>
          <code className="text-xs bg-muted px-2 py-1 rounded">{input}</code>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isValid
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}
        >
          {isValid ? '✓ Valid' : '✗ Invalid'}
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
        {code}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-3 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
