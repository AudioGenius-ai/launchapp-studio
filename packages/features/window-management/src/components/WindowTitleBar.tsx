import { WindowControls } from './WindowControls';
import { cn } from '@code-pilot/ui-kit';

interface WindowTitleBarProps {
  title?: string;
  icon?: React.ReactNode;
  className?: string;
  controlsClassName?: string;
  showControls?: boolean;
  showMinimize?: boolean;
  showMaximize?: boolean;
  showClose?: boolean;
  showPin?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  onPin?: () => void;
  children?: React.ReactNode;
}

export function WindowTitleBar({
  title,
  icon,
  className,
  controlsClassName,
  showControls = true,
  showMinimize = true,
  showMaximize = true,
  showClose = true,
  showPin = false,
  onMinimize,
  onMaximize,
  onClose,
  onPin,
  children,
}: WindowTitleBarProps) {
  return (
    <div 
      className={cn(
        'flex h-10 items-center justify-between bg-gray-50 px-3 dark:bg-gray-900',
        'border-b border-gray-200 dark:border-gray-800',
        className
      )}
      data-tauri-drag-region
    >
      <div className="flex items-center gap-2" data-tauri-drag-region>
        {icon && (
          <div className="flex h-5 w-5 items-center justify-center">
            {icon}
          </div>
        )}
        {title && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </span>
        )}
        {children}
      </div>
      
      {showControls && (
        <WindowControls
          className={controlsClassName}
          showMinimize={showMinimize}
          showMaximize={showMaximize}
          showClose={showClose}
          showPin={showPin}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          onClose={onClose}
          onPin={onPin}
        />
      )}
    </div>
  );
}