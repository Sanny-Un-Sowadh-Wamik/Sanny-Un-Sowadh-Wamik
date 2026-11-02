import { useCallback, useEffect, useRef } from "react";

/**
 * A crisp, auto-sizing 2D canvas. `draw` runs on resize and whenever `deps` change.
 * Call `repaint()` from an animation loop to redraw every frame.
 */
export function useCanvas(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  deps: unknown[],
) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const size = useRef({ w: 0, h: 0 });

  const repaint = useCallback(() => {
    const c = ref.current;
    if (!c || !size.current.w) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.current.w, size.current.h);
    drawRef.current(ctx, size.current.w, size.current.h);
  }, []);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ro = new ResizeObserver(() => {
      const r = c.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.current = { w: r.width, h: r.height };
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      repaint();
    });
    ro.observe(c);
    return () => ro.disconnect();
  }, [repaint]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => repaint(), deps);

  return { ref, repaint };
}
