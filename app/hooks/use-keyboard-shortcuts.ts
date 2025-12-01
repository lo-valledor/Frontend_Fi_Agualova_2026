import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  description?: string;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea (except for shortcuts targeting inputs)
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Find matching shortcut
      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey;
        const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
        const altMatch = !!shortcut.altKey === event.altKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (matchingShortcut) {
        // If typing, only allow ctrl/alt shortcuts
        if (isTyping && !event.ctrlKey && !event.altKey) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        matchingShortcut.callback();
      }
    };

    document.addEventListener('keydown', handleKeyPress, true);

    return () => {
      document.removeEventListener('keydown', handleKeyPress, true);
    };
  }, [shortcuts, enabled]);
}

// Helper hook for common monitor shortcuts
export function useMonitorKeyboardShortcuts(callbacks: {
  onSearch?: () => void;
  onRefresh?: () => void;
  onEscape?: () => void;
}) {
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'f',
        ctrlKey: true,
        callback: () => callbacks.onSearch?.(),
        description: 'Enfocar búsqueda'
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
        description: 'Cerrar diálogos'
      }
    ]
  });
}
