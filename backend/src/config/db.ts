import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/node-sqlite';
import { Result } from 'neverthrow';
import * as schema from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'black_rose.db');
const sqlite = new DatabaseSync(dbPath);

sqlite.exec('PRAGMA foreign_keys = ON;');
sqlite.exec('PRAGMA journal_mode = WAL;');
sqlite.exec('PRAGMA synchronous = NORMAL;');
sqlite.exec('PRAGMA busy_timeout = 5000;');

const createRawDrizzle = () => drizzle({ client: sqlite, relations: schema.schemaRelations });

export type DrizzleDB = ReturnType<typeof createRawDrizzle>;
export type DrizzleTx = Parameters<Parameters<DrizzleDB['transaction']>[0]>[0];
export type DbExecutor = DrizzleDB | DrizzleTx;

export class DatabaseManager {
  private static instance: DrizzleDB | null = null;

  private constructor() {}

  public static getInstance(): DrizzleDB {
    if (!DatabaseManager.instance) {
      const rawInstance = createRawDrizzle();

      DatabaseManager.instance = new Proxy<DrizzleDB>(rawInstance, {
        get(target: DrizzleDB, propKey: string | symbol, receiver: unknown): unknown {
          const originalProperty = Reflect.get(target, propKey, receiver);

          if (typeof originalProperty === 'function') {
            return (...args: unknown[]): unknown => {
              const start = performance.now();
              const executionResult = Result.fromThrowable(
                () => (originalProperty as (...fnArgs: unknown[]) => unknown).apply(target, args),
                (error) => error
              )();
              const duration = performance.now() - start;

              if (duration > 50) {
                console.warn(`⚠️ [SLOW QUERY: ${duration.toFixed(2)}ms] ${String(propKey)}`);
              }

              if (executionResult.isErr()) {
                console.error(`🚨 [DB ERROR] ${String(propKey)}`, executionResult.error);
                throw executionResult.error;
              }

              return executionResult.value;
            };
          }

          return originalProperty;
        },
      });
    }

    return DatabaseManager.instance;
  }
}

export const db: DrizzleDB = DatabaseManager.getInstance();

