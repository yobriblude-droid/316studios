import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { PageHero } from '../components/ui/PageHero';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { layout } from '../lib/layout';

type Service = { id: string; title: string; price: string; description?: string };

export default function BookingPage() {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({ name: '', email: '', date: '', serviceId: '' });
  const [services, setServices] = useState<Service[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then(setServices)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name || f.name,
        email: user.email || f.email,
      }));
    }
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Booking failed');
      setSuccess(true);
      setTimeout(() => navigate(user ? '/dashboard' : '/'), 2000);
    } catch {
      alert('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={layout.page}>
      <PageHero
        eyebrow="Schedule"
        title="Book a session"
        description="Reserve your date and service. We'll confirm availability within 24 hours."
        compact
      />

      <section className={layout.sectionDefault}>
        <div className="max-w-xl mx-auto">
          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel border-gold p-10 text-center"
            >
              <Calendar className="w-10 h-10 text-accent mx-auto mb-4" />
              <p className="text-lg text-foreground font-medium">Booking received</p>
              <p className="text-sm text-muted mt-2">Redirecting you shortly…</p>
            </motion.div>
          ) : (
            <Card elevation="glass" className="p-8 md:p-10">
              <form onSubmit={submit} className="space-y-5">
                <Input
                  label="Full name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <Input
                  label="Preferred date"
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted font-medium">
                    Service
                  </label>
                  <select
                    required
                    value={form.serviceId}
                    onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                    className="w-full bg-elevated border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent"
                  >
                    <option value="">Select a service</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} — {s.price}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Request booking'}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
