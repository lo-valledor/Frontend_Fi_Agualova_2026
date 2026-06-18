import { useEffect } from 'react';

import {
  findMatchingShortcut,
  isUserTyping,
  shouldAllowShortcutWhileTyping,
  type KeyboardShortcut
} from './utils/keyboard-helpers';


interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}


export function useKeyboardShortcuts({
  shortcuts,
  enabled = true
}: UseKeyboardShortcutsOptions): void {
  useEffect(() => {
    // Early return if shortcuts are disabled
    if (!enabled) {
      return;
    }

    const handleKeyPress = (event: KeyboardEvent): void => {
      // Check if user is typing in an input field
      const typing = isUserTyping(event);

      // Find matching shortcut
      const matchingShortcut = findMatchingShortcut(event, shortcuts);

      // Early return if no matching shortcut
      if (!matchingShortcut) {
        return;
      }

      // If typing, only allow ctrl/alt shortcuts
      if (typing && !shouldAllowShortcutWhileTyping(event, matchingShortcut)) {
        return;
      }

      // Prevent default behavior and execute callback
      event.preventDefault();
      event.stopPropagation();
      matchingShortcut.callback();
    };

    // Register event listener with capture phase
    document.addEventListener('keydown', handleKeyPress, true);

    // Cleanup on unmount or when dependencies change
    return (): void => {
      document.removeEventListener('keydown', handleKeyPress, true);
    };
  }, [shortcuts, enabled]);
}


interface MonitorKeyboardCallbacks {
  onSearch?: () => void;
  onRefresh?: () => void;
  onEscape?: () => void;
}


export function useMonitorKeyboardShortcuts(
  callbacks: MonitorKeyboardCallbacks
): void {
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'f',
        ctrlKey: true,
        callback: () => callbacks.onSearch?.(),
        description: 'Enfocar busqueda'
      },
      {
        key: 'r',
        ctrlKey: true,
        callback: () => callbacks.onRefresh?.(),
        description: 'Refrescar resultados'
      },
      {
        key: 'Escape',
        callback: () => callbacks.onEscape?.(),
        description: 'Cerrar dialogos'
      }
    ]
  });
}
