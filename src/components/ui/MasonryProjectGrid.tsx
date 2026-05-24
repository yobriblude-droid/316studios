import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { staggerContainer, staggerItem } from '../../lib/motion';
import type { ProjectItem } from '../../lib/layout';

/** 12-column masonry for landing — hero spans 7×2, supporting tiles 5+4+4+4 */
const SPANS = [
  'col-span-12 md:col-span-7 md:row-span-2 min-h-[280px] md:min-h-[420px]',
  'col-span-12 md:col-span-5 min-h-[200px]',
  'col-span-6 md:col-span-4 min-h-[180px]',
  'col-span-6 md:col-span-4 min-h-[180px]',
  'col-span-12 md:col-span-4 min-h-[180px]',
  'col-span-12 md:col-span-12 min-h-[160px]',
];

type MasonryProjectGridProps = {
  projects: ProjectItem[];
  className?: string;
};

export function MasonryProjectGrid({ projects, className }: MasonryProjectGridProps) {
  if (projects.length === 0) return null;

  const display = projects.slice(0, 6);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-80px' }}
      className={cn(
        'grid grid-cols-12 gap-2 auto-rows-min',
        className
      )}
    >
      {display.map((project, idx) => {
        const span = SPANS[idx] ?? SPANS[SPANS.length - 1];
        const cover = project.images?.[0];

        return (
          <motion.article
            key={project.id}
            variants={staggerItem}
            className={cn(
              'group relative overflow-hidden glass-panel-v2 border border-glass-border/50 shadow-md',
              span
            )}
            style={{ contentVisibility: 'auto' }}
          >
            {cover && (
              <img
                src={cover}
                alt={project.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1s] ease-out group-hover:scale-105"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
            <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6 z-10">
              <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-secondary mb-1">
                {project.category}
              </span>
              <h3 className="text-lg md:text-2xl font-black uppercase tracking-tighter text-foreground">
                {project.title}
              </h3>
              <p className="mt-1 text-xs text-muted line-clamp-2 max-w-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {project.description}
              </p>
              <Link
                to={`/projects/${project.id}`}
                className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-accent-link hover:text-accent-cta transition-colors"
              >
                View project
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </motion.article>
        );
      })}
    </motion.div>
  );
}

export default MasonryProjectGrid;
