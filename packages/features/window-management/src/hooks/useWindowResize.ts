import { useCallback, useEffect, useRef } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { windowService } from '../services/windowService';
import type { WindowSize, WindowPosition } from '../types';

interface UseWindowResizeOptions {
  windowId?: string;
  onResize?: (size: WindowSize) => void;
  onMove?: (position: WindowPosition) => void;
  debounceMs?: number;
}

export function useWindowResize({
  windowId,
  onResize,
  onMove,
  debounceMs = 100,
}: UseWindowResizeOptions = {}) {
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();
  const moveTimeoutRef = useRef<NodeJS.Timeout>();
  
  const setSize = useCallback(async (size: WindowSize) => {
    try {
      await windowService.setSize(size, windowId);
    } catch (error) {
      console.error('Failed to set window size:', error);
    }
  }, [windowId]);
  
  const setPosition = useCallback(async (position: WindowPosition) => {
    try {
      await windowService.setPosition(position, windowId);
    } catch (error) {
      console.error('Failed to set window position:', error);
    }
  }, [windowId]);
  
  const setMinSize = useCallback(async (size: WindowSize | null) => {
    try {
      await windowService.setMinSize(size, windowId);
    } catch (error) {
      console.error('Failed to set min window size:', error);
    }
  }, [windowId]);
  
  const setMaxSize = useCallback(async (size: WindowSize | null) => {
    try {
      await windowService.setMaxSize(size, windowId);
    } catch (error) {
      console.error('Failed to set max window size:', error);
    }
  }, [windowId]);
  
  useEffect(() => {
    const setupListeners = async () => {
      const window = windowId 
        ? await windowService.getWindow(windowId)
        : await getCurrentWindow();
      
      if (!window) return;
      
      const unlistenResize = await window.onResized(({ payload }) => {
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
        
        resizeTimeoutRef.current = setTimeout(() => {
          onResize?.(payload);
        }, debounceMs);
      });
      
      const unlistenMove = await window.onMoved(({ payload }) => {
        if (moveTimeoutRef.current) {
          clearTimeout(moveTimeoutRef.current);
        }
        
        moveTimeoutRef.current = setTimeout(() => {
          onMove?.(payload);
        }, debounceMs);
      });
      
      return () => {
        unlistenResize();
        unlistenMove();
        
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
        if (moveTimeoutRef.current) {
          clearTimeout(moveTimeoutRef.current);
        }
      };
    };
    
    setupListeners();
  }, [windowId, onResize, onMove, debounceMs]);
  
  return {
    setSize,
    setPosition,
    setMinSize,
    setMaxSize,
  };
}