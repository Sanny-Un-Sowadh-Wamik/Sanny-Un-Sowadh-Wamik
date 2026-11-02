import { useEffect, useMemo, useRef, useState } from "react";
import { burst, gauss, haptic, mulberry32 } from "@/lib/play";
import { tr, type LabProps } from "./types";
import { useCanvas } from "./useCanvas";

type Pt = { x: number; y: number };

const truth = (x: number) => Math.sin(2.6 * x) * 0.9;
const MAX_DEG = 12;

function genPoints(seed: number, n: number, noise: number): Pt[] {
  const rand = mulberry32(seed);
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const x = -1 + (2 * (i + rand() * 0.8)) / n;
    pts.push({ x: Math.max(-1, Math.min(1, x)), y: truth(x) + gauss(rand) * noise });
  }
  return pts;
}

/* Chebyshev basis keeps high-degree fits numerically calm */
function basis(x: number, d: number) {
  const t = [1, x];
  for (let k = 2; k <= d; k++) t.push(2 * x * t[k - 1] - t[k - 2]);
  return t.slice(0, d + 1);
}

function fit(pts: Pt[], d: number) {
  const m = d + 1;
  const A: number[][] = Array.from({ length: m }, () => new Array(m + 1).fill(0));
  for (const p of pts) {
    const b = basis(p.x, d);
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) A[i][j] += b[i] * b[j];
      A[i][m] += b[i] * p.y;
    }
  }
  for (let i = 0; i < m; i++) A[i][i] += 1e-7;
  for (let c = 0; c < m; c++) {
    let piv = c;
    for (let r = c + 1; r < m; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
    [A[c], A[piv]] = [A[piv], A[c]];
    const div = A[c][c] || 1e-12;
    for (let j = c; j <= m; j++) A[c][j] /= div;
    for (let r = 0; r < m; r++) {
      if (r === c) continue;
      const f = A[r][c];
      if (f === 0) continue;
      for (let j = c; j <= m; j++) A[r][j] -= f * A[c][j];
    }
  }
  return A.map((row) => row[m]);
}

const predict = (c: number[], x: number) => {
  const b = basis(x, c.length - 1);
  let s = 0;
  for (let i = 0; i < c.length; i++) s += c[i] * b[i];
  return s;
};

const mse = (c: number[], pts: Pt[]) =>
  pts.reduce((s, p) => s + (predict(c, p.x) - p.y) ** 2, 0) / Math.max(1, pts.length);

