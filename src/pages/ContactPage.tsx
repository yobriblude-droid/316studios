import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { motion } from 'motion/react';
import { Mail, MapPin, Phone, Send, CreditCard, MessageCircle } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { RouteOutMenu } from '../components/ui/RouteOutMenu';
import { mediaRequestContext } from '../lib/route-out';
import { layout } from '../lib/layout';
import { STUDIO, telUrl, whatsAppUrl } from '../lib/contact';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || 'Failed to send');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={layout.page}>
      <PageHero
        eyebrow="Get in Touch"
        title="Contact Us"
        description="Based in Nairobi. Available for local and destination assignments across Kenya and East Africa."
        compact
      />

      <section className={layout.sectionDefault}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
        >
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel-v2-elevated rounded-lg p-8 space-y-8">
              <div className="flex gap-4">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted font-semibold">Email</p>
                  <a href={`mailto:${STUDIO.email}`} className="text-foreground hover:text-accent transition-colors">
                    {STUDIO.email}
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted font-semibold">Phone</p>
                  <a href={telUrl()} className="text-foreground hover:text-accent transition-colors">
                    {STUDIO.phoneDisplay}
                  </a>
                  <a
                    href={whatsAppUrl('Hi 316 Studios, I would like to enquire about a session.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-2 text-sm text-accent hover:text-accent-hover"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <CreditCard className="w-5 h-5 text-accent shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted font-semibold">M-Pesa Paybill</p>
                  <p className="text-foreground tabular-nums">Paybill {STUDIO.paybill}</p>
                  <p className="text-sm text-muted mt-1">
                    Account no. <span className="text-foreground tabular-nums">{STUDIO.paybillAccount}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPin className="w-5 h-5 text-accent shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted font-semibold">Studio</p>
                  <p className="text-foreground">{STUDIO.city}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Typical response within 24 hours. For urgent bookings, call or WhatsApp directly, or use our{' '}
              <Link to="/bookings" className="text-accent-link hover:text-accent-brand">
                online booking form
              </Link>
              .
            </p>
            <RouteOutMenu
              context={mediaRequestContext(
                'inquiry',
                form.message || 'Session inquiry',
                'open',
                form.name,
                form.email
              )}
              compact
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7"
          >
            {submitted ? (
              <div className="border border-border-gold bg-accent-dim p-12 text-center">
                <p className="text-[10px] uppercase tracking-[0.3em] text-accent font-semibold mb-4">Message Sent</p>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-4">
                  Thank you, {form.name || 'friend'}
                </h2>
                <p className="text-sm text-muted">
                  We will be in touch shortly. For immediate booking, visit our appointments page.
                </p>
                <Link
                  to="/bookings"
                  className="inline-block mt-8 text-[10px] uppercase tracking-widest text-accent hover:text-accent-hover font-semibold"
                >
                  Book a Session
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="border border-border bg-surface p-8 md:p-10 space-y-6">
                <h2 className="text-lg font-bold uppercase tracking-tighter text-foreground">Send a message</h2>
                <Input
                  label="Name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                />
                <Input
                  label="Email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                />
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[10px] uppercase tracking-widest text-muted font-medium">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us about your project"
                    className="w-full bg-elevated border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                </div>
                {error && <p className="text-sm text-accent-danger">{error}</p>}
                <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto gap-2" disabled={sending}>
                  <Send className="w-4 h-4" /> {sending ? 'Sending…' : 'Send Message'}
                </Button>
              </form>
            )}
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
