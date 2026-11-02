import { useEffect, useRef } from "react";

/**
 * Fixed full-viewport animated background.
 * Renders a perspective 3D grid that pulses toward the viewer,
 * floating depth particles, and a slowly drifting indigo aurora.
 */
export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let t = 0;
    let scrollY = window.scrollY;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Floating depth particles (parallax stars)
    const PARTICLES = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random() * 0.9 + 0.1, // depth 0..1
      r: Math.random() * 1.6 + 0.4,
      hue: Math.random() > 0.5 ? "#818cf8" : "#a5b4fc",
    }));

    const onScroll = () => {
      scrollY = window.scrollY;
    };
    const onResize = () => resize();
    resize();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });

    const draw = () => {
      t += 0.005;
      ctx.clearRect(0, 0, W, H);

      // Aurora gradient blob (drifts)
      const cx = W * (0.5 + Math.sin(t * 0.6) * 0.15);
      const cy = H * (0.35 + Math.cos(t * 0.4) * 0.12);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
      grad.addColorStop(0, "rgba(79,70,229,0.22)");
      grad.addColorStop(0.4, "rgba(79,70,229,0.06)");
      grad.addColorStop(1, "rgba(10,10,26,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // 3D perspective grid (horizon ~55% down)
      const horizon = H * 0.55;
      const vp = { x: W / 2, y: horizon };
      const rows = 18;
      const cols = 24;
      const scrollPhase = (scrollY * 0.0015) % 1;

      ctx.strokeStyle = "rgba(129,140,248,0.18)";
      ctx.lineWidth = 1;

      // horizontal lines (depth)
      for (let i = 1; i <= rows; i++) {
        const p = (i + scrollPhase) / rows; // 0..1
        const ease = Math.pow(p, 2.2);
        const y = horizon + (H - horizon) * ease;
        const alpha = (1 - p) * 0.5;
        ctx.strokeStyle = `rgba(129,140,248,${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // radial converging lines (vanishing point)
      for (let i = -cols; i <= cols; i++) {
        const x = vp.x + (i / cols) * W * 1.6;
        ctx.strokeStyle = "rgba(129,140,248,0.13)";
        ctx.beginPath();
        ctx.moveTo(vp.x, vp.y);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      // Sweep beam along horizon
      const sweep = (Math.sin(t * 0.7) + 1) / 2;
      const sx = sweep * W;
      const beam = ctx.createLinearGradient(sx - 220, 0, sx + 220, 0);
      beam.addColorStop(0, "rgba(129,140,248,0)");
      beam.addColorStop(0.5, "rgba(129,140,248,0.25)");
      beam.addColorStop(1, "rgba(129,140,248,0)");
      ctx.fillStyle = beam;
      ctx.fillRect(sx - 220, horizon - 1, 440, 2);

      // Floating 3D particles with parallax drift
      for (const p of PARTICLES) {
        const drift = (t * 30 * p.z + scrollY * p.z * 0.4) % H;
        const x = (p.x * W + Math.sin(t + p.y * 6) * 12 * p.z) % W;
        const y = (p.y * H - drift + H) % H;
        const r = p.r * (0.4 + p.z * 1.2);
        const a = 0.25 + p.z * 0.55;
        ctx.beginPath();
        ctx.fillStyle =
          p.hue +
          Math.floor(a * 255)
            .toString(16)
            .padStart(2, "0");
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-screen w-screen opacity-40"
    />
  );
}