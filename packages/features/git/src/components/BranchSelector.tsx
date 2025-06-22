import React, { useState, useRef, useEffect } from 'react';
import { GitBranch as GitBranchType } from '@code-pilot/types';
import { Button, cn } from '@code-pilot/ui';
import { 
  GitBranch, 
  Check, 
  Plus,
  Search,
  ChevronDown
} from 'lucide-react';

export interface BranchSelectorProps {
  currentBranch: string | null;
  branches: GitBranchType[];
  onSwitch: (branch: string) => void;
  onCreate: (branch: string) => void;
  onDelete?: (branch: string) => void;
  loading?: boolean;
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({
  currentBranch,
  branches,
  onSwitch,
  onCreate,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const localBranches = branches.filter(b => !b.isRemote);
  const remoteBranches = branches.filter(b => b.isRemote);
  
  const filteredLocalBranches = localBranches.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredRemoteBranches = remoteBranches.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateBranch = () => {
    const name = prompt('Enter new branch name:');
    if (name) {
      onCreate(name);
      setIsOpen(false);
    }
  };

  const handleSwitchBranch = (branchName: string) => {
    onSwitch(branchName);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="sm"
        className="h-8 px-2"
        disabled={loading}
        onClick={() => setIsOpen(!isOpen)}
      >
        <GitBranch className="h-4 w-4 mr-1" />
        <span className="max-w-[150px] truncate">{currentBranch || 'No branch'}</span>
        <ChevronDown className="h-3 w-3 ml-1" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[250px] bg-background border rounded-md shadow-lg z-50">
          {/* Search */}
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1 rounded-md border">
              <Search className="h-3 w-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search branches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
          
          <div className="border-t" />
          
          {/* Create Branch */}
          <button
            className="w-full px-2 py-1.5 text-left text-sm hover:bg-accent flex items-center gap-2"
            onClick={handleCreateBranch}
          >
            <Plus className="h-4 w-4" />
            Create new branch
          </button>
          
          <div className="border-t" />
          
          {/* Local Branches */}
          {filteredLocalBranches.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Local Branches
              </div>
              {filteredLocalBranches.map((branch) => (
                <button
                  key={branch.name}
                  onClick={() => handleSwitchBranch(branch.name)}
                  disabled={branch.isCurrent}
                  className={cn(
                    "w-full px-2 py-1.5 text-left text-sm hover:bg-accent flex items-center gap-2",
                    branch.isCurrent && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {branch.isCurrent ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <div className="w-4" />
                    )}
                    <span className={cn(
                      "truncate",
                      branch.isCurrent && "font-medium"
                    )}>
                      {branch.name}
                    </span>
                  </div>
                  {(branch.ahead > 0 || branch.behind > 0) && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {branch.ahead > 0 && `↑${branch.ahead}`}
                      {branch.ahead > 0 && branch.behind > 0 && ' '}
                      {branch.behind > 0 && `↓${branch.behind}`}
                    </span>
                  )}
                </button>
              ))}
            </>
          )}
          
          {/* Remote Branches */}
          {filteredRemoteBranches.length > 0 && (
            <>
              <div className="border-t" />
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Remote Branches
              </div>
              {filteredRemoteBranches.map((branch) => (
                <button
                  key={branch.name}
                  onClick={() => handleSwitchBranch(branch.name)}
                  className="w-full px-2 py-1.5 text-left text-sm hover:bg-accent flex items-center gap-2"
                >
                  <div className="w-4" />
                  <span className="truncate text-muted-foreground">
                    {branch.name}
                  </span>
                </button>
              ))}
            </>
          )}
          
          {filteredLocalBranches.length === 0 && filteredRemoteBranches.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No branches found
            </div>
          )}
        </div>
      )}
    </div>
  );
};