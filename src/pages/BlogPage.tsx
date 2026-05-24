import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { layout } from '../lib/layout';
import { cn } from '../lib/utils';

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  authorName?: string;
  publishedAt?: string;
};

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch('/api/blog')
      .then((r) => r.json())
      .then(setPosts)
      .catch(() => setPosts([]));
  }, []);

  return (
    <div className={layout.page}>
      <PageHero
        compact
        tight
        eyebrow="Journal"
        title="Studio Blog"
        description="Behind the lens — process notes, gear, locations, and client stories from 316 Studios."
      />

      <section className={cn(layout.sectionDefault, 'pt-8')}>
        {posts.length === 0 ? (
          <div className="glass-panel-v2 rounded-2xl p-16 text-center">
            <BookOpen className="w-10 h-10 text-accent mx-auto mb-4" aria-hidden />
            <p className="text-muted text-sm uppercase tracking-widest">New posts coming soon</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col h-full glass-panel-v2 rounded-2xl overflow-hidden hover:border-accent/50 transition-all hover:shadow-[var(--glow-brand)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-elevated">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 img-placeholder" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" />
                  </div>
                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] uppercase tracking-widest text-muted mb-3">
                      <li className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-accent" aria-hidden />
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : 'Draft'}
                      </li>
                      {post.authorName && (
                        <li className="inline-flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-accent" aria-hidden />
                          {post.authorName}
                        </li>
                      )}
                    </ul>
                    <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-foreground group-hover:text-accent transition-colors">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-sm text-muted line-clamp-3 flex-1">{post.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold text-accent">
                      Read article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
