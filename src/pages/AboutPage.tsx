import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Camera, Award, Users, Globe, ArrowRight } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { LocationScroller } from '../components/ui/LocationScroller';
import { Testimonials } from '../components/ui/Testimonials';
import { layout } from '../lib/layout';
import { staggerContainer, staggerItem } from '../lib/motion';

const VALUES = [
  { Icon: Camera, title: 'Authentic Storytelling', text: 'Genuine emotions and natural moments — never forced poses.' },
  { Icon: Award, title: 'Technical Excellence', text: 'Professional-grade equipment and meticulous post-production.' },
  { Icon: Users, title: 'Collaborative Process', text: 'We work closely with you to realize your unique vision.' },
  { Icon: Globe, title: 'Local Expertise', text: "Deep knowledge of Nairobi's light, locations, and culture." },
] as const;

const PROCESS = [
  { step: '01', title: 'Consultation', text: 'Understanding your vision, preferences, and creative direction.' },
  { step: '02', title: 'Execution', text: 'On-location or studio session with professional lighting and direction.' },
  { step: '03', title: 'Delivery', text: 'Curated, retouched images via our secure client portal.' },
] as const;

const STATS = [
  { value: '500+', label: 'Satisfied Clients' },
  { value: '10+', label: 'Years Experience' },
  { value: '15', label: 'Industry Awards' },
] as const;

export default function AboutPage() {
  const [heroImage, setHeroImage] = useState<string | undefined>();

  useEffect(() => {
    fetch('/api/hero-slides')
      .then((r) => r.json())
      .then((slides) => {
        if (Array.isArray(slides) && slides[0]?.image) setHeroImage(slides[0].image);
      })
      .catch(() => setHeroImage(undefined));
  }, []);

  return (
    <div className={layout.page}>
      <PageHero
        eyebrow="Our Story"
        title="About 316 Studios"
        description="Based in Nairobi, we capture the essence of human connection through timeless visual narratives."
        image={heroImage}
      />

      {/* Asymmetric mission */}
      <section className={layout.sectionDefault}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7"
          >
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-foreground mb-6">
              Our Mission
            </h2>
            <p className="text-muted leading-relaxed mb-6">
              316 Studios specializes in capturing the true essence of human connection. Every portrait tells a story;
              every lifestyle frame reflects a moment of unfiltered reality.
            </p>
            <p className="text-muted leading-relaxed">
              We blend technical excellence with artistic vision to deliver images that resonate across generations —
              from corporate leaders in the CBD to families in Karen, from fashion runways in Westlands to weddings on the
              Mara.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 glass-panel border-gold p-8"
          >
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-accent font-semibold mb-6">What Sets Us Apart</h3>
            <ul className="space-y-5">
              {VALUES.map(({ Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <Icon className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted mt-1">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Process — editorial pacing */}
      <section className="w-full bg-surface border-y border-border py-16 md:py-24">
        <div className={layout.sectionInner}>
          <h2 className="text-[10px] uppercase tracking-[0.35em] text-accent font-semibold mb-4">The Process</h2>
          <p className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-foreground mb-12 max-w-2xl">
            From first call to final delivery
          </p>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-1"
          >
            {PROCESS.map(({ step, title, text }) => (
              <motion.div
                key={step}
                variants={staggerItem}
                className="border border-border bg-bg p-8 md:p-10"
              >
                <span className="text-4xl font-black text-accent/40">{step}</span>
                <h4 className="mt-4 text-sm font-bold uppercase tracking-widest text-foreground">{title}</h4>
                <p className="mt-3 text-xs text-muted leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className={layout.sectionTight}>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-1"
        >
          {STATS.map(({ value, label }) => (
            <motion.div
              key={label}
              variants={staggerItem}
              className="text-center p-10 border border-border bg-elevated"
            >
              <div className="text-4xl md:text-5xl font-black text-accent">{value}</div>
              <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted font-semibold">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <LocationScroller />
      <Testimonials />

      <section className="pb-20">
        <div className={`${layout.sectionInner} text-center`}>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-10 py-4 bg-accent text-[var(--primary-foreground)] text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-accent-hover transition-colors"
          >
            Start a Conversation <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
