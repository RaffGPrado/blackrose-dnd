import React from 'react';
import { Search, X, List, LayoutGrid } from 'lucide-react';

interface SpellFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  selectedSchool: string;
  setSelectedSchool: (school: string) => void;
  schools: string[];
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
}

export const SpellFilters: React.FC<SpellFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedLevel,
  setSelectedLevel,
  selectedSchool,
  setSelectedSchool,
  schools,
  viewMode,
  setViewMode,
  clearAllFilters,
  hasActiveFilters,
}) => {
  const levels = [
    { label: 'Todos os Círculos', value: '' },
    { label: 'Truques (Nível 0)', value: '0' },
    { label: '1º Círculo', value: '1' },
    { label: '2º Círculo', value: '2' },
    { label: '3º Círculo', value: '3' },
    { label: '4º Círculo', value: '4' },
    { label: '5º Círculo', value: '5' },
    { label: '6º Círculo', value: '6' },
    { label: '7º Círculo', value: '7' },
    { label: '8º Círculo', value: '8' },
    { label: '9º Círculo', value: '9' },
  ];

  return (
    <div className="bg-dnd-surface border border-dnd-border rounded-xl p-3 shadow-dnd-card space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-dnd-dim" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar magia..."
            className="w-full bg-dnd-elevated border border-dnd-border rounded-lg pl-9 pr-8 py-2.5 text-base sm:text-xs text-white placeholder-dnd-dim focus:outline-none focus:border-dnd-blue/60 min-h-11"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-dnd-dim hover:text-white p-1 min-h-8 min-w-8 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex bg-dnd-elevated border border-dnd-border rounded-lg p-0.5 items-center">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors min-h-10 min-w-10 flex items-center justify-center ${viewMode === 'grid' ? 'bg-dnd-blue text-white' : 'text-dnd-muted hover:text-white'}`}
            title="Visualização em Grid (Cartas)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors min-h-10 min-w-10 flex items-center justify-center ${viewMode === 'list' ? 'bg-dnd-blue text-white' : 'text-dnd-muted hover:text-white'}`}
            title="Visualização em Lista Compacta"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="flex-1 bg-dnd-elevated border border-dnd-border rounded-lg px-2.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-dnd-blue/60 appearance-none min-h-11"
        >
          {levels.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <select
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          className="flex-1 bg-dnd-elevated border border-dnd-border rounded-lg px-2.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-dnd-blue/60 appearance-none min-h-11"
        >
          <option value="">Todas as Escolas</option>
          {schools.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-bold text-dnd-muted hover:text-white underline underline-offset-2 flex items-center gap-1 p-1 min-h-8"
          >
            <X className="w-3.5 h-3.5" /> Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
};
