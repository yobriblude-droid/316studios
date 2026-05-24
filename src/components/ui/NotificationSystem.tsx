import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Settings, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useNotifications } from '../../contexts/NotificationContext';
import { trapFocus } from '../../lib/accessibility';
export function ToastStack() {
  const { toasts, dismissToast } = useNotifications();

  return (
    <div
      className="fixed bottom-24 md:bottom-6 right-4 z-[240] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            className={cn(
              'pointer-events-auto border p-4 shadow-lg glass-panel',
              t.type === 'error' && 'border-red-500/50',
              t.type === 'success' && 'border-emerald-500/50',
              t.type === 'warning' && 'border-amber-500/50',
              t.type === 'info' && 'border-border-gold'
            )}
          >
            <div className="flex justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{t.title}</p>
                {t.message && <p className="text-xs text-muted mt-1">{t.message}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="text-muted hover:text-foreground shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function NotificationBell() {
  const {
    unreadCount,
    panelOpen,
    setPanelOpen,
    notifications,
    markRead,
    markAllRead,
    dismiss,
    preferences,
    updatePreferences,
    loading,
  } = useNotifications();

  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!panelOpen || !panelRef.current) return;
    return trapFocus(panelRef.current);
  }, [panelOpen]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setPanelOpen(!panelOpen)}
        className="relative p-2 border border-border hover:border-accent text-muted hover:text-accent transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={panelOpen}
        aria-haspopup="dialog"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[9px] font-bold bg-accent text-[var(--primary-foreground)] rounded-full px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {panelOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-[199]"
              aria-label="Close notifications"
              onClick={() => setPanelOpen(false)}
            />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Notification center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 top-full mt-2 z-[200] w-[min(100vw-2rem,360px)] border border-border bg-surface shadow-xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h2 className="text-xs uppercase tracking-widest font-semibold text-foreground">
                  Notifications
                </h2>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="p-1.5 text-muted hover:text-accent"
                    aria-label="Mark all as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPanelOpen(false)}
                    className="p-1.5 text-muted hover:text-foreground"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {loading ? (
                  <p className="p-4 text-xs text-muted uppercase tracking-widest animate-pulse">Loading…</p>
                ) : notifications.length === 0 ? (
                  <p className="p-6 text-sm text-muted text-center">No notifications</p>
                ) : (
                  <ul>
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className={cn(
                          'border-b border-border/60 px-4 py-3',
                          !n.read && 'bg-accent-dim/40'
                        )}
                      >
                        <div className="flex justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground">{n.title}</p>
                            <p className="text-[11px] text-muted mt-0.5 line-clamp-2">{n.body}</p>
                            {n.link && (
                              <Link
                                to={n.link}
                                onClick={() => {
                                  markRead(n.id);
                                  setPanelOpen(false);
                                }}
                                className="text-[10px] text-accent uppercase tracking-wider mt-1 inline-block hover:underline"
                              >
                                View
                              </Link>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 shrink-0">
                            {!n.read && (
                              <button
                                type="button"
                                onClick={() => markRead(n.id)}
                                className="text-[9px] uppercase text-muted hover:text-accent"
                              >
                                Read
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => dismiss(n.id)}
                              className="text-[9px] uppercase text-muted hover:text-red-400"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-4 border-t border-border space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-muted flex items-center gap-1">
                  <Settings className="w-3 h-3" /> Preferences
                </p>
                {preferences &&
                  (
                    [
                      ['pushEnabled', 'Push alerts'],
                      ['commentAlerts', 'Comments'],
                      ['approvalAlerts', 'Approvals'],
                      ['requestAlerts', 'Requests'],
                      ['mentionAlerts', '@Mentions'],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between text-xs text-foreground">
                      <span>{label}</span>
                      <input
                        type="checkbox"
                        checked={preferences[key]}
                        onChange={(e) => updatePreferences({ [key]: e.target.checked })}
                        className="accent-[var(--accent)]"
                      />
                    </label>
                  ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function NotificationSystem() {
  return (
    <>
      <ToastStack />
    </>
  );
}

export default NotificationSystem;
