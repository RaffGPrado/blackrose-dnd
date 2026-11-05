import React from 'react';
import { cn } from '../../lib/utils';

export type ProficiencyLevel = 'none' | 'proficient' | 'expertise';

interface ProficiencyPipProps {
  level: ProficiencyLevel;
}

export const ProficiencyPip: React.FC<ProficiencyPipProps> = ({ level }) => {
  if (level === 'expertise') {
    return (
      <span
        aria-label="Especialização (dobro de proficiência)"
        className="w-3.5 h-3.5 rounded-full border-2 border-rose flex items-center justify-center shrink-0"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose" />
      </span>
    );
  }

  if (level === 'proficient') {
    return (
      <span
        aria-label="Proficiente"
        className="w-2.5 h-2.5 rounded-full bg-rose shrink-0 mx-0.5"
      />
    );
  }

  return (
    <span
      aria-label="Sem proficiência"
      className="w-2.5 h-2.5 rounded-full border border-rule-strong shrink-0 mx-0.5"
    />
  );
};

interface InteractivePipButtonProps {
  filled: boolean;
  variant?: 'rose' | 'heal' | 'gold';
  label: string;
  title?: string;
  onToggle: () => void;
}

export const InteractivePipButton: React.FC<InteractivePipButtonProps> = ({
  filled,
  variant = 'rose',
  label,
  title,
  onToggle,
}) => {
  const fillStyle =
    variant === 'heal'
      ? 'bg-heal border-heal'
      : variant === 'gold'
        ? 'bg-gold border-gold'
        : 'bg-rose border-rose';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-pressed={filled}
      title={title ?? label}
      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg tap-control hover:bg-elevated/60"
    >
      <span
        className={cn(
          'w-4 h-4 rounded-full border-2 transition-all duration-150',
          filled ? fillStyle : 'border-rule-strong bg-transparent'
        )}
      />
    </button>
  );
};
