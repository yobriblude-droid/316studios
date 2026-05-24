export type PageWidgetType =
  | 'heading'
  | 'text'
  | 'image'
  | 'gallery'
  | 'cta'
  | 'quote'
  | 'stats'
  | 'embed';

export type PageWidgetPage = 'home' | 'blog';

export interface PageWidgetConfig {
  body?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  images?: string[];
  author?: string;
  stats?: Array<{ label: string; value: string }>;
  embedHtml?: string;
}

export interface PageWidget {
  id: string;
  page: PageWidgetPage;
  postId: string | null;
  type: PageWidgetType;
  title: string;
  content: PageWidgetConfig;
  sortOrder: number;
  enabled: boolean;
}

export function parseWidgetContent(raw: string): PageWidgetConfig {
  try {
    return JSON.parse(raw) as PageWidgetConfig;
  } catch {
    return { body: raw };
  }
}

export const WIDGET_TYPE_LABELS: Record<PageWidgetType, string> = {
  heading: 'Heading',
  text: 'Text block',
  image: 'Image banner',
  gallery: 'Image gallery',
  cta: 'Call to action',
  quote: 'Quote',
  stats: 'Stats row',
  embed: 'Custom HTML',
};
