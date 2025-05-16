// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Define a type for cache data
type CacheData = unknown;

// Define the product cache type
interface ProductCache {
  bestsellers: { data: CacheData | null, timestamp: number };
  featured: { data: CacheData | null, timestamp: number };
  categories: Record<string, { data: CacheData | null, timestamp: number }>;
}

// Extend the global type to include our custom properties
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var productCache: ProductCache | undefined;
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Configure Prisma to not use transactions if they're not supported
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error'], // Reduce logging to only errors
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Adjust transaction options for better stability
  transactionOptions: {
    maxWait: 5000, // 5s
    timeout: 10000, // 10s
  }
});

// Initialize product cache if it doesn't exist
if (!global.productCache) {
  global.productCache = {
    bestsellers: { data: null, timestamp: 0 },
    featured: { data: null, timestamp: 0 },
    categories: {}
  };
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
