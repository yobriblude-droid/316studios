import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { ServicePackageGrid, type ServicePackage } from '../components/ui/ServicePackageGrid';
import { HighlightedButton } from '../components/ui/HighlightedButton';
import { layout } from '../lib/layout';

export default function ServicesPage() {
  const [services, setServices] = useState<ServicePackage[]>([]);

  useEffect(() => {
    fetch('/api/services').then((r) => r.json()).then(setServices);
  }, []);

  return (
    <div className={layout.page}>
      <PageHero
        compact
        tight
        eyebrow="Offerings"
        title="Our Services"
        description="Photography packages for portraits, weddings, fashion, and outdoor sessions. Transparent pricing in KSh."
      />

      <section className="w-full pt-6 pb-16 md:pb-20 px-3 sm:px-5 max-w-[1920px] mx-auto">
        <ServicePackageGrid services={services} />
      </section>

      <section className="w-full border-t border-glass-border py-16 px-3 sm:px-5">
        <div className="max-w-3xl mx-auto text-center glass-panel-v2 rounded-2xl p-10 md:p-14">
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground mb-4">
            Custom packages available
          </h2>
          <p className="text-sm text-muted mb-8">
            Need something beyond our standard offerings? We build bespoke packages for campaigns, events, and
            multi-day productions.
          </p>
          <Link to="/contact">
            <HighlightedButton variant="cta-primary" size="lg" className="gap-2">
              Discuss your project
              <ArrowRight className="w-4 h-4" />
            </HighlightedButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
