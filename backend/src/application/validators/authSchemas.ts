import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .trim()
    .min(2, 'O nome deve ter no mínimo 2 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .trim()
    .email('Formato de e-mail inválido')
    .max(255, 'E-mail muito longo')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(8, 'A senha deve possuir no mínimo 8 caracteres')
    .max(128, 'A senha não pode exceder 128 caracteres'),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .trim()
    .email('Formato de e-mail inválido')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(1, 'Senha não pode ser vazia')
    .max(128, 'Senha inválida'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
