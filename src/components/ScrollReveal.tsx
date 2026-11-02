import { useEffect } from "react";

/**
 * Global scroll-reveal: animates sections, headings, paragraphs, images,
 * cards and list items as they enter the viewport. Plays once per element.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const SELECTOR = [
      "section",
      "h1", "h2", "h3", "h4",
      "p",
      "img", "video",
      "article",
      "li",
      "[data-reveal]",
      ".card",
      "[class*='card']",
    ].join(",");

    const seen = new WeakSet<Element>();

    const tag = (el: Element, index: number) => {
      if (seen.has(el)) return;
      seen.add(el);
      const h = el as HTMLElement;
      // Skip elements that are huge wrappers (full viewport hero already in view)
      // or already explicitly animated.
      if (h.dataset.revealReady === "1") return;
      h.dataset.revealReady = "1";

      // Pick a variant per tag
      const tagName = el.tagName.toLowerCase();
      let variant = "reveal-up";
      if (tagName === "img" || tagName === "video") variant = "reveal-zoom";
      else if (tagName === "h1" || tagName === "h2") variant = "reveal-up-lg";
      else if (tagName === "li") variant = "reveal-right";

      h.classList.add("reveal", variant);
      // Stagger siblings slightly
      h.style.setProperty("--reveal-delay", `${Math.min(index * 40, 320)}ms`);
    };

    const reveal = (el: Element) => {
      (el as HTMLElement).classList.add("reveal-in");
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    const scan = () => {
      const nodes = Array.from(document.querySelectorAll(SELECTOR));
      nodes.forEach((el, i) => {
        // Skip cursor / portals / scripts
        if (el.closest("[aria-hidden='true']")) return;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;
        tag(el, i);
        // If already in view at load, reveal immediately (no flash)
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          requestAnimationFrame(() => reveal(el));
        } else {
          io.observe(el);
        }
      });
    };

    // Initial scan + observe DOM changes (route transitions, async content)
    scan();
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}

export default ScrollReveal;