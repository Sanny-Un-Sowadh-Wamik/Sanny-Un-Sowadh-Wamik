import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { burst, gauss, haptic, mulberry32 } from "@/lib/play";
import { tr, type LabProps } from "./types";
import { useCanvas } from "./useCanvas";

type Sample = { x: number; y: number; t: 0 | 1 };
type DatasetId = "circle" | "xor" | "moons" | "spiral";

const DATASETS: { id: DatasetId; en: string; jp: string }[] = [
  { id: "circle", en: "Circle", jp: "円" },
  { id: "xor", en: "XOR", jp: "XOR" },
  { id: "moons", en: "Moons", jp: "月" },
  { id: "spiral", en: "Spiral", jp: "渦巻き" },
];

function makeData(id: DatasetId, seed: number): Sample[] {
  const rand = mulberry32(seed);
  const out: Sample[] = [];
  const n = 90;
  const j = () => gauss(rand) * 0.06;
  for (let i = 0; i < n; i++) {
    if (id === "circle") {
      const a = rand() * Math.PI * 2;
      out.push({ x: Math.cos(a) * 0.35 * rand() + j(), y: Math.sin(a) * 0.35 * rand() + j(), t: 1 });
      const b = rand() * Math.PI * 2;
      const r = 0.7 + rand() * 0.25;
      out.push({ x: Math.cos(b) * r + j(), y: Math.sin(b) * r + j(), t: 0 });
    } else if (id === "xor") {
      const sx = rand() < 0.5 ? -1 : 1;
      const sy = rand() < 0.5 ? -1 : 1;
      out.push({ x: sx * (0.12 + rand() * 0.8) + j(), y: sy * (0.12 + rand() * 0.8) + j(), t: sx * sy > 0 ? 1 : 0 });
      out.push({ x: -sx * (0.12 + rand() * 0.8) + j(), y: sy * (0.12 + rand() * 0.8) + j(), t: -sx * sy > 0 ? 1 : 0 });
    } else if (id === "moons") {
      const a = rand() * Math.PI;
      out.push({ x: Math.cos(a) * 0.6 - 0.15 + j(), y: Math.sin(a) * 0.6 - 0.15 + j(), t: 1 });
      const b = rand() * Math.PI;
      out.push({ x: 0.15 + Math.cos(b) * 0.6 + j(), y: 0.15 - Math.sin(b) * 0.6 + j(), t: 0 });
    } else {
      const r = (i / n) * 0.9 + 0.05;
      const a = (i / n) * 3.2 * Math.PI;
      out.push({ x: Math.cos(a) * r + j(), y: Math.sin(a) * r + j(), t: 1 });
      out.push({ x: Math.cos(a + Math.PI) * r + j(), y: Math.sin(a + Math.PI) * r + j(), t: 0 });
    }
  }
  return out;
}

