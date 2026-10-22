import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodSchema } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parseResult = schema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      res.status(400).json({
        error: 'Erro de validação dos dados de entrada',
        details: errorMessages,
      });
      return;
    }

    req.body = parseResult.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parseResult = schema.safeParse(req.query);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      res.status(400).json({
        error: 'Parâmetros de busca inválidos',
        details: errorMessages,
      });
      return;
    }

    req.query = parseResult.data as unknown as Request['query'];
    next();
  };
}
