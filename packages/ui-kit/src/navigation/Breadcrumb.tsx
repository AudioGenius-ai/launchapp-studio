import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
  maxItems?: number;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className,
  separator = <ChevronRight className="h-4 w-4" />,
  maxItems,
}) => {
  let displayItems = items;
  
  if (maxItems && items.length > maxItems) {
    const firstItem = items[0];
    const lastItems = items.slice(-(maxItems - 1));
    displayItems = [firstItem, { label: '...', disabled: true }, ...lastItems];
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-1', className)}>
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-muted-foreground">
                {separator}
              </span>
            )}
            {item.href ? (
              <a
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-foreground',
                  item.disabled
                    ? 'text-muted-foreground cursor-not-allowed'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-disabled={item.disabled}
              >
                {item.label}
              </a>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                disabled={item.disabled}
                className={cn(
                  'text-sm font-medium transition-colors',
                  item.disabled
                    ? 'text-muted-foreground cursor-not-allowed'
                    : index === displayItems.length - 1
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};