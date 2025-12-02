/**
 * Keyboard Helper Utilities
 *
 * Functions for keyboard shortcut handling and validation
 */

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  description?: string;
}

/**
 * Checks if keyboard event matches a shortcut definition
 *
 * Compares all modifier keys (Ctrl, Shift, Alt) and the main key.
 *
 * @param event - Keyboard event to check
 * @param shortcut - Shortcut definition to match
 * @returns True if event matches shortcut
 *
 * @example
 * ```typescript
 * const matches = matchesShortcut(event, {
 *   key: 's',
 *   ctrlKey: true,
 *   callback: () => save()
 * });
 * ```
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
  const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey;
  const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
  const altMatch = !!shortcut.altKey === event.altKey;

  return keyMatch && ctrlMatch && shiftMatch && altMatch;
}

/**
 * Checks if user is currently typing in an input field
 *
 * @param event - Keyboard event
 * @returns True if user is typing in editable element
 */
export function isUserTyping(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement;
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  );
}

/**
 * Should shortcut be allowed when typing
 *
 * Ctrl/Alt shortcuts are allowed while typing, but plain key shortcuts aren't.
 *
 * @param event - Keyboard event
 * @param shortcut - Shortcut definition
 * @returns True if shortcut should execute while typing
 */
export function shouldAllowShortcutWhileTyping(
  event: KeyboardEvent,
  shortcut: KeyboardShortcut
): boolean {
  // Allow ctrl or alt shortcuts while typing
  return !!event.ctrlKey || !!event.altKey;
}

/**
 * Finds matching shortcut from list
 *
 * @param event - Keyboard event
 * @param shortcuts - List of available shortcuts
 * @returns Matching shortcut or undefined
 */
export function findMatchingShortcut(
  event: KeyboardEvent,
  shortcuts: KeyboardShortcut[]
): KeyboardShortcut | undefined {
  return shortcuts.find(shortcut => matchesShortcut(event, shortcut));
}

/**
 * Formats shortcut for display
 *
 * @param shortcut - Shortcut definition
 * @returns Human-readable shortcut string
 *
 * @example
 * ```typescript
 * formatShortcut({ key: 's', ctrlKey: true }) // 'Ctrl+S'
 * ```
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.altKey) parts.push('Alt');
  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
}

/**
 * Validates shortcut definition
 *
 * @param shortcut - Shortcut to validate
 * @returns Validation result with errors
 */
export function validateShortcut(shortcut: KeyboardShortcut): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!shortcut.key) {
    errors.push('Shortcut must have a key');
  }

  if (typeof shortcut.callback !== 'function') {
    errors.push('Shortcut must have a callback function');
  }

  if (!shortcut.ctrlKey && !shortcut.shiftKey && !shortcut.altKey && shortcut.key.length === 1) {
    // Plain letter shortcuts without modifiers should have a warning
    // but not an error - they're just less ideal
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
