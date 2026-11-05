import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Result } from 'neverthrow';
import { db, initSchema } from '../config/db.js';
import { referenceFeatures, referenceItems, spells } from '../config/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RACES_SEED = [
  'Human',
  'Elf',
  'Dwarf',
  'Halfling',
  'Dragonborn',
  'Gnome',
  'Half-Elf',
  'Half-Orc',
  'Tiefling',
] as const;

interface ClassSeedEntry {
  name: string;
  nameEn: string;
  hitDie: string;
  spellcastingAbility: string | null;
  casterType: 'full' | 'half' | 'pact' | 'none';
  savingThrows: string;
}

const CLASSES_SEED: ReadonlyArray<ClassSeedEntry> = [
  {
    name: 'Barbarian',
    nameEn: 'Barbarian',
    hitDie: '1d12',
    spellcastingAbility: null,
    casterType: 'none',
    savingThrows: JSON.stringify(['strength', 'constitution']),
  },
  {
    name: 'Bard',
    nameEn: 'Bard',
    hitDie: '1d8',
    spellcastingAbility: 'charisma',
    casterType: 'full',
    savingThrows: JSON.stringify(['dexterity', 'charisma']),
  },
  {
    name: 'Cleric',
    nameEn: 'Cleric',
    hitDie: '1d8',
    spellcastingAbility: 'wisdom',
    casterType: 'full',
    savingThrows: JSON.stringify(['wisdom', 'charisma']),
  },
  {
    name: 'Druid',
    nameEn: 'Druid',
    hitDie: '1d8',
    spellcastingAbility: 'wisdom',
    casterType: 'full',
    savingThrows: JSON.stringify(['intelligence', 'wisdom']),
  },
  {
    name: 'Fighter',
    nameEn: 'Fighter',
    hitDie: '1d10',
    spellcastingAbility: null,
    casterType: 'none',
    savingThrows: JSON.stringify(['strength', 'constitution']),
  },
  {
    name: 'Monk',
    nameEn: 'Monk',
    hitDie: '1d8',
    spellcastingAbility: null,
    casterType: 'none',
    savingThrows: JSON.stringify(['strength', 'dexterity']),
  },
  {
    name: 'Paladin',
    nameEn: 'Paladin',
    hitDie: '1d10',
    spellcastingAbility: 'charisma',
    casterType: 'half',
    savingThrows: JSON.stringify(['wisdom', 'charisma']),
  },
  {
    name: 'Ranger',
    nameEn: 'Ranger',
    hitDie: '1d10',
    spellcastingAbility: 'wisdom',
    casterType: 'half',
    savingThrows: JSON.stringify(['strength', 'dexterity']),
  },
  {
    name: 'Rogue',
    nameEn: 'Rogue',
    hitDie: '1d8',
    spellcastingAbility: null,
    casterType: 'none',
    savingThrows: JSON.stringify(['dexterity', 'intelligence']),
  },
  {
    name: 'Sorcerer',
    nameEn: 'Sorcerer',
    hitDie: '1d6',
    spellcastingAbility: 'charisma',
    casterType: 'full',
    savingThrows: JSON.stringify(['constitution', 'charisma']),
  },
  {
    name: 'Warlock',
    nameEn: 'Warlock',
    hitDie: '1d8',
    spellcastingAbility: 'charisma',
    casterType: 'pact',
    savingThrows: JSON.stringify(['wisdom', 'charisma']),
  },
  {
    name: 'Wizard',
    nameEn: 'Wizard',
    hitDie: '1d6',
    spellcastingAbility: 'intelligence',
    casterType: 'full',
    savingThrows: JSON.stringify(['intelligence', 'wisdom']),
  },
];

