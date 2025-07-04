import { z } from 'zod';

const EnvSchema = z.object({
  PRIVY_CLIENT_ID: z.string(),
  PRIVY_APP_ID: z.string(),
  PRIVY_APP_SECRET: z.string(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  throw new Error('Invalid environment variables');
}

export const ENV = parsed.data;
export type Env = z.infer<typeof EnvSchema>;
