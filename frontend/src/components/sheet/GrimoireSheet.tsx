import React, { useState, useEffect, useMemo } from 'react';
import { ResultAsync } from 'neverthrow';
import { api } from '../../services/api';
import { BookOpen, Zap, Sparkles, Wand2 } from 'lucide-react';
import { useCharacterActions } from '../../context/CharacterContext';
import { gameEventBus } from '../../context/GameEventBus';
import type { EnrichedCharacter, SpellCard, SpellSlot } from '../../types/dnd5e';

import { SpellFilters } from '../spells/SpellFilters';
import { SpellSlotManager } from '../spells/SpellSlotManager';
import { SpellCardGrid } from '../spells/SpellCardGrid';

interface GrimoireSheetProps {
  character: EnrichedCharacter;
  equippedSpells: SpellCard[];
  spellSlots: SpellSlot[];
}

const PAGE_SIZE = 10;

function getSchoolBadgeStyle(school?: string): string {
  switch (school?.toLowerCase()) {
    case 'abjuração':
    case 'abjuration':
      return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    case 'adivinhação':
    case 'divination':
      return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    case 'conjuração':
    case 'conjuration':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'encantamento':
    case 'enchantment':
      return 'bg-pink-500/15 text-pink-400 border-pink-500/30';
    case 'evocação':
    case 'evocation':
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    case 'ilusão':
    case 'illusion':
      return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    case 'necromancia':
    case 'necromancy':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'transmutação':
    case 'transmutation':
      return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    default:
      return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  }
}

export const GrimoireSheet: React.FC<GrimoireSheetProps> = ({
  character,
  equippedSpells,
  spellSlots,
}) => {
  const actions = useCharacterActions();
  const [activeTab, setActiveTab] = useState<'equipped' | 'catalog'>('equipped');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [catalogSpells, setCatalogSpells] = useState<SpellCard[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRestoringSlots, setIsRestoringSlots] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLevel, selectedSchool, activeTab]);

  const loadCatalog = async () => {
    if (catalogSpells.length > 0) return;
    setLoadingCatalog(true);
    await ResultAsync.fromPromise(
      Promise.all([api.getSchools(), api.getSpells()]),
      (err) => err
    ).match(
      ([schoolsData, spellsData]) => {
        setSchools(schoolsData.schools || []);
        setCatalogSpells(spellsData.spells || []);
      },
      (err) => {
        console.error('Falha ao carregar catálogo de magias', err);
      }
    );
    setLoadingCatalog(false);
  };

  useEffect(() => {
    if (activeTab === 'catalog') {
      void loadCatalog();
    }
  }, [activeTab]);

  const handleToggleSlot = (
    slotLevel: number,
    currentUsed: number,
    _maxSlots: number,
    circleIndex: number
  ) => {
    gameEventBus.publish({
      type: 'SPELL_SLOT_TOGGLED',
      payload: { characterId: character.id, slotLevel, currentUsed, circleIndex },
    });
  };

  const handleRestoreAllSlots = async () => {
    setIsRestoringSlots(true);
    await actions.restoreSpellSlots();
    setIsRestoringSlots(false);
  };

  const handleSaveSlotsConfig = async (newSlots: SpellSlot[]) => {
    gameEventBus.publish({
      type: 'SPELL_SLOTS_CONFIG_SAVED',
      payload: { characterId: character.id, newSlots },
    });
  };

  const handleAddSpell = (spell: SpellCard) => {
    gameEventBus.publish({
      type: 'SPELL_ADDED',
      payload: { characterId: character.id, spell },
    });
  };

  const handleRemoveSpell = (spellId: number) => {
    gameEventBus.publish({
      type: 'SPELL_REMOVED',
      payload: { characterId: character.id, spellId },
    });
  };

  const isEquipped = (spellId: number) => equippedSpells.some((s) => s.id === spellId);

  const filterSpell = (spell: SpellCard) => {
    if (searchQuery && !spell.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedLevel !== '' && spell.level !== Number(selectedLevel)) return false;
    if (selectedSchool && spell.school !== selectedSchool) return false;
    return true;
  };

  const filteredEquipped = useMemo(
    () => equippedSpells.filter(filterSpell),
    [equippedSpells, searchQuery, selectedLevel, selectedSchool]
  );
  const filteredCatalog = useMemo(
    () => catalogSpells.filter(filterSpell),
    [catalogSpells, searchQuery, selectedLevel, selectedSchool]
  );

  const activeList = activeTab === 'equipped' ? filteredEquipped : filteredCatalog;
  const totalItems = activeList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const isPaginated = totalItems > PAGE_SIZE;

  const displayedSpells = isPaginated
    ? activeList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : activeList;

  const hasActiveFilters = searchQuery !== '' || selectedLevel !== '' || selectedSchool !== '';
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedLevel('');
    setSelectedSchool('');
  };

  const rawAtkBonus = String(character.spell_attack_bonus ?? '0');
  const formattedAttackBonus =
    rawAtkBonus.startsWith('+') || rawAtkBonus.startsWith('-')
      ? rawAtkBonus
      : `+${rawAtkBonus}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="codex-card p-3 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase tracking-wider font-bold text-ink-soft">
              CD de Magia
            </span>
            <span className="font-serif text-2xl font-bold text-rose tabular-nums">
              {character.spell_save_dc}
            </span>
          </div>
          <Sparkles className="w-5 h-5 text-rose/70" />
        </div>

        <div className="codex-card p-3 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase tracking-wider font-bold text-ink-soft">
              Ataque Mágico
            </span>
            <span className="font-serif text-2xl font-bold text-gold tabular-nums">
              {formattedAttackBonus}
            </span>
          </div>
          <Wand2 className="w-5 h-5 text-gold/70" />
        </div>
      </div>

      <SpellSlotManager
        spellSlots={spellSlots}
        onToggleSlot={handleToggleSlot}
        onRestoreAllSlots={handleRestoreAllSlots}
        isRestoringSlots={isRestoringSlots}
        onSaveSlotsConfig={handleSaveSlotsConfig}
      />

      <div className="flex bg-elevated p-1 rounded-xl border border-rule">
        <button
          type="button"
          onClick={() => setActiveTab('equipped')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 tap-control ${
            activeTab === 'equipped'
              ? 'bg-rose text-white shadow-sm'
              : 'text-ink-soft hover:text-ink'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Grimório
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 tap-control ${
            activeTab === 'catalog'
              ? 'bg-rose text-white shadow-sm'
              : 'text-ink-soft hover:text-ink'
          }`}
        >
          <Zap className="w-4 h-4" /> Todas as Magias
        </button>
      </div>

      <SpellFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        selectedSchool={selectedSchool}
        setSelectedSchool={setSelectedSchool}
        schools={schools}
        viewMode={viewMode}
        setViewMode={setViewMode}
        clearAllFilters={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {loadingCatalog && activeTab === 'catalog' ? (
        <div className="text-center py-12 text-ink-soft text-xs">Carregando feitiços...</div>
      ) : (
        <SpellCardGrid
          spells={displayedSpells}
          viewMode={viewMode}
          activeTab={activeTab}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          isEquipped={isEquipped}
          onAddSpell={handleAddSpell}
          onRemoveSpell={handleRemoveSpell}
          getSchoolBadgeStyle={getSchoolBadgeStyle}
        />
      )}
    </div>
  );
};
