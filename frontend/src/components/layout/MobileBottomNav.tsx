import React from 'react';
import { motion } from 'motion/react';
import { Shield, Target, BookOpen, Package, Flame } from 'lucide-react';
import { cn } from '../../lib/utils';
import { triggerHaptic } from '../../hooks/useHaptics';

export type SheetTab = 'combat' | 'skills' | 'grimoire' | 'inventory' | 'features';

interface MobileBottomNavProps {
  currentTab: SheetTab;
  onChangeTab: (tab: SheetTab) => void;
  spellsCount: number;
}

export const TABS_CONFIG: {
  key: SheetTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'combat', label: 'Combate', icon: Shield },
  { key: 'skills', label: 'Perícias', icon: Target },
  { key: 'grimoire', label: 'Grimório', icon: BookOpen },
  { key: 'inventory', label: 'Mochila', icon: Package },
  { key: 'features', label: 'Talentos', icon: Flame },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onChangeTab,
  spellsCount,
}) => {
  return (
    <nav
      aria-label="Navegação da Ficha"
      className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-rule md:hidden pb-safe"
    >
      <div
        role="tablist"
        className="max-w-lg mx-auto grid grid-cols-5 px-2 pt-1.5"
      >
        {TABS_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                triggerHaptic('tap');
                onChangeTab(tab.key);
              }}
              className={cn(
                'relative min-h-[52px] flex flex-col items-center justify-center gap-1 rounded-2xl tap-control',
                isActive ? 'text-rose font-bold' : 'text-ink-soft hover:text-ink'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="codex-active-mobile-tab"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="absolute inset-x-1.5 inset-y-1 rounded-xl bg-rose-soft/80 border border-rose/25 -z-10"
                />
              )}

              <div className="relative">
                <Icon className="w-4 h-4" />
                {tab.key === 'grimoire' && spellsCount > 0 && (
                  <span className="absolute -top-1.5 -right-3 text-[10px] font-bold tabular-nums bg-rose text-white px-1.5 rounded-full leading-tight">
                    {spellsCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-tight leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
