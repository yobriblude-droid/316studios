import React, { useEffect, useState } from 'react';
import { Calendar, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

type Booking = {
  id: string;
  date: string;
  serviceId: string;
  status: string;
};

type Service = { id: string; title: string };

export function CalendarWidget() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/client/bookings').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/services').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([bookingData, serviceData]) => {
        setBookings(bookingData || []);
        const map: Record<string, string> = {};
        (serviceData as Service[]).forEach((s) => {
          map[s.id] = s.title;
        });
        setServices(map);
      })
      .catch(() => {
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter((b) => {
    const d = new Date(b.date);
    return !Number.isNaN(d.getTime()) && d >= new Date(new Date().toDateString());
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-muted">
        <Calendar className="w-5 h-5 text-accent shrink-0" />
        <p className="text-xs leading-relaxed">Your studio bookings and scheduled sessions.</p>
      </div>

      {loading ? (
        <p className="text-[10px] uppercase tracking-widest text-muted animate-pulse">Loading…</p>
      ) : upcoming.length === 0 ? (
        <p className="text-xs text-muted">No upcoming bookings.</p>
      ) : (
        <ul className="space-y-2 max-h-36 overflow-y-auto">
          {upcoming.slice(0, 5).map((b) => (
            <li key={b.id} className="border border-border px-3 py-2 bg-elevated/50">
              <p className="text-xs text-foreground font-medium">
                {new Date(b.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="text-[10px] text-muted truncate mt-0.5">
                {services[b.serviceId] || b.serviceId}
              </p>
              <p
                className={cn(
                  'text-[9px] uppercase tracking-widest mt-1',
                  b.status === 'confirmed' ? 'text-emerald-400' : 'text-amber-400'
                )}
              >
                {b.status}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/bookings"
        className="inline-flex w-full items-center justify-center gap-2 px-6 py-2.5 text-xs tracking-widest uppercase border border-border-gold text-foreground hover:bg-accent-dim transition-colors"
      >
        Book a session
        <ExternalLink className="w-3 h-3" />
      </Link>
    </div>
  );
}
