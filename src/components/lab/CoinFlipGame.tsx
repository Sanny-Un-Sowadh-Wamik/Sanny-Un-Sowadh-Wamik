import { useMemo, useState } from "react";
import { burst, gauss, haptic, mulberry32 } from "@/lib/play";
import { tr, type LabProps } from "./types";

const WINDOW = 40;
const ROUNDS = 20;

/* Synthetic returns with a whisper of momentum, like a very noisy market */
function makeSeries(seed: number) {
  const rand = mulberry32(seed);
  const rets: number[] = [];
  let prev = 0;
  for (let i = 0; i < WINDOW + ROUNDS + 2; i++) {
    const r = 0.09 * prev + gauss(rand) * 0.01;
    rets.push(r);
    prev = r;
  }
  const prices = [100];
  for (const r of rets) prices.push(prices[prices.length - 1] * (1 + r));
  return { rets, prices };
}

type Round = { up: boolean; guess: boolean; model: boolean };

export function CoinFlipGame({ lang, onUnlock }: LabProps) {
  const [seed, setSeed] = useState(5);
  const { rets, prices } = useMemo(() => makeSeries(seed), [seed]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [reveal, setReveal] = useState<null | Round>(null);

  const t = WINDOW + rounds.length;
  const done = rounds.length >= ROUNDS;
  const view = prices.slice(Math.max(0, t - WINDOW + 1), t + 1 + (reveal ? 1 : 0));
  const lo = Math.min(...view);
  const hi = Math.max(...view);

  const youRight = rounds.filter((r) => r.guess === r.up).length;
  const modelRight = rounds.filter((r) => r.model === r.up).length;
  let streak = 0;
  for (let i = rounds.length - 1; i >= 0 && rounds[i].guess === rounds[i].up; i--) streak++;

  const guess = (up: boolean) => {
    if (reveal || done) return;
    const nextUp = rets[t] > 0;
    const round: Round = { up: nextUp, guess: up, model: rets[t - 1] > 0 };
    setReveal(round);
    haptic(up === nextUp ? 12 : [30, 40, 30]);
    const nextCount = rounds.length + 1;
    window.setTimeout(() => {
      setRounds((r) => [...r, round]);
      setReveal(null);
      if (nextCount === ROUNDS) {
        onUnlock("coin");
        burst(window.innerWidth / 2, window.innerHeight / 2, 30);
      }
    }, 950);
  };

  const pts = view
    .map((p, i) => `${(i / (WINDOW - 1)) * 400},${150 - ((p - lo) / (hi - lo || 1)) * 130}`)
    .join(" ");
  const lastPt = pts.split(" ").pop()?.split(",") ?? ["0", "0"];

  return (
    <div className="lab-split lab-split--even">
      <div className="coin-stage">
        <svg viewBox="0 0 400 170" role="img" aria-label={tr(lang, "Price chart. Predict the next move.", "価格チャート。次の動きを予想しよう。")}>
          <polyline points={pts} fill="none" stroke={reveal ? (reveal.up ? "#7ddc9a" : "#ff6b5e") : "#f5c518"} strokeWidth={3} strokeLinejoin="round" />
          <circle cx={lastPt[0]} cy={lastPt[1]} r={6} fill="#fff" />
        </svg>
        <div className="coin-buttons">
          <button className="coin-btn coin-btn--up" disabled={!!reveal || done} onClick={() => guess(true)}>
            ▲ {tr(lang, "UP", "上昇")}
          </button>
          <button className="coin-btn coin-btn--down" disabled={!!reveal || done} onClick={() => guess(false)}>
            ▼ {tr(lang, "DOWN", "下落")}
          </button>
        </div>
        <div className="lab-status" role="status" aria-live="polite">
          {reveal
            ? `// ${reveal.guess === reveal.up ? tr(lang, "NICE CALL", "ナイス予想") : tr(lang, "WRONG WAY", "外れ")} · ${reveal.up ? tr(lang, "it went UP", "上昇しました") : tr(lang, "it went DOWN", "下落しました")}`
            : done
              ? `// ${tr(lang, "ROUND COMPLETE", "終了")}`
              : `// ${tr(lang, "CALL", "予想")} ${rounds.length + 1}/${ROUNDS}`}
        </div>
      </div>
      <div className="lab-controls">
        <div className="lab-ctrl-title">{tr(lang, "BEAT THE COIN FLIP", "コイントスに勝て")}</div>
        <p className="lab-ctrl-desc">
          {tr(
            lang,
            "Predict whether the next day closes up or down. My real ASX model managed 51.8% against a 48.8% baseline. Markets are noisy, so see how you do.",
            "翌日が上がるか下がるかを予想。私の実際のASXモデルはベースライン48.8%に対して51.8%でした。相場はノイズだらけ。あなたはどうかな。",
          )}
        </p>
        <div className="lab-scorebar">
          <span>{tr(lang, "YOU", "あなた")}</span>
          <b>{youRight}</b>
          <span>{tr(lang, "MODEL", "モデル")}</span>
          <b>{modelRight}</b>
          <span>{tr(lang, "STREAK", "連続")}</span>
          <b>{streak}</b>
        </div>
        <div className="lab-meter" aria-hidden>
          <span style={{ width: `${(rounds.length / ROUNDS) * 100}%` }} />
        </div>
        {done && (
          <div className="fraud-summary" role="status">
            <p>
              {tr(lang, "You", "あなた")} <b>{Math.round((youRight / ROUNDS) * 100)}%</b> · {tr(lang, "model", "モデル")} <b>{Math.round((modelRight / ROUNDS) * 100)}%</b> · {tr(lang, "coin", "コイン")} <b>50%</b>
            </p>
            <p>
              {youRight > ROUNDS * 0.6
                ? tr(lang, "Suspiciously good. Check for luck before quitting your day job.", "怪しいほど好成績。仕事を辞める前に運を疑おう。")
                : youRight >= ROUNDS * 0.45
                  ? tr(lang, "About what a coin does. That is the lesson: small edges are hard.", "コインとほぼ同じ。それが教訓：小さな優位性は難しい。")
                  : tr(lang, "Worse than a coin. Markets humble everyone.", "コイン以下。相場は誰でも謙虚にします。")}
            </p>
            <p className="fraud-hint">{tr(lang, "Synthetic prices with a faint momentum signal, not real market data.", "モメンタムをわずかに含む合成データで、実際の相場データではありません。")}</p>
          </div>
        )}
        <div className="lab-btn-row">
          <button
            className="lab-btn lab-btn-primary"
            onClick={() => {
              setSeed((s) => s + 1);
              setRounds([]);
              setReveal(null);
              haptic(8);
            }}
          >
            {done ? tr(lang, "PLAY AGAIN", "もう一度") : tr(lang, "NEW MARKET", "新しい相場")}
          </button>
        </div>
      </div>
    </div>
  );
}
