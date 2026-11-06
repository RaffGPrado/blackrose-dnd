import React, { useState, useEffect } from 'react';
import { requestSafe } from '../services/api';
import { calculateModifier, formatModifier } from '../utils/dnd';
import { ArrowLeft } from 'lucide-react';
import type { MetaOptionsResponse, EnrichedCharacter } from '../types/dnd5e';

interface CreateCharacterProps {
  onBack: () => void;
  onSuccess: (id: number) => void;
}

type AbilityField = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';

interface CharacterForm {
  name: string;
  race_id: string | number;
  class_id: string | number;
  level: number;
  max_hp: number;
  armor_class: number;
  initiative_bonus: number;
  speed: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

interface MetaOption {
  id: number;
  name: string;
}

const STAT_FIELDS: { key: AbilityField; label: string; name: string }[] = [
  { key: 'strength', label: 'FOR', name: 'Força' },
  { key: 'dexterity', label: 'DES', name: 'Destreza' },
  { key: 'constitution', label: 'CON', name: 'Constituição' },
  { key: 'intelligence', label: 'INT', name: 'Inteligência' },
  { key: 'wisdom', label: 'SAB', name: 'Sabedoria' },
  { key: 'charisma', label: 'CAR', name: 'Carisma' },
];

export const CreateCharacter: React.FC<CreateCharacterProps> = ({ onBack, onSuccess }) => {
  const [races, setRaces] = useState<MetaOption[]>([]);
  const [classes, setClasses] = useState<MetaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<CharacterForm>({
    name: '',
    race_id: '',
    class_id: '',
    level: 1,
    max_hp: 10,
    armor_class: 10,
    initiative_bonus: 0,
    speed: 9,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  });

  useEffect(() => {
    let isMounted = true;
    requestSafe<MetaOptionsResponse>('/characters/meta/options')
      .match(
        (data) => {
          if (!isMounted) return;
          setRaces(data.races ?? []);
          setClasses(data.classes ?? []);
          if (data.races?.length) setForm((f) => ({ ...f, race_id: data.races[0].id }));
          if (data.classes?.length) setForm((f) => ({ ...f, class_id: data.classes[0].id }));
          setLoading(false);
        },
        () => {
          if (!isMounted) return;
          setError('Falha ao carregar raças e classes');
          setLoading(false);
        }
      );

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = <K extends keyof CharacterForm>(field: K, value: CharacterForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setError('');
    setSubmitting(true);

    const payload = {
      name: form.name.trim(),
      race_id: form.race_id ? Number(form.race_id) : null,
      class_id: form.class_id ? Number(form.class_id) : null,
      level: Number(form.level) || 1,
      max_hp: Number(form.max_hp) || 10,
      armor_class: Number(form.armor_class) || 10,
      initiative_bonus: Number(form.initiative_bonus) || 0,
      speed: Number(form.speed) || 9,
      strength: Number(form.strength) || 10,
      dexterity: Number(form.dexterity) || 10,
      constitution: Number(form.constitution) || 10,
      intelligence: Number(form.intelligence) || 10,
      wisdom: Number(form.wisdom) || 10,
      charisma: Number(form.charisma) || 10,
    };

    const result = await requestSafe<{ message: string; character: EnrichedCharacter }>('/characters', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    result.match(
      (res) => {
        setSubmitting(false);
        onSuccess(res.character.id);
      },
      (err) => {
        setSubmitting(false);
        setError(err.message || 'Falha ao criar personagem');
      }
    );
  };

  return (
    <div className="min-h-screen bg-dnd-dark text-dnd-text pb-12 max-w-2xl mx-auto">
      <header className="sticky top-0 z-20 bg-dnd-surface/90 backdrop-blur-md border-b border-dnd-border px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-dnd-muted hover:text-white p-2 rounded-lg transition-colors min-h-11 min-w-11"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>
        <h1 className="text-sm font-bold text-white">Criar Personagem</h1>
        <div className="w-8" />
      </header>

      <main className="p-4 sm:p-6 space-y-5">
        {error && (
          <div className="p-3.5 bg-rose-950/50 border border-rose-900 text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-dnd-dim text-sm animate-pulse">
            Carregando compêndio SRD 5.1...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-dnd-surface border border-dnd-border rounded-2xl p-4 sm:p-5 space-y-3.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-dnd-rose">Identidade do Herói</h2>

              <div>
                <label className="block text-xs text-dnd-muted mb-1">Nome do Personagem</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ex: Vaelen Brisa Noturna"
                  className="w-full bg-dnd-elevated border border-dnd-border rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-dnd-dim focus:outline-none focus:border-dnd-rose transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dnd-muted mb-1">Raça</label>
                  <select
                    value={form.race_id}
                    onChange={(e) => handleChange('race_id', e.target.value)}
                    className="w-full bg-dnd-elevated border border-dnd-border rounded-xl px-3 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-dnd-rose transition-all min-h-11"
                  >
                    {races.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-dnd-muted mb-1">Classe</label>
                  <select
                    value={form.class_id}
                    onChange={(e) => handleChange('class_id', e.target.value)}
                    className="w-full bg-dnd-elevated border border-dnd-border rounded-xl px-3 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-dnd-rose transition-all min-h-11"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {([
                  { field: 'level' as const, label: 'Nível', color: 'text-white' },
                  { field: 'max_hp' as const, label: 'PV Máx', color: 'text-dnd-emerald' },
                  { field: 'armor_class' as const, label: 'CA', color: 'text-dnd-blue' },
                  { field: 'speed' as const, label: 'Desloc.', color: 'text-dnd-gold' },
                ] as { field: keyof CharacterForm; label: string; color: string }[]).map(({ field, label, color }) => (
                  <div key={field}>
                    <label className="block text-[10px] text-dnd-muted mb-1 text-center font-semibold uppercase">{label}</label>
                    <input
                      type="number"
                      min="1"
                      value={form[field] as number}
                      onChange={(e) => handleChange(field, Number(e.target.value))}
                      className={`w-full bg-dnd-elevated border border-dnd-border rounded-xl px-2 py-2 text-base sm:text-xs ${color} text-center focus:outline-none focus:border-dnd-rose font-bold min-h-11`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-dnd-surface border border-dnd-border rounded-2xl p-4 sm:p-5 space-y-3.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-dnd-rose">Atributos D&D 5e</h2>
              <p className="text-[11px] text-dnd-muted">Base padrão 10 (modificador +0)</p>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {STAT_FIELDS.map(({ key, label, name }) => (
                  <div key={key} className="bg-dnd-elevated border border-dnd-border rounded-xl p-2.5 text-center">
                    <span className="block text-[10px] font-bold text-dnd-muted">{label} ({name})</span>
                    <div className="text-sm font-black text-dnd-rose my-1">{formatModifier(calculateModifier(form[key]))}</div>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={form[key]}
                      onChange={(e) => handleChange(key, Number(e.target.value))}
                      className="w-full bg-dnd-surface border border-dnd-border rounded-lg py-1.5 text-base sm:text-xs text-white text-center focus:outline-none focus:border-dnd-rose font-bold min-h-10"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-fuchsia-600 hover:from-rose-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-rose-950/50 disabled:opacity-50 active:scale-[0.99] min-h-12"
            >
              {submitting ? 'Salvando Ficha...' : 'Criar e Abrir Ficha'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};
