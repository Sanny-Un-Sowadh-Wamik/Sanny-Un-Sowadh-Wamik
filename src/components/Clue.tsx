import type { ReactNode } from "react";
import { useClueSeen } from "@/lib/clues";

/** A very small "✦ hint" that fades in after the intro and retires once the feature has been used. */
export function Clue({ id, children, keyboard = false }: { id: string; children: ReactNode; keyboard?: boolean }) {
  const seen = useClueSeen(id);
  if (seen) return null;
  return (
    <span className={`clue ${keyboard ? "clue--kb" : ""}`}>
      <i aria-hidden className="clue-star">
        ✦
      </i>
      {children}
    </span>
  );
}

/** Wording that follows the visitor's input: hover/click for a mouse, tap for touch. */
export function Both({ mouse, touch }: { mouse: string; touch: string }) {
  return (
    <>
      <span className="for-mouse">{mouse}</span>
      <span className="for-touch">{touch}</span>
    </>
  );
}