/* A one-hidden-layer MLP trained with Adam. Tiny, but a real network. */
class Net {
  H: number;
  P: Float64Array;
  m: Float64Array;
  v: Float64Array;
  t = 0;
  constructor(H: number, seed: number) {
    this.H = H;
    const n = 4 * H + 1;
    this.P = new Float64Array(n);
    this.m = new Float64Array(n);
    this.v = new Float64Array(n);
    const rand = mulberry32(seed);
    for (let i = 0; i < 2 * H; i++) this.P[i] = gauss(rand) * 0.9;
    for (let i = 3 * H; i < 4 * H; i++) this.P[i] = gauss(rand) * 0.5;
  }
  forward(x: number, y: number) {
    const { H, P } = this;
    let z = P[4 * H];
    for (let h = 0; h < H; h++) z += P[3 * H + h] * Math.tanh(P[2 * h] * x + P[2 * h + 1] * y + P[2 * H + h]);
    return 1 / (1 + Math.exp(-z));
  }
  step(data: Sample[], lr: number) {
    const { H, P } = this;
    const G = new Float64Array(P.length);
    const A = new Float64Array(H);
    let loss = 0;
    let correct = 0;
    for (const s of data) {
      let z = P[4 * H];
      for (let h = 0; h < H; h++) {
        A[h] = Math.tanh(P[2 * h] * s.x + P[2 * h + 1] * s.y + P[2 * H + h]);
        z += P[3 * H + h] * A[h];
      }
      const p = 1 / (1 + Math.exp(-z));
      loss -= s.t * Math.log(p + 1e-9) + (1 - s.t) * Math.log(1 - p + 1e-9);
      if (p > 0.5 === (s.t === 1)) correct++;
      const dz = p - s.t;
      G[4 * H] += dz;
      for (let h = 0; h < H; h++) {
        G[3 * H + h] += dz * A[h];
        const d1 = dz * P[3 * H + h] * (1 - A[h] * A[h]);
        G[2 * h] += d1 * s.x;
        G[2 * h + 1] += d1 * s.y;
        G[2 * H + h] += d1;
      }
    }
    this.t++;
    const n = data.length;
    for (let i = 0; i < P.length; i++) {
      const g = G[i] / n;
      this.m[i] = 0.9 * this.m[i] + 0.1 * g;
      this.v[i] = 0.999 * this.v[i] + 0.001 * g * g;
      const mh = this.m[i] / (1 - 0.9 ** this.t);
      const vh = this.v[i] / (1 - 0.999 ** this.t);
      P[i] -= (lr * mh) / (Math.sqrt(vh) + 1e-8);
    }
    return { loss: loss / n, acc: correct / n };
  }
}

const LR_STEPS = [0.003, 0.006, 0.012, 0.025, 0.05, 0.1];

