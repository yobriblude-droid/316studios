import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { layout, type ProjectItem } from '../lib/layout';
import { staggerContainer, staggerItem } from '../lib/motion';
import { cn } from '../lib/utils';
import { ImageLightbox } from '../components/ui/ImageLightbox';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [allProjects, setAllProjects] = useState<ProjectItem[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((list: ProjectItem[]) => {
        setAllProjects(list);
        const p = list.find((x) => String(x.id) === String(id));
        setProject(p ?? null);
        setActiveImage(0);
      })
      .catch(() => setProject(null));
  }, [id]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const currentIndex = allProjects.findIndex((p) => String(p.id) === String(id));
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject =
    currentIndex >= 0 && currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-muted text-sm uppercase tracking-widest">
        {allProjects.length === 0 ? 'Loading…' : 'Project not found'}
      </div>
    );
  }

  const images = project.images?.length ? project.images : [];

  return (
    <div className={layout.page}>
      <section className="relative min-h-[70vh] md:min-h-[80vh] w-full overflow-hidden">
        <button
          type="button"
          className="absolute inset-0 z-0 cursor-zoom-in"
          onClick={() => openLightbox(activeImage)}
          aria-label="Open fullscreen viewer"
        >
          <motion.img
            key={activeImage}
            src={images[activeImage]}
            alt={project.title}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          />
        </button>
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-bg/20 pointer-events-none" />
        <div
          className={cn(
            'absolute inset-0 z-10 flex flex-col justify-end pb-12 md:pb-20 pt-28 w-full',
            layout.sectionInner
          )}
        >
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted hover:text-accent mb-8 transition-colors w-fit"
          >
            <ArrowLeft className="w-3 h-3" /> All galleries
          </Link>
          <span className="text-[10px] font-semibold tracking-[0.35em] uppercase text-accent mb-3">
            {project.category}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-foreground max-w-5xl leading-[0.9]">
            {project.title}
          </h1>
          <p className="mt-6 text-sm md:text-base text-muted max-w-2xl">{project.description}</p>
          {images.length > 1 && (
            <button
              type="button"
              onClick={() => openLightbox(activeImage)}
              className="mt-6 text-[10px] uppercase tracking-widest text-accent hover:underline w-fit"
            >
              View all {images.length} images fullscreen
            </button>
          )}
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-6 right-3 sm:right-6 lg:right-10 z-20 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`Hero image ${i + 1}`}
                aria-current={i === activeImage}
                className={cn(
                  'h-1 transition-all min-w-[12px]',
                  i === activeImage ? 'w-8 bg-accent' : 'w-3 bg-foreground/30 hover:bg-accent/50'
                )}
              />
            ))}
          </div>
        )}
      </section>

      {images.length > 1 && (
        <section className={layout.sectionDefault}>
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-accent font-semibold mb-6">Gallery</h2>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3"
          >
            {images.map((img, i) => (
              <motion.button
                key={i}
                type="button"
                variants={staggerItem}
                onClick={() => openLightbox(i)}
                className="aspect-[4/5] overflow-hidden rounded-xl border border-border relative group"
                aria-label={`Open image ${i + 1} of ${images.length}`}
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors" />
              </motion.button>
            ))}
          </motion.div>
        </section>
      )}

      <section className="border-t border-border w-full">
        <div className={cn(layout.sectionInner, 'grid grid-cols-1 md:grid-cols-2 p-0')}>
          {prevProject ? (
            <Link
              to={`/projects/${prevProject.id}`}
              className="group p-8 md:p-12 border-b md:border-b-0 md:border-r border-border hover:bg-accent-dim transition-colors"
            >
              <span className="text-[10px] uppercase tracking-widest text-muted">Previous</span>
              <p className="mt-2 text-xl font-bold uppercase tracking-tighter group-hover:text-accent transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> {prevProject.title}
              </p>
            </Link>
          ) : (
            <div className="hidden md:block border-r border-border" />
          )}
          {nextProject ? (
            <Link
              to={`/projects/${nextProject.id}`}
              className="group p-8 md:p-12 hover:bg-accent-dim transition-colors text-right"
            >
              <span className="text-[10px] uppercase tracking-widest text-muted">Next</span>
              <p className="mt-2 text-xl font-bold uppercase tracking-tighter group-hover:text-accent transition-colors flex items-center justify-end gap-2">
                {nextProject.title} <ArrowRight className="w-4 h-4" />
              </p>
            </Link>
          ) : null}
        </div>
      </section>

      <ImageLightbox
        open={lightboxOpen}
        images={images}
        index={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={(i) => {
          setLightboxIndex(i);
          setActiveImage(i);
        }}
        title={project.title}
        subtitle={project.category}
      />
    </div>
  );
}
