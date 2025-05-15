// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Configure Prisma to not use transactions if they're not supported
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  // Add connection pooling
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Disable transactions for environments that don't support them
  transactionOptions: {
    maxWait: 10000, // 10s
    timeout: 5000, // 5s
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
