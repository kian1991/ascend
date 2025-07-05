// import { z } from 'zod';

// const EnvSchema = z.object({
//   NEXT_PUBLIC_PRIVY_CLIENT_ID: z.string(),
//   NEXT_PUBLIC_PRIVY_APP_ID: z.string(),
// });

// const parsed = EnvSchema.safeParse(process.env);
// if (!parsed.success) {
//   console.error('Invalid environment variables:', parsed.error.format());
//   throw new Error('Invalid environment variables');
// }

// export type Env = z.infer<typeof EnvSchema>;
// export const ENV: Env = parsed.data;
