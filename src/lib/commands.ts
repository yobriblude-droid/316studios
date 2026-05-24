export type CommandItem = {
  id: string;
  label: string;
  keywords?: string[];
  group: string;
  action: () => void;
  icon?: string;
};

const registry: CommandItem[] = [];

export function registerCommands(items: CommandItem[]): () => void {
  registry.push(...items);
  return () => {
    for (const item of items) {
      const idx = registry.findIndex((r) => r.id === item.id);
      if (idx >= 0) registry.splice(idx, 1);
    }
  };
}

export function getCommands(): CommandItem[] {
  return [...registry];
}

export function clearCommands(): void {
  registry.length = 0;
}

export const defaultNavigationCommands = (navigate: (path: string) => void): CommandItem[] => [
  { id: 'nav-home', label: 'Go to Portfolio', group: 'Navigate', keywords: ['home', 'landing'], action: () => navigate('/') },
  { id: 'nav-projects', label: 'Go to Projects', group: 'Navigate', keywords: ['gallery', 'work'], action: () => navigate('/projects') },
  { id: 'nav-services', label: 'Go to Services', group: 'Navigate', keywords: ['pricing', 'packages'], action: () => navigate('/services') },
  { id: 'nav-about', label: 'Go to About', group: 'Navigate', keywords: ['studio', 'team'], action: () => navigate('/about') },
  { id: 'nav-contact', label: 'Go to Contact', group: 'Navigate', keywords: ['email', 'inquiry'], action: () => navigate('/contact') },
  { id: 'nav-book', label: 'Book a session', group: 'Actions', keywords: ['booking', 'schedule'], action: () => navigate('/bookings') },
  { id: 'nav-dashboard', label: 'Client dashboard', group: 'Workspace', keywords: ['portal', 'files'], action: () => navigate('/dashboard') },
  { id: 'nav-invoices', label: 'Billing & invoices', group: 'Workspace', keywords: ['billing', 'payments', 'invoices'], action: () => navigate('/dashboard/billing') },
  { id: 'nav-checkout', label: 'Checkout', group: 'Workspace', keywords: ['pay', 'purchase'], action: () => navigate('/checkout') },
  { id: 'nav-login', label: 'Client login', group: 'Account', keywords: ['sign in', 'auth'], action: () => navigate('/login') },
  { id: 'nav-admin', label: 'Admin dashboard', group: 'Admin', keywords: ['operations', 'manage'], action: () => navigate('/admin/dashboard') },
];
