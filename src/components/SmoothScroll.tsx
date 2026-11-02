import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Buttery-smooth inertia scrolling site-wide.
 * Disables itself for users who prefer reduced motion.
 * Restores scroll position (and hash anchors) on reload.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Restore scroll position or hash anchor after Lenis takes over
    const hash = window.location.hash;
    if (hash && hash !== "#") {
      const el = document.querySelector(hash);
      if (el) {
        lenis.scrollTo(el as HTMLElement, { offset: 0, immediate: true });
      } else {
        lenis.scrollTo(window.scrollY, { immediate: true });
      }
    } else {
      lenis.scrollTo(window.scrollY, { immediate: true });
    }

    // Intercept in-page anchor clicks so smooth-scroll handles them
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest('a[href^="#"]') as
        | HTMLAnchorElement
        | null;
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.2 });
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}

export default SmoothScroll;