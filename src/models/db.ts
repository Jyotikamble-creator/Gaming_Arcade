/**
 * PostgreSQL Database Connection — Prisma
 * This file provides database connection utilities for the gamearchade application
 * Automatic connection pooling handled by Prisma
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
 * Initialize database connection
 * Prisma handles connection pooling automatically
 */
export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma');
    return prisma;
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:', error);
    throw error;
  }
}

/**
 * Disconnect from database
 * Should be called on app shutdown
 */
export async function disconnectDB() {
  try {
    await prisma.$disconnect();
    console.log('✅ PostgreSQL disconnected');
  } catch (error) {
    console.error('❌ Failed to disconnect from PostgreSQL:', error);
  }
}

export default { connectDB, disconnectDB, prisma };
