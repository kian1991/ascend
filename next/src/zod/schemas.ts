import z from 'zod';

export const ETHSchema = z
  .string()
  .refine((value) => /^0x[a-fA-F0-9]{40}$/.test(value), {
    message: 'Invalid  address',
  });
