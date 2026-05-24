import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FolderOpen,
  Upload,
  MessageSquare,
  CreditCard,
  Images,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { cn } from '../lib/utils';
import { useRealtimeConnection } from '../hooks/use-realtime';
import {
  useClientFiles,
  useClientInvoices,
  useClientMediaRequests,
  useApproveFile,
  usePostComment,
} from '../hooks/use-client-data';
import { WidgetGrid } from '../components/widgets';
import type { ClientFile, Invoice } from '../components/widgets';
import { MediaLibrary } from '../components/ui/MediaLibrary';
import { MediaPreview } from '../components/ui/MediaPreview';
import { Modal } from '../components/ui/Modal';
import { HighlightedButton } from '../components/ui/HighlightedButton';
import { apiFetch } from '../lib/api';
import { STUDIO } from '../lib/contact';

type Section = 'overview' | 'library' | 'billing';

function resolveSection(pathname: string): Section {
  if (pathname.includes('/library')) return 'library';
  if (pathname.includes('/billing')) return 'billing';
  return 'overview';
}

const QUICK_LINKS = [
  { to: '/dashboard/library', label: 'Media library', desc: 'Deliverables, approvals, downloads', icon: FolderOpen },
  { to: '/dashboard/requests', label: 'Upload requests', desc: 'Send files and links to the studio', icon: Upload },
  { to: '/dashboard/messages', label: 'Studio messages', desc: 'Direct line to 316 Studios', icon: MessageSquare },
  { to: '/dashboard/billing', label: 'Billing', desc: 'Invoices and payments', icon: CreditCard },
  { to: '/bookings', label: 'Book a session', desc: 'Schedule your next shoot', icon: Images },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const section = resolveSection(location.pathname);
  const { user } = useAuth();
  const { toast } = useNotifications();

  const filesQuery = useClientFiles();
  const requestsQuery = useClientMediaRequests();
  const invoicesQuery = useClientInvoices();
  const approveMutation = useApproveFile();
  const commentMutation = usePostComment();
  const { connected } = useRealtimeConnection(Boolean(user));

  const [search, setSearch] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [previewFile, setPreviewFile] = useState<ClientFile | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  const files = filesQuery.data || [];
  const mediaRequests = requestsQuery.data || [];
  const invoices = invoicesQuery.data || [];
  const loading = filesQuery.isLoading || requestsQuery.isLoading;

  useEffect(() => {
    if (filesQuery.isError || requestsQuery.isError) navigate('/login');
  }, [filesQuery.isError, requestsQuery.isError, navigate]);

  const handleDownload = async (file: ClientFile) => {
    try {
      const res = await apiFetch(`/api/client/files/${file.id}/download`);
      if (!res.ok) throw new Error('Download failed');
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank');
      else toast({ type: 'info', title: 'Download tracked', message: `Count: ${data.downloadCount}` });
      filesQuery.refetch();
    } catch {
      toast({ type: 'error', title: 'Download failed' });
    }
  };

  const handleBulkDownload = async () => {
    for (const id of selectedFiles) {
      const f = files.find((x) => x.id === id);
      if (f) await handleDownload(f);
    }
    setSelectedFiles([]);
  };

  const handleSelectAll = () => {
    const filtered = files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
    setSelectedFiles(filtered.map((f) => f.id));
  };

  const setApproval = async (fileId: string, approve: boolean) => {
    try {
      await approveMutation.mutateAsync({ id: fileId, approve });
      toast({ type: 'success', title: approve ? 'Approved' : 'Rejected' });
    } catch {
      toast({ type: 'error', title: 'Update failed' });
    }
  };

  const submitComment = async (fileId: string) => {
    const text = (commentText[fileId] || '').trim();
    if (!text) return;
    try {
      await commentMutation.mutateAsync({ id: fileId, text });
      setCommentText((prev) => ({ ...prev, [fileId]: '' }));
      filesQuery.refetch();
    } catch {
      toast({ type: 'error', title: 'Comment failed' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]" role="status">
        <p className="text-muted text-sm uppercase tracking-widest animate-pulse">Loading…</p>
      </div>
    );
  }

  const pendingInvoices = invoices.filter((i) => !i.paid).length;
  const pendingApprovals = files.filter((f) => f.approved === null || f.approved === undefined).length;

  if (section === 'library') {
    return (
      <>
        <header className="mb-8">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">Media library</h1>
          <p className="mt-2 text-sm text-muted">{files.length} deliverables · select all · bulk download · approve</p>
        </header>
        <MediaLibrary
          files={files}
          search={search}
          onSearchChange={setSearch}
          selectedIds={selectedFiles}
          onToggleSelect={(id) =>
            setSelectedFiles((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
          }
          onSelectAll={handleSelectAll}
          onClearSelection={() => setSelectedFiles([])}
          onPreview={setPreviewFile}
          onDownload={handleDownload}
          onApprove={setApproval}
          commentText={commentText}
          onCommentChange={(id, text) => setCommentText((prev) => ({ ...prev, [id]: text }))}
          onSubmitComment={submitComment}
          clientName={user?.name}
          clientEmail={user?.email}
          onBulkDownload={handleBulkDownload}
        />
        <MediaPreview file={previewFile} open={!!previewFile} onClose={() => setPreviewFile(null)} onDownload={handleDownload} />
      </>
    );
  }

  if (section === 'billing') {
    return (
      <>
        <header className="mb-8">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">Billing</h1>
          <p className="mt-2 text-sm text-muted">
            {pendingInvoices > 0 ? `${pendingInvoices} invoice(s) awaiting payment` : 'All caught up'}
          </p>
          <p className="mt-3 text-xs text-muted">
            M-Pesa Paybill {STUDIO.paybill} · Account {STUDIO.paybillAccount}
          </p>
        </header>
        {invoices.length === 0 ? (
          <div className="glass-panel-v2 rounded-2xl p-12 text-center text-muted text-sm">No invoices yet.</div>
        ) : (
          <ul className="space-y-3">
            {invoices.map((inv) => (
              <li key={inv.id}>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(inv)}
                  className="w-full flex flex-wrap items-center justify-between gap-4 p-5 glass-panel-v2 rounded-xl hover:border-primary/50 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium">Invoice #{inv.id.slice(0, 8)}</p>
                    <p className="text-[10px] text-muted uppercase tracking-widest mt-1">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl tabular-nums">KES {inv.amount?.toLocaleString()}</p>
                    <p className={cn('text-[10px] uppercase tracking-widest', inv.paid ? 'text-accent-success' : 'text-primary')}>
                      {inv.paid ? 'Paid' : 'Pay now'}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
        <Modal open={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title={selectedInvoice ? `Invoice` : undefined} size="md">
          {selectedInvoice && (
            <div className="space-y-4 text-sm">
              <div className="flex justify-between"><span className="text-muted">Amount</span><span>KES {selectedInvoice.amount?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted">Status</span><span>{selectedInvoice.paid ? 'Paid' : 'Pending'}</span></div>
              {!selectedInvoice.paid && (
                <HighlightedButton variant="cta-primary" className="w-full" onClick={() => navigate('/checkout')}>
                  Pay invoice
                </HighlightedButton>
              )}
            </div>
          )}
        </Modal>
      </>
    );
  }

  return (
    <>
      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-bold mb-2">Welcome back</p>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">{user?.name}</h1>
        <p className="mt-3 text-sm text-muted flex flex-wrap items-center gap-3">
          <span>{files.length} files</span>
          <span>·</span>
          <span>{pendingApprovals} pending review</span>
          {connected && (
            <span className="inline-flex items-center gap-1.5 text-accent-success">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-success animate-pulse" /> Live
            </span>
          )}
        </p>
      </motion.header>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-10">
        {QUICK_LINKS.map(({ to, label, desc, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="glass-panel-v2 rounded-xl p-5 hover:border-primary/50 hover:shadow-[var(--glow-brand)] transition-all group"
          >
            <Icon className="w-5 h-5 text-primary mb-3" />
            <p className="text-sm font-bold uppercase tracking-tight">{label}</p>
            <p className="text-xs text-muted mt-1">{desc}</p>
            <ArrowRight className="w-4 h-4 text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      <WidgetGrid
        userName={user?.name}
        data={{ files, mediaRequests, invoices }}
        selectedCount={selectedFiles.length}
        requestType="file"
        requestDetails=""
        onPreview={setPreviewFile}
        onScrollToLibrary={() => navigate('/dashboard/library')}
        onBulkDownload={handleBulkDownload}
        onNewRequest={() => navigate('/dashboard/requests')}
        onViewBilling={() => navigate('/dashboard/billing')}
        onRequestTypeChange={() => {}}
        onRequestDetailsChange={() => {}}
        onSubmitRequest={() => navigate('/dashboard/requests')}
        onDeleteRequest={() => {}}
        onSelectInvoice={setSelectedInvoice}
        hideCollaboration
      />

      <MediaPreview file={previewFile} open={!!previewFile} onClose={() => setPreviewFile(null)} onDownload={handleDownload} />
      <Modal open={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} size="md">
        {selectedInvoice && (
          <div className="space-y-4 text-sm p-2">
            <p className="font-medium">KES {selectedInvoice.amount?.toLocaleString()}</p>
            {!selectedInvoice.paid && (
              <HighlightedButton variant="cta-primary" className="w-full" onClick={() => navigate('/checkout')}>
                Pay now
              </HighlightedButton>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default DashboardPage;
