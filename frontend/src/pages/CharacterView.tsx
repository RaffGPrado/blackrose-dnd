import React, { useState } from 'react';
import { useCharacter } from '../hooks/useCharacter';
import { MobileTopBar } from '../components/layout/MobileTopBar';
import { MobileBottomNav, SheetTab, TABS_CONFIG } from '../components/layout/MobileBottomNav';
import { HealthTracker } from '../components/sheet/HealthTracker';
import { CombatSummary } from '../components/sheet/CombatSummary';
import { AttacksList } from '../components/sheet/AttacksList';
import { AbilityScoresGrid } from '../components/sheet/AbilityScoresGrid';
import { SkillsList } from '../components/sheet/SkillsList';
import { InventoryTab } from '../components/sheet/InventoryTab';
import { FeaturesTab } from '../components/sheet/FeaturesTab';
import { GrimoireSheet } from '../components/sheet/GrimoireSheet';
import { AddAttackModal } from '../components/modals/AddAttackModal';
import { AddItemModal } from '../components/modals/AddItemModal';
import { AddFeatureModal } from '../components/modals/AddFeatureModal';
import { EditCharacterModal } from '../components/modals/EditCharacterModal';
import { CharacterProvider } from '../context/CharacterContext';
import { gameEventBus } from '../context/GameEventBus';
import type { CharacterCore } from '../types/dnd5e';

interface CharacterViewProps {
  characterId: number;
  onBack: () => void;
  onOpenGrimoire?: () => void;
}

export const CharacterView: React.FC<CharacterViewProps> = ({
  characterId,
  onBack,
}) => {
  const characterData = useCharacter(characterId);
  const {
    character,
    items,
    attacks,
    features,
    spellSlots,
    spells,
    loading,
    error,
  } = characterData;

  const [currentTab, setCurrentTab] = useState<SheetTab>('combat');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAttackModal, setShowAttackModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  const longRest = () => {
    void characterData.longRest();
  };

  const saveEdit = (updates: Partial<CharacterCore>) => {
    gameEventBus.publish({ type: 'CHARACTER_EDITED', payload: { characterId, updates } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dnd-dark flex items-center justify-center text-dnd-rose text-sm font-bold animate-pulse">
        Carregando Ficha Black Rose...
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="min-h-screen bg-dnd-dark flex flex-col items-center justify-center p-4 text-center">
        <p className="text-dnd-rose font-bold mb-4">{error || 'Personagem não encontrado'}</p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-dnd-surface hover:bg-dnd-elevated border border-dnd-border text-white rounded-xl text-xs font-bold transition-colors"
        >
          Voltar para Lista
        </button>
      </div>
    );
  }

  return (
    <CharacterProvider value={characterData}>
      <div className="min-h-screen bg-dnd-dark text-dnd-text pb-28 md:pb-12 max-w-6xl mx-auto select-none">
        <MobileTopBar
          character={character}
          onBack={onBack}
          onOpenEditModal={() => setShowEditModal(true)}
          onLongRest={longRest}
        />

        <div className="hidden md:flex items-center justify-center gap-2 p-1.5 bg-dnd-surface border border-dnd-border rounded-2xl max-w-2xl mx-auto mt-4 mb-2 shadow-sm">
          {TABS_CONFIG.map((t) => {
            const Icon = t.icon;
            const isActive = currentTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setCurrentTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-dnd-rose text-white shadow-md'
                    : 'text-dnd-muted hover:text-white hover:bg-dnd-elevated'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                {t.key === 'grimoire' && spells.length > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-dnd-elevated text-dnd-rose font-black'
                    }`}
                  >
                    {spells.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <main className="p-3.5 sm:p-5 lg:p-6 space-y-4">
          {currentTab === 'combat' && (
            <div className="animate-in fade-in duration-150">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                <div className="lg:col-span-5 space-y-4">
                  <HealthTracker character={character} />
                  <CombatSummary character={character} />
                </div>

                <div className="lg:col-span-7">
                  <AttacksList
                    characterId={characterId}
                    attacks={attacks}
                    onOpenAddModal={() => setShowAttackModal(true)}
                  />
                </div>
              </div>
            </div>
          )}

          {currentTab === 'skills' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <AbilityScoresGrid character={character} />
              <SkillsList character={character} />
            </div>
          )}

          {currentTab === 'grimoire' && (
            <div className="animate-in fade-in duration-150">
              <GrimoireSheet
                character={character}
                equippedSpells={spells}
                spellSlots={spellSlots}
              />
            </div>
          )}

          {currentTab === 'inventory' && (
            <div className="animate-in fade-in duration-150">
              <InventoryTab
                characterId={characterId}
                character={character}
                items={items}
                onOpenAddItemModal={() => setShowItemModal(true)}
              />
            </div>
          )}

          {currentTab === 'features' && (
            <div className="animate-in fade-in duration-150">
              <FeaturesTab
                characterId={characterId}
                features={features}
                onOpenAddModal={() => setShowFeatureModal(true)}
              />
            </div>
          )}
        </main>

        <MobileBottomNav
          currentTab={currentTab}
          onChangeTab={setCurrentTab}
          spellsCount={spells.length}
        />

        <AddAttackModal
          isOpen={showAttackModal}
          onClose={() => setShowAttackModal(false)}
          onAddAttack={async (attack) =>
            gameEventBus.publish({ type: 'ATTACK_ADDED', payload: { characterId, attack } })
          }
        />

        <AddItemModal
          isOpen={showItemModal}
          onClose={() => setShowItemModal(false)}
          onAddItem={async (item) =>
            gameEventBus.publish({ type: 'ITEM_ADDED', payload: { characterId, item } })
          }
        />

        <AddFeatureModal
          isOpen={showFeatureModal}
          onClose={() => setShowFeatureModal(false)}
          onAddFeature={async (feature) =>
            gameEventBus.publish({ type: 'FEATURE_ADDED', payload: { characterId, feature } })
          }
          characterClassName={character.class_name}
        />

        <EditCharacterModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          character={character}
          onSave={async (updates) => saveEdit(updates)}
        />
      </div>
    </CharacterProvider>
  );
};
