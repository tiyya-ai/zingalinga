import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/neon.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;