import { useEffect } from 'react';
import { useSessionStore } from '../features/session/useSessionStore';

export function useSessionKeyboardShortcut() {
  const toggleRun = useSessionStore((state) => state.toggleRun);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.code !== 'Space' && event.key !== ' ') || event.repeat || event.defaultPrevented
        || event.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
      const target = event.target;
      if (target instanceof Element && target.closest(
        'input, textarea, select, button, a, [role="textbox"], [role="combobox"], [contenteditable]:not([contenteditable="false"])',
      )) return;
      event.preventDefault();
      toggleRun();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleRun]);
}