export function NeuralLab({ lang, active, onUnlock }: LabProps) {
  const [ds, setDs] = useState<DatasetId>("circle");
  const [seed, setSeed] = useState(3);
  const [hidden, setHidden] = useState(6);
  const [lrIdx, setLrIdx] = useState(3);
  const [playing, setPlaying] = useState(true);
  const [stats, setStats] = useState({ epoch: 0, loss: 0.7, acc: 0.5 });
  const [won, setWon] = useState(false);

  const data = useMemo(() => makeData(ds, seed), [ds, seed]);
  const net = useRef<Net>(new Net(hidden, 1));
  const epoch = useRef(0);
  const last = useRef({ loss: 0.7, acc: 0.5 });

  const reset = useCallback(() => {
    net.current = new Net(hidden, seed * 7 + hidden);
    epoch.current = 0;
    last.current = { loss: 0.7, acc: 0.5 };
    setStats({ epoch: 0, loss: 0.7, acc: 0.5 });
    setWon(false);
  }, [hidden, seed]);

  useEffect(() => reset(), [reset, ds]);

  const cv = useCanvas(
    (ctx, w, h) => {
      const res = w < 420 ? 28 : 40;
      const cw = w / res;
      const ch = h / res;
      const n = net.current;
      for (let i = 0; i < res; i++) {
        for (let j = 0; j < res; j++) {
          const x = ((i + 0.5) / res) * 2 - 1;
          const y = 1 - ((j + 0.5) / res) * 2;
          const p = n.forward(x, y);
          const r = Math.round(p * 209 + (1 - p) * 111);
          const g = Math.round(p * 52 + (1 - p) * 168);
          const b = Math.round(p * 42 + (1 - p) * 220);
          ctx.fillStyle = `rgba(${r},${g},${b},${0.2 + Math.abs(p - 0.5) * 0.9})`;
          ctx.fillRect(i * cw, j * ch, cw + 0.6, ch + 0.6);
        }
      }
      for (const s of data) {
        ctx.beginPath();
        ctx.arc(((s.x + 1) / 2) * w, ((1 - s.y) / 2) * h, 4.6, 0, 7);
        ctx.fillStyle = s.t ? "#d1342a" : "#6fa8dc";
        ctx.fill();
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
      }
    },
    [data, active],
  );

  const repaintRef = useRef(cv.repaint);
  repaintRef.current = cv.repaint;

  useEffect(() => {
    if (!active || !playing) return;
    let raf = 0;
    let frame = 0;
    const loop = () => {
      const lr = LR_STEPS[lrIdx];
      for (let k = 0; k < 8; k++) last.current = net.current.step(data, lr);
      epoch.current += 8;
      repaintRef.current();
      if (++frame % 6 === 0) setStats({ epoch: epoch.current, loss: last.current.loss, acc: last.current.acc });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, playing, data, lrIdx]);

  useEffect(() => {
    if (!won && stats.acc >= 0.95 && stats.epoch >= 40) {
      setWon(true);
      haptic([20, 40, 20]);
      burst(window.innerWidth / 2, window.innerHeight / 2, 40);
      onUnlock("neural");
    }
  }, [stats, won, onUnlock]);

  return (
    <div className="lab-split">
      <div className="lab-canvas-wrap">
        <canvas ref={cv.ref} style={{ touchAction: "pan-y" }} />
        <div className="lab-hint">
          {tr(lang, "Red vs blue: the network is drawing the boundary", "赤と青：ネットワークが境界線を描いています")}
        </div>
      </div>
      <div className="lab-controls">
        <div className="lab-ctrl-title">{tr(lang, "TRAIN A NEURAL NET", "ニューラルネットを育てる")}</div>
        <p className="lab-ctrl-desc">
          {tr(
            lang,
            "A real network, learning in your browser. Pick a puzzle, add neurons, and watch the boundary bend around the dots. Reach 95% to catch this one.",
            "ブラウザ内で本当に学習するネットワーク。パズルを選び、ニューロンを増やして境界が点に沿って曲がる様子を見よう。精度95%で達成。",
          )}
        </p>
        <div className="lab-chips" role="group" aria-label={tr(lang, "Puzzle", "パズル")}>
          {DATASETS.map((d) => (
            <button
              key={d.id}
              className={`lab-chip ${ds === d.id ? "on" : ""}`}
              aria-pressed={ds === d.id}
              onClick={() => {
                setDs(d.id);
                haptic(8);
              }}
            >
              {tr(lang, d.en, d.jp)}
            </button>
          ))}
        </div>
        <div className="lab-slider-row">
          <label>{tr(lang, "NEURONS", "ニューロン")}</label>
          <input
            type="range"
            min={2}
            max={16}
            value={hidden}
            aria-label={tr(lang, "Hidden neurons", "隠れ層のニューロン数")}
            className="lab-range"
            onChange={(e) => setHidden(Number(e.target.value))}
          />
          <span className="lab-kval">{hidden}</span>
        </div>
        <div className="lab-slider-row">
          <label>{tr(lang, "SPEED", "学習率")}</label>
          <input
            type="range"
            min={0}
            max={LR_STEPS.length - 1}
            value={lrIdx}
            aria-label={tr(lang, "Learning rate", "学習率")}
            className="lab-range"
            onChange={(e) => setLrIdx(Number(e.target.value))}
          />
          <span className="lab-kval">{LR_STEPS[lrIdx]}</span>
        </div>
        <div className="lab-meter" aria-hidden>
          <span style={{ width: `${Math.round(stats.acc * 100)}%` }} />
        </div>
        <div className="lab-status" role="status">
          {`// ${tr(lang, "EPOCH", "エポック")} ${stats.epoch} · ${tr(lang, "LOSS", "損失")} ${stats.loss.toFixed(3)} · ${tr(lang, "ACC", "精度")} ${Math.round(stats.acc * 100)}%`}
          {won ? ` · ${tr(lang, "CAUGHT!", "ゲット！")}` : ""}
        </div>
        <div className="lab-btn-row">
          <button className="lab-btn lab-btn-primary" onClick={() => setPlaying((p) => !p)}>
            {playing ? tr(lang, "PAUSE", "一時停止") : tr(lang, "TRAIN ▶", "学習 ▶")}
          </button>
          <button
            className="lab-btn"
            onClick={() => {
              setSeed((s) => s + 1);
              haptic(8);
            }}
          >
            {tr(lang, "RESET", "リセット")}
          </button>
        </div>
      </div>
    </div>
  );
}
