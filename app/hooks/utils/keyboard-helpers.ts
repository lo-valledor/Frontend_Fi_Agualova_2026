export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  description?: string;
}

export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: KeyboardShortcut
): boolean {
  const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
  const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey;
  const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
  const altMatch = !!shortcut.altKey === event.altKey;

  return keyMatch && ctrlMatch && shiftMatch && altMatch;
}

export function isUserTyping(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement;
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  );
}

export function shouldAllowShortcutWhileTyping(
  event: KeyboardEvent,
  shortcut: KeyboardShortcut
): boolean {
  // Allow ctrl or alt shortcuts while typing
  return !!event.ctrlKey || !!event.altKey;
}

export function findMatchingShortcut(
  event: KeyboardEvent,
  shortcuts: KeyboardShortcut[]
): KeyboardShortcut | undefined {
  return shortcuts.find(shortcut => matchesShortcut(event, shortcut));
}

export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.altKey) parts.push('Alt');
  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
}

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

  if (
    !shortcut.ctrlKey &&
    !shortcut.shiftKey &&
    !shortcut.altKey &&
    shortcut.key.length === 1
  ) {
    // Plain letter shortcuts without modifiers should have a warning
    // but not an error - they're just less ideal
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
