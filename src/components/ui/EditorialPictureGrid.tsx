import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { staggerContainer, staggerItem } from '../../lib/motion';
import { placeholderGradient } from '../../lib/placeholders';
import type { ProjectItem } from '../../lib/layout';

/** Editorial 12-column grid — inspired by agency portfolio layouts */
const LAYOUT = [
  'col-span-12 lg:col-span-8 lg:row-span-2 min-h-[320px] lg:min-h-[520px]',
  'col-span-6 lg:col-span-4 min-h-[200px] lg:min-h-[250px]',
  'col-span-6 lg:col-span-4 min-h-[200px] lg:min-h-[250px]',
  'col-span-12 sm:col-span-6 lg:col-span-4 min-h-[220px]',
  'col-span-12 sm:col-span-6 lg:col-span-4 min-h-[220px]',
  'col-span-12 lg:col-span-4 min-h-[200px]',
  'col-span-6 lg:col-span-3 min-h-[180px]',
  'col-span-6 lg:col-span-3 min-h-[180px]',
  'col-span-12 lg:col-span-6 min-h-[240px]',
];

type EditorialPictureGridProps = {
  projects: ProjectItem[];
  limit?: number;
  className?: string;
};

export function EditorialPictureGrid({ projects, limit = 9, className }: EditorialPictureGridProps) {
  const display = projects.slice(0, limit);
  if (display.length === 0) {
    return (
      <div className="grid grid-cols-12 gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(LAYOUT[i] ?? 'col-span-6 min-h-[200px]', 'img-placeholder border border-glass-border')}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-60px' }}
      className={cn('grid grid-cols-12 gap-1', className)}
    >
      {display.map((project, idx) => {
        const span = LAYOUT[idx] ?? LAYOUT[LAYOUT.length - 1];
        const cover = project.images?.[0];

        return (
          <motion.article
            key={project.id}
            variants={staggerItem}
            className={cn('group relative overflow-hidden border border-glass-border/60', span)}
          >
            {cover ? (
              <img
                src={cover}
                alt={project.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                loading="lazy"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: placeholderGradient(project.id) }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg/95 via-bg/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
            <Link
              to={`/projects/${project.id}`}
              className="absolute inset-0 z-10 flex flex-col justify-end p-4 md:p-5"
            >
              <span className="text-[9px] font-semibold tracking-[0.3em] uppercase text-accent mb-1">
                {project.category}
              </span>
              <h3 className="text-base md:text-xl font-black uppercase tracking-tighter text-foreground">
                {project.title}
              </h3>
              <span className="mt-2 inline-flex items-center gap-1 text-[9px] uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowUpRight className="w-3 h-3" />
              </span>
            </Link>
          </motion.article>
        );
      })}
    </motion.div>
  );
}

export default EditorialPictureGrid;
