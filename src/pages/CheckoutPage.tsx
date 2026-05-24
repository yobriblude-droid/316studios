import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { layout } from '../lib/layout';
import { cn } from '../lib/utils';

type Service = { id: string; title: string; description: string; price: string };

const CheckoutPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/services').then((r) => r.json()).then(setServices);
  }, []);

  const handleCheckout = async () => {
    if (!selected) return alert('Select a service');
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: selected }),
      });
      if (!res.ok) throw new Error('Checkout failed');
      const data = await res.json();
      const pay = await fetch('/api/payments/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: data.invoice.id }),
      });
      if (!pay.ok) throw new Error('Payment failed');
      navigate('/invoices');
    } catch (err) {
      if ((err as Error).message === 'Checkout failed') navigate('/login');
      else alert('Checkout error. Please sign in and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={layout.page}>
      <PageHero
        eyebrow="Billing"
        title="Checkout"
        description="Select a service package. Payment is simulated for demo purposes."
        compact
      />

      <section className={layout.sectionDefault}>
        <div className="max-w-2xl mx-auto space-y-4">
          {services.map((s) => (
            <motion.button
              key={s.id}
              type="button"
              onClick={() => setSelected(s.id)}
              className={cn(
                'w-full text-left border p-6 transition-colors',
                selected === s.id
                  ? 'border-accent bg-accent-dim ring-1 ring-accent/30'
                  : 'border-border bg-surface hover:border-border-gold'
              )}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    'w-5 h-5 border flex items-center justify-center shrink-0 mt-0.5',
                    selected === s.id ? 'border-accent bg-accent' : 'border-border'
                  )}
                >
                  {selected === s.id && (
                    <Check className="w-3 h-3 text-[var(--primary-foreground)]" />
                  )}
                </span>
                <div>
                  <p className="text-lg font-semibold text-foreground">{s.title}</p>
                  <p className="text-sm text-muted mt-1">{s.description}</p>
                  <p className="text-sm text-accent font-medium mt-3 tabular-nums">{s.price}</p>
                </div>
              </div>
            </motion.button>
          ))}
          {services.length === 0 && (
            <Card className="text-center text-muted text-sm">No services available.</Card>
          )}
          <Button
            variant="primary"
            className="w-full mt-6"
            onClick={handleCheckout}
            disabled={loading || !selected}
          >
            {loading ? 'Processing…' : 'Pay & create invoice'}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default CheckoutPage;
