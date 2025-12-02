/**
 * Keyboard Shortcuts Hook
 *
 * Provides hooks for managing keyboard shortcuts in the application.
 * Uses keyboard-helpers utilities for consistent shortcut matching and validation.
 *
 * Includes early returns for disabled state and proper event handling to prevent
 * conflicts with user input in forms.
 */

import { useEffect } from 'react';

import {
  findMatchingShortcut,
  isUserTyping,
  shouldAllowShortcutWhileTyping,
  type KeyboardShortcut
} from './utils/keyboard-helpers';

/**
 * Options for keyboard shortcuts hook
 */
interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * Hook for managing keyboard shortcuts
 *
 * Registers keyboard shortcuts that can be triggered globally in the application.
 * Automatically handles:
 * - Enabling/disabling shortcuts
 * - Preventing shortcuts when user is typing (unless Ctrl/Alt is pressed)
 * - Preventing default behavior and event propagation
 * - Cleanup on unmount
 *
 * @param options - Configuration object
 * @param options.shortcuts - Array of keyboard shortcuts to register
 * @param options.enabled - Whether shortcuts are enabled (default: true)
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     {
 *       key: 's',
 *       ctrlKey: true,
 *       callback: () => handleSave(),
 *       description: 'Save document'
 *     },
 *     {
 *       key: 'Escape',
 *       callback: () => handleClose(),
 *       description: 'Close dialog'
 *     }
 *   ],
 *   enabled: !isFormSubmitting
 * });
 * ```
 */
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

/**
 * Callbacks for monitor keyboard shortcuts
 */
interface MonitorKeyboardCallbacks {
  onSearch?: () => void;
  onRefresh?: () => void;
  onEscape?: () => void;
}

/**
 * Hook for common monitor keyboard shortcuts
 *
 * Provides pre-configured shortcuts commonly used in monitor views:
 * - Ctrl+F: Focus search input
 * - Ctrl+R: Refresh results
 * - Escape: Close dialogs
 *
 * @param callbacks - Object containing callback functions for each shortcut
 * @param callbacks.onSearch - Called when Ctrl+F is pressed
 * @param callbacks.onRefresh - Called when Ctrl+R is pressed
 * @param callbacks.onEscape - Called when Escape is pressed
 *
 * @example
 * ```tsx
 * useMonitorKeyboardShortcuts({
 *   onSearch: () => searchInputRef.current?.focus(),
 *   onRefresh: () => refetchData(),
 *   onEscape: () => setDialogOpen(false)
 * });
 * ```
 */
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
