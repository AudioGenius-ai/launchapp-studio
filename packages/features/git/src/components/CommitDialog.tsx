import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: any[]) => twMerge(clsx(inputs));
const Button = ({ children, onClick, className, ...props }: any) => (
  <button onClick={onClick} className={cn('px-4 py-2 rounded', className)} {...props}>
    {children}
  </button>
);

// Mock Dialog components for now
const Dialog = ({ open, children }: any) => open ? <div className="fixed inset-0 z-50">{children}</div> : null;
const DialogContent = ({ children, className }: any) => <div className={cn('bg-white p-6 rounded-lg shadow-lg', className)}>{children}</div>;
const DialogHeader = ({ children }: any) => <div className="mb-4">{children}</div>;
const DialogTitle = ({ children }: any) => <h2 className="text-lg font-semibold">{children}</h2>;
const DialogFooter = ({ children }: any) => <div className="mt-4 flex gap-2 justify-end">{children}</div>;
import { GitCommit } from 'lucide-react';

export interface CommitDialogProps {
  open: boolean;
  onClose: () => void;
  onCommit: (message: string, options?: { amend?: boolean }) => void;
  stagedFiles: Array<{ path: string; status: string }>;
  recentCommits?: Array<{ message: string; hash: string }>;
  loading?: boolean;
}

export const CommitDialog: React.FC<CommitDialogProps> = ({
  open,
  onClose,
  onCommit,
  stagedFiles,
  recentCommits = [],
  loading = false,
}) => {
  const [message, setMessage] = useState('');
  const [amend, setAmend] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onCommit(message.trim(), { amend });
      setMessage('');
      setAmend(false);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCommit className="h-5 w-5" />
              Commit Changes
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* Commit Message */}
            <div>
              <label htmlFor="commit-message" className="text-sm font-medium">
                Commit Message
              </label>
              <textarea
                ref={textareaRef}
                id="commit-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter commit message..."
                className={cn(
                  "mt-1 w-full min-h-[100px] p-3 rounded-md",
                  "border bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-ring",
                  "resize-none"
                )}
                required
              />
              <div className="mt-1 text-xs text-muted-foreground">
                Press {navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Enter to commit
              </div>
            </div>

            {/* Staged Files */}
            <div>
              <h4 className="text-sm font-medium mb-2">
                Files to be committed ({stagedFiles.length})
              </h4>
              <div className="max-h-[150px] overflow-auto rounded-md border p-2 bg-muted/50">
                {stagedFiles.map((file) => (
                  <div key={file.path} className="text-xs py-0.5 text-muted-foreground">
                    {file.path}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Commits */}
            {recentCommits.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Commits</h4>
                <div className="space-y-1">
                  {recentCommits.slice(0, 3).map((commit) => (
                    <button
                      key={commit.hash}
                      type="button"
                      onClick={() => setMessage(commit.message)}
                      className={cn(
                        "w-full text-left text-xs p-2 rounded",
                        "hover:bg-muted transition-colors",
                        "truncate"
                      )}
                    >
                      {commit.message}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Options */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="amend"
                checked={amend}
                onChange={(e) => setAmend(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="amend" className="text-sm">
                Amend previous commit
              </label>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!message.trim() || loading}
            >
              {loading ? 'Committing...' : 'Commit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};