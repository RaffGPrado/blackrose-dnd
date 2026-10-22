import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { Edit3 } from 'lucide-react';
import type { EnrichedCharacter, CharacterCore, AbilityKey } from '../../types/dnd5e';

interface EditCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: EnrichedCharacter;
  onSave: (updates: Partial<CharacterCore>) => Promise<void>;
}

export const EditCharacterModal: React.FC<EditCharacterModalProps> = ({
  isOpen,
  onClose,
  character,
  onSave,
}) => {
  const [form, setForm] = useState<Partial<CharacterCore>>({});
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'core' | 'attributes' | 'roleplay'>('core');

  useEffect(() => {
    if (character) {
      setForm({
        name: character.name,
        level: character.level,
        max_hp: character.max_hp,
        temp_hp: character.temp_hp || 0,
        armor_class: character.armor_class,
        initiative_bonus: character.initiative_bonus || 0,
        speed: character.speed || 9,
        hit_dice_total: character.hit_dice_total || '1d8',
        hit_dice_current: character.hit_dice_current || 1,
        spellcasting_ability: character.spellcasting_ability || 'intelligence',
        background: character.background || '',
        alignment: character.alignment || '',
        personality_traits: character.personality_traits || '',
        ideals: character.ideals || '',
        bonds: character.bonds || '',
        flaws: character.flaws || '',
        proficiencies_languages: character.proficiencies_languages || '',
        strength: character.strength,
        dexterity: character.dexterity,
        constitution: character.constitution,
        intelligence: character.intelligence,
        wisdom: character.wisdom,
        charisma: character.charisma,
      });
    }
  }, [character, isOpen]);

  const handleChange = <K extends keyof CharacterCore>(field: K, value: CharacterCore[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      ...form,
      level: Number(form.level) || 1,
      max_hp: Number(form.max_hp) || 10,
      temp_hp: Number(form.temp_hp) || 0,
      armor_class: Number(form.armor_class) || 10,
      initiative_bonus: Number(form.initiative_bonus) || 0,
      speed: Number(form.speed) || 9,
      strength: Number(form.strength) || 10,
      dexterity: Number(form.dexterity) || 10,
      constitution: Number(form.constitution) || 10,
      intelligence: Number(form.intelligence) || 10,
      wisdom: Number(form.wisdom) || 10,
      charisma: Number(form.charisma) || 10,
    });
    setLoading(false);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Editar Ficha Completa" icon={<Edit3 className="w-4 h-4 text-rose-400" />}>
      <div className="flex bg-[#191b29] p-1 rounded-xl border border-gray-800 mb-3 text-xs">
        <button
          type="button"
          onClick={() => setTab('core')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            tab === 'core' ? 'bg-rose-600 text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          Combate
        </button>
        <button
          type="button"
          onClick={() => setTab('attributes')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            tab === 'attributes' ? 'bg-rose-600 text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          Atributos
        </button>
        <button
          type="button"
          onClick={() => setTab('roleplay')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            tab === 'roleplay' ? 'bg-rose-600 text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          Biografia
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {tab === 'core' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Nome do Personagem</label>
              <input
                type="text"
                required
                value={form.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-[#191b29] border border-gray-700/80 rounded-xl px-3 py-2 text-base sm:text-sm text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Nível</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={form.level || 1}
                  onChange={(e) => handleChange('level', Number(e.target.value))}
                  className="w-full bg-[#191b29] border border-gray-700/80 rounded-xl px-3 py-2 text-base sm:text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">PV Máximo</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.max_hp || 10}
                  onChange={(e) => handleChange('max_hp', Number(e.target.value))}
                  className="w-full bg-[#191b29] border border-gray-700/80 rounded-xl px-3 py-2 text-base sm:text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">CA</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.armor_class || 10}
                  onChange={(e) => handleChange('armor_class', Number(e.target.value))}
                  className="w-full bg-[#191b29] border border-gray-700/80 rounded-xl px-3 py-2 text-base sm:text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Bônus Inic.</label>
                <input
                  type="number"
                  value={form.initiative_bonus || 0}
                  onChange={(e) => handleChange('initiative_bonus', Number(e.target.value))}
                  className="w-full bg-[#191b29] border border-gray-700/80 rounded-xl px-3 py-2 text-base sm:text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Desloc. (m)</label>
                <input
                  type="number"
                  value={form.speed || 9}
                  onChange={(e) => handleChange('speed', Number(e.target.value))}
                  className="w-full bg-[#191b29] border border-gray-700/80 rounded-xl px-3 py-2 text-base sm:text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Atributo de Conjuração</label>
              <select
                value={form.spellcasting_ability || 'intelligence'}
                onChange={(e) => handleChange('spellcasting_ability', e.target.value as AbilityKey)}
                className="w-full bg-[#191b29] border border-gray-700/80 rounded-xl px-3 py-2 text-base sm:text-sm text-white"
              >
                <option value="intelligence">Inteligência (Mago, Artífice)</option>
                <option value="wisdom">Sabedoria (Clérigo, Druida, Ranger)</option>
                <option value="charisma">Carisma (Bardo, Bruxo, Feiticeiro, Paladino)</option>
              </select>
            </div>
          </div>
        )}

        {tab === 'attributes' && (
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { key: 'strength' as const, label: 'Força (FOR)' },
              { key: 'dexterity' as const, label: 'Destreza (DES)' },
              { key: 'constitution' as const, label: 'Constituição (CON)' },
              { key: 'intelligence' as const, label: 'Inteligência (INT)' },
              { key: 'wisdom' as const, label: 'Sabedoria (SAB)' },
              { key: 'charisma' as const, label: 'Carisma (CAR)' },
            ].map((ab) => (
              <div key={ab.key} className="bg-[#191b29] p-2.5 rounded-xl border border-gray-800">
                <label className="block text-[11px] font-bold text-gray-400 mb-1">{ab.label}</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={form[ab.key] ?? 10}
                  onChange={(e) => handleChange(ab.key, Number(e.target.value))}
                  className="w-full bg-[#12131c] border border-gray-700 rounded-lg p-2 text-center text-base sm:text-sm font-black text-white"
                />
              </div>
            ))}
          </div>
        )}

        {tab === 'roleplay' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Antecedente</label>
                <input
                  type="text"
                  value={form.background || ''}
                  onChange={(e) => handleChange('background', e.target.value)}
                  className="w-full bg-[#191b29] border border-gray-700/80 rounded-xl px-3 py-2 text-base sm:text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Alinhamento</label>
                <input
                  type="text"
                  value={form.alignment || ''}
                  onChange={(e) => handleChange('alignment', e.target.value)}
                  className="w-full bg-[#191b29] border border-gray-700/80 rounded-xl px-3 py-2 text-base sm:text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Traços de Personalidade</label>
              <textarea
                rows={2}
                value={form.personality_traits || ''}
                onChange={(e) => handleChange('personality_traits', e.target.value)}
                className="w-full bg-[#191b29] border border-gray-700/80 rounded-xl p-2 text-base sm:text-sm text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Idiomas & Outras Proficiências</label>
              <textarea
                rows={2}
                value={form.proficiencies_languages || ''}
                onChange={(e) => handleChange('proficiencies_languages', e.target.value)}
                className="w-full bg-[#191b29] border border-gray-700/80 rounded-xl p-2 text-base sm:text-sm text-white resize-none"
              />
            </div>
          </div>
        )}

        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-bold rounded-xl min-h-11"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-1/2 py-3 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-600/20 active:scale-95 min-h-11"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
