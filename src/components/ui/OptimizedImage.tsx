import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { getOptimizedSources } from '../../lib/image-optimizer';
import { prefersReducedMotion } from '../../lib/accessibility';

type OptimizedImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
};

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  sizes,
  priority = false,
  onLoad,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const { srcSet, sizes: defaultSizes, placeholder } = getOptimizedSources(src);
  const reduced = prefersReducedMotion();

  return (
    <div className={cn('relative overflow-hidden bg-elevated', className)}>
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-elevated"
          style={{ backgroundImage: `url("${placeholder}")`, backgroundSize: 'cover' }}
          aria-hidden
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes || defaultSizes}
        srcSet={srcSet || undefined}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => {
          setLoaded(true);
          onLoad?.();
        }}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          reduced && 'transition-none'
        )}
      />
    </div>
  );
}

export default OptimizedImage;
