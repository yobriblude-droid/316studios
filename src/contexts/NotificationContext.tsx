import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AppNotification } from '../lib/socket';
import { useRealtimeNotifications } from '../hooks/use-realtime';
import { AuthContext } from './AuthContext';
import { apiFetch } from '../lib/api';
import { announceToScreenReader } from '../lib/accessibility';

export type Toast = {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
};

type NotificationPreferences = {
  emailEnabled: boolean;
  pushEnabled: boolean;
  commentAlerts: boolean;
  approvalAlerts: boolean;
  requestAlerts: boolean;
  mentionAlerts: boolean;
};

type NotificationContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  toasts: Toast[];
  preferences: NotificationPreferences | null;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

const defaultPrefs: NotificationPreferences = {
  emailEnabled: true,
  pushEnabled: true,
  commentAlerts: true,
  approvalAlerts: true,
  requestAlerts: true,
  mentionAlerts: true,
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setPreferences(null);
      return;
    }
    setLoading(true);
    try {
      const [notifRes, countRes, prefRes] = await Promise.all([
        apiFetch('/api/client/notifications'),
        apiFetch('/api/client/notifications/unread-count'),
        apiFetch('/api/client/notification-preferences'),
      ]);
      if (notifRes.ok) setNotifications(await notifRes.json());
      if (countRes.ok) {
        const data = await countRes.json();
        setUnreadCount(data.count || 0);
      }
      if (prefRes.ok) setPreferences(await prefRes.json());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const entry: Toast = { ...t, id, duration: t.duration ?? 4000 };
    setToasts((prev) => [...prev, entry]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, entry.duration);
  }, []);

  useRealtimeNotifications(
    useCallback(
      (n: AppNotification) => {
        setNotifications((prev) => [n, ...prev].slice(0, 50));
        setUnreadCount((c) => c + 1);
        toast({
          type: 'info',
          title: n.title,
          message: n.body,
        });
        announceToScreenReader(`${n.title}. ${n.body}`, 'polite');
      },
      [toast]
    )
  );

  const markRead = useCallback(
    async (id: string) => {
      await apiFetch(`/api/client/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    },
    []
  );

  const markAllRead = useCallback(async () => {
    await apiFetch('/api/client/notifications/read-all', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const dismiss = useCallback(async (id: string) => {
    await apiFetch(`/api/client/notifications/${id}`, { method: 'DELETE' });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await refresh();
  }, [refresh]);

  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    const res = await apiFetch('/api/client/notification-preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    });
    if (res.ok) {
      setPreferences(await res.json());
    }
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      toasts,
      preferences: preferences ?? defaultPrefs,
      loading,
      refresh,
      markRead,
      markAllRead,
      dismiss,
      updatePreferences,
      toast,
      dismissToast,
      panelOpen,
      setPanelOpen,
    }),
    [
      notifications,
      unreadCount,
      toasts,
      preferences,
      loading,
      refresh,
      markRead,
      markAllRead,
      dismiss,
      updatePreferences,
      toast,
      dismissToast,
      panelOpen,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}
