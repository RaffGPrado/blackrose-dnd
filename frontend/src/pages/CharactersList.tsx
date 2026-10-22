import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useCharactersList } from '../hooks/useCharactersList';
import { Plus, Shield, Heart, Sparkles, LogOut, ChevronRight, User, Crown } from 'lucide-react';

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
    <div className="min-h-screen bg-dnd-dark text-dnd-text pb-20 max-w-6xl mx-auto">
      <header className="sticky top-0 z-20 bg-dnd-surface/90 backdrop-blur-md border-b border-dnd-border px-4 py-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-fuchsia-600 flex items-center justify-center shadow-sm shadow-rose-900/40">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">Black Rose</h1>
            <p className="text-[11px] text-dnd-muted leading-tight truncate max-w-[140px] sm:max-w-xs">{user?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenDMDashboard && (
            <button
              type="button"
              onClick={onOpenDMDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-950/70 hover:bg-purple-900/80 border border-purple-800/60 text-purple-300 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 min-h-11 min-w-11"
              title="Abrir Mesa do Mestre em Tempo Real"
            >
              <Crown className="w-4 h-4 text-purple-300" />
              <span>Modo Mestre</span>
            </button>
          )}

          <button
            type="button"
            onClick={logout}
            className="p-2 sm:px-3 text-dnd-muted hover:text-dnd-rose rounded-lg transition-colors text-xs flex items-center gap-1 min-h-11 min-w-11"
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
            <h2 className="text-lg sm:text-xl font-bold text-white">Seus Personagens</h2>
            <p className="text-xs text-dnd-muted">Selecione uma ficha para jogar</p>
          </div>

          <button
            type="button"
            onClick={onCreateCharacter}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 to-fuchsia-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-900/30 active:scale-95 transition-all min-h-11 min-w-11"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Personagem</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/50 border border-rose-900 text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-dnd-dim text-sm animate-pulse">
            Carregando registros de heróis...
          </div>
        ) : characters.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-dnd-border rounded-2xl p-6 max-w-md mx-auto">
            <User className="w-12 h-12 text-dnd-dim mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-300">Nenhum personagem criado ainda</h3>
            <p className="text-xs text-dnd-dim mt-1 max-w-xs mx-auto">
              Crie seu primeiro herói de D&D 5e para gerenciar vida, atributos e grimório pessoal.
            </p>
            <button
              type="button"
              onClick={onCreateCharacter}
              className="mt-4 px-4 py-2.5 bg-dnd-rose text-white text-xs font-semibold rounded-xl hover:bg-rose-500 transition-colors min-h-11"
            >
              Criar Primeiro Personagem
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {characters.map((char) => (
              <div
                key={char.id}
                onClick={() => onSelectCharacter(char.id)}
                className="bg-dnd-surface hover:bg-dnd-elevated border border-dnd-border hover:border-dnd-rose/60 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer shadow-md active:scale-[0.99] flex items-center justify-between group"
              >
                <div className="space-y-1.5 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white group-hover:text-dnd-rose-light transition-colors">{char.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 bg-rose-950/80 border border-rose-800/60 text-rose-300 font-semibold rounded-full">
                      Nv {char.level}
                    </span>
                  </div>

                  <p className="text-xs text-dnd-muted">
                    {char.race_name || 'Aventureiro'} • {char.class_name || 'Guerreiro'}
                  </p>

                  <div className="flex items-center gap-3 text-xs pt-1">
                    <span className="flex items-center gap-1 text-dnd-emerald font-medium">
                      <Heart className="w-3.5 h-3.5 fill-dnd-emerald/20" />
                      {char.current_hp}/{char.max_hp} PV
                    </span>
                    <span className="flex items-center gap-1 text-dnd-blue font-medium">
                      <Shield className="w-3.5 h-3.5 fill-dnd-blue/20" />
                      CA {char.armor_class}
                    </span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-dnd-elevated group-hover:bg-dnd-highlight flex items-center justify-center text-dnd-muted group-hover:text-white transition-colors">
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
