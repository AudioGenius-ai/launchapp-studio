import { Search, X } from 'lucide-react';
import { cn } from '@code-pilot/ui-kit';

interface FileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function FileSearchBar({
  value,
  onChange,
  placeholder = 'Search files...',
  className,
}: FileSearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-8 pr-8 py-1.5 text-sm bg-background border rounded focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-accent rounded"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}