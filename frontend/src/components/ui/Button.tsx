import React from 'react';
import { cn } from '../../lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'heal' | 'gold' | 'ghost';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-rose-600 to-fuchsia-600 hover:from-rose-500 hover:to-fuchsia-500 text-white shadow-md shadow-rose-900/30 border border-rose-500/30',
  secondary:
    'bg-[#1c1c28] hover:bg-[#252535] text-white border border-gray-700/60',
  danger:
    'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/70',
  heal:
    'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-800/70',
  gold:
    'bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-700/70',
  ghost:
    'bg-transparent hover:bg-white/5 text-gray-300 hover:text-white border border-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'min-h-12 px-4 py-3 text-sm rounded-xl',
  sm: 'min-h-12 px-3 py-2.5 text-xs rounded-xl',
  lg: 'min-h-12 px-6 py-3.5 text-base rounded-2xl',
  icon: 'min-h-12 min-w-12 p-2.5 rounded-xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold transition-all select-none active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-500/50 disabled:opacity-50 disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
