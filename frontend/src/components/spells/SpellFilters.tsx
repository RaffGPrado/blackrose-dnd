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
    <div className="codex-card p-3 space-y-2.5">
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-3 top-3 text-ink-soft" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar magia..."
            className="w-full bg-elevated border border-rule rounded-xl pl-9 pr-8 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-rose h-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-ink-soft hover:text-ink p-1 h-6 w-6 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex bg-elevated border border-rule rounded-xl p-0.5 items-center shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors h-9 w-9 flex items-center justify-center tap-control ${viewMode === 'grid' ? 'bg-rose text-white' : 'text-ink-soft hover:text-ink'}`}
            title="Visualização em Grid (Cartas)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors h-9 w-9 flex items-center justify-center tap-control ${viewMode === 'list' ? 'bg-rose text-white' : 'text-ink-soft hover:text-ink'}`}
            title="Visualização em Lista Compacta"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="w-full min-w-0 bg-elevated border border-rule rounded-xl px-2.5 py-2 text-xs font-medium text-ink focus:outline-none focus:border-rose h-10"
        >
          {levels.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <select
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          className="w-full min-w-0 bg-elevated border border-rule rounded-xl px-2.5 py-2 text-xs font-medium text-ink focus:outline-none focus:border-rose h-10"
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
            className="text-xs font-bold text-rose hover:underline underline-offset-2 flex items-center gap-1 p-1"
          >
            <X className="w-3.5 h-3.5" /> Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
};
