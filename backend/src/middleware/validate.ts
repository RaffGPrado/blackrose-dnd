import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parseResult = schema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
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

export function validateQuery<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parseResult = schema.safeParse(req.query);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
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
