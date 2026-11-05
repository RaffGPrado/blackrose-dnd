import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useCharactersList } from '../hooks/useCharactersList';
import { Plus, Shield, Heart, Sparkles, LogOut, ChevronRight, User, Crown } from 'lucide-react';
import { triggerHaptic } from '../hooks/useHaptics';

interface CharactersListProps {
  onSelectCharacter: (id: number) => void;
  onCreateCharacter: () => void;
  onOpenDMDashboard?: () => void;
}

export const CharactersList: React.FC<CharactersListProps> = ({
  onSelectCharacter,
  onCreateCharacter,
  onOpenDMDashboard,
}) => {
  const { user, logout } = useAuthStore();
  const { characters, loading, error } = useCharactersList();

  return (
    <div className="min-h-screen bg-paper text-ink pb-20 max-w-6xl mx-auto">
      <header className="sticky top-0 z-20 bg-paper/90 backdrop-blur-md border-b border-rule px-4 py-3 sm:px-6 flex items-center justify-between pt-safe">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-soft border border-rose/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-rose" />
          </div>
          <div>
            <h1 className="font-serif text-base font-bold text-ink leading-tight">
              Black Rose Codex
            </h1>
            <p className="text-[11px] text-ink-soft leading-tight truncate max-w-[140px] sm:max-w-xs">
              {user?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenDMDashboard && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                onOpenDMDashboard();
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-gold-soft/80 hover:bg-gold-soft border border-gold/30 text-gold rounded-xl text-xs font-bold transition-all tap-control"
              title="Abrir Mesa do Mestre em Tempo Real"
            >
              <Crown className="w-4 h-4" />
              <span>Modo Mestre</span>
            </button>
          )}

          <button
            type="button"
            onClick={logout}
            className="px-3 py-2 text-ink-soft hover:text-rose hover:bg-elevated rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5 tap-control"
            title="Sair da Conta"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink">
              Seus Personagens
            </h2>
            <p className="text-xs text-ink-soft">Selecione uma ficha para jogar na mesa</p>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              onCreateCharacter();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose text-white rounded-xl text-xs font-bold shadow-sm tap-control"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Personagem</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-soft border border-rose/40 text-rose text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-ink-soft font-serif text-sm animate-pulse">
            Carregando registros de heróis...
          </div>
        ) : characters.length === 0 ? (
          <div className="codex-card py-16 text-center border-dashed p-6 max-w-md mx-auto">
            <User className="w-12 h-12 text-ink-faint mx-auto mb-3" />
            <h3 className="font-serif text-base font-bold text-ink">
              Nenhum personagem criado ainda
            </h3>
            <p className="text-xs text-ink-soft mt-1 max-w-xs mx-auto">
              Crie seu primeiro herói de D&D 5e para gerenciar vida, atributos e grimório pessoal.
            </p>
            <button
              type="button"
              onClick={onCreateCharacter}
              className="mt-4 px-4 py-2.5 bg-rose text-white text-xs font-bold rounded-xl tap-control"
            >
              Criar Primeiro Personagem
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {characters.map((char) => (
              <div
                key={char.id}
                onClick={() => {
                  triggerHaptic('tap');
                  onSelectCharacter(char.id);
                }}
                className="codex-card hover:border-rose/50 p-4 sm:p-5 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-between group"
              >
                <div className="space-y-1.5 flex-1 pr-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg font-bold text-ink truncate group-hover:text-rose transition-colors">
                      {char.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 bg-rose-soft border border-rose/30 text-rose font-bold rounded-full shrink-0">
                      Nv {char.level}
                    </span>
                  </div>

                  <p className="text-xs text-ink-soft truncate">
                    {char.race_name || 'Aventureiro'} • {char.class_name || 'Guerreiro'}
                  </p>

                  <div className="flex items-center gap-3 text-xs pt-1 tabular-nums">
                    <span className="flex items-center gap-1 text-heal font-bold">
                      <Heart className="w-3.5 h-3.5" />
                      {char.current_hp}/{char.max_hp} PV
                    </span>
                    <span className="flex items-center gap-1 text-ink font-bold">
                      <Shield className="w-3.5 h-3.5 text-ink-soft" />
                      CA {char.armor_class}
                    </span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-xl bg-elevated group-hover:bg-rose-soft flex items-center justify-center text-ink-soft group-hover:text-rose transition-colors shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
