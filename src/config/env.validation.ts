import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z.coerce.number().default(8080),
  // Database
  DB_HOST: z.string().trim().min(1),
  DB_PORT: z.coerce.number().int().min(1).max(65535),
  DB_USERNAME: z.string().trim().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().trim().min(1),
  DB_POOL_MAX: z.coerce.number().default(10),
  DB_POOL_MIN: z.coerce.number().default(2),
  DB_POOL_CONNECTION_TIMEOUT_MS: z.coerce.number().default(5000),
  DB_POOL_IDLE_TIMEOUT_MS: z.coerce.number().default(30000),

  // Throttler
  THROTTLE_TTL_MS: z.coerce.number().default(1000),
  THROTTLE_LIMIT: z.coerce.number().default(60),
});

export type Env = z.infer<typeof envSchema>;

//Kiểm tra kết quả
export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => ` - ${i.path.join('.')}: ${i.message}`)
      .join(`\n`);

    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  return parsed.data;
}
