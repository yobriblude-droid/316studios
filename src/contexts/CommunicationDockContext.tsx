import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type CommunicationDockContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
};

const CommunicationDockContext = createContext<CommunicationDockContextValue | null>(null);

export function CommunicationDockProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);

  return (
    <CommunicationDockContext.Provider value={value}>{children}</CommunicationDockContext.Provider>
  );
}

export function useCommunicationDock() {
  const ctx = useContext(CommunicationDockContext);
  if (!ctx) {
    return {
      open: false,
      setOpen: () => {},
      toggle: () => {},
    };
  }
  return ctx;
}
