import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { ok, err } from 'neverthrow';
import { createCharacterController } from '../src/application/http/CharacterController.js';
import type { ICharacterRepository } from '../src/domain/character/ICharacterRepository.js';
import type { EnrichedCharacter } from '../src/domain/character/CharacterEntity.js';

function createMockResponse() {
  const res: Partial<Response> & { _statusCode: number; _jsonData: unknown } = {
    _statusCode: 200,
    _jsonData: null,
    status: vi.fn().mockImplementation(function (code: number) {
      res._statusCode = code;
      return res;
    }),
    json: vi.fn().mockImplementation(function (data: unknown) {
      res._jsonData = data;
      return res;
    }),
  };
  return res as Response & { _statusCode: number; _jsonData: unknown };
}

describe('CharacterController - HTTP Reactions & Status Codes', () => {
  const dummyEnrichedChar: EnrichedCharacter = {
    id: 42,
    user_id: 1,
    name: 'Morrigan',
    race_id: 1,
    class_id: 1,
    race_name: 'Humano',
    class_name: 'Mago',
    level: 5,
    max_hp: 30,
    current_hp: 30,
    temp_hp: 0,
    armor_class: 12,
    speed: 30,
    initiative_bonus: 2,
    hit_dice_total: '5d6',
    hit_dice_current: 5,
    death_successes: 0,
    death_failures: 0,
    inspiration: 0,
    spellcasting_ability: 'intelligence',
    strength: 10,
    dexterity: 14,
    constitution: 12,
    intelligence: 18,
    wisdom: 12,
    charisma: 10,
    coins_cp: 0,
    coins_sp: 0,
    coins_ep: 0,
    coins_gp: 50,
    coins_pp: 0,
    background: 'Acólito',
    alignment: 'Neutro Bom',
    personality_traits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    proficiencies_languages: '',
    conditions: '[]',
    current_initiative: null,
    created_at: '',
    updated_at: '',
    proficiency_bonus: 3,
    initiative: 2,
    formatted_initiative: '+2',
    spell_save_dc: 15,
    spell_attack_bonus: 7,
    formatted_spell_attack_bonus: '+7',
    modifiers: { strength: 0, dexterity: 2, constitution: 1, intelligence: 4, wisdom: 1, charisma: 0 },
    formatted_modifiers: { strength: '+0', dexterity: '+2', constitution: '+1', intelligence: '+4', wisdom: '+1', charisma: '+0' },
    saving_throws: {} as any,
    skills: {} as any,
    passive_perception: 11,
  };

  it('createCharacter should return 400 when character name is empty', () => {
    const mockRepo: Partial<ICharacterRepository> = {
      create: vi.fn(),
    };
    const controller = createCharacterController(mockRepo as ICharacterRepository);

    const req = {
      user: { id: 1 },
      body: { name: '   ' },
    } as unknown as Request;
    const res = createMockResponse();

    controller.createCharacter(req, res);

    expect(res._statusCode).toBe(400);
    expect(res._jsonData).toEqual({ error: 'Character name is required' });
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('createCharacter should return 201 with created character when valid', () => {
    const mockRepo: Partial<ICharacterRepository> = {
      create: vi.fn().mockReturnValue(ok(dummyEnrichedChar)),
    };
    const controller = createCharacterController(mockRepo as ICharacterRepository);

    const req = {
      user: { id: 1 },
      body: { name: 'Morrigan', level: 5 },
    } as unknown as Request;
    const res = createMockResponse();

    controller.createCharacter(req, res);

    expect(res._statusCode).toBe(201);
    expect(res._jsonData).toMatchObject({
      message: 'Character created successfully',
      character: dummyEnrichedChar,
    });
  });

  it('getCharacterDetail should return 404 when character does not exist', () => {
    const mockRepo: Partial<ICharacterRepository> = {
      findDetailById: vi.fn().mockReturnValue(ok(null)),
    };
    const controller = createCharacterController(mockRepo as ICharacterRepository);

    const req = {
      params: { id: '999' },
      user: { id: 1 },
    } as unknown as Request;
    const res = createMockResponse();

    controller.getCharacterDetail(req, res);

    expect(res._statusCode).toBe(404);
    expect(res._jsonData).toEqual({ error: 'Character not found' });
  });

  it('getCharacterDetail should return 200 with detail when found', () => {
    const mockDetail = {
      character: dummyEnrichedChar,
      items: [],
      attacks: [],
      features: [],
      spell_slots: [],
      spells: [],
    };
    const mockRepo: Partial<ICharacterRepository> = {
      findDetailById: vi.fn().mockReturnValue(ok(mockDetail)),
    };
    const controller = createCharacterController(mockRepo as ICharacterRepository);

    const req = {
      params: { id: '42' },
      user: { id: 1 },
    } as unknown as Request;
    const res = createMockResponse();

    controller.getCharacterDetail(req, res);

    expect(res._statusCode).toBe(200);
    expect(res._jsonData).toEqual(mockDetail);
  });

  it('updateCharacter should return 404 when repository returns null', () => {
    const mockRepo: Partial<ICharacterRepository> = {
      update: vi.fn().mockReturnValue(ok(null)),
    };
    const controller = createCharacterController(mockRepo as ICharacterRepository);

    const req = {
      params: { id: '42' },
      user: { id: 1 },
      body: { current_hp: 15 },
    } as unknown as Request;
    const res = createMockResponse();

    controller.updateCharacter(req, res);

    expect(res._statusCode).toBe(404);
    expect(res._jsonData).toEqual({ error: 'Character not found or no fields provided' });
  });

  it('deleteCharacter should return 200 when successful and 404 when not found', () => {
    const mockRepo: Partial<ICharacterRepository> = {
      delete: vi.fn().mockReturnValueOnce(ok(true)).mockReturnValueOnce(ok(false)),
    };
    const controller = createCharacterController(mockRepo as ICharacterRepository);

    const req = {
      params: { id: '42' },
      user: { id: 1 },
    } as unknown as Request;

    const resSuccess = createMockResponse();
    controller.deleteCharacter(req, resSuccess);
    expect(resSuccess._statusCode).toBe(200);
    expect(resSuccess._jsonData).toEqual({ message: 'Character deleted successfully' });

    const resFail = createMockResponse();
    controller.deleteCharacter(req, resFail);
    expect(resFail._statusCode).toBe(404);
    expect(resFail._jsonData).toEqual({ error: 'Character not found' });
  });

  it('getMetaOptions should return 500 when repository returns an error', () => {
    const mockRepo: Partial<ICharacterRepository> = {
      getMetaOptions: vi.fn().mockReturnValue(err(new Error('DB failure'))),
    };
    const controller = createCharacterController(mockRepo as ICharacterRepository);

    const req = {} as Request;
    const res = createMockResponse();

    controller.getMetaOptions(req, res);

    expect(res._statusCode).toBe(500);
    expect(res._jsonData).toEqual({ error: 'Failed to fetch metadata options' });
  });
});
