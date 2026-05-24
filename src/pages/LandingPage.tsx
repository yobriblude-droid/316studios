import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { HeroCinematic } from '../components/ui/HeroCinematic';
import { EditorialPictureGrid } from '../components/ui/EditorialPictureGrid';
import { PortfolioShowcase } from '../components/ui/PortfolioShowcase';
import { LocationScroller } from '../components/ui/LocationScroller';
import { Testimonials } from '../components/ui/Testimonials';
import { HighlightedButton } from '../components/ui/HighlightedButton';
import { PageWidgetRenderer } from '../components/widgets/PageWidgetRenderer';
import type { HeroSlide, ProjectItem } from '../lib/layout';
import { layout } from '../lib/layout';
import { PLACEHOLDER_HERO } from '../lib/placeholders';
import { parseWidgetContent, type PageWidget } from '../lib/page-widgets';

type BlogTeaser = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
};

function mapWidgets(raw: Array<Record<string, unknown>>): PageWidget[] {
  return raw.map((w) => ({
    id: String(w.id),
    page: (w.page as PageWidget['page']) || 'home',
    postId: (w.postId as string) || null,
    type: String(w.type) as PageWidget['type'],
    title: String(w.title ?? ''),
    content: parseWidgetContent(String(w.content ?? '{}')),
    sortOrder: Number(w.sortOrder ?? 0),
    enabled: Boolean(w.enabled ?? true),
  }));
}

export default function LandingPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [posts, setPosts] = useState<BlogTeaser[]>([]);
  const [widgets, setWidgets] = useState<PageWidget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/hero-slides').then((r) => r.json()),
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/blog').then((r) => r.json()).catch(() => []),
      fetch('/api/widgets/home').then((r) => r.json()).catch(() => []),
    ])
      .then(([s, p, blog, w]) => {
        const heroSlides = Array.isArray(s) && s.length > 0 ? s : PLACEHOLDER_HERO;
        setSlides(heroSlides);
        setProjects(Array.isArray(p) ? p : []);
        setPosts(Array.isArray(blog) ? blog.slice(0, 3) : []);
        setWidgets(mapWidgets(Array.isArray(w) ? w : []));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center bg-bg text-muted text-[10px] uppercase tracking-[0.3em]">
        Loading…
      </div>
    );
  }

  return (
    <div className={layout.page}>
      <HeroCinematic
        slides={slides}
        ctaPrimary={{ label: 'View portfolio', to: '/projects' }}
        ctaSecondary={{ label: 'Book session', to: '/bookings' }}
      />

      <section className="w-full border-b border-glass-border red-gradient-mesh">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-5 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-accent font-semibold">316 Studios</p>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground mt-1">
                Visual production agency
              </h2>
            </div>
            <p className="text-xs text-muted max-w-md md:text-right">
              Commercial photography, brand campaigns, and client delivery — Nairobi & beyond.
            </p>
          </div>
        </div>
      </section>

      {widgets.length > 0 && (
        <section className="w-full px-3 sm:px-5 py-8 max-w-[1920px] mx-auto">
          <PageWidgetRenderer widgets={widgets} />
        </section>
      )}

      <section id="featured" className="w-full py-12 md:py-16 px-3 sm:px-5 max-w-[1920px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground">
            Selected work
          </h2>
          <Link to="/projects" className="text-[10px] uppercase tracking-widest text-accent hover:underline flex items-center gap-1">
            Full archive <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <EditorialPictureGrid projects={projects} limit={9} />
      </section>

      <PortfolioShowcase className="border-t border-glass-border" limit={8} compact />

      <section className="w-full py-10 px-3 sm:px-5 border-y border-glass-border">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter">Services & bookings</h2>
          <div className="flex flex-wrap gap-2">
            <Link to="/services">
              <HighlightedButton variant="cta-primary" size="md">Packages</HighlightedButton>
            </Link>
            <Link to="/bookings">
              <HighlightedButton variant="ghost-glass" size="md">Book now</HighlightedButton>
            </Link>
          </div>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="w-full py-12 px-3 sm:px-5 max-w-[1920px] mx-auto">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter">Journal</h2>
            <Link to="/blog" className="text-[10px] uppercase tracking-widest text-accent">All</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-1">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group border border-glass-border overflow-hidden hover:border-accent/60 transition-colors"
              >
                {post.coverImage ? (
                  <img src={post.coverImage} alt="" className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36 img-placeholder" />
                )}
                <div className="p-4">
                  <h3 className="font-bold uppercase text-sm tracking-tight">{post.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <LocationScroller />
      <Testimonials />

      <section className="w-full border-t border-border-gold bg-surface/80 py-14 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`${layout.sectionInner} max-w-3xl mx-auto text-center`}
        >
          <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tighter text-foreground mb-6">
            Ready to shoot?
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link to="/bookings">
              <HighlightedButton variant="cta-primary" size="lg">Book</HighlightedButton>
            </Link>
            <Link to="/login">
              <HighlightedButton variant="ghost-glass" size="lg">Client portal</HighlightedButton>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
