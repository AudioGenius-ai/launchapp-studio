import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ProblemsPanel: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-foregroundSecondary)' }}>
          <AlertCircle size={16} />
          <span>No problems detected</span>
        </div>
      </div>
    </div>
  );
};