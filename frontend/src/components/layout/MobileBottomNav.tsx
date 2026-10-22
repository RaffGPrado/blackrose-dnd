import React from 'react';
import { Shield, Target, BookOpen, Package, Flame } from 'lucide-react';

export type SheetTab = 'combat' | 'skills' | 'grimoire' | 'inventory' | 'features';

interface MobileBottomNavProps {
  currentTab: SheetTab;
  onChangeTab: (tab: SheetTab) => void;
  spellsCount: number;
}

export const TABS_CONFIG: { key: SheetTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
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
    <nav aria-label="Navegação da Ficha" className="fixed bottom-0 left-0 right-0 z-30 bg-dnd-surface/95 backdrop-blur-md border-t border-dnd-border md:hidden shadow-2xl">
      <div className="max-w-lg mx-auto grid grid-cols-5 px-1.5 pt-1.5 pb-safe">
        {TABS_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChangeTab(tab.key)}
              className={`min-h-[48px] flex flex-col items-center justify-center gap-1 rounded-xl transition-all active:scale-95 relative ${
                isActive
                  ? 'text-dnd-rose font-bold bg-dnd-rose-faint shadow-sm'
                  : 'text-dnd-muted hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 text-dnd-rose' : ''}`} />
                {tab.key === 'grimoire' && spellsCount > 0 && (
                  <span className="absolute -top-1.5 -right-3 text-[9px] font-black bg-dnd-rose text-white px-1 rounded-full leading-tight">
                    {spellsCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
