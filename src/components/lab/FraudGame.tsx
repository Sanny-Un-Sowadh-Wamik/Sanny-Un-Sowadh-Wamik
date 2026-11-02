import { useMemo, useRef, useState } from "react";
import { burst, gauss, haptic, mulberry32 } from "@/lib/play";
import { tr, type Lang, type LabProps } from "./types";

type Tx = {
  id: number;
  amount: number;
  hour: number;
  km: number;
  vel: number;
  isNew: boolean;
  foreign: boolean;
  fraud: boolean;
  risk: number;
  reasons: string[];
};

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

const REASONS: Record<string, { en: string; jp: string }> = {
  amount: { en: "High amount", jp: "高額" },
  night: { en: "Late night", jp: "深夜" },
  km: { en: "Far from home", jp: "自宅から遠い" },
  vel: { en: "Rapid-fire", jp: "短時間に連続" },
  isNew: { en: "New merchant", jp: "初めての店" },
  foreign: { en: "Foreign card use", jp: "海外利用" },
};

function makeTx(rand: () => number, id: number, fraud: boolean): Tx {
  const amount = Math.exp((fraud ? 4.7 : 3.7) + gauss(rand) * (fraud ? 1.0 : 0.9));
  const hour = fraud && rand() < 0.6 ? Math.floor(rand() * 6) : 7 + Math.floor(rand() * 16);
  const km = -Math.log(1 - rand() * 0.999) * (fraud ? 150 : 16);
  const vel = fraud ? 2 + Math.floor(rand() * 5) : 1 + Math.floor(rand() * 2);
  const isNew = rand() < (fraud ? 0.75 : 0.18);
  const foreign = rand() < (fraud ? 0.45 : 0.04);
  const c: Record<string, number> = {
    amount: 0.85 * (Math.log(amount) - 3.9),
    night: hour < 6 ? 1.3 : 0,
    km: 0.75 * Math.log1p(km / 45),
    vel: 0.5 * (vel - 1),
    isNew: isNew ? 0.9 : 0,
    foreign: foreign ? 0.9 : 0,
  };
  const z = -2.8 + Object.values(c).reduce((a, b) => a + b, 0) + gauss(rand) * 1.05;
  const reasons = Object.entries(c)
    .filter(([, v]) => v > 0.45 && sigmoid(z) > 0.3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => k);
  return { id, amount, hour, km, vel, isNew, foreign, fraud, risk: sigmoid(z), reasons };
}

