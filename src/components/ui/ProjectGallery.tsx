import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Images } from 'lucide-react';
import { cn } from '../../lib/utils';
import { staggerContainer, staggerItem } from '../../lib/motion';
import type { ProjectItem, PortfolioItem } from '../../lib/layout';
import { ImageLightbox } from './ImageLightbox';

interface ProjectGalleryProps {
  projects: ProjectItem[];
  portfolios: PortfolioItem[];
  portfolioSlug: string;
  onPortfolioChange: (slug: string) => void;
  filter: string;
  onFilterChange: (cat: string) => void;
  categories: string[];
  loading?: boolean;
}

export function ProjectGallery({
  projects,
  portfolios,
  portfolioSlug,
  onPortfolioChange,
  filter,
  onFilterChange,
  categories,
  loading,
}: ProjectGalleryProps) {
  const [lightboxProject, setLightboxProject] = useState<ProjectItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const filtered =
    filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  const portfolioCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of projects) {
      if (p.portfolioId) map.set(p.portfolioId, (map.get(p.portfolioId) ?? 0) + 1);
    }
    return map;
  }, [projects]);

  const openProject = useCallback((project: ProjectItem, imageIndex = 0) => {
    setLightboxProject(project);
    setLightboxIndex(imageIndex);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxProject(null);
    setLightboxIndex(0);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3">
        {Array.from({ length: 12 }).map((_, n) => (
          <div key={n} className="aspect-[4/5] bg-elevated animate-pulse border border-border rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="lg:grid lg:grid-cols-[minmax(220px,280px)_1fr] lg:gap-8 xl:gap-10">
        {/* Albums — always visible on desktop, horizontal on mobile */}
        <aside className="mb-6 lg:mb-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <p className="text-[10px] uppercase tracking-widest text-muted font-semibold mb-3">Albums</p>
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide">
            <button
              type="button"
              onClick={() => onPortfolioChange('All')}
              className={cn(
                'shrink-0 lg:shrink flex items-center gap-3 p-2 lg:p-3 rounded-xl border text-left transition-all min-w-[140px] lg:min-w-0 lg:w-full',
                portfolioSlug === 'All'
                  ? 'border-accent bg-accent-dim'
                  : 'border-border hover:border-accent/50'
              )}
            >
              <span className="w-12 h-12 lg:w-14 lg:h-14 rounded-lg bg-elevated border border-border flex items-center justify-center shrink-0">
                <Images className="w-5 h-5 text-muted" />
              </span>
              <span>
                <span className="block text-xs font-bold uppercase tracking-tight">All work</span>
                <span className="text-[10px] text-muted">{projects.length} projects</span>
              </span>
            </button>
            {portfolios.map((pf) => {
              const count = portfolioCounts.get(pf.id) ?? 0;
              return (
                <button
                  key={pf.id}
                  type="button"
                  onClick={() => onPortfolioChange(pf.slug)}
                  className={cn(
                    'shrink-0 lg:shrink flex items-center gap-3 p-2 lg:p-3 rounded-xl border text-left transition-all min-w-[160px] lg:min-w-0 lg:w-full',
                    portfolioSlug === pf.slug
                      ? 'border-accent bg-accent-dim'
                      : 'border-border hover:border-accent/50'
                  )}
                >
                  {pf.coverImage ? (
                    <img
                      src={pf.coverImage}
                      alt=""
                      className="w-12 h-12 lg:w-14 lg:h-14 rounded-lg object-cover shrink-0 border border-border"
                    />
                  ) : (
                    <span className="w-12 h-12 lg:w-14 lg:h-14 rounded-lg bg-elevated border border-border shrink-0" />
                  )}
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-tight truncate">{pf.title}</span>
                    <span className="text-[10px] text-muted">{count} projects</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onFilterChange(cat)}
                className={cn(
                  'px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-semibold border transition-all rounded-xl min-h-[40px]',
                  filter === cat
                    ? 'bg-primary text-[var(--primary-foreground)] border-primary'
                    : 'border-border text-muted hover:border-primary hover:text-primary'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted py-16 text-center uppercase tracking-widest">No projects in this album</p>
          ) : (
            <motion.div
              layout
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 md:gap-3"
            >
              {filtered.map((project) => {
                const thumb = project.images?.[0];
                const imageCount = project.images?.length ?? 0;
                return (
                  <motion.article
                    key={project.id}
                    layout
                    variants={staggerItem}
                    className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-glass-border glass-panel-v2 cursor-pointer"
                    onClick={() => openProject(project)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openProject(project);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${project.title}, ${imageCount} images`}
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={project.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-elevated" />
                    )}
                    <div className="absolute inset-0 media-card-scrim bg-gradient-to-t from-bg/90 via-bg/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                      <span className="text-[10px] uppercase tracking-widest text-accent font-semibold">{project.category}</span>
                      <h3 className="text-sm md:text-base font-bold uppercase tracking-tighter text-foreground line-clamp-2">
                        {project.title}
                      </h3>
                      {imageCount > 1 && (
                        <span className="text-[10px] text-muted mt-1 inline-block">{imageCount} images</span>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      <ImageLightbox
        open={!!lightboxProject}
        images={lightboxProject?.images ?? []}
        index={lightboxIndex}
        onClose={closeLightbox}
        onIndexChange={setLightboxIndex}
        title={lightboxProject?.title}
        subtitle={lightboxProject?.category}
        footer={
          lightboxProject ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <p className="text-sm text-muted max-w-2xl line-clamp-3">{lightboxProject.description}</p>
              <Link
                to={`/projects/${lightboxProject.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-[var(--primary-foreground)] text-[10px] uppercase tracking-widest font-semibold hover:bg-accent-hover shrink-0 min-h-[44px]"
                onClick={closeLightbox}
              >
                Full project <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : undefined
        }
      />
    </>
  );
}

export default ProjectGallery;
