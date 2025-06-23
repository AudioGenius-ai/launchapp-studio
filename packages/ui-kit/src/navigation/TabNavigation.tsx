import React from 'react';
import { cn } from '../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
  badge?: string | number;
  icon?: React.ReactNode;
}

interface TabNavigationProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  items,
  activeTab,
  onTabChange,
  className,
  variant = 'default',
}) => {
  const getTabClasses = (item: TabItem, isActive: boolean) => {
    const baseClasses = 'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    
    if (item.disabled) {
      return cn(baseClasses, 'cursor-not-allowed opacity-50');
    }

    switch (variant) {
      case 'pills':
        return cn(
          baseClasses,
          'rounded-md',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        );
      case 'underline':
        return cn(
          baseClasses,
          'border-b-2 rounded-none',
          isActive
            ? 'border-primary text-foreground'
            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
        );
      default:
        return cn(
          baseClasses,
          'border border-border rounded-t-lg -mb-px',
          isActive
            ? 'bg-background text-foreground border-b-background'
            : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-background/50'
        );
    }
  };

  return (
    <div
      className={cn(
        'flex',
        variant === 'underline' ? 'border-b border-border' : '',
        className
      )}
    >
      {items.map((item) => {
        const isActive = item.id === activeTab;
        
        return (
          <button
            key={item.id}
            type="button"
            disabled={item.disabled}
            onClick={() => !item.disabled && onTabChange(item.id)}
            className={getTabClasses(item, isActive)}
            aria-selected={isActive}
            role="tab"
          >
            {item.icon && item.icon}
            {item.label}
            {item.badge && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};