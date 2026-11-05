import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useCharacterActions } from '../../context/CharacterContext';
import type { ClassFeature } from '../../types/dnd5e';
import { SectionTitle } from '../ui/SectionTitle';
import { triggerHaptic } from '../../hooks/useHaptics';
import { useHoldToExplain, type ExplainEntry } from '../../hooks/useHoldToExplain';

interface FeaturesTabProps {
  characterId: number;
  features: ClassFeature[];
  onOpenAddModal: () => void;
  onExplain?: (entry: ExplainEntry) => void;
}

interface FeatureCardItemProps {
  feature: ClassFeature;
  onAdjustUsage: (id: number, delta: number) => void;
  onDelete: (id: number) => void;
  onExplain?: (entry: ExplainEntry) => void;
}

const FeatureCardItem: React.FC<FeatureCardItemProps> = ({
  feature,
  onAdjustUsage,
  onDelete,
  onExplain,
}) => {
  const holdProps = useHoldToExplain(
    {
      title: feature.name,
      subtitle:
        feature.uses_max > 0
          ? `Usos disponíveis: ${feature.uses_current} de ${feature.uses_max}`
          : 'Característica Passiva',
      badge:
        feature.uses_max > 0 ? `${feature.uses_current}/${feature.uses_max}` : 'Passiva',
      description:
        feature.description || 'Característica ou talento registrado na sua ficha.',
    },
    onExplain
  );

  return (
    <div
      {...holdProps}
      className="codex-card p-4 space-y-2.5 holdable cursor-context-menu flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-base font-bold text-ink">{feature.name}</h3>

          <div
            className="flex items-center gap-1.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {feature.uses_max > 0 && (
              <div className="flex items-center gap-1 bg-elevated px-2 py-1 rounded-xl border border-rule">
                <span className="text-[10px] text-ink-soft font-bold uppercase mr-0.5">
                  Usos:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    onAdjustUsage(feature.id, -1);
                  }}
                  className="w-9 h-9 bg-card hover:bg-rule text-ink rounded-lg text-xs font-bold flex items-center justify-center border border-rule tap-control"
                >
                  -
                </button>
                <span className="font-serif text-sm font-bold text-rose px-1.5 tabular-nums">
                  {feature.uses_current}/{feature.uses_max}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    onAdjustUsage(feature.id, 1);
                  }}
                  className="w-9 h-9 bg-card hover:bg-rule text-ink rounded-lg text-xs font-bold flex items-center justify-center border border-rule tap-control"
                >
                  +
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                onDelete(feature.id);
              }}
              className="w-10 h-10 text-ink-soft hover:text-rose hover:bg-elevated rounded-xl flex items-center justify-center tap-control"
              title="Remover habilidade"
              aria-label={`Remover ${feature.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {feature.description && (
          <p className="text-xs text-ink-soft leading-relaxed mt-1.5">
            {feature.description}
          </p>
        )}
      </div>
    </div>
  );
};

export const FeaturesTab: React.FC<FeaturesTabProps> = ({
  features,
  onOpenAddModal,
  onExplain,
}) => {
  const actions = useCharacterActions();

  return (
    <section aria-label="Habilidades e Talentos" className="space-y-3">
      <SectionTitle
        title="Habilidades & Talentos"
        right={
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              onOpenAddModal();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-soft/80 hover:bg-rose-soft text-rose border border-rose/30 rounded-xl text-xs font-bold tap-control"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        }
      />

      {features.length === 0 ? (
        <div className="codex-card text-center py-8 px-4 text-ink-soft text-xs border-dashed">
          Nenhuma habilidade cadastrada. Toque em "Adicionar" para registrar Fúria, Ataque Furtivo, Visão no Escuro...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((feat) => (
            <FeatureCardItem
              key={feat.id}
              feature={feat}
              onAdjustUsage={(id, delta) => actions.adjustFeatureUsage(id, delta)}
              onDelete={(id) => actions.deleteFeature(id)}
              onExplain={onExplain}
            />
          ))}
        </div>
      )}
    </section>
  );
};
