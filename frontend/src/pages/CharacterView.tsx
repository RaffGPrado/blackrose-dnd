import React, { useRef, useState } from 'react';
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
import { InfoDrawer } from '../components/ui/InfoDrawer';
import { CharacterProvider } from '../context/CharacterContext';
import { gameEventBus } from '../context/GameEventBus';
import { triggerHaptic } from '../hooks/useHaptics';
import type { ExplainEntry } from '../hooks/useHoldToExplain';
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
  const [explainEntry, setExplainEntry] = useState<ExplainEntry | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAttackModal, setShowAttackModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  // Gesto de deslize lateral leve que nunca bloqueia a rolagem vertical nativa
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    const t = e.touches[0];
    if (!t) return;
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    if (!t) return;

    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Só troca de aba se o movimento for claramente horizontal (> 75px e > 1.8x o deslocamento vertical)
    if (Math.abs(dx) < 75 || Math.abs(dx) < Math.abs(dy) * 1.8) {
      return;
    }

    const curIdx = TABS_CONFIG.findIndex((tab) => tab.key === currentTab);
    if (curIdx === -1) return;

    const nextIdx = dx < 0 ? curIdx + 1 : curIdx - 1;
    const nextTab = TABS_CONFIG[nextIdx];
    if (nextTab) {
      triggerHaptic('tap');
      setCurrentTab(nextTab.key);
      window.scrollTo?.({ top: 0, behavior: 'smooth' });
    }
  };

  const longRest = () => {
    void characterData.longRest();
  };

  const saveEdit = (updates: Partial<CharacterCore>) => {
    gameEventBus.publish({ type: 'CHARACTER_EDITED', payload: { characterId, updates } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-rose font-serif text-base font-bold animate-pulse">
        Carregando Ficha Black Rose...
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-4 text-center">
        <p className="text-rose font-bold mb-4">{error || 'Personagem não encontrado'}</p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 bg-card hover:bg-elevated border border-rule text-ink rounded-xl text-xs font-bold transition-colors tap-control"
        >
          Voltar para Lista
        </button>
      </div>
    );
  }

  return (
    <CharacterProvider value={characterData}>
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="min-h-screen bg-paper text-ink pb-28 md:pb-12 max-w-6xl mx-auto"
      >
        <MobileTopBar
          character={character}
          onBack={onBack}
          onOpenEditModal={() => setShowEditModal(true)}
          onLongRest={longRest}
          onJumpToCombat={() => setCurrentTab('combat')}
        />

        {/* Barra de Abas Desktop */}
        <div className="hidden md:flex items-center justify-center gap-2 p-1.5 bg-card border border-rule rounded-2xl max-w-2xl mx-auto mt-3 mb-2 shadow-sm">
          {TABS_CONFIG.map((t) => {
            const Icon = t.icon;
            const isActive = currentTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setCurrentTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all tap-control ${
                  isActive
                    ? 'bg-rose-soft text-rose border border-rose/30 shadow-sm'
                    : 'text-ink-soft hover:text-ink hover:bg-elevated'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                {t.key === 'grimoire' && spells.length > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                      isActive
                        ? 'bg-rose text-white'
                        : 'bg-elevated text-rose font-bold'
                    }`}
                  >
                    {spells.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Conteúdo da Aba Ativa com Rolagem Vertical 100% Livre */}
        <main className="p-3.5 sm:p-5 lg:p-6 space-y-4">
          {currentTab === 'combat' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
              <div className="lg:col-span-5 space-y-4">
                <HealthTracker character={character} />
                <CombatSummary
                  character={character}
                  onExplain={setExplainEntry}
                />
              </div>

              <div className="lg:col-span-7">
                <AttacksList
                  characterId={characterId}
                  attacks={attacks}
                  onOpenAddModal={() => setShowAttackModal(true)}
                  onExplain={setExplainEntry}
                />
              </div>
            </div>
          )}

          {currentTab === 'skills' && (
            <div className="space-y-5">
              <AbilityScoresGrid
                character={character}
                onExplain={setExplainEntry}
              />
              <SkillsList
                character={character}
                onExplain={setExplainEntry}
              />
            </div>
          )}

          {currentTab === 'grimoire' && (
            <GrimoireSheet
              character={character}
              equippedSpells={spells}
              spellSlots={spellSlots}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryTab
              characterId={characterId}
              character={character}
              items={items}
              onOpenAddItemModal={() => setShowItemModal(true)}
              onExplain={setExplainEntry}
            />
          )}

          {currentTab === 'features' && (
            <FeaturesTab
              characterId={characterId}
              features={features}
              onOpenAddModal={() => setShowFeatureModal(true)}
              onExplain={setExplainEntry}
            />
          )}
        </main>

        <MobileBottomNav
          currentTab={currentTab}
          onChangeTab={setCurrentTab}
          spellsCount={spells.length}
        />

        <InfoDrawer
          entry={explainEntry}
          onClose={() => setExplainEntry(null)}
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
