import React from 'react';
import { Link } from 'react-router-dom';
import { parseWidgetContent, type PageWidget } from '../../lib/page-widgets';
import { HighlightedButton } from '../ui/HighlightedButton';
import { placeholderGradient } from '../../lib/placeholders';

type PageWidgetRendererProps = {
  widgets: PageWidget[];
  className?: string;
  /** Full-width blog/article layout — no narrow text column */
  wide?: boolean;
};

export function PageWidgetRenderer({ widgets, className, wide }: PageWidgetRendererProps) {
  if (widgets.length === 0) return null;

  return (
    <div className={className}>
      {widgets.map((w) => {
        const cfg = typeof w.content === 'string' ? parseWidgetContent(w.content as unknown as string) : w.content;
        const contentRaw = typeof w.content === 'object' ? JSON.stringify(w.content) : String(w.content);

        switch (w.type) {
          case 'heading':
            return (
              <section key={w.id} className="py-8 border-b border-glass-border">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground">
                  {w.title || cfg.body}
                </h2>
              </section>
            );
          case 'text':
            return (
              <section key={w.id} className={wide ? 'py-6 w-full' : 'py-6 max-w-3xl'}>
                {w.title && (
                  <p className="text-[10px] uppercase tracking-[0.35em] text-accent mb-2">{w.title}</p>
                )}
                <p
                  className={
                    wide
                      ? 'text-base md:text-lg text-foreground/90 leading-relaxed whitespace-pre-wrap max-w-4xl'
                      : 'text-sm md:text-base text-muted leading-relaxed whitespace-pre-wrap'
                  }
                >
                  {cfg.body}
                </p>
              </section>
            );
          case 'image':
            return (
              <section key={w.id} className="py-4 w-full">
                {cfg.imageUrl ? (
                  <img
                    src={cfg.imageUrl}
                    alt={w.title}
                    className={
                      wide
                        ? 'w-full max-h-[min(85vh,900px)] object-cover rounded-xl border border-glass-border'
                        : 'w-full max-h-[480px] object-cover border border-glass-border'
                    }
                  />
                ) : (
                  <div
                    className="w-full h-48 md:h-72 img-placeholder border border-glass-border"
                    style={{ background: placeholderGradient(w.id) }}
                  />
                )}
                {w.title && <p className="mt-2 text-[10px] uppercase tracking-widest text-muted">{w.title}</p>}
              </section>
            );
          case 'gallery': {
            const imgs = cfg.images ?? [];
            return (
              <section key={w.id} className="py-6">
                {w.title && (
                  <h3 className="text-lg font-black uppercase tracking-tight mb-4">{w.title}</h3>
                )}
                <div
                  className={
                    wide
                      ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3'
                      : 'grid grid-cols-2 md:grid-cols-3 gap-1'
                  }
                >
                  {imgs.length > 0
                    ? imgs.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt=""
                          className={
                            wide
                              ? 'aspect-[4/3] object-cover rounded-lg border border-glass-border'
                              : 'aspect-[4/3] object-cover border border-glass-border'
                          }
                        />
                      ))
                    : [0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="aspect-[4/3] img-placeholder border border-glass-border"
                          style={{ background: placeholderGradient(`${w.id}-${i}`) }}
                        />
                      ))}
                </div>
              </section>
            );
          }
          case 'cta':
            return (
              <section
                key={w.id}
                className="py-10 px-6 md:px-10 my-6 border border-border-gold bg-accent-dim/30 backdrop-blur-md"
              >
                <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-foreground mb-3">
                  {w.title || 'Get in touch'}
                </h3>
                {cfg.body && <p className="text-sm text-muted mb-6 max-w-xl">{cfg.body}</p>}
                {cfg.linkUrl && (
                  <Link to={cfg.linkUrl}>
                    <HighlightedButton variant="cta-primary" size="md">
                      {cfg.linkLabel || 'Learn more'}
                    </HighlightedButton>
                  </Link>
                )}
              </section>
            );
          case 'quote':
            return (
              <blockquote
                key={w.id}
                className="py-8 px-6 border-l-4 border-primary my-6 glass-panel-v2"
              >
                <p className="text-lg md:text-2xl font-medium text-foreground leading-snug">
                  &ldquo;{cfg.body}&rdquo;
                </p>
                {cfg.author && (
                  <cite className="block mt-4 text-[10px] uppercase tracking-widest text-muted not-italic">
                    — {cfg.author}
                  </cite>
                )}
              </blockquote>
            );
          case 'stats':
            return (
              <section key={w.id} className="py-8 grid grid-cols-2 md:grid-cols-4 gap-1">
                {(cfg.stats ?? []).map((s, i) => (
                  <div key={i} className="glass-panel-v2 p-5 border border-glass-border text-center">
                    <p className="text-2xl md:text-3xl font-black text-accent">{s.value}</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted mt-1">{s.label}</p>
                  </div>
                ))}
              </section>
            );
          case 'embed':
            return (
              <section
                key={w.id}
                className="py-6 prose prose-invert max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: cfg.embedHtml || contentRaw }}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export default PageWidgetRenderer;