const ensureColumn = (tableName: string, columnName: string, columnDefinition: string): void => {
  const res = Result.fromThrowable(
    () => {
      const columns = sqlite.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
      const exists = columns.some((col) => col.name === columnName);
      if (!exists) {
        sqlite.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition};`);
      }
    },
    (error) => {
      console.error(`🚨 [DB MIGRATION ERROR] ${tableName}.${columnName}:`, error);
      return error;
    }
  )();
};

export const initSchema = (): void => {
  Result.fromThrowable(
    () => {
      sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS races (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      name_en TEXT NOT NULL DEFAULT '',
      hit_die TEXT NOT NULL DEFAULT '1d8',
      spellcasting_ability TEXT,
      caster_type TEXT NOT NULL DEFAULT 'none',
      saving_throws TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS spells (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_en TEXT,
      level INTEGER NOT NULL,
      school TEXT NOT NULL,
      casting_time TEXT NOT NULL DEFAULT '1 Ação',
      range TEXT NOT NULL DEFAULT 'Pessoal',
      components TEXT NOT NULL DEFAULT 'V, S',
      duration TEXT NOT NULL DEFAULT 'Instantânea',
      concentration INTEGER NOT NULL DEFAULT 0,
      ritual INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL DEFAULT '',
      image_filename TEXT NOT NULL,
      image_path TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      race_id INTEGER,
      class_id INTEGER,
      level INTEGER DEFAULT 1,
      max_hp INTEGER NOT NULL DEFAULT 10,
      current_hp INTEGER NOT NULL DEFAULT 10,
      temp_hp INTEGER NOT NULL DEFAULT 0,
      armor_class INTEGER NOT NULL DEFAULT 10,
      speed INTEGER NOT NULL DEFAULT 30,
      initiative_bonus INTEGER DEFAULT 0,
      hit_dice_total TEXT DEFAULT '1d8',
      hit_dice_current INTEGER DEFAULT 1,
      death_successes INTEGER DEFAULT 0,
      death_failures INTEGER DEFAULT 0,
      inspiration INTEGER DEFAULT 0,
      spellcasting_ability TEXT DEFAULT 'intelligence',
      
      strength INTEGER NOT NULL DEFAULT 10,
      dexterity INTEGER NOT NULL DEFAULT 10,
      constitution INTEGER NOT NULL DEFAULT 10,
      intelligence INTEGER NOT NULL DEFAULT 10,
      wisdom INTEGER NOT NULL DEFAULT 10,
      charisma INTEGER NOT NULL DEFAULT 10,

      coins_cp INTEGER DEFAULT 0,
      coins_sp INTEGER DEFAULT 0,
      coins_ep INTEGER DEFAULT 0,
      coins_gp INTEGER DEFAULT 0,
      coins_pp INTEGER DEFAULT 0,

      background TEXT,
      alignment TEXT,
      personality_traits TEXT,
      ideals TEXT,
      bonds TEXT,
      flaws TEXT,
      proficiencies_languages TEXT,
      conditions TEXT DEFAULT '[]',
      current_initiative INTEGER DEFAULT NULL,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (race_id) REFERENCES races (id),
      FOREIGN KEY (class_id) REFERENCES classes (id)
    );

    CREATE INDEX IF NOT EXISTS idx_user ON characters(user_id);

    CREATE TABLE IF NOT EXISTS character_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER NOT NULL,
      skill_key TEXT NOT NULL,
      FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE,
      UNIQUE (character_id, skill_key)
    );

    CREATE INDEX IF NOT EXISTS idx_char_skills ON character_skills(character_id);

    CREATE TABLE IF NOT EXISTS character_saving_throws (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER NOT NULL,
      ability_key TEXT NOT NULL,
      FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE,
      UNIQUE (character_id, ability_key)
    );

    CREATE INDEX IF NOT EXISTS idx_char_saves ON character_saving_throws(character_id);

    CREATE TABLE IF NOT EXISTS character_spells (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER NOT NULL,
      spell_id INTEGER NOT NULL,
      prepared INTEGER DEFAULT 1,
      FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE,
      FOREIGN KEY (spell_id) REFERENCES spells (id) ON DELETE CASCADE,
      UNIQUE (character_id, spell_id)
    );

    CREATE INDEX IF NOT EXISTS idx_char_spells ON character_spells(character_id);

    CREATE TABLE IF NOT EXISTS character_spell_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER NOT NULL,
      slot_level INTEGER NOT NULL,
      max_slots INTEGER NOT NULL DEFAULT 0,
      used_slots INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE,
      UNIQUE (character_id, slot_level)
    );

    CREATE INDEX IF NOT EXISTS idx_char_slots ON character_spell_slots(character_id);

    CREATE TABLE IF NOT EXISTS character_attacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      bonus TEXT NOT NULL,
      damage_type TEXT NOT NULL,
      FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_char_attacks ON character_attacks(character_id);

    CREATE TABLE IF NOT EXISTS character_features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      uses_max INTEGER DEFAULT 0,
      uses_current INTEGER DEFAULT 0,
      recovery TEXT DEFAULT 'Descanso Longo',
      FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_char_features ON character_features(character_id);

    CREATE TABLE IF NOT EXISTS character_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'Equipamento',
      quantity INTEGER DEFAULT 1,
      description TEXT,
      effect TEXT,
      damage TEXT,
      properties TEXT,
      weight REAL DEFAULT 0.0,
      equipped INTEGER DEFAULT 0,
      FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_char_items ON character_items(character_id);

    CREATE TABLE IF NOT EXISTS reference_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      weight REAL DEFAULT 0.0,
      cost TEXT,
      damage TEXT,
      armor_class TEXT,
      properties TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS reference_features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      source_type TEXT NOT NULL DEFAULT 'Classe',
      class_name TEXT,
      level INTEGER DEFAULT 1,
      uses_max INTEGER DEFAULT 0,
      recovery TEXT DEFAULT 'Descanso Longo',
      description TEXT
    );
  `);
    },
    (err) => {
      console.error('🚨 [CREATE TABLE ERROR]:', err);
      return err;
    }
  )();

  ensureColumn('classes', 'name_en', "TEXT NOT NULL DEFAULT ''");
  ensureColumn('classes', 'hit_die', "TEXT NOT NULL DEFAULT '1d8'");
  ensureColumn('classes', 'spellcasting_ability', 'TEXT');
  ensureColumn('classes', 'caster_type', "TEXT NOT NULL DEFAULT 'none'");
  ensureColumn('classes', 'saving_throws', "TEXT NOT NULL DEFAULT '[]'");

  ensureColumn('spells', 'name_en', 'TEXT');
  ensureColumn('spells', 'casting_time', "TEXT NOT NULL DEFAULT '1 Ação'");
  ensureColumn('spells', 'range', "TEXT NOT NULL DEFAULT 'Pessoal'");
  ensureColumn('spells', 'components', "TEXT NOT NULL DEFAULT 'V, S'");
  ensureColumn('spells', 'duration', "TEXT NOT NULL DEFAULT 'Instantânea'");
  ensureColumn('spells', 'concentration', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('spells', 'ritual', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('spells', 'description', "TEXT NOT NULL DEFAULT ''");

  ensureColumn('characters', 'conditions', "TEXT DEFAULT '[]'");
  ensureColumn('characters', 'current_initiative', 'INTEGER DEFAULT NULL');

  ensureColumn('character_spells', 'prepared', 'INTEGER NOT NULL DEFAULT 1');

  ensureColumn('character_features', 'recovery', "TEXT DEFAULT 'Descanso Longo'");

  ensureColumn('character_items', 'category', "TEXT DEFAULT 'Equipamento'");
  ensureColumn('character_items', 'description', 'TEXT');
  ensureColumn('character_items', 'effect', 'TEXT');
  ensureColumn('character_items', 'damage', 'TEXT');
  ensureColumn('character_items', 'properties', 'TEXT');
};

initSchema();

