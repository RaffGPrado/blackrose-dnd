import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputElement = (
      <input
        id={id}
        ref={ref}
        className={cn(
          'w-full min-h-12 bg-[#1c1c28] border border-gray-700/60 rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all disabled:opacity-50',
          className
        )}
        {...props}
      />
    );

    if (!label) {
      return inputElement;
    }

    return (
      <div>
        <label htmlFor={id} className="block text-xs font-medium text-gray-400 mb-1">
          {label}
        </label>
        {inputElement}
      </div>
    );
  }
);

Input.displayName = 'Input';
