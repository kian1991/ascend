import z from 'zod';

export const ETHSchema = z.string().refine((value) => /^0x[a-fA-F0-9]{40}$/.test(value), {
    message: 'Invalid  address'
});

export type ETHAddress = z.infer<typeof ETHSchema>;

export const BeneficiarySchema = z.object({
    name: z.string().min(2),
    lastName: z.string().min(2),
    birthdate: z.date(), //ms later
    wallet: ETHSchema
});

export type Beneficiary = z.infer<typeof BeneficiarySchema>;
