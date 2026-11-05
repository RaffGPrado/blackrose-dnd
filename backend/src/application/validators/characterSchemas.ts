import { z } from 'zod';

const abilityKeyEnum = z.enum([
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
]);

export const createCharacterSchema = z.object({
  name: z
    .string({ error: 'Nome do personagem é obrigatório' })
    .trim()
    .min(1, 'Nome do personagem não pode ser vazio')
    .max(100, 'Nome do personagem deve ter no máximo 100 caracteres'),
  race_id: z.coerce.number().int().positive().nullable().optional(),
  class_id: z.coerce.number().int().positive().nullable().optional(),
  class_name: z.string().trim().max(100).nullable().optional(),
  level: z.coerce.number().int().min(1).max(20).default(1),
  strength: z.coerce.number().int().min(1).max(30).optional().default(10),
  dexterity: z.coerce.number().int().min(1).max(30).optional().default(10),
  constitution: z.coerce.number().int().min(1).max(30).optional().default(10),
  intelligence: z.coerce.number().int().min(1).max(30).optional().default(10),
  wisdom: z.coerce.number().int().min(1).max(30).optional().default(10),
  charisma: z.coerce.number().int().min(1).max(30).optional().default(10),
  max_hp: z.coerce.number().int().min(1).max(9999).optional().default(10),
  current_hp: z.coerce.number().int().min(0).max(9999).optional().default(10),
  temp_hp: z.coerce.number().int().min(0).max(9999).optional().default(0),
  armor_class: z.coerce.number().int().min(0).max(100).optional().default(10),
  initiative_bonus: z.coerce.number().int().min(-20).max(50).optional().default(0),
  speed: z.coerce.number().int().min(0).max(300).optional().default(9),
  hit_dice_total: z.string().max(20).optional(),
  hit_dice_current: z.coerce.number().int().min(0).max(20).optional(),
  spellcasting_ability: abilityKeyEnum.optional(),
  background: z.string().max(200).optional(),
  alignment: z.string().max(100).optional(),
});

export const updateCharacterSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  race_id: z.coerce.number().int().positive().nullable().optional(),
  class_id: z.coerce.number().int().positive().nullable().optional(),
  level: z.coerce.number().int().min(1).max(20).optional(),
  strength: z.coerce.number().int().min(1).max(30).optional(),
  dexterity: z.coerce.number().int().min(1).max(30).optional(),
  constitution: z.coerce.number().int().min(1).max(30).optional(),
  intelligence: z.coerce.number().int().min(1).max(30).optional(),
  wisdom: z.coerce.number().int().min(1).max(30).optional(),
  charisma: z.coerce.number().int().min(1).max(30).optional(),
  max_hp: z.coerce.number().int().min(1).max(9999).optional(),
  current_hp: z.coerce.number().int().min(0).max(9999).optional(),
  temp_hp: z.coerce.number().int().min(0).max(9999).optional(),
  armor_class: z.coerce.number().int().min(0).max(100).optional(),
  initiative_bonus: z.coerce.number().int().min(-20).max(50).optional(),
  speed: z.coerce.number().int().min(0).max(300).optional(),
  hit_dice_total: z.string().max(20). nullable().optional(),
  hit_dice_current: z.coerce.number().int().min(0).max(20).optional(),
  death_successes: z.coerce.number().int().min(0).max(3).optional(),
  death_failures: z.coerce.number().int().min(0).max(3).optional(),
  inspiration: z.coerce.number().int().min(0).max(1).optional(),
  spellcasting_ability: abilityKeyEnum.optional(),
  background: z.string().max(200).nullable().optional(),
  alignment: z.string().max(100).nullable().optional(),
  personality_traits: z.string().max(2000).nullable().optional(),
  ideals: z.string().max(2000).nullable().optional(),
  bonds: z.string().max(2000).nullable().optional(),
  flaws: z.string().max(2000).nullable().optional(),
  proficiencies_languages: z.string().max(2000).nullable().optional(),
  coins_cp: z.coerce.number().int().min(0).max(999999).optional(),
  coins_sp: z.coerce.number().int().min(0).max(999999).optional(),
  coins_ep: z.coerce.number().int().min(0).max(999999).optional(),
  coins_gp: z.coerce.number().int().min(0).max(999999).optional(),
  coins_pp: z.coerce.number().int().min(0).max(999999).optional(),
  conditions: z.string().max(500).optional(),
  current_initiative: z.coerce.number().int().min(-20).max(99).nullable().optional(),
});

export const addAttackSchema = z.object({
  name: z.string().trim().min(1).max(100),
  bonus: z.string().trim().max(50).optional().default('+0'),
  damage_type: z.string().trim().min(1).max(200),
});

export const addItemSchema = z.object({
  name: z.string().trim().min(1).max(100),
  quantity: z.coerce.number().int().min(1).max(9999).default(1),
  weight: z.coerce.number().min(0).max(9999).default(0),
  effect: z.string().max(2000).optional().default(''),
  description: z.string().max(2000).optional().default(''),
  equipped: z.coerce.number().int().min(0).max(1).optional().default(0),
});

export const addFeatureSchema = z.object({
  name: z.string().trim().min(1).max(100),
  source: z.string().trim().max(100).optional().default('Personalizada'),
  description: z.string().max(3000).optional().default(''),
  uses_max: z.coerce.number().int().min(0).max(99).default(0),
  uses_current: z.coerce.number().int().min(0).max(99).default(0),
  recovery: z.string().trim().max(50).optional().default('Descanso Longo'),
});

export const addSpellToGrimoireSchema = z.object({
  spell_id: z.coerce.number().int().positive('ID de magia inválido'),
});

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>;
