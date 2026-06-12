/**
 * PostgreSQL Database Connection
 * Connects to PostgreSQL using Prisma ORM
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Connect to PostgreSQL database
 * Prisma automatically manages connection pooling
 */
export async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL via Prisma');
    return prisma;
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:', error);
    throw error;
  }
}

// Default export for compatibility
export default connectToDatabase;