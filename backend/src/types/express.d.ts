/**
 * Express Request augmentation — adds `req.user` typed from JWT payload.
 */
declare namespace Express {
  interface Request {
    user?: {
      id: number;
      name: string;
      email: string;
    };
  }
}