function makeDeck(seed: number): Tx[] {
  const rand = mulberry32(seed);
  const deck: Tx[] = [];
  for (let i = 0; i < 12; i++) deck.push(makeTx(rand, i, i < 4));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const clock = (h: number) => `${String(h).padStart(2, "0")}:${String(Math.floor((h * 37) % 60)).padStart(2, "0")}`;

type Answer = { tx: Tx; flagged: boolean };

export function FraudGame({ lang, active, onUnlock }: LabProps) {
  const [mode, setMode] = useState<"play" | "tune">("play");
  const [seed, setSeed] = useState(21);
  const deck = useMemo(() => makeDeck(seed), [seed]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [dx, setDx] = useState(0);
  const [drag, setDrag] = useState(false);
  const [flying, setFlying] = useState<null | "left" | "right">(null);
  const start = useRef(0);
  const dxRef = useRef(0);
  const idx = answers.length;
  const done = idx >= deck.length;
  const card = deck[idx];
  const last = answers[answers.length - 1];

  const decide = (flagged: boolean) => {
    if (done || flying) return;
    setFlying(flagged ? "right" : "left");
    haptic(flagged ? [14, 30, 14] : 10);
    window.setTimeout(() => {
      const next = [...answers, { tx: card, flagged }];
      setAnswers(next);
      setFlying(null);
      setDx(0);
      const right = flagged === card.fraud;
      if (!right) haptic([40, 40, 40]);
      if (next.length === deck.length) {
        onUnlock("fraud");
        burst(window.innerWidth / 2, window.innerHeight / 2, 34);
      }
    }, 260);
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (flying) return;
    start.current = e.clientX;
    dxRef.current = 0;
    setDrag(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety; dragging still works without it */
    }
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    dxRef.current = e.clientX - start.current;
    setDx(dxRef.current);
  };
  const onUp = () => {
    if (!drag) return;
    setDrag(false);
    const d = dxRef.current;
    dxRef.current = 0;
    if (Math.abs(d) > 90) decide(d > 0);
    else setDx(0);
  };

  const youRight = answers.filter((a) => a.flagged === a.tx.fraud).length;
  const modelRight = answers.filter((a) => (a.tx.risk > 0.5) === a.tx.fraud).length;

  const reasonText = (tx: Tx, l: Lang) =>
    tx.reasons.length ? tx.reasons.map((r) => REASONS[r][l]).join(" · ") : tr(l, "Nothing unusual", "特に異常なし");

  return (
    <div className="game">
      <div className="lab-chips" role="tablist" aria-label={tr(lang, "Fraud lab mode", "モード")}>
        <button className={`lab-chip ${mode === "play" ? "on" : ""}`} role="tab" aria-selected={mode === "play"} onClick={() => setMode("play")}>
          {tr(lang, "Play: beat the model", "対戦：モデルに勝て")}
        </button>
        <button className={`lab-chip ${mode === "tune" ? "on" : ""}`} role="tab" aria-selected={mode === "tune"} onClick={() => setMode("tune")}>
          {tr(lang, "Tune the threshold", "しきい値を調整")}
        </button>
      </div>

      {mode === "play" ? (
        <div className="lab-split lab-split--even">
          <div className="fraud-stage">
            {!done ? (
              <>
                <div className="fraud-progress" aria-hidden>
                  {deck.map((_, i) => (
                    <span key={i} className={i < idx ? "done" : i === idx ? "now" : ""} />
                  ))}
                </div>
                <div
                  className={`fraud-card ${flying ? `fly-${flying}` : ""} ${drag ? "dragging" : ""}`}
                  style={!flying ? { transform: `translateX(${dx}px) rotate(${dx / 22}deg)` } : undefined}
                  tabIndex={active ? 0 : -1}
                  role="group"
                  aria-label={tr(lang, "Transaction card. Arrow keys: left approve, right flag.", "取引カード。左キーで承認、右キーで不正報告。")}
                  onPointerDown={onDown}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onPointerCancel={onUp}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") decide(false);
                    if (e.key === "ArrowRight") decide(true);
                  }}
                >
                  <span className="fraud-stamp fraud-stamp--ok" style={{ opacity: Math.max(0, -dx / 90) }}>
                    {tr(lang, "APPROVE", "承認")}
                  </span>
                  <span className="fraud-stamp fraud-stamp--bad" style={{ opacity: Math.max(0, dx / 90) }}>
                    {tr(lang, "FRAUD", "不正")}
                  </span>
                  <div className="fraud-amount">{money(card.amount)}</div>
                  <ul className="fraud-facts">
                    <li>{tr(lang, "Time", "時刻")} <b>{clock(card.hour)}</b></li>
                    <li>{tr(lang, "Distance from home", "自宅からの距離")} <b>{Math.round(card.km)} km</b></li>
                    <li>{tr(lang, "Purchases in the last hour", "直近1時間の購入")} <b>{card.vel}</b></li>
                    <li>{tr(lang, "Merchant", "店")} <b>{card.isNew ? tr(lang, "first time", "初めて") : tr(lang, "usual", "いつもの")}</b></li>
                    <li>{tr(lang, "Card", "カード")} <b>{card.foreign ? tr(lang, "used abroad", "海外利用") : tr(lang, "domestic", "国内")}</b></li>
                  </ul>
                </div>
                <div className="lab-btn-row">
                  <button className="lab-btn" onClick={() => decide(false)}>
                    ← {tr(lang, "APPROVE", "承認")}
                  </button>
                  <button className="lab-btn lab-btn-primary" onClick={() => decide(true)}>
                    {tr(lang, "FLAG", "不正")} →
                  </button>
                </div>
                <p className="fraud-hint">{tr(lang, "Swipe the card, or use the buttons. This deck is rigged: 1 in 3 is fraud.", "カードをスワイプ、またはボタンで。このデッキは3枚に1枚が不正です。")}</p>
              </>
            ) : (
              <div className="fraud-summary" role="status">
                <div className="fraud-score">
                  <div>
                    <b>{youRight}/12</b>
                    <span>{tr(lang, "YOU", "あなた")}</span>
                  </div>
                  <div>
                    <b>{modelRight}/12</b>
                    <span>{tr(lang, "MODEL", "モデル")}</span>
                  </div>
                </div>
                <p>
                  {youRight > modelRight
                    ? tr(lang, "You beat the model. Humans still have it.", "モデルに勝利！人間もまだやれる。")
                    : youRight === modelRight
                      ? tr(lang, "A tie with the model. Respectable.", "モデルと引き分け。立派です。")
                      : tr(lang, "The model wins this round. Try again?", "今回はモデルの勝ち。もう一度？")}
                </p>
                <button
                  className="lab-btn lab-btn-primary"
                  onClick={() => {
                    setSeed((s) => s + 1);
                    setAnswers([]);
                    setDx(0);
                  }}
                >
                  {tr(lang, "NEW DECK", "新しいデッキ")}
                </button>
              </div>
            )}
          </div>
          <div className="lab-controls">
            <div className="lab-ctrl-title">{tr(lang, "BEAT THE FRAUD MODEL", "不正検知モデルに勝て")}</div>
            <p className="lab-ctrl-desc">
              {tr(
                lang,
                "My real project catches 85.9% of fraud at 84.7% precision. Here you play the analyst: decide, then see the model's risk score and the reasons it gave.",
                "実際のプロジェクトは不正の85.9%を適合率84.7%で検出します。ここではあなたがアナリスト。判定したら、モデルのリスクスコアと理由が見られます。",
              )}
            </p>
            <div className="lab-status" role="status" aria-live="polite">
              {last
                ? `// ${last.flagged === last.tx.fraud ? tr(lang, "CORRECT", "正解") : tr(lang, "MISSED", "外れ")} · ${last.tx.fraud ? tr(lang, "it was FRAUD", "不正でした") : tr(lang, "it was LEGIT", "正常でした")} · ${tr(lang, "model risk", "モデルのリスク")} ${Math.round(last.tx.risk * 100)}%`
                : `// ${tr(lang, "READY", "準備完了")}`}
            </div>
            {last && (
              <div className="fraud-reason">
                {tr(lang, "Model says:", "モデルの見解：")} {reasonText(last.tx, lang)}
              </div>
            )}
            <div className="lab-scorebar">
              <span>{tr(lang, "YOU", "あなた")}</span>
              <b>{youRight}</b>
              <span>{tr(lang, "MODEL", "モデル")}</span>
              <b>{modelRight}</b>
            </div>
          </div>
        </div>
      ) : (
        <Tuner lang={lang} />
      )}
    </div>
  );
}

