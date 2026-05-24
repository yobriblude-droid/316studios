import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Twitter } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { cn } from '../../lib/utils';
import { STUDIO } from '../../lib/contact';

const FOOTER_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
  { to: '/about', label: 'About' },
] as const;

const SOCIAL = [
  { href: 'https://twitter.com/316studios', label: 'Twitter', Icon: Twitter },
  { href: 'https://instagram.com/316studios', label: 'Instagram', Icon: Instagram },
  { href: 'https://linkedin.com/company/316studios', label: 'LinkedIn', Icon: Linkedin },
] as const;

export function Footer() {
  return (
  <footer className="bg-bg border-t border-border py-16">
    <div className="w-full mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 2xl:px-10 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <BrandMark linkTo="/" className="mb-6" />
          <p className="text-muted max-w-sm mb-6 text-sm leading-relaxed">
            Capturing the essence of human connection. Professional photography services for individuals,
            families, and corporate clients in Nairobi, Kenya.
          </p>
          <div className="flex gap-3">
            {SOCIAL.map(({ href, label, Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'w-10 h-10 border border-border flex items-center justify-center',
                  'hover:border-accent hover:text-accent hover:bg-accent-dim transition-colors'
                )}
                aria-label={label}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-6 uppercase tracking-widest text-xs text-accent">Links</h4>
          <ul className="space-y-3 text-sm text-muted">
            {FOOTER_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="hover:text-accent transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-6 uppercase tracking-widest text-xs text-accent">Contact</h4>
          <ul className="space-y-3 text-sm text-muted">
            <li>
              <a href={`mailto:${STUDIO.email}`} className="hover:text-accent transition-colors">
                {STUDIO.email}
              </a>
            </li>
            <li>
              <a href={`tel:${STUDIO.phoneE164}`} className="hover:text-accent transition-colors">
                {STUDIO.phoneDisplay}
              </a>
            </li>
            <li>{STUDIO.city}</li>
            <li className="text-xs pt-2">
              M-Pesa Paybill {STUDIO.paybill} · Acc {STUDIO.paybillAccount}
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 2xl:px-10 mt-16 pt-8 border-t border-border text-[9px] uppercase tracking-[0.2em] text-muted flex flex-col md:flex-row justify-between gap-4">
        <p>&copy; 2024 316 Studios · Visual Asset Management</p>
        <div className="flex gap-8">
          <span>Terms of Service</span>
          <Link to="/admin/login" className="text-accent hover:underline">
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
