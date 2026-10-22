import { z } from 'zod';

export const createCharacterSchema = z.object({
  name: z
    .string({ required_error: 'Nome do personagem é obrigatório' })
    .trim()
    .min(1, 'Nome do personagem não pode ser vazio')
    .max(100, 'Nome do personagem deve ter no máximo 100 caracteres'),
  race_id: z.coerce.number().int().positive().nullable().optional(),
  class_id: z.coerce.number().int().positive().nullable().optional(),
  level: z.coerce.number().int().min(1).max(20).default(1),
  strength: z.coerce.number().int().min(1).max(30).optional().default(10),
  dexterity: z.coerce.number().int().min(1).max(30).optional().default(10),
  constitution: z.coerce.number().int().min(1).max(30).optional().default(10),
  intelligence: z.coerce.number().int().min(1).max(30).optional().default(10),
  wisdom: z.coerce.number().int().min(1).max(30).optional().default(10),
  charisma: z.coerce.number().int().min(1).max(30).optional().default(10),
  hp_max: z.coerce.number().int().min(1).max(9999).optional().default(10),
  hp_current: z.coerce.number().int().min(0).max(9999).optional().default(10),
  temp_hp: z.coerce.number().int().min(0).max(9999).optional().default(0),
  armor_class: z.coerce.number().int().min(0).max(100).optional().default(10),
  speed: z.coerce.number().int().min(0).max(300).optional().default(9),
  passive_perception: z.coerce.number().int().min(0).max(50).optional().default(10),
  proficiency_bonus: z.coerce.number().int().min(2).max(10).optional().default(2),
  hit_dice_max: z.string().max(20).optional().default('1d8'),
  hit_dice_current: z.coerce.number().int().min(0).max(20).optional().default(1),
});

export const updateCharacterSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  level: z.coerce.number().int().min(1).max(20).optional(),
  strength: z.coerce.number().int().min(1).max(30).optional(),
  dexterity: z.coerce.number().int().min(1).max(30).optional(),
  constitution: z.coerce.number().int().min(1).max(30).optional(),
  intelligence: z.coerce.number().int().min(1).max(30).optional(),
  wisdom: z.coerce.number().int().min(1).max(30).optional(),
  charisma: z.coerce.number().int().min(1).max(30).optional(),
  hp_max: z.coerce.number().int().min(1).max(9999).optional(),
  hp_current: z.coerce.number().int().min(0).max(9999).optional(),
  temp_hp: z.coerce.number().int().min(0).max(9999).optional(),
  armor_class: z.coerce.number().int().min(0).max(100).optional(),
  speed: z.coerce.number().int().min(0).max(300).optional(),
  passive_perception: z.coerce.number().int().min(0).max(50).optional(),
  proficiency_bonus: z.coerce.number().int().min(2).max(10).optional(),
  inspiration: z.coerce.number().int().min(0).max(1).optional(),
  death_save_success: z.coerce.number().int().min(0).max(3).optional(),
  death_save_failure: z.coerce.number().int().min(0).max(3).optional(),
  hit_dice_current: z.coerce.number().int().min(0).max(20).optional(),
  conditions: z.string().max(500).optional(),
  notes: z.string().max(5000).optional(),
});

export const addAttackSchema = z.object({
  name: z.string().trim().min(1).max(100),
  attack_bonus: z.coerce.number().int().min(-20).max(50).default(0),
  damage: z.string().trim().min(1).max(50),
  damage_type: z.string().trim().min(1).max(50),
});

export const addItemSchema = z.object({
  name: z.string().trim().min(1).max(100),
  quantity: z.coerce.number().int().min(1).max(9999).default(1),
  weight: z.coerce.number().min(0).max(9999).default(0),
  description: z.string().max(2000).optional().default(''),
});

export const addFeatureSchema = z.object({
  name: z.string().trim().min(1).max(100),
  source: z.string().trim().max(100).default('Personalizada'),
  description: z.string().max(3000).optional().default(''),
  uses_max: z.coerce.number().int().min(0).max(99).default(0),
  uses_current: z.coerce.number().int().min(0).max(99).default(0),
  recovery: z.string().trim().max(50).default('Descanso Longo'),
});

export const addSpellToGrimoireSchema = z.object({
  spell_id: z.coerce.number().int().positive('ID de magia inválido'),
});

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>;
