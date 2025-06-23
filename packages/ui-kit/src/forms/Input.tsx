import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'ghost' | 'filled';
  inputSize?: 'sm' | 'md' | 'lg';
  error?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text', 
    variant = 'default',
    inputSize = 'md',
    error = false,
    icon,
    iconPosition = 'left',
    disabled,
    ...props 
  }, ref) => {
    const inputClasses = cn(
      'flex w-full rounded-md border bg-background text-sm ring-offset-background transition-colors',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      
      // Size variants
      {
        'h-8 px-2 py-1 text-xs': inputSize === 'sm',
        'h-10 px-3 py-2': inputSize === 'md',
        'h-12 px-4 py-3 text-base': inputSize === 'lg',
      },
      
      // Style variants
      {
        'border-input': variant === 'default',
        'border-transparent bg-muted': variant === 'ghost',
        'border-input bg-muted/50': variant === 'filled',
      },
      
      // Error state
      error && 'border-destructive focus-visible:ring-destructive',
      
      // Icon padding
      icon && iconPosition === 'left' && 'pl-8',
      icon && iconPosition === 'right' && 'pr-8',
      
      className
    );

    if (icon) {
      return (
        <div className="relative">
          <input
            type={type}
            className={inputClasses}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          <div 
            className={cn(
              'absolute top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground',
              iconPosition === 'left' ? 'left-2' : 'right-2',
              disabled && 'opacity-50'
            )}
          >
            {icon}
          </div>
        </div>
      );
    }

    return (
      <input
        type={type}
        className={inputClasses}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };