import React from 'react';
import { Calendar, User, BookOpen, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

type BlogMetaProps = {
  publishedAt?: string;
  authorName?: string;
  readMinutes?: number;
  className?: string;
};

export function BlogMeta({ publishedAt, authorName, readMinutes, className }: BlogMetaProps) {
  const dateLabel = publishedAt
    ? new Date(publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Draft';

  return (
    <ul className={cn('flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted', className)}>
      <li className="inline-flex items-center gap-2">
        <Calendar className="w-4 h-4 text-accent shrink-0" aria-hidden />
        <time dateTime={publishedAt}>{dateLabel}</time>
      </li>
      {authorName && (
        <li className="inline-flex items-center gap-2">
          <User className="w-4 h-4 text-accent shrink-0" aria-hidden />
          <span>{authorName}</span>
        </li>
      )}
      {readMinutes != null && readMinutes > 0 && (
        <li className="inline-flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent shrink-0" aria-hidden />
          <span>{readMinutes} min read</span>
        </li>
      )}
      <li className="inline-flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-accent shrink-0" aria-hidden />
        <span>316 Studios Journal</span>
      </li>
    </ul>
  );
}

export default BlogMeta;
