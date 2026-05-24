export type ClientFile = {
  id: string;
  name: string;
  size: string;
  format: string;
  date: string;
  url: string;
  approved: boolean | null;
  comments: Array<{ id: string; userId: string; text: string; date: string }>;
  downloadCount: number;
};

export type MediaRequest = {
  id: string;
  requestType: 'file' | 'external_link';
  requestDetails: string;
  status: string;
  responseLink?: string | null;
  responseNote?: string | null;
  createdAt: string;
};

export type Invoice = {
  id: string;
  userId: string;
  serviceId: string;
  amount: number;
  paid: number | boolean;
  createdAt: string;
  paidAt: string | null;
};

export type DashboardData = {
  userName?: string;
  files: ClientFile[];
  mediaRequests: MediaRequest[];
  invoices: Invoice[];
};
