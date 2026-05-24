import React from 'react';
import { cn } from '../../lib/utils';
import { layout } from '../../lib/layout';

type WorkspaceShellProps = {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
};

export function WorkspaceShell({ children, sidebar, className }: WorkspaceShellProps) {
  return (
    <div className={cn(layout.page, 'pt-20 md:pt-24 pb-28 md:pb-16', className)}>
      <div className={cn(layout.workspaceContainer, 'flex flex-col xl:flex-row gap-4 xl:gap-5')}>
        <div className="flex-1 min-w-0">{children}</div>
        {sidebar}
      </div>
    </div>
  );
}

export default WorkspaceShell;
