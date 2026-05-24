import { cn } from './utils';

/** Layout tokens — full-width shells with minimal edge gutters */
export const layout = {
  edgeGutter: 'px-3 sm:px-4 md:px-5',
  gutter: 'px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8',
  /** Full viewport width with tight horizontal margins */
  container: 'w-full mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 2xl:px-10',
  workspaceContainer: 'w-full mx-auto px-3 sm:px-4 md:px-5 lg:px-6',
  /** Readable prose blocks only — not page shells */
  containerNarrow: 'w-full max-w-3xl mx-auto px-3 sm:px-4 md:px-5',
  /** Matches fixed marketing Navbar height (h-16) */
  belowNav: 'pt-16',
  stickyBelowNav: 'top-16',
  page: 'min-h-screen bg-bg text-foreground overflow-x-hidden',
  marketingBleed: 'w-full max-w-none px-0',
  hero: 'relative min-h-[100svh] w-full overflow-hidden',
  section: 'w-full',
  sectionInner: 'w-full mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 2xl:px-10',
  sectionTight: 'w-full mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 2xl:px-10 py-12 md:py-16',
  sectionDefault: 'w-full mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 2xl:px-10 py-12 md:py-20',
  sectionWide: 'w-full',
  prose: 'max-w-3xl',
} as const;

export function sectionClass(...extra: (string | undefined | false)[]) {
  return cn(layout.section, ...extra);
}

export type PortfolioItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  sortOrder?: number;
};

export type ProjectItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  images: string[];
  portfolioId?: string;
};

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
};

export type SiteLocation = {
  id: string;
  name: string;
  tag: string;
  description: string;
  image: string;
  sortOrder?: number;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  rating: number;
  sortOrder?: number;
};
