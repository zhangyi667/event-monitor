import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080/api';
process.env.NEXT_PUBLIC_SSE_URL = 'http://localhost:8080/api/events/stream';
