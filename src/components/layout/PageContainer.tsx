import React from 'react';
import { cn } from '../../lib/utils';
import { layout } from '../../lib/layout';

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'main';
  narrow?: boolean;
};

/** Consistent horizontal margins — prevents content clipping at screen edges */
export function PageContainer({ children, className, as: Tag = 'div', narrow }: PageContainerProps) {
  return (
    <Tag
      className={cn(
        layout.container,
        narrow && 'max-w-5xl',
        className
      )}
    >
      {children}
    </Tag>
  );
}

export default PageContainer;
