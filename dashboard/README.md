# Event Monitor Dashboard

Real-time Ethereum ERC20 token transfer monitoring dashboard built with Next.js. Connects to a Spring Boot backend via REST APIs and Server-Sent Events (SSE) for live blockchain event streaming.

## Features

- **Real-Time Event Feed** - Live streaming of ERC20 transfer events via SSE with auto-reconnect
- **Statistics Dashboard** - Aggregated analytics including total volume, transfer counts, top senders/receivers, and volume charts
- **Address Lookup** - View transfer history, sent/received stats for any Ethereum address
- **Search & Filtering** - Filter events by address, token, amount range, and date
- **Dark/Light Theme** - Toggle between themes with system preference detection
- **Kubernetes Ready** - Includes Dockerfile and k8s manifests for production deployment

## Screenshots

### Home Page
![Home Page](../home_page.png)

### Dashboard
![Dashboard](../dashboard.png)

### Real-Time Event Feed
![Events](../events.png)

## Architecture

```
event-monitor-dashboard (Next.js 16 / React 19)
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page
│   │   ├── events/             # Real-time event feed
│   │   ├── dashboard/          # Statistics dashboard
│   │   ├── address/[address]/  # Address detail page
│   │   └── api/health/         # Health check endpoint (k8s probes)
│   ├── components/
│   │   ├── events/             # EventFeed, EventCard, ConnectionStatus, Filters
│   │   ├── dashboard/          # StatsCard, VolumeChart, TokenChart, Leaderboard
│   │   ├── address/            # AddressHeader, AddressStats, TransferHistory
│   │   └── ui/                 # Reusable UI primitives (Button, Card, etc.)
│   ├── hooks/
│   │   └── useEventStream.ts   # SSE connection hook with auto-reconnect
│   ├── lib/
│   │   ├── api/                # API client, endpoints, event/stats fetchers
│   │   ├── constants/          # App config
│   │   └── utils/              # Formatting helpers (addresses, amounts, dates)
│   ├── types/                  # TypeScript interfaces
│   └── context/                # React context providers
├── k8s/
│   ├── deployment.yml          # Kubernetes Deployment
│   └── service.yml             # Kubernetes Service (NodePort)
├── Dockerfile                  # Multi-stage Docker build
└── public/                     # Static assets
```

### Data Flow

```
Ethereum Blockchain
       │
       ▼
Spring Boot Backend (event-monitor)
  ├── REST API  ──────► GET /api/events, /api/events/stats
  └── SSE Stream ─────► GET /api/events/stream
       │
       ▼
Next.js Dashboard (this repo)
  ├── React Query ────► Fetches historical events & stats
  └── EventSource ────► Real-time transfer event streaming
```

## Dependencies

### Runtime
| Package | Purpose |
|---|---|
| Next.js 16 | React framework with App Router |
| React 19 | UI library |
| @tanstack/react-query | Data fetching and caching |
| axios | HTTP client for REST APIs |
| recharts | Charts and data visualization |
| lucide-react | Icons |
| next-themes | Dark/light theme switching |
| date-fns | Date formatting |
| tailwindcss | Utility-first CSS framework |
| zod | Schema validation |

### Backend (separate repo)
| Service | Purpose |
|---|---|
| event-monitor (Spring Boot) | REST API + SSE streaming |
| PostgreSQL | Event storage |
| Prometheus | Metrics collection |

## Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your backend URL

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Kubernetes Deployment

#### Prerequisites

- Docker
- Kubernetes cluster (e.g., Colima, minikube, or cloud provider)
- `kubectl` configured
- Backend services deployed (event-monitor, PostgreSQL, Prometheus)

#### Steps

1. **Create the namespace** (if not already created by the backend):

```bash
kubectl create namespace event-monitor
```

2. **Build the Docker image**:

```bash
docker build -t event-monitor-dashboard:latest .
```

3. **Deploy to Kubernetes**:

```bash
kubectl apply -f k8s/deployment.yml
kubectl apply -f k8s/service.yml
```

4. **Verify the deployment**:

```bash
kubectl get pods -n event-monitor -l app=event-monitor-dashboard
kubectl get svc -n event-monitor event-monitor-dashboard-service
```

5. **Access the dashboard**:

```bash
# Port-forward to access locally
kubectl port-forward -n event-monitor svc/event-monitor-dashboard-service 3000:3000

# Open http://localhost:3000
```

#### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:30081/api` |
| `NEXT_PUBLIC_SSE_URL` | SSE stream endpoint | `http://localhost:30081/api/events/stream` |
| `NODE_ENV` | Environment mode | `development` |

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```