const SCHOOL_KEYWORDS: Readonly<Record<string, readonly string[]>> = {
  Abjuração: [
    'alarme',
    'armadura arcana',
    'escudo arcano',
    'protecao',
    'santuario',
    'tranca arcana',
    'dissipar magia',
    'contramagia',
    'banimento',
    'campo antimagia',
    'globo de invulnerabilidade',
    'pele de pedra',
  ],
  Adivinhação: [
    'detectar',
    'identificacao',
    'compreender idiomas',
    'augurio',
    'localizar',
    'videncia',
    'olho arcano',
    'visao da verdade',
    'golpe certeiro',
    'orientacao',
    'sexto sentido',
  ],
  Conjuração: [
    'invocar',
    'conjurar',
    'servo invisivel',
    'nevoa',
    'teia',
    'passo nebuloso',
    'porta dimensional',
    'teleporte',
    'bolha acida',
    ' Rajada',
    'criar comida',
    'muralha de espinhos',
  ],
  Encantamento: [
    'amizade',
    'zombaria',
    'enfeiticar',
    'sono',
    'comando',
    'bencao',
    'perdicao',
    'risada',
    'sugestao',
    'imobilizar',
    'dominar',
    'confusao',
    'palavra de poder',
    'zona da verdade',
    'heroismo',
  ],
  Evocação: [
    'bola de fogo',
    'misseis magicos',
    'raio',
    'relampago',
    'chama',
    'fogo',
    'luz',
    'curar ferimentos',
    'palavra curativa',
    'onda trovejante',
    'despedacar',
    'muralha de fogo',
    'muralha de gelo',
    'muralha de energia',
    'cone de frio',
    'corrente de relampagos',
    'explosao solar',
  ],
  Ilusão: [
    'ilusao',
    'imagem',
    'invisibilidade',
    'disfarcar',
    'silencio',
    'reflexos',
    'medo',
    'padrao hipnotico',
    'miragem',
    'simulacro',
  ],
  Necromancia: [
    'toque arrepiante',
    'infligir ferimentos',
    'raio adoecente',
    'animar mortos',
    'rogar maldicao',
    'toque vampirico',
    'malogro',
    'reviver os mortos',
    'ressurreicao',
    'dedo da morte',
    'clone',
  ],
  Transmutação: [
    'taumaturgia',
    'prestidigitacao',
    'consertar',
    'mensagem',
    'queda suave',
    'recuo acelerado',
    'salto',
    'passos longos',
    'alterar-se',
    'aumentar',
    'velocidade',
    'lentidao',
    'voo',
    'polimorfia',
    'telecinese',
    'desintegrar',
    'parar o tempo',
  ],
};

interface CompendiumItemJson {
  name: string;
  category: string;
  weight?: number | null;
  cost?: number | string | null;
  damage?: string | null;
  armor_class?: string | number | null;
  properties?: string | null;
  description?: string | null;
}

interface CompendiumFeatureJson {
  name: string;
  source_type?: string | null;
  class_name?: string | null;
  level?: number | null;
  uses_max?: number | null;
  recovery?: string | null;
  description?: string | null;
}

interface CompendiumFileJson {
  items?: CompendiumItemJson[];
  features?: CompendiumFeatureJson[];
}

interface SpellTranslationFileJson {
  entries?: Record<
    string,
    {
      name: string;
      description: string;
    }
  >;
}

interface NormalizedSpellEntry {
  nameEn: string;
  namePt: string;
  description: string;
}

const normalizeKey = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const detectSchool = (spellName: string): string => {
  const normalized = normalizeKey(spellName);
  for (const [school, keywords] of Object.entries(SCHOOL_KEYWORDS)) {
    if (keywords.some((kw) => normalized.includes(normalizeKey(kw)))) {
      return school;
    }
  }
  return 'Evocação';
};

const loadSpellTranslations = (): Map<string, NormalizedSpellEntry> => {
  const spellMap = new Map<string, NormalizedSpellEntry>();
  const spellsJsonPath = path.resolve(__dirname, '../data/original/dnd5e.spells.json');
  if (!fs.existsSync(spellsJsonPath)) {
    return spellMap;
  }

  const parsedResult = Result.fromThrowable(
    () => JSON.parse(fs.readFileSync(spellsJsonPath, 'utf-8')) as SpellTranslationFileJson,
    (error) => error
  )();

  if (parsedResult.isErr() || !parsedResult.value.entries) {
    return spellMap;
  }

  for (const [enName, entry] of Object.entries(parsedResult.value.entries)) {
    const record: NormalizedSpellEntry = {
      nameEn: enName,
      namePt: entry.name,
      description: stripHtml(entry.description || ''),
    };
    spellMap.set(normalizeKey(entry.name), record);
    spellMap.set(normalizeKey(enName), record);
  }

  return spellMap;
};

const seedRacesAndClasses = (): void => {
  const upsertRace = db.$client.prepare('INSERT OR IGNORE INTO races (name) VALUES (?)');
  for (const raceName of RACES_SEED) {
    upsertRace.run(raceName);
  }

  const upsertClass = db.$client.prepare(`
    INSERT INTO classes (name, name_en, hit_die, spellcasting_ability, caster_type, saving_throws)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET
      name_en = excluded.name_en,
      hit_die = excluded.hit_die,
      spellcasting_ability = excluded.spellcasting_ability,
      caster_type = excluded.caster_type,
      saving_throws = excluded.saving_throws
  `);

  for (const cls of CLASSES_SEED) {
    upsertClass.run(
      cls.name,
      cls.nameEn,
      cls.hitDie,
      cls.spellcastingAbility,
      cls.casterType,
      cls.savingThrows
    );
  }
};

