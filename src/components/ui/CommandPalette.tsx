import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import { useNavigate } from 'react-router-dom';
import { Search, Command } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { trapFocus, announceToScreenReader } from '../../lib/accessibility';
import { getCommands, registerCommands, defaultNavigationCommands } from '../../lib/commands';
import type { CommandItem } from '../../lib/commands';

export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unregister = registerCommands(defaultNavigationCommands(navigate));
    return unregister;
  }, [navigate]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
    window.setTimeout(() => inputRef.current?.focus(), 50);
    const release = panelRef.current ? trapFocus(panelRef.current) : undefined;
    return () => release?.();
  }, [open]);

  const commands = getCommands();

  const fuse = useMemo(
    () =>
      new Fuse(commands, {
        keys: ['label', 'group', 'keywords'],
        threshold: 0.35,
      }),
    [commands]
  );

  const results: CommandItem[] = useMemo(() => {
    if (!query.trim()) return commands;
    return fuse.search(query.trim()).map((r) => r.item);
  }, [query, commands, fuse]);

  const runCommand = useCallback(
    (item: CommandItem) => {
      setOpen(false);
      item.action();
      announceToScreenReader(`Executed ${item.label}`);
    },
    []
  );

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      runCommand(results[activeIndex]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[250] flex items-start justify-center pt-[15vh] px-4">
          <motion.button
            type="button"
            aria-label="Close command palette"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative w-full max-w-xl glass-panel border-gold overflow-hidden"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
          >
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <Search className="w-4 h-4 text-muted shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onInputKeyDown}
                placeholder="Search commands…"
                className="flex-1 py-4 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
                aria-controls="command-listbox"
                aria-activedescendant={
                  results[activeIndex] ? `command-option-${results[activeIndex].id}` : undefined
                }
              />
              <kbd className="hidden sm:inline text-[10px] text-muted border border-border px-1.5 py-0.5 uppercase">
                Esc
              </kbd>
            </div>
            <ul
              id="command-listbox"
              role="listbox"
              className="max-h-72 overflow-y-auto py-2"
            >
              {results.length === 0 ? (
                <li className="px-4 py-6 text-sm text-muted text-center">No commands found</li>
              ) : (
                results.map((item, index) => (
                  <li key={item.id} role="option" aria-selected={index === activeIndex}>
                    <button
                      id={`command-option-${item.id}`}
                      type="button"
                      onClick={() => runCommand(item)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        'w-full text-left px-4 py-2.5 flex items-center justify-between gap-4 text-sm transition-colors',
                        index === activeIndex ? 'bg-accent-dim text-accent' : 'text-foreground hover:bg-elevated'
                      )}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] uppercase tracking-widest text-muted">{item.group}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="px-4 py-2 border-t border-border flex items-center gap-2 text-[10px] text-muted uppercase tracking-wider">
              <Command className="w-3 h-3" />
              <span>Ctrl+K to toggle</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default CommandPalette;
