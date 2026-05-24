import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { staggerContainer, staggerItem } from '../../lib/motion';
import type { ProjectItem } from '../../lib/layout';

interface BentoGridProps {
  projects: ProjectItem[];
  className?: string;
}

export function BentoGrid({ projects, className }: BentoGridProps) {
  if (projects.length === 0) return null;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-80px' }}
      className={cn(
        'grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-1 auto-rows-[minmax(200px,1fr)]',
        className
      )}
    >
      {projects.map((project, idx) => {
        const span =
          idx === 0
            ? 'md:col-span-2 md:row-span-2 min-h-[320px] md:min-h-[480px]'
            : idx === 1
              ? 'md:col-span-1 md:row-span-2 min-h-[240px]'
              : 'md:col-span-1 min-h-[200px]';

        return (
          <motion.article
            key={project.id}
            variants={staggerItem}
            className={cn('group relative overflow-hidden bg-surface border border-border', span)}
          >
            <img
              src={project.images?.[0]}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-10">
              <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-accent mb-2">
                {project.category}
              </span>
              <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tighter text-foreground">
                {project.title}
              </h3>
              <p className="mt-2 text-xs text-muted line-clamp-2 max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {project.description}
              </p>
              <Link
                to={`/projects/${project.id}`}
                className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-accent hover:text-accent-hover opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
              >
                View Project <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </motion.article>
        );
      })}
    </motion.div>
  );
}

export default BentoGrid;
