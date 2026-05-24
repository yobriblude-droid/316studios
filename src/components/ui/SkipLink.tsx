import React from 'react';

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:px-4 focus:py-2 focus:bg-accent focus:text-[var(--primary-foreground)] focus:text-xs focus:uppercase focus:tracking-widest focus:font-semibold"
    >
      Skip to main content
    </a>
  );
}
