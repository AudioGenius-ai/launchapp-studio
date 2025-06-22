import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const SearchPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Search size={20} />
        <h2 className="text-lg font-semibold">Search</h2>
      </div>
      <div className="space-y-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search files by name or content..."
          className="w-full px-3 py-2 text-sm rounded-md border"
          style={{
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-foreground)',
          }}
        />
        <div className="text-sm" style={{ color: 'var(--color-foregroundSecondary)' }}>
          Enter a search query to find files...
        </div>
      </div>
    </div>
  );
};