const seedCompendiumReference = (): void => {
  const compendiumPath = path.resolve(__dirname, '../data/compendium_pt_br.json');
  if (!fs.existsSync(compendiumPath)) {
    return;
  }

  const parsedResult = Result.fromThrowable(
    () => JSON.parse(fs.readFileSync(compendiumPath, 'utf-8')) as CompendiumFileJson,
    (error) => error
  )();

  if (parsedResult.isErr()) {
    return;
  }

  const compendium = parsedResult.value;
  const itemCountRow = db.$client
    .prepare('SELECT COUNT(*) as count FROM reference_items')
    .get() as { count: number } | undefined;

  if ((!itemCountRow || itemCountRow.count === 0) && Array.isArray(compendium.items)) {
    const itemsToInsert = compendium.items;
    Result.fromThrowable(
      () =>
        db.transaction((tx) => {
          for (const item of itemsToInsert) {
            tx.insert(referenceItems)
              .values({
                name: item.name,
                category: item.category || 'Equipamento',
                weight: typeof item.weight === 'number' ? item.weight : 0.0,
                cost: item.cost !== null && item.cost !== undefined ? String(item.cost) : null,
                damage: item.damage ?? null,
                armorClass:
                  item.armor_class !== null && item.armor_class !== undefined
                    ? String(item.armor_class)
                    : null,
                properties: item.properties ?? null,
                description: item.description ?? '',
              })
              .run();
          }
        }),
      (error) => error
    )();
  }

  const featureCountRow = db.$client
    .prepare('SELECT COUNT(*) as count FROM reference_features')
    .get() as { count: number } | undefined;

  if ((!featureCountRow || featureCountRow.count === 0) && Array.isArray(compendium.features)) {
    const featuresToInsert = compendium.features;
    Result.fromThrowable(
      () =>
        db.transaction((tx) => {
          for (const feat of featuresToInsert) {
            tx.insert(referenceFeatures)
              .values({
                name: feat.name,
                sourceType: feat.source_type ?? 'Classe',
                className: feat.class_name ?? null,
                level: typeof feat.level === 'number' ? feat.level : 1,
                usesMax: typeof feat.uses_max === 'number' ? feat.uses_max : 0,
                recovery: feat.recovery ?? 'Descanso Longo',
                description: feat.description ?? '',
              })
              .run();
          }
        }),
      (error) => error
    )();
  }
};

const seedSpells = (): void => {
  const candidateCardPaths = [
    process.env.CARDS_PATH ?? '',
    path.join(__dirname, '../../assets/magic_cards'),
    path.join(__dirname, '../assets/magic_cards'),
    path.resolve(__dirname, '../../../reference_data/magic_cards'),
  ];
  const cardsRoot = candidateCardPaths.find((p) => Boolean(p) && fs.existsSync(p));
  if (!cardsRoot) {
    return;
  }

  const levelMap: Readonly<Record<string, number>> = {
    '0(Truques)': 0,
    LV1: 1,
    LV2: 2,
    LV3: 3,
    LV4: 4,
    LV5: 5,
    LV6: 6,
    LV7: 7,
    LV8: 8,
    LV9: 9,
  };

  const spellTranslations = loadSpellTranslations();

  Result.fromThrowable(
    () =>
      db.transaction((tx) => {
        tx.delete(spells).run();
        const folders = fs.readdirSync(cardsRoot);

        for (const folder of folders) {
          const level = levelMap[folder];
          if (level === undefined) continue;

          const folderPath = path.join(cardsRoot, folder);
          if (!fs.statSync(folderPath).isDirectory()) continue;

          const files = fs.readdirSync(folderPath);
          for (const file of files) {
            if (!file.endsWith('.webp')) continue;
            const spellNameRaw = path.parse(file).name;
            const spellName =
              spellNameRaw.charAt(0).toUpperCase() + spellNameRaw.slice(1).toLowerCase();

            const translation = spellTranslations.get(normalizeKey(spellName));
            const school = detectSchool(spellName);
            const relativePath = `/cards/${folder}/${file}`;

            tx.insert(spells)
              .values({
                name: translation?.namePt ?? spellName,
                nameEn: translation?.nameEn ?? null,
                level,
                school,
                castingTime: '1 Ação',
                range: '9 metros',
                components: 'V, S',
                duration: 'Instantânea',
                concentration: 0,
                ritual: 0,
                description: translation?.description ?? '',
                imageFilename: file,
                imagePath: relativePath,
              })
              .run();
          }
        }
      }),
    (error) => error
  )();
};

export const runSeed = (): void => {
  initSchema();
  seedRacesAndClasses();
  seedCompendiumReference();
  seedSpells();
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeed();
}
