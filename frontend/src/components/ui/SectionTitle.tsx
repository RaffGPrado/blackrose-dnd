import React from 'react';
import { cn } from '../../lib/utils';

interface SectionTitleProps {
  title: string;
  right?: React.ReactNode;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, right, className }) => {
  return (
    <div className={cn('flex items-center gap-3 mb-2.5', className)}>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft shrink-0">
        {title}
      </h2>
      <div className="h-px flex-1 bg-rule" aria-hidden="true" />
      {right && <div className="text-xs text-ink-soft shrink-0">{right}</div>}
    </div>
  );
};
