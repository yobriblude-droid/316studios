import { describe, expect, it, vi } from 'vitest';
import { clearCommands, getCommands, registerCommands } from '../src/lib/commands';

describe('commands', () => {
  it('registers and unregisters commands', () => {
    clearCommands();
    const action = vi.fn();
    const unregister = registerCommands([
      { id: 'test-cmd', label: 'Test', group: 'Test', action },
    ]);
    expect(getCommands().length).toBe(1);
    unregister();
    expect(getCommands().length).toBe(0);
  });
});
