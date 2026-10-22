import React, { useState } from 'react';
import { useDMConnection } from '../hooks/useDMConnection';
import { DMPlayerCard } from '../components/dm/DMPlayerCard';
import { InitiativeTracker } from '../components/dm/InitiativeTracker';
import { BottomSheet } from '../components/ui/BottomSheet';
import {
  ArrowLeft,
  Users,
  Wifi,
  WifiOff,
  UserPlus,
  ArrowDownUp,
  RefreshCw,
  Search,
  Check,
} from 'lucide-react';

import { compareByInitiative } from '../utils/dnd';

interface DMDashboardProps {
  onBack: () => void;
}

export const DMDashboard: React.FC<DMDashboardProps> = ({ onBack }) => {
  const {
    roster,
    watchedIds,
    connected,
    loading,
    error,
    activeTurnId,
    toggleWatched,
    adjustHp,
    adjustTempHp,
    toggleCondition,
    setInitiative,
    sortInitiative,
    advanceTurn,
    setActiveTurnId,
    refreshRoster,
  } = useDMConnection();

  const [showRosterModal, setShowRosterModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRoster = roster.filter((char) =>
    char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (char.class_name && char.class_name.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const watchedCharacters = roster.filter((char) => watchedIds.includes(char.id));
  const sortedWatched = [...watchedCharacters].sort(compareByInitiative);
  const onlineCount = watchedCharacters.filter((c) => c.online).length;

  return (
    <div className="min-h-screen bg-dnd-dark text-dnd-text pb-20 max-w-7xl mx-auto">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-dnd-surface/95 backdrop-blur-md border-b border-dnd-border px-4 py-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 text-dnd-muted hover:text-white rounded-xl hover:bg-dnd-elevated transition-colors flex items-center gap-1.5 text-xs min-h-[36px]"
            title="Voltar para Personagens"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Voltar</span>
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 leading-tight">
              <span>Mesa do Mestre</span>
              <span className="text-[10px] px-2 py-0.5 bg-purple-950/80 border border-purple-800/60 text-purple-300 font-bold rounded-full">
                Ao Vivo
              </span>
            </h1>
            <p className="text-[11px] text-dnd-muted">Visão em tempo real de combate e status do grupo</p>
          </div>
        </div>

        {/* WebSocket Connection Badge & Add Button */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
              connected
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/60 border-rose-800/60 text-rose-300 animate-pulse'
            }`}
          >
            {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{connected ? 'Conectado' : 'Reconectando'}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowRosterModal(true)}
            className="px-3 py-1.5 bg-dnd-rose hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-950/40 transition-all active:scale-95 flex items-center gap-1.5 min-h-[36px]"
            title="Adicionar Personagens"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Adicionar Herói</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Encounter Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-dnd-surface border border-dnd-border rounded-2xl p-3 sm:p-4 text-center text-xs shadow-sm max-w-2xl mx-auto">
          <div>
            <span className="block text-[10px] font-bold uppercase text-dnd-dim">Mesa</span>
            <span className="text-sm sm:text-base font-bold text-white">{watchedCharacters.length} Heróis</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase text-dnd-dim">Jogadores</span>
            <span className="text-sm sm:text-base font-bold text-emerald-400">{onlineCount} Online</span>
          </div>
          <div>
            <button
              type="button"
              onClick={sortInitiative}
              className="w-full h-full flex flex-col items-center justify-center text-dnd-gold hover:text-amber-300 transition-colors"
              title="Ordenar lista por iniciativa decrescente"
            >
              <ArrowDownUp className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] font-bold uppercase">Ordenar</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/50 border border-rose-900 text-rose-300 text-xs rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={refreshRoster}
              className="p-1 hover:bg-rose-900/50 rounded transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Watched Cards List */}
        {loading ? (
          <div className="py-20 text-center text-dnd-dim text-sm animate-pulse">
            Sintonizando canal da Mesa Conectada...
          </div>
        ) : sortedWatched.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-dnd-border rounded-2xl p-8 max-w-md mx-auto space-y-3">
            <Users className="w-12 h-12 text-dnd-dim mx-auto" />
            <h3 className="text-sm font-bold text-gray-300">Nenhum personagem na mesa ainda</h3>
            <p className="text-xs text-dnd-dim max-w-xs mx-auto">
              Selecione quais heróis estão na sessão de hoje para acompanhar PV e condições em tempo real sem delay.
            </p>
            <button
              type="button"
              onClick={() => setShowRosterModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-fuchsia-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-950/50 hover:from-rose-500 hover:to-fuchsia-500 transition-all inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Adicionar Heróis à Mesa</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Turn Order Tracker */}
            <InitiativeTracker
              characters={sortedWatched}
              activeTurnId={activeTurnId}
              onAdvanceTurn={advanceTurn}
              onSelectTurn={setActiveTurnId}
              onSetInitiative={setInitiative}
            />

            {/* Combatant Cards Grid - Responsive: 1 col on mobile, 2 on md, 3 on lg, 4 on xl */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedWatched.map((player) => (
                <DMPlayerCard
                  key={player.id}
                  player={player}
                  isActiveTurn={player.id === activeTurnId}
                  onAdjustHp={adjustHp}
                  onAdjustTempHp={adjustTempHp}
                  onToggleCondition={toggleCondition}
                  onSetInitiative={setInitiative}
                  onUnwatch={toggleWatched}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Select Characters Modal (BottomSheet) */}
      <BottomSheet
        isOpen={showRosterModal}
        onClose={() => setShowRosterModal(false)}
        title="Gerenciar Heróis da Mesa"
      >
        <div className="space-y-3 p-1">
          <p className="text-xs text-gray-400">
            Marque os personagens que participarão do combate para acompanhar as barras de vida ao vivo:
          </p>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou classe..."
              className="w-full bg-[#181824] border border-gray-700/60 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Roster Selection List */}
          <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
            {filteredRoster.length === 0 ? (
              <p className="py-6 text-center text-xs text-gray-500">Nenhum personagem encontrado</p>
            ) : (
              filteredRoster.map((char) => {
                const isSelected = watchedIds.includes(char.id);
                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => toggleWatched(char.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-800/80 text-white shadow-sm'
                        : 'bg-[#181824] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{char.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-gray-800 text-gray-300 rounded-full font-semibold">
                          Nv {char.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        {char.race_name || 'Aventureiro'} • {char.class_name || 'Guerreiro'}
                        {char.player_name && ` (${char.player_name})`}
                      </p>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-rose-600 border-rose-500 text-white'
                          : 'border-gray-700 bg-gray-900/50 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
