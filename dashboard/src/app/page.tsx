import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Event Monitor
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Real-time Ethereum ERC20 token transfer monitoring. Track transactions,
          analyze trends, and stay updated with blockchain activity.
        </p>
        <div className="flex gap-4">
          <Link
            href={ROUTES.EVENTS}
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            View Events
          </Link>
          <Link
            href={ROUTES.DASHBOARD}
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
