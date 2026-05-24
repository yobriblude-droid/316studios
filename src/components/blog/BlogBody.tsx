import React from 'react';
import { cn } from '../../lib/utils';

function isImageUrl(line: string) {
  return /^https?:\/\/.+\.(jpe?g|png|gif|webp|avif)(\?.*)?$/i.test(line.trim());
}

function parseBlocks(body: string): Array<{ type: 'p' | 'h2' | 'h3' | 'img'; content: string }> {
  const blocks: Array<{ type: 'p' | 'h2' | 'h3' | 'img'; content: string }> = [];
  const chunks = body.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);

  for (const chunk of chunks) {
    if (isImageUrl(chunk)) {
      blocks.push({ type: 'img', content: chunk });
      continue;
    }
    if (chunk.startsWith('### ')) {
      blocks.push({ type: 'h3', content: chunk.slice(4).trim() });
      continue;
    }
    if (chunk.startsWith('## ')) {
      blocks.push({ type: 'h2', content: chunk.slice(3).trim() });
      continue;
    }
    blocks.push({ type: 'p', content: chunk });
  }
  return blocks;
}

type BlogBodyProps = {
  body: string;
  className?: string;
};

export function BlogBody({ body, className }: BlogBodyProps) {
  if (!body?.trim()) return null;

  const blocks = parseBlocks(body);

  return (
    <div className={cn('blog-prose w-full', className)}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'h2':
            return (
              <h2 key={i} className="blog-prose-h2">
                {block.content}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={i} className="blog-prose-h3">
                {block.content}
              </h3>
            );
          case 'img':
            return (
              <figure key={i} className="blog-prose-figure">
                <img src={block.content} alt="" className="blog-prose-img" loading="lazy" />
              </figure>
            );
          default:
            return (
              <p key={i} className="blog-prose-p">
                {block.content}
              </p>
            );
        }
      })}
    </div>
  );
}

export default BlogBody;
