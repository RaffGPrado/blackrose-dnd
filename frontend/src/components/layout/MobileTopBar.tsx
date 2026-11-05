import React, { useEffect, useState } from 'react';
import { ArrowLeft, Edit3, Heart, Moon, Shield, SunMoon } from 'lucide-react';
import type { EnrichedCharacter } from '../../types/dnd5e';
import { cn } from '../../lib/utils';
import { triggerHaptic } from '../../hooks/useHaptics';

export type ThemePreference = 'auto' | 'grimoire' | 'parchment';

interface MobileTopBarProps {
  character: EnrichedCharacter;
  onBack: () => void;
  onOpenEditModal: () => void;
  onLongRest: () => void;
  onJumpToCombat?: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  character,
  onBack,
  onOpenEditModal,
  onLongRest,
  onJumpToCombat,
}) => {
  const [themePref, setThemePref] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem('codex-theme') as ThemePreference | null;
    return saved || 'auto';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (themePref === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', themePref);
    }
    localStorage.setItem('codex-theme', themePref);

    const isDark =
      themePref === 'grimoire' ||
      (themePref === 'auto' &&
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-color-scheme: dark)').matches);

    const meta = document.getElementById('meta-theme-color');
    if (meta) {
      meta.setAttribute('content', isDark ? '#0E0D0C' : '#F5F0E6');
    }
  }, [themePref]);

  const cycleTheme = () => {
    triggerHaptic('tap');
    setThemePref((prev) =>
      prev === 'auto' ? 'grimoire' : prev === 'grimoire' ? 'parchment' : 'auto'
    );
  };

  const isDying = character.current_hp === 0;
  const hpRatio = Math.max(
    0,
    Math.min(100, Math.round((character.current_hp / Math.max(1, character.max_hp)) * 100))
  );

  return (
    <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur-md border-b border-rule pt-safe">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Botão Voltar */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('tap');
            onBack();
          }}
          aria-label="Voltar para fichas"
          className="h-9 px-2.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink hover:bg-elevated tap-control shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Fichas</span>
        </button>

        {/* Identidade Editorial Central / Fluida */}
        <div className="min-w-0 flex-1 px-1">
          <div className="flex items-baseline gap-1.5">
            <h1 className="font-serif text-sm sm:text-base font-bold tracking-tight text-ink truncate">
              {character.name}
            </h1>
            <span className="text-[11px] font-semibold text-rose shrink-0">
              Nv {character.level}
            </span>
          </div>
          <p className="text-[11px] text-ink-soft truncate leading-tight">
            {character.race_name || 'Herói'} • {character.class_name || 'Aventureiro'}
          </p>
        </div>

        {/* Pílulas Compactas: PV & CA */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              onJumpToCombat?.();
            }}
            aria-label={`Pontos de Vida: ${character.current_hp} de ${character.max_hp}`}
            className={cn(
              'h-9 px-2 rounded-xl border flex items-center gap-1 tap-control tabular-nums',
              isDying
                ? 'bg-rose-soft border-rose text-rose animate-pulse'
                : 'bg-card border-rule text-ink'
            )}
          >
            <Heart
              className={cn(
                'w-3.5 h-3.5 shrink-0',
                isDying ? 'text-rose fill-rose' : hpRatio > 35 ? 'text-heal' : 'text-rose'
              )}
            />
            <span className="text-xs font-bold">
              {character.current_hp}
              <span className="text-ink-soft font-normal hidden xs:inline">/{character.max_hp}</span>
            </span>
          </button>

          <div
            aria-label={`Classe de Armadura ${character.armor_class}`}
            className="hidden xs:flex h-9 px-2 rounded-xl bg-card border border-rule items-center gap-1 tabular-nums"
          >
            <Shield className="w-3.5 h-3.5 text-ink-soft shrink-0" />
            <span className="text-xs font-bold text-ink">{character.armor_class}</span>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              onOpenEditModal();
            }}
            title="Editar Ficha"
            aria-label="Editar Ficha"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-ink-soft hover:text-ink hover:bg-elevated tap-control"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('heal');
              onLongRest();
            }}
            title="Descanso Longo"
            aria-label="Descanso Longo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-ink-soft hover:text-gold hover:bg-elevated tap-control"
          >
            <Moon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={cycleTheme}
            title={`Tema: ${themePref === 'auto' ? 'Automático' : themePref === 'grimoire' ? 'Grimório (Escuro)' : 'Pergaminho (Claro)'}`}
            aria-label="Alternar tema claro, escuro ou automático"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-rose bg-rose-soft/60 border border-rose/25 tap-control"
          >
            <SunMoon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
