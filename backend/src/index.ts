import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
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

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for frontend development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

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
