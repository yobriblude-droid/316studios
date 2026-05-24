export type OptimizedImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
};

const PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23131313" width="400" height="300"/%3E%3C/svg%3E';

export function buildSrcSet(src: string, widths: number[] = [400, 800, 1200, 1600]): string {
  if (!src || src.startsWith('data:')) return '';
  if (src.includes('unsplash') || src.includes('placeholder')) return '';

  const separator = src.includes('?') ? '&' : '?';
  return widths
    .map((w) => {
      if (src.startsWith('/media/') || src.startsWith('/uploads/')) {
        return `${src} ${w}w`;
      }
      return `${src}${separator}w=${w} ${w}w`;
    })
    .join(', ');
}

export function getOptimizedSources(src: string): {
  src: string;
  srcSet: string;
  sizes: string;
  placeholder: string;
} {
  const srcSet = buildSrcSet(src);
  const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  let webpSrc = src;
  if (src.match(/\.(jpe?g|png)$/i) && !src.startsWith('data:')) {
    webpSrc = src.replace(/\.(jpe?g|png)$/i, '.webp');
  }

  return {
    src: webpSrc,
    srcSet,
    sizes,
    placeholder: PLACEHOLDER,
  };
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload ${src}`));
    img.src = src;
  });
}

export function getLqipStyle(dominantColor = '#131313'): { backgroundColor: string; backgroundImage: string; backgroundSize: string } {
  return {
    backgroundColor: dominantColor,
    backgroundImage: `url("${PLACEHOLDER}")`,
    backgroundSize: 'cover',
  };
}
