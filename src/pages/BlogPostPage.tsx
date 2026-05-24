import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { layout } from '../lib/layout';
import { PageWidgetRenderer } from '../components/widgets/PageWidgetRenderer';
import { parseWidgetContent, type PageWidget } from '../lib/page-widgets';
import { BlogBody } from '../components/blog/BlogBody';
import { BlogMeta } from '../components/blog/BlogMeta';
import { cn } from '../lib/utils';

type Post = {
  id: string;
  title: string;
  body: string;
  excerpt: string;
  coverImage?: string;
  authorName?: string;
  publishedAt?: string;
};

function mapWidgets(raw: Array<Record<string, unknown>>): PageWidget[] {
  return raw.map((w) => ({
    id: String(w.id),
    page: 'blog',
    postId: (w.postId as string) || null,
    type: String(w.type) as PageWidget['type'],
    title: String(w.title ?? ''),
    content: parseWidgetContent(String(w.content ?? '{}')),
    sortOrder: Number(w.sortOrder ?? 0),
    enabled: true,
  }));
}

function estimateReadMinutes(body: string, excerpt: string) {
  const words = `${body} ${excerpt}`.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [widgets, setWidgets] = useState<PageWidget[]>([]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blog/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((p: Post | null) => {
        setPost(p);
        if (p?.id) {
          Promise.all([
            fetch(`/api/widgets/blog?postId=${encodeURIComponent(p.id)}`).then((r) => r.json()),
            fetch('/api/widgets/blog').then((r) => r.json()),
          ]).then(([postW, globalW]) => {
            const merged = [
              ...mapWidgets(Array.isArray(globalW) ? globalW : []),
              ...mapWidgets(Array.isArray(postW) ? postW : []),
            ].sort((a, b) => a.sortOrder - b.sortOrder);
            setWidgets(merged);
          });
        }
      });
  }, [slug]);

  const readMinutes = useMemo(
    () => (post ? estimateReadMinutes(post.body, post.excerpt) : 0),
    [post]
  );

  if (!post) {
    return (
      <div className={`${layout.page} flex items-center justify-center min-h-[50vh] text-muted text-sm`}>
        Loading…
      </div>
    );
  }

  return (
    <article className={layout.page}>
      <div className="relative w-full min-h-[45vh] md:min-h-[58vh] lg:min-h-[65vh] overflow-hidden border-b border-glass-border">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 img-placeholder" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-bg/20" />
        <div className={cn('absolute inset-x-0 bottom-0 z-10 pb-8 md:pb-12', layout.sectionInner)}>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted hover:text-accent mb-6 transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Back to journal
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-foreground max-w-5xl leading-[0.92]">
            {post.title}
          </h1>
          <p className="mt-4 text-sm md:text-base text-muted max-w-3xl">{post.excerpt}</p>
        </div>
      </div>

      <div className={cn(layout.sectionDefault, 'pt-8 md:pt-12')}>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10 pb-8 border-b border-glass-border">
          <BlogMeta
            publishedAt={post.publishedAt}
            authorName={post.authorName}
            readMinutes={readMinutes}
          />
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-border text-[10px] uppercase tracking-widest hover:border-accent transition-colors shrink-0 min-h-[44px]"
            onClick={() => {
              if (navigator.share) {
                void navigator.share({ title: post.title, url: window.location.href });
              } else {
                void navigator.clipboard.writeText(window.location.href);
              }
            }}
          >
            <Share2 className="w-4 h-4 text-accent" aria-hidden />
            Share
          </button>
        </div>

        <PageWidgetRenderer
          widgets={widgets.filter((w) => w.type !== 'heading')}
          className="mb-10"
          wide
        />

        <BlogBody body={post.body} />
      </div>
    </article>
  );
}
