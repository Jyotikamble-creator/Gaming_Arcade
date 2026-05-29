/**
 * Prisma Configuration - Database connection setup
 * Configuration is handled through DATABASE_URL environment variable:
 * - Development: file:./prisma/dev.db
 * - Production: postgresql://user:password@host:port/database
 * 
 * This file is for reference only. Prisma 6+ uses .env for configuration.
 */

export const prismaConfig = {
  // Connection handled via DATABASE_URL in .env
  // See schema.prisma for datasource configuration
} as const;

