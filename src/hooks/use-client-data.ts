import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-client';
import type { ClientFile, Invoice, MediaRequest } from '../components/widgets/types';
import { invalidateClientWorkspace } from '../lib/cache-strategy';
import { apiFetch } from '../lib/api';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(url, init);
  if (!res.ok) throw new Error(`Request failed: ${url}`);
  return res.json();
}

export function useClientFiles() {
  return useQuery({
    queryKey: queryKeys.clientFiles,
    queryFn: () => fetchJson<ClientFile[]>('/api/client/files'),
    staleTime: 30 * 1000,
  });
}

export function useClientMediaRequests() {
  return useQuery({
    queryKey: queryKeys.clientMediaRequests,
    queryFn: () => fetchJson<MediaRequest[]>('/api/client/media-requests'),
  });
}

export function useClientInvoices() {
  return useQuery({
    queryKey: queryKeys.clientInvoices,
    queryFn: () => fetchJson<Invoice[]>('/api/invoices'),
  });
}

export function useClientBookings() {
  return useQuery({
    queryKey: queryKeys.clientBookings,
    queryFn: () =>
      fetchJson<Array<{ id: string; date: string; serviceId: string; status: string }>>(
        '/api/client/bookings'
      ),
  });
}

export function useApproveFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      const res = await apiFetch(`/api/client/files/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.clientFiles });
      invalidateClientWorkspace();
    },
  });
}

export function usePostComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const res = await apiFetch(`/api/client/files/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.clientFiles });
    },
  });
}

export function useCreateMediaRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      category: string;
      message: string;
      link?: string;
    }) => {
      const res = await apiFetch('/api/client/media-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.clientMediaRequests });
    },
  });
}

export function usePublicProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => fetchJson<unknown[]>('/api/projects'),
    staleTime: 5 * 60 * 1000,
  });
}
