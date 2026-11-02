import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const burstLayerRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia("(hover: none)").matches) return;

    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
      const t = e.target as HTMLElement | null;
      const isInteractive = !!t?.closest(
        'a, button, [role="button"], input, textarea, select, label, summary, [data-cursor="hover"]'
      );
      setHovering((h) => (h !== isInteractive ? isInteractive : h));
    };
    const leave = () => setVisible(false);
    const enter = () => setVisible(true);
    const dn = (e: MouseEvent) => {
      setDown(true);
      spawnBurst(e.clientX, e.clientY);
    };
    const up = () => setDown(false);

    const spawnBurst = (x: number, y: number) => {
      const layer = burstLayerRef.current;
      if (!layer) return;
      const count = 12;
      for (let i = 0; i < count; i++) {
        const p = document.createElement("span");
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const dist = 40 + Math.random() * 50;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const size = 4 + Math.random() * 4;
        p.style.cssText = `
          position: fixed;
          left: ${x}px;
          top: ${y}px;
          width: ${size}px;
          height: ${size}px;
          margin-left: ${-size / 2}px;
          margin-top: ${-size / 2}px;
          border-radius: 9999px;
          background: white;
          box-shadow: 0 0 8px 2px color-mix(in oklab, var(--primary) 90%, white), 0 0 20px 4px color-mix(in oklab, var(--primary) 60%, transparent);
          pointer-events: none;
          z-index: 9997;
          --dx: ${dx}px;
          --dy: ${dy}px;
          animation: cursor-spark 650ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        `;
        layer.appendChild(p);
        setTimeout(() => p.remove(), 700);
      }
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    window.addEventListener("mouseenter", enter);
    window.addEventListener("mousedown", dn);
    window.addEventListener("mouseup", up);

    let raf = 0;
    const tick = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.18;
      ring.current.y += (pos.current.y - ring.current.y) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    document.documentElement.classList.add("custom-cursor-active");

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
      window.removeEventListener("mouseenter", enter);
      window.removeEventListener("mousedown", dn);
      window.removeEventListener("mouseup", up);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [visible]);

  return (
    <>
      <div ref={burstLayerRef} aria-hidden className="pointer-events-none fixed inset-0 z-[9997]" />
      {/* Outer glow halo */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] rounded-full transition-[width,height,opacity] duration-300 ease-out"
        style={{
          width: hovering ? 140 : 90,
          height: hovering ? 140 : 90,
          opacity: visible ? (hovering ? 0.9 : 0.55) : 0,
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--primary) 55%, transparent) 0%, color-mix(in oklab, var(--primary) 20%, transparent) 40%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />
      {/* Bright core dot */}
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full bg-white transition-[width,height,opacity] duration-150 ease-out"
        style={{
          width: down ? 6 : hovering ? 14 : 10,
          height: down ? 6 : hovering ? 14 : 10,
          opacity: visible ? 1 : 0,
          boxShadow:
            "0 0 6px 1px #fff, 0 0 14px 3px color-mix(in oklab, var(--primary) 90%, white), 0 0 32px 8px color-mix(in oklab, var(--primary) 70%, transparent), 0 0 60px 18px color-mix(in oklab, var(--primary) 40%, transparent)",
        }}
      />
    </>
  );
}

export default CustomCursor;