function Tuner({ lang }: { lang: Lang }) {
  const [thr, setThr] = useState(0.5);
  const set = useMemo(() => {
    const rand = mulberry32(404);
    return Array.from({ length: 500 }, (_, i) => makeTx(rand, i, i < 50));
  }, []);

  const m = useMemo(() => {
    let tp = 0, fp = 0, fn = 0, tn = 0;
    for (const t of set) {
      const flag = t.risk > thr;
      if (flag && t.fraud) tp++;
      else if (flag) fp++;
      else if (t.fraud) fn++;
      else tn++;
    }
    const precision = tp + fp ? tp / (tp + fp) : 1;
    const recall = tp + fn ? tp / (tp + fn) : 0;
    const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
    return { tp, fp, fn, tn, precision, recall, f1, cost: fn * 100 + fp * 5 };
  }, [set, thr]);

  const bins = useMemo(() => {
    const b = Array.from({ length: 20 }, () => ({ legit: 0, fraud: 0 }));
    for (const t of set) b[Math.min(19, Math.floor(t.risk * 20))][t.fraud ? "fraud" : "legit"]++;
    return b;
  }, [set]);
  const maxBin = Math.max(...bins.map((b) => Math.max(b.legit, b.fraud)), 1);

  return (
    <div className="lab-split lab-split--even">
      <div className="tuner-chart">
        <svg viewBox="0 0 400 190" role="img" aria-label={tr(lang, "Risk score distribution for legit and fraud transactions", "正常と不正のリスクスコア分布")}>
          {bins.map((b, i) => {
            const hl = (Math.sqrt(b.legit) / Math.sqrt(maxBin)) * 150;
            const hf = (Math.sqrt(b.fraud) / Math.sqrt(maxBin)) * 150;
            return (
              <g key={i}>
                <rect x={i * 20 + 1} y={170 - hl} width={18} height={hl} fill="#f5c518" opacity={0.85} />
                <rect x={i * 20 + 4} y={170 - hf} width={12} height={hf} fill="#d1342a" />
              </g>
            );
          })}
          <line x1={thr * 400} x2={thr * 400} y1={6} y2={172} stroke="#fff" strokeWidth={2.5} strokeDasharray="5 4" />
          <text x={Math.min(Math.max(thr * 400, 40), 360)} y={186} fill="#fff" fontSize={11} textAnchor="middle" fontFamily="monospace">
            {tr(lang, "threshold", "しきい値")} {thr.toFixed(2)}
          </text>
        </svg>
        <div className="lab-legend">
          <span style={{ color: "#f5c518" }}>■ {tr(lang, "legit (450)", "正常 (450)")}</span>
          <span style={{ color: "#ff6b5e" }}>■ {tr(lang, "fraud (50)", "不正 (50)")}</span>
        </div>
      </div>
      <div className="lab-controls">
        <div className="lab-ctrl-title">{tr(lang, "TUNE THE THRESHOLD", "しきい値を調整")}</div>
        <p className="lab-ctrl-desc">
          {tr(
            lang,
            "Flag anything above the line. Slide it left and you catch more fraud but annoy more customers. Slide right and the reverse. Real systems trade these off with money.",
            "線より上を不正と判定します。左へ動かすと不正を多く捕まえますが、正常な客も止めます。右はその逆。実際のシステムはお金でこのバランスを決めます。",
          )}
        </p>
        <div className="lab-slider-row">
          <label>{tr(lang, "THRESHOLD", "しきい値")}</label>
          <input
            type="range"
            min={0.05}
            max={0.95}
            step={0.01}
            value={thr}
            aria-label={tr(lang, "Flagging threshold", "判定のしきい値")}
            className="lab-range"
            onChange={(e) => {
              setThr(Number(e.target.value));
              haptic(3);
            }}
          />
          <span className="lab-kval">{thr.toFixed(2)}</span>
        </div>
        <div className="confusion" role="table" aria-label={tr(lang, "Confusion matrix", "混同行列")}>
          <div className="cm cm--good"><b>{m.tp}</b><span>{tr(lang, "frauds caught", "捕まえた不正")}</span></div>
          <div className="cm cm--bad"><b>{m.fp}</b><span>{tr(lang, "false alarms", "誤検知")}</span></div>
          <div className="cm cm--bad"><b>{m.fn}</b><span>{tr(lang, "frauds missed", "見逃した不正")}</span></div>
          <div className="cm cm--good"><b>{m.tn}</b><span>{tr(lang, "legit passed", "正常を通過")}</span></div>
        </div>
        <div className="lab-readout">
          <div className="lab-readout-row"><span>{tr(lang, "PRECISION", "適合率")}</span><b>{Math.round(m.precision * 100)}%</b></div>
          <div className="lab-readout-row"><span>{tr(lang, "RECALL", "再現率")}</span><b>{Math.round(m.recall * 100)}%</b></div>
          <div className="lab-readout-row"><span>F1</span><b>{m.f1.toFixed(2)}</b></div>
          <div className="lab-readout-row"><span>{tr(lang, "COST*", "コスト*")}</span><b>${m.cost.toLocaleString()}</b></div>
        </div>
        <p className="fraud-hint">{tr(lang, "*Illustrative: $100 per missed fraud, $5 per false alarm.", "*例示：不正の見逃し1件$100、誤検知1件$5。")}</p>
      </div>
    </div>
  );
}