export function OverfitLab({ lang, active, onUnlock }: LabProps) {
  const [seed, setSeed] = useState(11);
  const [noise, setNoise] = useState(0.28);
  const [deg, setDeg] = useState(3);
  const [extra, setExtra] = useState<Pt[]>([]);
  const [breaking, setBreaking] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const train = useMemo(() => [...genPoints(seed, 14, noise), ...extra], [seed, noise, extra]);
  const test = useMemo(() => genPoints(seed + 999, 90, noise), [seed, noise]);

  const curves = useMemo(() => {
    const out: { tr: number; te: number; c: number[] }[] = [];
    for (let d = 1; d <= MAX_DEG; d++) {
      const c = fit(train, d);
      out.push({ tr: mse(c, train), te: mse(c, test), c });
    }
    return out;
  }, [train, test]);

  const bestDeg = useMemo(
    () => curves.reduce((b, cur, i) => (cur.te < curves[b].te ? i : b), 0) + 1,
    [curves],
  );
  const cur = curves[deg - 1];
  const verdict: "under" | "good" | "over" =
    deg < bestDeg - 1 ? "under" : deg > bestDeg + 1 && cur.te > curves[bestDeg - 1].te * 1.6 ? "over" : "good";

  useEffect(() => {
    if (deg >= 10 && verdict === "over") onUnlock("overfit");
  }, [deg, verdict, onUnlock]);

  useEffect(() => () => void (timer.current && clearInterval(timer.current)), []);

  const breakIt = () => {
    if (breaking) return;
    setBreaking(true);
    setDeg(1);
    haptic(12);
    let d = 1;
    timer.current = setInterval(() => {
      d += 1;
      setDeg(d);
      haptic(5);
      if (d >= MAX_DEG && timer.current) {
        clearInterval(timer.current);
        setBreaking(false);
      }
    }, 420);
  };

  const main = useCanvas(
    (ctx, w, h) => {
      const pad = 14;
      const X = (x: number) => pad + ((x + 1) / 2) * (w - pad * 2);
      const Y = (y: number) => h / 2 - (y / 2.2) * (h / 2 - pad);
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 8; i++) {
        ctx.beginPath();
        ctx.moveTo(pad + (i / 8) * (w - pad * 2), 0);
        ctx.lineTo(pad + (i / 8) * (w - pad * 2), h);
        ctx.stroke();
      }
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const x = -1 + (i / 120) * 2;
        i ? ctx.lineTo(X(x), Y(truth(x))) : ctx.moveTo(X(x), Y(truth(x)));
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      for (const p of test) {
        ctx.beginPath();
        ctx.arc(X(p.x), Y(p.y), 2.4, 0, 7);
        ctx.fill();
      }
      ctx.strokeStyle = "#f5c518";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i <= 200; i++) {
        const x = -1 + (i / 200) * 2;
        const y = Math.max(-2.4, Math.min(2.4, predict(cur.c, x)));
        i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y));
      }
      ctx.stroke();
      for (const p of train) {
        ctx.beginPath();
        ctx.arc(X(p.x), Y(p.y), 5.5, 0, 7);
        ctx.fillStyle = "#d1342a";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
      }
    },
    [train, test, cur, active],
  );

  const chart = useCanvas(
    (ctx, w, h) => {
      const pad = 10;
      const vals = curves.flatMap((c) => [Math.log10(c.tr + 1e-4), Math.log10(c.te + 1e-4)]);
      const lo = Math.min(...vals);
      const hi = Math.min(Math.max(...vals), 1.2);
      const X = (d: number) => pad + ((d - 1) / (MAX_DEG - 1)) * (w - pad * 2);
      const Y = (v: number) => h - pad - ((Math.min(v, hi) - lo) / (hi - lo || 1)) * (h - pad * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.moveTo(X(deg), 0);
      ctx.lineTo(X(deg), h);
      ctx.stroke();
      const line = (key: "tr" | "te", color: string) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        curves.forEach((c, i) => {
          const px = X(i + 1);
          const py = Y(Math.log10(c[key] + 1e-4));
          i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        });
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(X(deg), Y(Math.log10(curves[deg - 1][key] + 1e-4)), 5, 0, 7);
        ctx.fill();
      };
      line("tr", "#7ab8ff");
      line("te", "#ff6b5e");
    },
    [curves, deg, active],
  );

  const addPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const pad = 14;
    const x = ((e.clientX - r.left - pad) / (r.width - pad * 2)) * 2 - 1;
    const y = -((e.clientY - r.top - r.height / 2) / (r.height / 2 - pad)) * 2.2;
    if (x < -1 || x > 1 || extra.length >= 14) return;
    setExtra((p) => [...p, { x, y }]);
    haptic(6);
    burst(e.clientX, e.clientY, 5);
  };

  const label =
    verdict === "under"
      ? tr(lang, "UNDERFIT — too simple to follow the curve", "未学習 — 単純すぎて曲線を追えない")
      : verdict === "over"
        ? tr(lang, "OVERFIT — it memorised the noise", "過学習 — ノイズを暗記している")
        : tr(lang, "SWEET SPOT — fits the pattern, not the noise", "ちょうど良い — ノイズでなくパターンを学習");

  return (
    <div className="lab-split">
      <div className="lab-canvas-wrap">
        <canvas ref={main.ref} onPointerDown={addPoint} style={{ touchAction: "pan-y" }} />
        <div className="lab-hint">{tr(lang, "Tap to add training points", "タップで学習データを追加")}</div>
      </div>
      <div className="lab-controls">
        <div className="lab-ctrl-title">{tr(lang, "OVERFITTING LAB", "過学習ラボ")}</div>
        <p className="lab-ctrl-desc">
          {tr(
            lang,
            "Red dots train the yellow curve. Faint dots are hidden test data. Raise the degree and watch training error fall while test error blows up.",
            "赤い点が黄色い曲線を学習します。薄い点は隠しテストデータ。次数を上げると学習誤差は下がるのに、テスト誤差は跳ね上がります。",
          )}
        </p>
        <div className="lab-slider-row">
          <label>{tr(lang, "DEGREE", "次数")}</label>
          <input
            type="range"
            min={1}
            max={MAX_DEG}
            value={deg}
            aria-label={tr(lang, "Model degree", "モデルの次数")}
            className="lab-range"
            onChange={(e) => {
              setDeg(Number(e.target.value));
              haptic(4);
            }}
          />
          <span className="lab-kval">{deg}</span>
        </div>
        <div className="lab-slider-row">
          <label>{tr(lang, "NOISE", "ノイズ")}</label>
          <input
            type="range"
            min={0.05}
            max={0.6}
            step={0.01}
            value={noise}
            aria-label={tr(lang, "Noise level", "ノイズの強さ")}
            className="lab-range"
            onChange={(e) => setNoise(Number(e.target.value))}
          />
          <span className="lab-kval">{noise.toFixed(2)}</span>
        </div>
        <div className="lab-chart-wrap">
          <canvas ref={chart.ref} aria-label={tr(lang, "Training and test error by degree", "次数ごとの学習・テスト誤差")} />
        </div>
        <div className="lab-legend">
          <span style={{ color: "#7ab8ff" }}>■ {tr(lang, "train error", "学習誤差")}</span>
          <span style={{ color: "#ff6b5e" }}>■ {tr(lang, "test error", "テスト誤差")}</span>
        </div>
        <div className={`lab-status lab-status--${verdict}`} role="status">
          {label}
        </div>
        <div className="lab-btn-row">
          <button className="lab-btn lab-btn-primary" onClick={breakIt} disabled={breaking}>
            {tr(lang, "BREAK IT", "壊す")}
          </button>
          <button
            className="lab-btn"
            onClick={() => {
              setSeed((s) => s + 1);
              setExtra([]);
              haptic(8);
            }}
          >
            {tr(lang, "NEW DATA", "新データ")}
          </button>
        </div>
      </div>
    </div>
  );
}
