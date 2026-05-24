import type { Transition, Variants } from 'motion/react';

export const easeOut: Transition = {
  duration: 0.28,
  ease: [0.16, 1, 0.3, 1],
};

export const easeOutSlow: Transition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 24,
};

export const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: easeOut },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: easeOut },
    exit: { y: -12, opacity: 0, transition: { duration: 0.2 } },
  },
  slideDown: {
    initial: { y: -16, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: easeOut },
    exit: { y: -16, opacity: 0, transition: { duration: 0.2 } },
  },
  scaleIn: {
    initial: { scale: 0.96, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: easeOut },
    exit: { scale: 0.98, opacity: 0, transition: { duration: 0.2 } },
  },
} satisfies Record<string, Variants>;

export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: springSnappy,
};

export const staggerContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: easeOut },
};

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
