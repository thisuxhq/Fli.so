type ShortcutHandler = (e: KeyboardEvent) => void;

export interface Shortcut {
  key: string;
  handler: ShortcutHandler;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export function initKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handleKeydown = (e: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      if (
        e.key === shortcut.key &&
        !!e.ctrlKey === !!shortcut.ctrl &&
        !!e.shiftKey === !!shortcut.shift &&
        !!e.altKey === !!shortcut.alt
      ) {
        shortcut.handler(e);
      }
    }
  };

  window.addEventListener("keydown", handleKeydown);
  return () => window.removeEventListener("keydown", handleKeydown);
}
