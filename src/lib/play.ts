/* Small shared helpers for motion, haptics and confetti. */

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function haptic(pattern: number | number[] = 10) {
  try {
    // Browsers ignore (and log) vibration until the person has tapped something
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}

export function burst(x: number, y: number, count = 32) {
  if (reducedMotion()) return;
  const colors = ["#d1342a", "#f5c518", "#ffffff", "#2b2b33"];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = 60 + Math.random() * 100;
    el.className = "confetti";
    const size = 6 + Math.random() * 9;
    el.style.width = el.style.height = `${size}px`;
    el.style.borderRadius = i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0";
    if (i % 4 === 3) el.style.clipPath = "polygon(50% 0, 100% 100%, 0 100%)";
    el.style.cssText += `;left:${x}px;top:${y}px;background:${colors[i % colors.length]};--dx:${(Math.cos(angle) * dist).toFixed(0)}px;--dy:${(Math.sin(angle) * dist).toFixed(0)}px`;
    document.body.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
}

/* Seeded PRNG so each round of a game is reproducible */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Standard normal sample from a uniform generator */
export function gauss(rand: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* A single flat four-point sparkle that falls and fades (used for the scroll-ball trail) */
export function spark(x: number, y: number) {
  if (reducedMotion()) return;
  const el = document.createElement("span");
  const colors = ["#f5c518", "#d1342a", "#ffffff", "#f5c518"];
  const size = 6 + Math.random() * 7;
  el.className = "spark";
  el.style.width = el.style.height = `${size}px`;
  el.style.cssText += `;left:${x}px;top:${y}px;background:${colors[Math.floor(Math.random() * colors.length)]};--dx:${(Math.random() * 44 - 22).toFixed(0)}px;--dy:${(18 + Math.random() * 56).toFixed(0)}px`;
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}
