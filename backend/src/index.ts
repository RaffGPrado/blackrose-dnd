import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import http from 'http';
import { initSchema, db } from './config/db.js';
import { runSeed } from './scripts/seed.js';
import { initGameServer } from './websocket/GameServer.js';
import authRoutes from './routes/auth.js';
import characterRoutes from './routes/characters.js';
import spellRoutes from './routes/spells.js';
import referenceRoutes from './routes/reference.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security check for JWT secret in production
if (
  process.env.NODE_ENV === 'production' &&
  (!process.env.JWT_SECRET ||
    process.env.JWT_SECRET === 'black_rose_dnd_super_secret_jwt_key_2026' ||
    process.env.JWT_SECRET === 'change_this_to_a_secure_random_string_in_production')
) {
  console.warn(
    '⚠️ [SECURITY WARNING]: Running in production with default or insecure JWT_SECRET! Please configure a secure key in your environment.'
  );
}

const app = express();
const PORT = process.env.PORT || 4000;

// Enable reverse proxy trust for Caddy / Nginx / Cloudflare (real client IP and HTTPS proto)
app.set('trust proxy', 1);

// HTTP Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Vite SPA, inline styles and WebSocket connections
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows serving local card assets
  })
);

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Payload size limit
app.use(express.json({ limit: '1mb' }));

// Rate limiting: general API protection
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Por favor, tente novamente em alguns minutos.' },
});

// Rate limiting: strict protection against brute force on auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 attempts per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de autenticação. Aguarde 1 minuto antes de tentar novamente.' },
});

app.use('/api/', generalApiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Initialize schema
initSchema();

// Auto-seed if database is brand new (e.g. no spells or reference items yet)
import { sql } from 'drizzle-orm';
const spellCount = db.get<{ count: number }>(sql`SELECT COUNT(*) as count FROM spells`);
const refItemCount = db.get<{ count: number }>(sql`SELECT COUNT(*) as count FROM reference_items`);
if (!spellCount || spellCount.count === 0 || !refItemCount || refItemCount.count === 0) {
  console.log('Database missing initial or reference data. Running seed...');
  runSeed();
}

// Serve card images statically
const candidatePaths = [
  process.env.CARDS_PATH,
  path.resolve(__dirname, '../assets/magic_cards'),
].filter((p): p is string => Boolean(p));

const cardsPath = candidatePaths.find((p) => fs.existsSync(p)) || path.resolve(__dirname, '../assets/magic_cards');
app.use('/cards', express.static(cardsPath));

// Routes
app.get('/api/health', (_req: Request, res: Response): void => {
  res.json({ status: 'ok', name: 'Black Rose DnD API', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/spells', spellRoutes);
app.use('/api/reference', referenceRoutes);

// Serve frontend build if available
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req: Request, res: Response, next: NextFunction): void => {
    if (req.path.startsWith('/api') || req.path.startsWith('/cards')) {
      next();
      return;
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Global error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = http.createServer(app);
initGameServer(server);

server.listen(PORT, () => {
  console.log(`🗡️ Black Rose DnD Backend running on http://localhost:${PORT}`);
});

export default app;
