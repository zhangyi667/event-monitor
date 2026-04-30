/**
 * Route Path Constants
 */

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  EVENTS: '/events',
  EVENT_DETAILS: (txHash: string) => `/events/${txHash}`,
  ADDRESS: (address: string) => `/address/${address}`,
  ABOUT: '/about',
} as const;

export default ROUTES;
