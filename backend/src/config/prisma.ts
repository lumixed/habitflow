import { PrismaClient } from '@prisma/client';

// In development, ts-node reloads the module on every change.
// Without this check, each reload would open a new connection pool,
// eventually exhausting the database connection limit.

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
