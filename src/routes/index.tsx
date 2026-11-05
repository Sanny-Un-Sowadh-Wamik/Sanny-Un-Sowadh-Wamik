import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import faviconAsset from "@/assets/favicon.png.asset.json";
import { burst, haptic, mulberry32, reducedMotion, spark } from "@/lib/play";
import { FraudGame } from "@/components/lab/FraudGame";
import { OverfitLab } from "@/components/lab/OverfitLab";
import { NeuralLab } from "@/components/lab/NeuralLab";
import { CoinFlipGame } from "@/components/lab/CoinFlipGame";
import { DexPanel } from "@/components/lab/DexPanel";
import { DEX, dexName, useDex } from "@/components/lab/dex";
import { Both, Clue } from "@/components/Clue";
import { clueSeen, dismissClue } from "@/lib/clues";

const heroDesktop = { url: "/hero.mp4" };
const heroMobile = { url: "/hero.mp4" };
const avatarAsset = { url: "/avatar.png" };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sanny Un Sowadh Wamik — Data Scientist Portfolio" },
      { name: "description", content: "Final-year RMIT Data Science student building production ML systems — XGBoost, LSTM, MLflow, FastAPI, Docker. Live projects with measurable metrics." },
      { property: "og:title", content: "Sanny Un Sowadh Wamik — Data Scientist" },
      { property: "og:description", content: "ML · MLOps · Data Science · Melbourne. RMIT '27." },
    ],
  }),
  component: Portfolio,
});

/* ────────────────────────────────────────────────────────────────
   Bilingual content
   ──────────────────────────────────────────────────────────────── */

type Lang = "en" | "jp";
type Bi = { en: string; jp: string };
const T = (l: Lang, b: Bi) => b[l];

const STATS = [
  { v: "21", l: { en: "Repos", jp: "リポジトリ" } },
  { v: "10+", l: { en: "ML Models", jp: "MLモデル" } },
  { v: "5+", l: { en: "Languages", jp: "分析言語" } },
  { v: "18", l: { en: "Public PJ", jp: "公開PJ" } },
];

const SKILLS = [
  { t: { en: "Languages", jp: "言語" }, body: "Python · SQL · R", pct: 95 },
  {
    t: { en: "Machine Learning", jp: "機械学習" },
    body: "XGBoost · LightGBM · LSTM · Time-Series · SMOTE · PCA · A/B Testing",
    pct: 92,
  },
  {
    t: { en: "ML Tooling & MLOps", jp: "MLツール ＆ MLOps" },
    body: "scikit-learn · Optuna · SHAP · MLflow · FastAPI · Docker · GitHub Actions · WebSockets",
    pct: 90,
  },
  {
    t: { en: "Data & Big Data", jp: "データ ＆ ビッグデータ" },
    body: "pandas · NumPy · Spark · Hadoop · PostgreSQL · Supabase · GeoPandas · ETL/ELT",
    pct: 86,
  },
  {
    t: { en: "Visualisation", jp: "可視化" },
    body: "Power BI · Tableau · Streamlit · Plotly · Matplotlib · Seaborn",
    pct: 88,
  },
  {
    t: { en: "Workflow", jp: "ワークフロー" },
    body: "Git · Jupyter · Linux · pytest · n8n",
    pct: 90,
  },
];

type Project = {
  num: string;
  tag: string;
  title: Bi;
  body: Bi;
  metric: string;
  links: { label: string; href: string }[];
  featured?: boolean;
};

const FEATURED: Project[] = [
  {
    num: "01",
    tag: "PYTHON · XGBOOST · LSTM · MLFLOW · FASTAPI",
    title: {
      en: "Stock-Price Forecasting — MLOps",
      jp: "株価予測プラットフォーム — MLOps",
    },
    body: {
      en: "Beat ARIMA & a coin-flip on next-day ASX direction (51.8% vs 48.8%) with engineered RSI/MACD/Bollinger features and leakage-free walk-forward CV across 10 equities (18,460 samples). Served via a FastAPI /predict endpoint + Streamlit, MLflow registry, pytest & GitHub Actions CI — running live.",
      jp: "次の日のASX騰落をARIMA・ランダムウォークに勝る精度で予測（51.8% 対 48.8%）。RSI/MACD/ボリンジャー特徴量とリーク防止のウォークフォワード検証を10銘柄（18,460サンプル）に適用。FastAPI /predict＋Streamlit、MLflowレジストリ、pytest、GitHub Actions CIでライブ稼働。",
    },
    metric: "51.8% DIR. ACCURACY",
    links: [
      { label: "Live ↗", href: "https://sanny2005-asx-stock-forecaster.hf.space/" },
      { label: "API ↗", href: "https://sanny2005-asx-forecaster-api.hf.space/docs" },
      { label: "Code ↗", href: "https://github.com/Sanny-Un-Sowadh-Wamik/stock-forecasting-mlops" },
    ],
    featured: true,
  },
  {
    num: "02",
    tag: "PYTHON · XGBOOST · SMOTE · SHAP · FASTAPI WS",
    title: {
      en: "Real-Time Credit-Card Fraud Detection",
      jp: "リアルタイム不正検知",
    },
    body: {
      en: "Caught 85.9% of fraud at 84.7% precision (PR-AUC 0.88, ROC-AUC 0.99) on 284,807 transactions (0.17% fraud) with a cost-sensitive XGBoost + Isolation Forest ensemble and train-only SMOTE. SHAP reason codes streamed live over a FastAPI WebSocket.",
      jp: "284,807件（不正0.17%）の不均衡データで不正の85.9%を84.7%の適合率で検出（PR-AUC 0.88, ROC-AUC 0.99）。コスト考慮型XGBoost＋Isolation Forestのアンサンブルと学習foldのみのSMOTE。SHAP理由コードをFastAPI WebSocketでライブ配信し Alert / Review / OK に分類。",
    },
    metric: "PR-AUC 0.88 · ROC-AUC 0.99",
    links: [
      { label: "Live ↗", href: "https://sanny2005-realtime-fraud-detection.hf.space/" },
      { label: "API ↗", href: "https://sanny2005-fraud-detection-api.hf.space/docs" },
      { label: "Code ↗", href: "https://github.com/Sanny-Un-Sowadh-Wamik/realtime-fraud-detection" },
    ],
  },
  {
    num: "03",
    tag: "PYTHON · GEOPANDAS · PCA · FOLIUM · STREAMLIT",
    title: {
      en: "Melbourne Suburb Liveability Index",
      jp: "メルボルン居住性指数",
    },
    body: {
      en: "Ranked 260 Greater-Melbourne suburbs on an 8-dimension liveability score — real suburb-boundary geometry (GeoPandas, Vicgrid) with PCA setting the weights (PC1 = 42% of variance). An interactive Folium choropleth re-scores as you move the sliders.",
      jp: "グレーター・メルボルンの260郊外を8次元の居住性スコアでランク付け。実際の郊外境界ジオメトリ（GeoPandas, Vicgrid）に、手動ではなくPCAで重みを設定（PC1=分散の42%）。スライダー操作で再スコアするインタラクティブなFolium階級区分図として公開。",
    },
    metric: "260 SUBURBS · PCA",
    links: [
      { label: "Live ↗", href: "https://sanny2005-melbourne-liveability.hf.space/" },
      { label: "Code ↗", href: "https://github.com/Sanny-Un-Sowadh-Wamik/melbourne-liveability" },
    ],
  },
  {
    num: "04",
    tag: "NEXT.JS 14 · TYPESCRIPT · APIFY · CLAUDE API",
    title: { en: "Vaultr — AI Cashback Engine", jp: "Vaultr — AIキャッシュバック" },
    body: {
      en: "An /api/cashback service that pulls live offers from five vetted Australian networks via Apify, runs a Claude pass to drop untrusted sources, and ranks what's left by the user's own spending — with three fallback tiers so the feed always loads.",
      jp: "/api/cashback サービスがApify経由で厳選した5つの豪州ネットワークからライブのオファーを取得し、Claudeで信頼できないソースを除外、ユーザー自身の支出でランク付け。キーが欠けてもフィードが読み込まれる3段階のフォールバック付き。",
    },
    metric: "AI CASHBACK ENGINE",
    links: [{ label: "Code ↗", href: "https://github.com/Sanny-Un-Sowadh-Wamik/thevaultr" }],
  },
];

const MORE = [
  {
    tag: "PYTHON · SQL",
    t: { en: "Click & Collect Analysis", jp: "Click & Collect 行動分析" },
    p: { en: "Funnel analysis · 110M events, 5.3M users", jp: "530万ユーザー・1.1億イベントのファネル分析" },
    href: "https://github.com/Sanny-Un-Sowadh-Wamik/Click-Collect-Product-Analyst-Case-Study",
  },
  {
    tag: "PYTHON",
    t: { en: "RFM Segmentation", jp: "RFM顧客セグメンテーション" },
    p: { en: "K-Means customer segments", jp: "K-Meansで顧客を分類" },
    href: "https://github.com/Sanny-Un-Sowadh-Wamik/RFM-customer-segmentation-analysis",
  },
  {
    tag: "PYTHON · JUPYTER",
    t: { en: "Uber Ride Analytics 2024", jp: "Uber乗車分析 2024" },
    p: { en: "Demand & surge-pricing analysis", jp: "需要トレンド・サージ価格分析" },
    href: "https://github.com/Sanny-Un-Sowadh-Wamik/Uber-Ride-Analytics-2024---Data-Science-Project",
  },
  {
    tag: "JUPYTER",
    t: { en: "Depression Risk Prediction", jp: "うつ病リスク予測" },
    p: { en: "LogReg / RF / XGBoost compare", jp: "LogReg・RF・XGBoost比較" },
    href: "https://github.com/Sanny-Un-Sowadh-Wamik/Depression-Prediction-Project",
  },
  {
    tag: "JUPYTER",
    t: { en: "House Prices Prediction", jp: "住宅価格予測" },
    p: { en: "Regression modelling & feature selection", jp: "回帰モデリング・特徴選択" },
    href: "https://github.com/Sanny-Un-Sowadh-Wamik/House-Prices-Prediction",
  },
  {
    tag: "JUPYTER",
    t: { en: "Titanic Survival", jp: "タイタニック生存予測" },
    p: { en: "Kaggle ML classification", jp: "Kaggle ML分類チャレンジ" },
    href: "https://github.com/Sanny-Un-Sowadh-Wamik/Titanic---Machine-Learning-from-Disaster",
  },
  {
    tag: "PYTHON",
    t: { en: "F1 Race Analysis", jp: "F1レース分析" },
    p: { en: "Telemetry & strategy analysis", jp: "テレメトリー・戦略データ分析" },
    href: "https://github.com/Sanny-Un-Sowadh-Wamik/f1_analysis",
  },
  {
    tag: "JUPYTER",
    t: { en: "Netflix Movies EDA", jp: "Netflix映画EDA" },
    p: { en: "Exploratory data analysis", jp: "探索的データ分析・可視化" },
    href: "https://github.com/Sanny-Un-Sowadh-Wamik/Investigating-Netflix-Movies",
  },
  {
    tag: "R",
    t: { en: "Interpol Global Map", jp: "INTERPOL地図" },
    p: { en: "Geospatial mapping in R", jp: "Rによる地理空間可視化" },
    href: "https://github.com/Sanny-Un-Sowadh-Wamik/The-Global-Hunt-Mapping-Interpol-s-Most-Wanted",
  },
  {
    tag: "TYPESCRIPT",
    t: { en: "bizbleed", jp: "bizbleed" },
    p: { en: "Full-stack web app", jp: "フルスタックウェブアプリ" },
    href: "https://github.com/Sanny-Un-Sowadh-Wamik/bizbleed",
  },
  {
    tag: "TYPESCRIPT",
    t: { en: "Store.AI", jp: "Store.AI" },
    p: { en: "AI-powered commerce app", jp: "AI搭載コマースアプリ" },
    href: "https://github.com/Sanny-Un-Sowadh-Wamik/Store.AI",
  },
  {
    tag: "PYTHON",
    t: { en: "MusicBot", jp: "MusicBot" },
    p: { en: "Discord music bot", jp: "Discord音楽ボット" },
    href: "https://github.com/Sanny-Un-Sowadh-Wamik/MusicBot",
  },
  {
    tag: "JUPYTER",
    t: { en: "Transit Delay Prediction", jp: "公共交通の遅延予測" },
    p: { en: "ML delay prediction from weather", jp: "気象イベントから遅延をML予測" },
    href: "https://github.com/Sanny-Un-Sowadh-Wamik/Predicting-Public-Transport-Delays-Using-Weather-Events",
  },
];

const TECH = [
  "Python", "SQL", "XGBoost", "LightGBM", "scikit-learn", "MLflow", "FastAPI",
  "Docker", "SHAP", "GeoPandas", "Spark", "Power BI", "PyTorch", "Tableau",
  "Streamlit", "Optuna", "Gotta Train 'Em All",
];

/* Pokémon-themed Poké Ball motif */
function PokeBall({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`h-full w-full ${className}`} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#24242b" />
      <path d="M 4 32 A 28 28 0 0 1 60 32 Z" fill="#d1342a" />
      <path d="M 4 32 A 28 28 0 0 0 60 32 Z" fill="#ece8df" />
      <rect x="2" y="29" width="60" height="6" fill="#24242b" />
      <circle cx="32" cy="32" r="8" fill="#24242b" />
      <circle cx="32" cy="32" r="5" fill="#ece8df" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────────────────
   Play: small, optional delights (all off under Reduce Motion)
   ──────────────────────────────────────────────────────────────── */

function usePlay() {
  useEffect(() => {
    // Spotlight, tilt and magnetic buttons: fine pointers only
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const spot = t?.closest<HTMLElement>(".spot");
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${e.clientX - r.left}px`);
        spot.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
      const tilt = t?.closest<HTMLElement>("[data-tilt]");
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        tilt.style.setProperty("--ry", `${(((e.clientX - r.left) / r.width - 0.5) * 7).toFixed(2)}deg`);
        tilt.style.setProperty("--rx", `${(-((e.clientY - r.top) / r.height - 0.5) * 7).toFixed(2)}deg`);
      }
      const mag = t?.closest<HTMLElement>("[data-magnetic]");
      if (mag) {
        const r = mag.getBoundingClientRect();
        mag.style.transform = `translate(${((e.clientX - (r.left + r.width / 2)) * 0.22).toFixed(1)}px, ${((e.clientY - (r.top + r.height / 2)) * 0.3).toFixed(1)}px)`;
      }
    };
    const onOut = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const to = e.relatedTarget as Node | null;
      const tilt = t?.closest<HTMLElement>("[data-tilt]");
      if (tilt && !tilt.contains(to)) {
        tilt.style.setProperty("--rx", "0deg");
        tilt.style.setProperty("--ry", "0deg");
      }
      const mag = t?.closest<HTMLElement>("[data-magnetic]");
      if (mag && !mag.contains(to)) mag.style.transform = "";
    };
    if (fine && !reducedMotion()) {
      document.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerout", onOut);
    }

    // Konami code: ↑ ↑ ↓ ↓ ← → ← → B A
    const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      pos = e.key === code[pos] ? pos + 1 : e.key === code[0] ? 1 : 0;
      if (pos === code.length) {
        pos = 0;
        dismissClue("konami");
        for (let i = 0; i < 6; i++) {
          setTimeout(() => burst(innerWidth * (0.15 + Math.random() * 0.7), innerHeight * (0.25 + Math.random() * 0.4), 26), i * 160);
        }
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
}

/* Touch: a ripple under the finger and a tiny haptic tick on tappable things */
function useTouchPlay() {
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch" || reducedMotion()) return;
      const el = document.createElement("span");
      el.className = "tap-ripple";
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      document.body.appendChild(el);
      el.addEventListener("animationend", () => el.remove());
      const target = e.target;
      if (target instanceof Element && target.closest("a, button, [role='button'], .more-card, article")) {
        haptic(8);
      }
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);
}

/* ────────────────────────────────────────────────────────────────
   Hefty motion
   ──────────────────────────────────────────────────────────────── */

function Intro() {
  return (
    <div aria-hidden className="intro">
      <div className="intro__track">
        <span className="intro__fill" />
        <div className="intro__ball">
          <div className="intro__hop">
            <div className="intro__spin">
              <PokeBall />
            </div>
          </div>
        </div>
      </div>
      <div className="intro__label">LOADING</div>
    </div>
  );
}

/* Big marquee band: speeds up with scroll, reverses when you scroll back up */
function Band({ words, dir = 1, sun = false }: { words: string[]; dir?: 1 | -1; sun?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = trackRef.current;
    if (!el || reducedMotion()) return;
    let x = 0;
    let last = window.scrollY;
    let vel = 0;
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const tick = () => {
      const y = window.scrollY;
      vel += (y - last - vel) * 0.12;
      last = y;
      if (visible) {
        const half = el.scrollWidth / 2;
        x -= dir * (0.7 + vel * 0.45);
        if (x <= -half) x += half;
        if (x > 0) x -= half;
        const skew = Math.max(-12, Math.min(12, -vel * 0.4 * dir));
        el.style.transform = `translate3d(${x.toFixed(1)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [dir]);

  return (
    <div aria-hidden className={`band ${sun ? "band--sun" : ""}`}>
      <div ref={trackRef} className="band__track">
        {[0, 1].map((g) => (
          <div key={g} className="flex">
            {words.map((w, i) => (
              <span key={i} className="band__item">
                {w}
                <span className="band__dot" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* A ring that trails the real cursor and swells over anything clickable (mouse only) */
function CursorRing() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.classList.add("on");
      const t = e.target as HTMLElement | null;
      el.classList.toggle("big", !!t?.closest("a, button, [role='button'], .more-card, article, .chip, input"));
      el.classList.toggle("inv", !!t?.closest("#contact"));
    };
    const onLeave = () => el.classList.remove("on");
    const tick = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return <div ref={ref} aria-hidden className="cursor-ring" />;
}

/* Headings decode from noise the first time they scroll into view */
function RiseTitle({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<{ vis: boolean; from: "top" | "bottom" }>({ vis: true, from: "bottom" });
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setState((s) => (s.vis ? s : { ...s, vis: true }));
        else setState({ vis: false, from: e.boundingClientRect.top < 0 ? "top" : "bottom" });
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const spaced = text.includes(" ");
  const parts = spaced ? text.split(" ") : Array.from(text);
  return (
    <span ref={ref} className="rise-title" data-in={state.vis ? "true" : "false"} data-from={state.from}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="rise-line">
        {parts.map((w, i) => (
          <span key={i} className="rise-mask">
            <span className="rise-word" style={{ "--w": i } as React.CSSProperties}>
              {w}
            </span>
            {spaced && i < parts.length - 1 ? "\u00a0" : ""}
          </span>
        ))}
      </span>
    </span>
  );
}

/* Words light up one by one as the paragraph travels up the screen */
function ScrubText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = useMemo(
    () => (/[\u3040-\u30ff\u4e00-\u9fff]/.test(text) ? (text.match(/.{1,3}/g) ?? [text]) : text.split(" ")),
    [text],
  );
  const jp = words.length > 0 && !text.includes(" ");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
    if (reducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.88 - r.top) / (vh * 0.5 + r.height * 0.5)));
      const n = spans.length;
      for (let i = 0; i < n; i++) {
        const on = Math.min(1, Math.max(0, (p * 1.25 - i / n) * 7));
        spans[i].style.setProperty("--on", on.toFixed(3));
      }
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [words]);
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i} data-w className="scrub-word">
          {w}
          {jp ? "" : " "}
        </span>
      ))}
    </p>
  );
}

/* Browsers without scroll-driven animation (older iOS, Firefox) get the same entrances from IntersectionObserver */
function useScrollFallback() {
  useEffect(() => {
    if (reducedMotion() || (typeof CSS !== "undefined" && CSS.supports("animation-timeline", "view()"))) return;
    const root = document.documentElement;
    root.classList.add("fx-js");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("fx-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    document.querySelectorAll(".stack-group, #skills, #contact").forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      root.classList.remove("fx-js");
    };
  }, []);
}

/* A reload should always start at the top */
function useStartAtTop() {
  useEffect(() => {
    try {
      history.scrollRestoration = "manual";
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (nav?.type === "reload") {
        window.scrollTo(0, 0);
        if (location.hash) history.replaceState(null, "", location.pathname + location.search);
      }
    } catch {
      /* non-critical */
    }
  }, []);
}

/* ────────────────────────────────────────────────────────────────
   The scroll ball: a page scrubber with a little magic
   drag = fly through the page · tap = next section · hold = back to top · reach the end = catch
   ──────────────────────────────────────────────────────────────── */

const STOPS: { id: string; l: Bi }[] = [
  { id: "top", l: { en: "Top", jp: "トップ" } },
  { id: "about", l: { en: "About", jp: "自己紹介" } },
  { id: "skills", l: { en: "Stack", jp: "スタック" } },
  { id: "work", l: { en: "Work", jp: "作品" } },
  { id: "more", l: { en: "All works", jp: "全作品" } },
  { id: "lab", l: { en: "Lab", jp: "ラボ" } },
  { id: "contact", l: { en: "Contact", jp: "連絡先" } },
];

function ScrollBall({ lang, progress }: { lang: Lang; progress: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [stops, setStops] = useState<number[]>([]);
  const [dragging, setDragging] = useState(false);
  const [catching, setCatching] = useState(false);
  const [flip, setFlip] = useState(0);
  const [label, setLabel] = useState<string | null>(null);
  const labelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drag = useRef<{ id: number; x0: number; moved: boolean; done: boolean; timer: ReturnType<typeof setTimeout> } | null>(null);
  const caught = useRef(false);
  const lastP = useRef(0);
  const lastSpark = useRef(0);
  const lastStop = useRef(-1);
  const hint = useRef(false);

  // After every load or reload the ball invites you to drag it; first-timers also learn tap and hold
  useEffect(() => {
    const timers: number[] = [];
    const atTop = () => window.scrollY < 80 && !drag.current;
    timers.push(
      window.setTimeout(() => {
        if (!atTop()) return;
        hint.current = true;
        showLabel(T(lang, { en: "Drag me →", jp: "ドラッグ →" }), 4200);
        timers.push(window.setTimeout(() => (hint.current = false), 4300));
        if (!clueSeen("scrollball")) {
          timers.push(
            window.setTimeout(() => {
              if (!atTop()) return;
              hint.current = true;
              showLabel(T(lang, { en: "Tap me · hold me", jp: "タップ・長押しも" }), 3800);
              timers.push(window.setTimeout(() => (hint.current = false), 3900));
            }, 4800),
          );
        }
      }, 3500),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopTop = (i: number) => {
    if (i <= 0) return 0;
    const el = document.getElementById(STOPS[i].id);
    return el ? Math.max(0, el.getBoundingClientRect().top + window.scrollY - 76) : 0;
  };

  // Where each section sits along the bar
  useEffect(() => {
    const measure = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setStops(STOPS.map((_, i) => Math.min(1, stopTop(i) / max)));
    };
    const t0 = window.setTimeout(measure, 600);
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => {
      window.clearTimeout(t0);
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = stops.length ? stops.reduce((c, f, i) => (progress >= f - 0.002 ? i : c), 0) : 0;
  const name = (i: number) => T(lang, STOPS[i].l);

  const showLabel = (text: string, ms = 1400) => {
    setLabel(text);
    if (labelTimer.current) clearTimeout(labelTimer.current);
    if (ms > 0) labelTimer.current = setTimeout(() => setLabel(null), ms);
  };

  const ballCenter = () => {
    const r = ref.current?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: innerWidth / 2, y: 40 };
  };

  // Sparkle trail, section name, and the catch at the end of the page
  useEffect(() => {
    // The "scroll down" nudge has done its job once you start scrolling
    if (hint.current && progress > 0.02) {
      hint.current = false;
      setLabel(null);
    }
    const dp = progress - lastP.current;
    lastP.current = progress;
    const now = performance.now();
    if (Math.abs(dp) > 0.0004 && now - lastSpark.current > (dragging ? 30 : 75)) {
      lastSpark.current = now;
      const c = ballCenter();
      spark(c.x, c.y);
      if (dragging) spark(c.x, c.y);
    }
    if (stops.length && lastStop.current !== current) {
      if (lastStop.current !== -1) {
        showLabel(name(current), dragging ? 0 : 1300);
        haptic(5);
      }
      lastStop.current = current;
    }
    if (progress >= 0.995 && !caught.current) {
      caught.current = true;
      setCatching(true);
      const c = ballCenter();
      burst(c.x, c.y + 20, 36);
      haptic([20, 40, 20, 40, 70]);
      showLabel(T(lang, { en: "Gotcha!", jp: "ゲット！" }), 1800);
      window.setTimeout(() => setCatching(false), 1300);
    } else if (progress < 0.9) {
      caught.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const goTo = (i: number) => {
    const y = i >= STOPS.length ? 0 : stopTop(i);
    window.scrollTo({ top: y, behavior: reducedMotion() ? "auto" : "smooth" });
    setFlip((n) => n + 1);
    const c = ballCenter();
    burst(c.x, c.y + 16, 14);
    haptic([8, 30, 8]);
    showLabel(i >= STOPS.length ? name(0) : name(i), 1500);
  };
  const next = () => goTo(stops.findIndex((f) => f > progress + 0.004) === -1 ? STOPS.length : stops.findIndex((f) => f > progress + 0.004));
  const prev = () => {
    let i = current;
    if (stops[i] !== undefined && progress - stops[i] < 0.004) i -= 1;
    goTo(Math.max(0, i));
  };

  const down = (e: React.PointerEvent<HTMLDivElement>) => {
    dismissClue("scrollball");
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* optional */
    }
    const timer = setTimeout(() => {
      const d = drag.current;
      if (!d || d.moved) return;
      d.done = true;
      setFlip((n) => n + 1);
      window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
      const c = ballCenter();
      burst(c.x, c.y + 16, 28);
      haptic([30, 40, 30]);
      showLabel(T(lang, { en: "Return!", jp: "もどれ！" }), 1500);
    }, 600);
    drag.current = { id: e.pointerId, x0: e.clientX, moved: false, done: false, timer };
    setDragging(true);
  };
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || d.done) return;
    if (!d.moved && Math.abs(e.clientX - d.x0) < 6) return;
    if (!d.moved) {
      d.moved = true;
      clearTimeout(d.timer);
      haptic(10);
    }
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const f = Math.min(1, Math.max(0, (e.clientX - 14) / (window.innerWidth - 28)));
    window.scrollTo({ top: f * max, behavior: "instant" });
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d) return;
    clearTimeout(d.timer);
    if (!d.moved && !d.done) next();
    else if (d.moved) showLabel(name(current), 900);
  };

  const key = (e: React.KeyboardEvent) => {
    dismissClue("scrollball");
    if (e.key === "ArrowRight" || e.key === "ArrowDown") (e.preventDefault(), next());
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") (e.preventDefault(), prev());
    else if (e.key === "Home") (e.preventDefault(), goTo(0));
    else if (e.key === "End") {
      e.preventDefault();
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: reducedMotion() ? "auto" : "smooth" });
    }
  };

  const edge = progress < 0.14 ? "edge-l" : progress > 0.86 ? "edge-r" : "";

  return (
    <>
      <span aria-hidden className="progress-track" />
      {stops.slice(1).map((f, i) => (
        <span key={i} aria-hidden className="progress-tick" style={{ "--f": f } as React.CSSProperties} />
      ))}
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label={T(lang, { en: "Page position. Drag to scroll, tap for next section, hold to return to top.", jp: "ページ位置。ドラッグでスクロール、タップで次のセクション、長押しで先頭へ。" })}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-valuetext={name(current)}
        className={`progress-ball ${dragging ? "is-dragging" : ""} ${catching ? "ball-catch" : ""}`}
        style={{ "--p": progress, "--rot": `${progress * 2880}deg` } as React.CSSProperties}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={key}
      >
        <span key={flip} className={`progress-ball__art ${flip ? "is-flip" : ""}`}>
          <PokeBall />
        </span>
        {label && (
          <span className={`ball-label ${edge}`} role="status">
            {label.endsWith("→") ? (
              <>
                {label.slice(0, -1)}
                <span aria-hidden className="ball-arrow">→</span>
              </>
            ) : (
              label
            )}
          </span>
        )}
      </div>
    </>
  );
}

/* Letters that hop when touched; the heading keeps one readable label */
function Hop({ text, start = 0 }: { text: string; start?: number }) {
  let k = start;
  return (
    <>
      {text.split(" ").map((word, wi, all) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {word.split("").map((c, i) => (
            <span
              key={i}
              aria-hidden
              className="hop hop-in"
              style={{ animationDelay: `${2250 + k++ * 45}ms` }}
            >
              {c}
            </span>
          ))}
          {wi < all.length - 1 ? "\u00a0" : ""}
        </span>
      ))}
    </>
  );
}

function CountUp({ value }: { value: string }) {
  const m = value.match(/^(\d+)(.*)$/);
  const target = m ? Number(m[1]) : 0;
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!m) return;
    if (reducedMotion()) {
      setN(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 1300);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return <>{m ? `${n}${m[2]}` : value}</>;
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal, .reveal-3d, .reveal-3d-left, .reveal-3d-right");
    if (reducedMotion()) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    // Entering plays the reveal; leaving resets it (remembering which edge it left through),
    // so scrolling back up replays it coming in from above.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) {
            el.classList.add("in");
          } else {
            el.classList.toggle("from-top", e.boundingClientRect.top < 0);
            el.classList.remove("in");
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="eyebrow flex items-center gap-3">
      <span className="inline-block h-px w-8 bg-accent" />
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Header
   ──────────────────────────────────────────────────────────────── */

const MENU_LINKS: { id: string; l: Bi }[] = [
  { id: "about", l: { en: "About", jp: "自己紹介" } },
  { id: "skills", l: { en: "Stack", jp: "スタック" } },
  { id: "work", l: { en: "Work", jp: "作品" } },
  { id: "more", l: { en: "All works", jp: "全作品" } },
  { id: "lab", l: { en: "Lab", jp: "ラボ" } },
  { id: "contact", l: { en: "Contact", jp: "連絡先" } },
];

const SOCIALS = [
  { href: "https://github.com/Sanny-Un-Sowadh-Wamik", label: "GitHub" },
  { href: "https://www.linkedin.com/in/sanny-un-sowadh-wamik/", label: "LinkedIn" },
  { href: "mailto:sannyunsowadh01@gmail.com", label: "Email" },
];

/* Smooth jump that lands just under the fixed header */
function goToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - 76), behavior: reducedMotion() ? "auto" : "smooth" });
}

/* Segmented language switch with a sliding thumb */
function LangSwitch({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="lang-switch" role="group" aria-label="Language" data-lang={lang}>
      <span aria-hidden className="lang-thumb" />
      {(["en", "jp"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          lang={l === "jp" ? "ja" : "en"}
          onClick={() => {
            setLang(l);
            haptic(6);
          }}
        >
          {l === "jp" ? "日本語" : "EN"}
        </button>
      ))}
    </div>
  );
}

/* Full-screen menu for phones: replaces the old bottom tab bar */
function MobileMenu({ lang, open, onClose }: { lang: Lang; open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("menu-open");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onResize = () => {
      if (window.innerWidth >= 768) onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    ref.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.documentElement.classList.remove("menu-open");
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open, onClose]);

  return (
    <div id="mobile-menu" ref={ref} className={`mobile-menu ${open ? "is-open" : ""}`} inert={!open} aria-label={T(lang, { en: "Menu", jp: "メニュー" })}>
      <nav>
        <ul>
          {MENU_LINKS.map((m, i) => (
            <li key={m.id} style={{ "--i": i } as React.CSSProperties}>
              <a
                href={`#${m.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  haptic(8);
                  window.setTimeout(() => goToSection(m.id), 90);
                }}
              >
                {T(lang, m.l)}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mobile-menu__foot" style={{ "--i": MENU_LINKS.length } as React.CSSProperties}>
        <span className="brand-status">
          <i aria-hidden />
          {T(lang, { en: "Open to roles", jp: "採用対応可" })}
        </span>
        <div className="mobile-menu__social">
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} target={s.href.startsWith("http") ? "_blank" : undefined} rel="noopener">
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function Header({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [menu, setMenu] = useState(false);
  const closeMenu = () => setMenu(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("about");
  const [progress, setProgress] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(1, y / h) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = ["about", "work", "lab", "contact"];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const movePillTo = (el: HTMLElement | null) => {
    const nav = navRef.current;
    if (!el || !nav) return;
    const a = el.getBoundingClientRect();
    const n = nav.getBoundingClientRect();
    setPill({ left: a.left - n.left - 10, width: a.width + 20, opacity: 1 });
  };

  useEffect(() => {
    const el = navRef.current?.querySelector<HTMLElement>(`[data-nav="${active}"]`);
    if (el) movePillTo(el);
  }, [active, lang]);

  return (
    <>
    <header
      className={`site-header fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 ${
        scrolled ? "site-header--scrolled border-transparent" : "border-line bg-background/60 backdrop-blur-md"
      }`}
    >
      <div className={`mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 transition-[padding] duration-300 sm:px-8 ${scrolled ? "py-2" : "py-3.5"}`}>
        <div className="flex items-center gap-4">
          <a href="#top" className="brand" aria-label="Wamik dot data, back to top" onClick={() => setMenu(false)}>
            <span aria-hidden className="brand-word">
              {"WAMIK".split("").map((c, i) => (
                <span key={i} className="hop">{c}</span>
              ))}
            </span>
            <span aria-hidden className="brand-tld">.DATA</span>
          </a>
          <span className="brand-status brand-status--bar">
            <i aria-hidden />
            {T(lang, { en: "Open to roles", jp: "採用対応可" })}
          </span>
        </div>
        <nav
          ref={navRef}
          onMouseLeave={() => {
            const el = navRef.current?.querySelector<HTMLElement>(`[data-nav="${active}"]`);
            if (el) movePillTo(el);
            else setPill((p) => ({ ...p, opacity: 0 }));
          }}
          aria-label="Sections"
          className="nav-list relative hidden items-center gap-2 md:flex"
        >
          <span
            aria-hidden
            className="nav-pill"
            style={{
              transform: `translateX(${pill.left}px)`,
              width: `${pill.width}px`,
              opacity: pill.opacity,
            }}
          />
          {[
            { id: "about", href: "#about", l: { en: "About", jp: "自己紹介" } },
            { id: "work", href: "#work", l: { en: "Work", jp: "作品" } },
            { id: "lab", href: "#lab", l: { en: "Lab", jp: "ラボ" } },
            { id: "contact", href: "#contact", l: { en: "Contact", jp: "連絡先" } },
          ].map((i, idx) => (
            <a
              key={i.href}
              href={i.href}
              data-nav={i.id}
              onMouseEnter={(e) => movePillTo(e.currentTarget)}
              className={`nav-link mono relative rounded-full px-3 py-2 text-xs tracking-[0.22em] uppercase transition-colors ${
                active === i.id ? "text-ink" : "text-dim hover:text-ink"
              }`}
              style={{ animationDelay: `${120 + idx * 70}ms` }}
            >
              <span className="nav-link-text">{T(lang, i.l)}</span>
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LangSwitch lang={lang} setLang={setLang} />
          <button
            type="button"
            className="menu-btn md:hidden"
            aria-label={T(lang, { en: "Menu", jp: "メニュー" })}
            aria-expanded={menu}
            aria-controls="mobile-menu"
            onClick={() => {
              setMenu((m) => !m);
              haptic(8);
            }}
          >
            <span aria-hidden />
            <span aria-hidden />
          </button>
        </div>
      </div>
      <span
        aria-hidden
        className="nav-progress"
        style={{ transform: `scaleX(${progress})` }}
      />
      <ScrollBall lang={lang} progress={progress} />
    </header>
    <MobileMenu lang={lang} open={menu} onClose={closeMenu} />
    </>
  );
}

/* ────────────────────────────────────────────────────────────────
   Hero — magazine cover
   ──────────────────────────────────────────────────────────────── */

function Hero({ lang }: { lang: Lang }) {
  const charRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const bubbleIdx = useRef(0);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const LINES: Bi[] = [
    { en: "Pika pika!", jp: "ピカピカ！" },
    { en: "Open to roles.", jp: "お仕事募集中！" },
    { en: "Ask me about MLOps.", jp: "MLOpsの話、しませんか？" },
    { en: "Gotta train 'em all.", jp: "ぜんぶ訓練してみせる！" },
  ];
  const sayHi = (x: number, y: number) => {
    dismissClue("portrait");
    burst(x, y, 12);
    haptic(10);
    setGreeted(true);
    void enableDeviceTilt();
    setBubble(T(lang, LINES[bubbleIdx.current % LINES.length]));
    bubbleIdx.current += 1;
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), 2600);
  };

  const setVars = (rx: number, ry: number) => {
    const el = charRef.current;
    if (!el) return;
    el.style.setProperty("--cx", `${ry.toFixed(2)}deg`);
    el.style.setProperty("--cy", `${rx.toFixed(2)}deg`);
  };
  const reset = () => setVars(0, 0);

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = charRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    // Stronger response on touch (swipe parallax)
    const mult = e.pointerType === "touch" ? 24 : 12;
    setVars(-y * mult, x * mult);
  };

  useEffect(() => {
    if (reducedMotion()) return;
    const onScroll = () => {
      const el = charRef.current;
      if (el) el.style.translate = `0 ${(-window.scrollY * 0.07).toFixed(1)}px`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onEnter = () => setFocused(true);
  const onLeave = () => {
    setFocused(false);
    reset();
  };

  const throwBall = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 14);
    haptic([12, 40, 18]);
    el.classList.remove("ball-spin");
    void el.offsetWidth;
    el.classList.add("ball-spin");
  };

  /* The full Poké Ball catch: throw, flash, get sucked in, drop, three shakes, click, release */
  const heroRef = useRef<HTMLElement>(null);
  const [toss, setToss] = useState<{ sx: number; sy: number; hx: number; hy: number } | null>(null);
  const tossRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const catching = useRef(false);
  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const say = (text: string, ms = 1800) => {
    setBubble(text);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), ms);
  };

  const catchSequence = async (btn: HTMLElement) => {
    dismissClue("ball");
    throwBall(btn);
    const hero = heroRef.current;
    const wrap = charRef.current;
    const img = wrap?.querySelector<HTMLElement>("img");
    if (catching.current || !hero || !wrap || !img || reducedMotion()) return;
    catching.current = true;
    btn.setAttribute("aria-busy", "true");
    setGreeted(true);

    const hr = hero.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    const cr = wrap.getBoundingClientRect();
    const sx = br.left + br.width / 2 - hr.left;
    const sy = br.top + br.height / 2 - hr.top;
    const hx = cr.left + cr.width / 2 - hr.left;
    const hy = cr.top + cr.height * 0.45 - hr.top;
    const fx = hx;
    const fy = Math.min(cr.bottom - hr.top - 8, hr.height - 40);
    setToss({ sx, sy, hx, hy });
    await wait(40);

    const ball = tossRef.current;
    const flash = flashRef.current;
    if (!ball || !flash) {
      setToss(null);
      catching.current = false;
      btn.removeAttribute("aria-busy");
      return;
    }
    const at = (x: number, y: number, rot = 0, s = 1) => `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rot}deg) scale(${s})`;
    const dx = hx - sx;
    const dy = hy - sy;

    // 1. throw: a high arc with a lot of spin
    ball.animate(
      [
        { transform: at(0, 0, 0, 0.8), offset: 0 },
        { transform: at(dx * 0.5, dy * 0.5 - 140, 400, 1.15), offset: 0.55 },
        { transform: at(dx, dy, 720, 1), offset: 1 },
      ],
      { duration: 700, easing: "cubic-bezier(0.35, 0, 0.5, 1)", fill: "forwards" },
    );
    haptic(8);
    await wait(700);

    // 2. flash, then the character is pulled into the ball as red light
    flash.animate(
      [
        { opacity: 0.95, transform: "scale(0.2)" },
        { opacity: 0, transform: "scale(1.5)" },
      ],
      { duration: 520, easing: "ease-out", fill: "forwards" },
    );
    burst(cr.left + cr.width / 2, cr.top + cr.height * 0.45, 22);
    haptic([20, 30, 20]);
    const suck = img.animate(
      [
        { scale: 1, opacity: 1, filter: "brightness(1)" },
        { scale: 1.08, opacity: 1, filter: "brightness(4) saturate(0)", offset: 0.3 },
        { scale: 0.04, opacity: 0, filter: "brightness(2) sepia(1) saturate(8) hue-rotate(-40deg)" },
      ],
      { duration: 560, easing: "cubic-bezier(0.6, 0, 0.8, 0.4)", fill: "forwards" },
    );
    ball.animate(
      [
        { transform: at(dx, dy, 720, 1) },
        { transform: at(dx, dy, 720, 1.5), offset: 0.4 },
        { transform: at(dx, dy, 720, 1) },
      ],
      { duration: 560, fill: "forwards" },
    );
    await wait(600);

    // 3. the ball drops and bounces
    const gx = fx - sx;
    const gy = fy - sy;
    ball.animate(
      [
        { transform: at(dx, dy, 720, 1), offset: 0 },
        { transform: at(gx, gy, 800, 1), offset: 0.5, easing: "ease-out" },
        { transform: at(gx, gy - 46, 830, 1), offset: 0.68, easing: "ease-in" },
        { transform: at(gx, gy, 860, 1), offset: 0.84 },
        { transform: at(gx, gy - 14, 870, 1), offset: 0.93, easing: "ease-in" },
        { transform: at(gx, gy, 880, 1), offset: 1 },
      ],
      { duration: 900, easing: "ease-in", fill: "forwards" },
    );
    await wait(900);

    // 4. wobble, wobble, wobble…
    for (let i = 0; i < 3; i++) {
      await wait(280);
      ball.animate(
        [
          { transform: at(gx, gy, 880, 1) },
          { transform: at(gx - 4, gy, 880 - 26, 1), offset: 0.3 },
          { transform: at(gx + 4, gy, 880 + 22, 1), offset: 0.65 },
          { transform: at(gx, gy, 880, 1) },
        ],
        { duration: 520, easing: "ease-in-out", fill: "forwards" },
      );
      haptic(14);
      await wait(520);
    }

    // 5. click! The ball locks, stars burst out
    await wait(220);
    const bx = hr.left + fx;
    const by = hr.top + fy;
    burst(bx, by, 34);
    haptic([20, 40, 20, 40, 80]);
    ball.animate(
      [
        { transform: at(gx, gy, 880, 1) },
        { transform: at(gx, gy, 880, 1.7), offset: 0.4 },
        { transform: at(gx, gy, 880, 1.7), offset: 0.7 },
        { transform: at(gx, gy, 880, 0), opacity: 0 },
      ],
      { duration: 800, easing: "ease-in-out", fill: "forwards" },
    );
    say(T(lang, { en: "Gotcha!", jp: "ゲット！" }), 1600);
    await wait(1000);

    // 6. release: the character pops back out
    suck.cancel();
    img.animate(
      [
        { scale: 0.04, opacity: 0, filter: "brightness(4) saturate(0)" },
        { scale: 1.15, opacity: 1, filter: "brightness(1.6)", offset: 0.6 },
        { scale: 1, opacity: 1, filter: "brightness(1)" },
      ],
      { duration: 700, easing: "cubic-bezier(0.3, 1.5, 0.5, 1)" },
    );
    burst(cr.left + cr.width / 2, cr.top + cr.height * 0.45, 26);
    haptic([10, 30, 10]);
    say(T(lang, { en: "Pika pika!", jp: "ピカピカ！" }), 1800);
    setToss(null);
    catching.current = false;
    btn.removeAttribute("aria-busy");
  };

  // Phones: tilt the portrait with the device (iOS asks permission on first tap)
  const [greeted, setGreeted] = useState(false);
  const tiltHandler = useRef<((e: DeviceOrientationEvent) => void) | null>(null);
  const enableDeviceTilt = async () => {
    if (tiltHandler.current || reducedMotion()) return;
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    const D = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } })
      .DeviceOrientationEvent;
    if (!D) return;
    if (typeof D.requestPermission === "function") {
      try {
        if ((await D.requestPermission()) !== "granted") return;
      } catch {
        return;
      }
    }
    const clamp = (v: number) => Math.max(-30, Math.min(30, v));
    tiltHandler.current = (e: DeviceOrientationEvent) => {
      setVars(-clamp((e.beta ?? 45) - 45) * 0.45, clamp(e.gamma ?? 0) * 0.45);
    };
    window.addEventListener("deviceorientation", tiltHandler.current);
  };
  useEffect(
    () => () => {
      if (tiltHandler.current) window.removeEventListener("deviceorientation", tiltHandler.current);
    },
    [],
  );

  return (
    <section ref={heroRef} id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden pt-28 md:min-h-[100svh] md:pt-36">
      

      {/* Floating Poké Ball accent */}
      <button
        type="button"
        aria-label={T(lang, { en: "Throw the Poké Ball", jp: "モンスターボールを投げる" })}
        onClick={(e) => void catchSequence(e.currentTarget)}
        className="pokeball-float absolute right-4 top-20 z-20 hidden h-14 w-14 md:right-10 md:top-28 md:block"
      >
        <PokeBall />
      </button>

      <div className="hero-exit relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-4 sm:px-6 md:grid md:min-h-0 md:grid-cols-12 md:gap-6 md:px-10">
        {/* Mobile: compact single column layout */}
        <div className="flex flex-1 flex-col md:contents">
          {/* Meta row */}
          <div className="order-1 pr-[150px] sm:pr-[220px] md:pr-0 md:col-span-3 md:flex md:flex-col md:gap-6">
            <div className="flex flex-col gap-2 md:gap-4">
              <Eyebrow>
                <span className="text-xs tracking-[0.18em] md:text-xs md:tracking-[0.22em]">
                  {T(lang, { en: "Portfolio / 2026", jp: "ポートフォリオ / 2026" })}
                </span>
              </Eyebrow>
              <div className="mono space-y-0.5 text-xs text-foreground md:space-y-1 md:text-xs">
                <div className="flex gap-2 md:gap-3">
                  <span className="w-20 text-dim">Location</span>
                  <span>{T(lang, { en: "Melbourne, AU", jp: "メルボルン" })}</span>
                </div>
                <div className="flex gap-2 md:gap-3">
                  <span className="w-20 text-dim">Education</span>
                  <span>{T(lang, { en: "RMIT B.DS '27", jp: "RMIT 2027" })}</span>
                </div>
                <div className="flex gap-2 md:gap-3">
                  <span className="w-20 text-dim">Status</span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-1 w-1 rounded-full bg-emerald-400 md:h-1.5 md:w-1.5" />
                    {T(lang, { en: "Available", jp: "対応可" })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Character — absolutely positioned on mobile (kept clear of text); normal grid cell on desktop */}
          <div className="pointer-events-none absolute -right-6 top-14 z-0 sm:right-0 sm:top-8 md:pointer-events-auto md:static md:order-3 md:col-span-4 lg:col-span-3 md:z-auto md:flex md:items-end md:justify-center">
            <div
              ref={charRef}
              className={`char-3d-wrap pointer-events-auto relative w-[170px] sm:w-[260px] md:w-full ${focused ? "is-focused" : ""}`}
              onPointerMove={onPointerMove}
              onPointerEnter={onEnter}
              onPointerLeave={onLeave}
              onPointerCancel={onLeave}
              role="button"
              tabIndex={0}
              aria-label={T(lang, { en: "Sanny's illustrated portrait. Press to say hi.", jp: "Sannyのイラスト。押すとあいさつします。" })}
              onClick={(e) => sayHi(e.clientX, e.clientY)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  const r = e.currentTarget.getBoundingClientRect();
                  sayHi(r.left + r.width / 2, r.top + r.height / 3);
                }
              }}
            >
              {bubble && (
                <div role="status" className="speech-bubble">
                  {bubble}
                </div>
              )}
              <img
                src={avatarAsset.url}
                alt=""
                className="char-3d"
                draggable={false}
              />
              {!greeted && (
                <span aria-hidden className="tap-hint">
                  {T(lang, { en: "Tap me", jp: "タップ！" })}
                </span>
              )}
            </div>
          </div>

          {/* Center content */}
          <div className="hero-rise relative z-10 order-2 mt-5 pr-[150px] sm:pr-[220px] md:pr-0 md:col-span-5 lg:col-span-6 md:mt-0">
            <h1
              aria-label="Sanny Un Sowadh Wamik"
              onPointerEnter={() => dismissClue("letters")}
              className="text-[clamp(1.6rem,6.4vw,7rem)] font-bold leading-[0.95] tracking-[-0.02em] md:text-[clamp(2.5rem,10vw,7rem)]"
            >
              <span className="hero-name-line"><Hop text="Sanny Un" /></span>
              <br />
              <span className="hero-name-line text-accent-ink">
                <Hop text="Sowadh Wamik" start={8} />
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-snug text-foreground/90 sm:text-base md:mt-6 md:text-xl md:leading-relaxed">
              {T(lang, {
                en: "Data scientist building production ML systems — models, pipelines, and the APIs that ship them.",
                jp: "本番運用のMLシステムを構築するデータサイエンティスト。モデル・パイプライン・APIまで一貫して開発します。",
              })}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-8 md:gap-3">
              <a
                href="#work"
                data-magnetic
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 mono text-xs font-medium tracking-[0.18em] uppercase text-white transition-all hover:bg-accent-ink md:gap-3 md:px-6 md:py-3 md:text-xs"
              >
                {T(lang, { en: "View work", jp: "作品を見る" })}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
              <a
                href="#contact"
                data-magnetic
                className="group inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 mono text-xs font-medium tracking-[0.18em] uppercase text-ink transition-all hover:border-accent hover:text-accent-ink md:gap-3 md:px-6 md:py-3 md:text-xs"
              >
                {T(lang, { en: "Get in touch", jp: "連絡先" })}
              </a>
              <button
                type="button"
                aria-label={T(lang, { en: "Throw the Poké Ball", jp: "モンスターボールを投げる" })}
                onClick={(e) => void catchSequence(e.currentTarget)}
                className="ball-chip inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface p-2 md:hidden"
              >
                <PokeBall />
              </button>
            </div>

            <p className="clue-row">
              <Clue id="letters">
                <Both mouse={T(lang, { en: "Hover the letters", jp: "文字にさわってみて" })} touch={T(lang, { en: "Tap the letters", jp: "文字をタップ" })} />
              </Clue>
              <Clue id="portrait">
                <Both mouse={T(lang, { en: "Click the portrait", jp: "イラストをクリック" })} touch={T(lang, { en: "Tap the portrait", jp: "イラストをタップ" })} />
              </Clue>
              <Clue id="ball">{T(lang, { en: "Throw the ball", jp: "ボールを投げてみて" })}</Clue>
            </p>
          </div>
        </div>

        {/* Now / currently — fills the gap on mobile */}
        <div className="order-3 relative z-10 mt-6 w-full md:hidden">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { k: { en: "Now building", jp: "開発中" }, v: "Stock-Price MLOps · v2" },
              { k: { en: "Now learning", jp: "学習中" }, v: "Ray · LangGraph" },
              { k: { en: "Latest ship", jp: "最新リリース" }, v: "Realtime Fraud API" },
              { k: { en: "Reading", jp: "読書中" }, v: "Designing ML Systems" },
            ].map((r, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 border-l-2 border-accent/50 bg-surface/40 px-3 py-2 backdrop-blur-sm"
              >
                <span className="mono text-xs tracking-[0.2em] uppercase text-accent-ink">
                  {T(lang, r.k)}
                </span>
                <span className="text-[12px] leading-snug text-ink">{r.v}</span>
              </div>
            ))}
          </div>
          <div className="mono mt-4 flex items-center justify-center gap-2 text-xs tracking-[0.3em] uppercase text-dim">
            <span className="inline-block h-px w-6 bg-accent/60" />
            {T(lang, { en: "Scroll", jp: "スクロール" })}
            <span className="inline-block h-px w-6 bg-accent/60" />
          </div>
        </div>

        {/* Stats - full width at bottom */}
        <div className="order-4 mt-6 w-full md:order-3 md:mt-auto md:col-span-12">
          <div className="grid grid-cols-4 gap-px border-t border-line bg-line">
            {STATS.map((s) => (
              <div key={s.v} className="bg-background px-2 py-3 md:p-5">
                <div className="text-lg font-bold tracking-tight md:text-3xl"><CountUp value={s.v} /></div>
                <div className="mono mt-0.5 text-xs tracking-[0.15em] uppercase text-dim md:mt-1 md:text-xs md:tracking-[0.2em]">
                  {T(lang, s.l)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The thrown Poké Ball and its capture flash */}
      {toss && (
        <>
          <div ref={flashRef} aria-hidden className="capture-flash" style={{ left: toss.hx, top: toss.hy }} />
          <div ref={tossRef} aria-hidden className="throw-ball" style={{ left: toss.sx, top: toss.sy }}>
            <PokeBall />
          </div>
        </>
      )}

      {/* Tech stack: scrolls by itself on phones, wraps on desktop */}
      <div className="tech-strip w-full overflow-hidden border-t border-line bg-background/80 py-4 md:overflow-visible">
        <div className="tech-track mx-auto max-w-[1400px] md:flex-wrap md:px-10">
          <ul className="tech-list">
            {TECH.map((x) => (
              <li key={x} className="chip">{x}</li>
            ))}
          </ul>
          <ul className="tech-list tech-list--copy" aria-hidden>
            {TECH.map((x) => (
              <li key={x} className="chip">{x}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   About
   ──────────────────────────────────────────────────────────────── */

function About({ lang }: { lang: Lang }) {
  return (
    <section id="about" className="about-section relative overflow-hidden border-t border-line py-28 sm:py-36">

      <div className="relative mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6 sm:px-10">
        <div className="reveal-3d-left col-span-12 md:col-span-3">
          <Eyebrow>
            <span>{T(lang, { en: "About", jp: "自己紹介" })}</span>
          </Eyebrow>
          <h2 className="mt-6 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1] tracking-tight">
            <span className="about-title-word">
              <RiseTitle text={T(lang, { en: "Background", jp: "背景" })} />
            </span>
          </h2>
          <div className="mono mt-6 text-xs tracking-[0.18em] uppercase text-accent-ink">
            <span className="inline-block">●</span> RMIT '27
          </div>
        </div>

        <div className="reveal-3d col-span-12 md:col-span-6">
          <ScrubText className="about-lede text-xl leading-relaxed" text={T(lang, {
              en: "Final-year Data Science student at RMIT (graduating 2027). I build machine-learning models and the pipelines & APIs that carry them into production — three projects run as live, documented services with MLflow tracking and CI/CD.",
              jp: "RMIT大学データサイエンス最終学年（2027年卒業見込み）。機械学習モデルと、それを本番へ届けるパイプライン・APIを構築します。3つのプロジェクトはMLflowトラッキングとCI/CDを備えたライブサービスとして稼働中。",
            })} />
          <p className="mt-6 text-base leading-relaxed text-dim">
            {T(lang, {
              en: "Just as comfortable in SQL and Power BI / Tableau, turning large, messy datasets into decisions people can act on.",
              jp: "SQL・Power BI・Tableauも得意で、大規模で雑然としたデータを実行可能な意思決定へと変えます。",
            })}
          </p>
        </div>

        <div className="reveal-3d-right col-span-12 space-y-3 md:col-span-3">
          {[
            { l: { en: "Education", jp: "学歴" }, v: { en: "B. Data Science — RMIT (2027)", jp: "RMIT データサイエンス学士 (2027)" } },
            { l: { en: "Location", jp: "所在地" }, v: { en: "Melbourne, Australia", jp: "メルボルン、豪州" } },
            { l: { en: "Status", jp: "状態" }, v: { en: "Open to roles", jp: "採用対応可" } },
          ].map((r, i) => (
            <div
              key={i}
              className="about-fact group relative flex flex-col gap-1 border-l-2 border-accent/40 pl-4 transition-all duration-300 hover:border-accent hover:pl-6"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              <span className="mono text-xs tracking-[0.22em] uppercase text-accent-ink transition-colors group-hover:text-ink">
                {T(lang, r.l)}
              </span>
              <span className="text-sm text-ink">{T(lang, r.v)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   Skills
   ──────────────────────────────────────────────────────────────── */

/* Each group gets its own colour: tools fill with it on hover, and --on keeps the text readable */
const GROUP_COLORS: { c: string; on: string }[] = [
  { c: "#d1342a", on: "#ffffff" },
  { c: "#2b2b33", on: "#ffffff" },
  { c: "#7fb2e5", on: "#1c1c22" },
  { c: "#4fbf7c", on: "#1c1c22" },
  { c: "#ee8a3c", on: "#1c1c22" },
  { c: "#f5c518", on: "#1c1c22" },
];

function Skills({ lang }: { lang: Lang }) {
  const [q, setQ] = useState("");
  const groups = useMemo(() => SKILLS.map((s) => ({ ...s, tools: s.body.split(" · ") })), []);
  const total = useMemo(() => groups.reduce((n, g) => n + g.tools.length, 0), [groups]);
  const needle = q.trim().toLowerCase();
  const hits = needle
    ? groups.map((g) => g.tools.filter((x) => x.toLowerCase().includes(needle)).length)
    : groups.map(() => 0);
  const hitTotal = hits.reduce((a, b) => a + b, 0);
  const hitGroups = hits.filter((n) => n > 0).length;

  // Dock-style magnification: tools near the cursor swell, with a smooth falloff
  const frame = useRef(0);
  const magnify = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || reducedMotion()) return;
    const root = e.currentTarget;
    const { clientX: x, clientY: y } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      root.querySelectorAll<HTMLElement>(".tool-chip").forEach((c) => {
        const r = c.getBoundingClientRect();
        const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
        c.style.setProperty("--m", (1 + Math.max(0, 1 - d / 110) * 0.38).toFixed(3));
      });
    });
  };
  const settle = (e: React.PointerEvent<HTMLElement>) => {
    cancelAnimationFrame(frame.current);
    e.currentTarget.querySelectorAll<HTMLElement>(".tool-chip").forEach((c) => c.style.removeProperty("--m"));
  };
  const poke = (e: React.PointerEvent<HTMLElement>) => {
    const chip = (e.target as HTMLElement).closest<HTMLElement>(".tool-chip");
    if (!chip) return;
    haptic(6);
    chip.classList.remove("poked");
    void chip.offsetWidth;
    chip.classList.add("poked");
    const r = chip.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 7);
  };

  return (
    <section id="skills" className="relative border-t border-line bg-surface/30 py-28 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="reveal flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>
              <span>{T(lang, { en: "Skills & tech", jp: "スキル＆技術" })}</span>
            </Eyebrow>
            <h2 className="mt-6 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1] tracking-tight">
              <RiseTitle text={T(lang, { en: "Data stack", jp: "データスタック" })} />
            </h2>
          </div>
          <div className="stack-total">
            <b><CountUp value={String(total)} /></b>
            <span>{T(lang, { en: "tools across", jp: "ツール /" })} {groups.length} {T(lang, { en: "groups", jp: "グループ" })}</span>
          </div>
        </div>

        <div className="stack-search">
          <label htmlFor="toolSearch" className="sr-only">
            {T(lang, { en: "Find a tool", jp: "ツールを探す" })}
          </label>
          <input
            id="toolSearch"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={T(lang, { en: "Find a tool… try “xg” or “docker”", jp: "ツールを検索… 例：xg、docker" })}
            autoComplete="off"
            spellCheck={false}
          />
          <p className="mono" role="status" aria-live="polite">
            {!needle
              ? T(lang, { en: "Hover or tap a tool", jp: "ツールにタッチしてみよう" })
              : hitTotal
                ? T(lang, {
                    en: `${hitTotal} match${hitTotal > 1 ? "es" : ""} in ${hitGroups} group${hitGroups > 1 ? "s" : ""}`,
                    jp: `${hitGroups}グループで${hitTotal}件一致`,
                  })
                : T(lang, { en: "No match, but I can learn it.", jp: "該当なし。でも覚えます。" })}
          </p>
        </div>

        <div className="stack-groups">
          {groups.map((g, gi) => {
            const col = GROUP_COLORS[gi % GROUP_COLORS.length];
            return (
              <section
                key={gi}
                className="stack-group spot reveal"
                data-dim={needle && !hits[gi] ? "true" : undefined}
                style={{ "--c": col.c, "--on": col.on } as React.CSSProperties}
                aria-label={T(lang, g.t)}
              >
                <header className="stack-group__head">
                  <h3>{T(lang, g.t)}</h3>
                  <span className="stack-group__count">{g.tools.length}</span>
                </header>
                <ul className="chip-cloud" onPointerMove={magnify} onPointerLeave={settle} onPointerDown={poke}>
                  {g.tools.map((tool, k) => {
                    const match = needle && tool.toLowerCase().includes(needle);
                    return (
                      <li
                        key={tool}
                        className={`tool-chip ${match ? "is-match" : ""} ${needle && !match ? "is-miss" : ""}`}
                        style={{ "--k": k } as React.CSSProperties}
                      >
                        {tool}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   Projects — magazine layout
   ──────────────────────────────────────────────────────────────── */

function ProjectsFeatured({ lang }: { lang: Lang }) {
  const stackRef = useRef<HTMLDivElement>(null);

  // Each card shrinks and darkens a little as the next one slides over it
  useEffect(() => {
    const root = stackRef.current;
    if (!root || reducedMotion()) return;
    // Phones: scroll events lag the compositor's sticky positioning, so a JS-driven
    // scale/translate makes the cards shake. Keep plain sticky stacking there.
    if (window.matchMedia("(pointer: coarse), (max-width: 767px)").matches) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".stack-card"));
    let raf = 0;
    const update = () => {
      raf = 0;
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return card.style.setProperty("--p", "0");
        const stuckTop = parseFloat(getComputedStyle(next).top) || 0;
        const d = next.getBoundingClientRect().top - stuckTop;
        const p = Math.min(1, Math.max(0, 1 - d / Math.max(1, card.offsetHeight * 0.85)));
        card.style.setProperty("--p", p.toFixed(3));
        if (p > 0.3) dismissClue("stack");
      });
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="work" className="relative border-t border-line py-28 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="reveal flex items-end justify-between gap-6">
          <div>
            <Eyebrow>
              <span>{T(lang, { en: "Featured work", jp: "注目プロジェクト" })}</span>
            </Eyebrow>
            <h2 className="mt-6 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1] tracking-tight">
              <RiseTitle text={T(lang, { en: "Key works", jp: "主要作品" })} />
            </h2>
            <p className="mt-4">
              <Clue id="stack">{T(lang, { en: "Keep scrolling: the cards stack", jp: "スクロールするとカードが重なります" })}</Clue>
            </p>
          </div>
        </div>

        <div ref={stackRef} className="stack">
          {FEATURED.map((p, i) => (
            <article
              key={p.num}
              style={{ "--i": i } as React.CSSProperties}
              className="stack-card spot grid grid-cols-12 gap-x-6 gap-y-4 p-6 sm:p-10"
            >
              <div className="col-span-12 flex items-baseline justify-between gap-4 md:col-span-2 md:block">
                <div className="font-bold text-5xl text-accent-ink sm:text-6xl">{p.num}</div>
                <div className="mono text-xs tracking-[0.22em] uppercase text-accent-ink md:mt-4">
                  {i === 0 ? T(lang, { en: "Lead project", jp: "主要案件" }) : T(lang, { en: "Featured", jp: "注目" })}
                </div>
              </div>
              <div className="col-span-12 md:col-span-10">
                <div className="mono text-xs tracking-[0.2em] text-dim">{p.tag}</div>
                <h3 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-4xl">{T(lang, p.title)}</h3>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink/85">{T(lang, p.body)}</p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
                  <span className="mono text-xs tracking-[0.18em] text-accent-ink">{p.metric}</span>
                  <div className="flex flex-wrap gap-3">
                    {p.links.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noopener"
                        className="mono inline-flex min-h-11 items-center rounded-full border border-line px-4 text-xs tracking-[0.18em] uppercase text-ink transition-colors hover:border-accent hover:bg-accent hover:text-white"
                      >
                        {l.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const WORK_CATS: { id: string; l: Bi; match: string[] }[] = [
  { id: "all", l: { en: "All", jp: "すべて" }, match: [] },
  { id: "python", l: { en: "Python", jp: "Python" }, match: ["PYTHON"] },
  { id: "notebooks", l: { en: "Notebooks", jp: "ノートブック" }, match: ["JUPYTER"] },
  { id: "web", l: { en: "Web apps", jp: "Webアプリ" }, match: ["TYPESCRIPT", "JAVASCRIPT"] },
  { id: "r", l: { en: "R", jp: "R" }, match: ["R"] },
  { id: "sql", l: { en: "SQL", jp: "SQL" }, match: ["SQL"] },
];

/* Card colour comes from the project's main language; --on keeps text readable when the card fills on hover */
const LANG_COLOR: Record<string, { c: string; on: string }> = {
  PYTHON: { c: "#f5c518", on: "#1c1c22" },
  JUPYTER: { c: "#ee8a3c", on: "#1c1c22" },
  TYPESCRIPT: { c: "#2b2b33", on: "#ffffff" },
  JAVASCRIPT: { c: "#2b2b33", on: "#ffffff" },
  R: { c: "#7fb2e5", on: "#1c1c22" },
  SQL: { c: "#4fbf7c", on: "#1c1c22" },
};

function MoreWork({ lang }: { lang: Lang }) {
  const [filter, setFilter] = useState("all");
  const [shuffle, setShuffle] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const snap = useRef<Map<string, DOMRect> | null>(null);

  const items = useMemo(() => {
    const cat = WORK_CATS.find((c) => c.id === filter) ?? WORK_CATS[0];
    let list = MORE.map((m, i) => ({ ...m, i, tokens: m.tag.split(" · ") })).filter(
      (m) => !cat.match.length || cat.match.some((k) => m.tokens.includes(k)),
    );
    if (shuffle) {
      const rand = mulberry32(shuffle * 97 + 3);
      list = [...list];
      for (let k = list.length - 1; k > 0; k--) {
        const j = Math.floor(rand() * (k + 1));
        [list[k], list[j]] = [list[j], list[k]];
      }
    }
    return list;
  }, [filter, shuffle]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        WORK_CATS.map((c) => [
          c.id,
          c.match.length ? MORE.filter((m) => c.match.some((k) => m.tag.split(" · ").includes(k))).length : MORE.length,
        ]),
      ),
    [],
  );

  // Remember where every card is, so the next render can glide them to their new places (FLIP)
  const capture = () => {
    const grid = gridRef.current;
    if (!grid) return;
    snap.current = new Map(
      Array.from(grid.querySelectorAll<HTMLElement>("[data-key]")).map((el) => [el.dataset.key as string, el.getBoundingClientRect()]),
    );
  };

  useLayoutEffect(() => {
    const grid = gridRef.current;
    const prev = snap.current;
    snap.current = null;
    if (!grid || !prev || reducedMotion()) return;
    grid.querySelectorAll<HTMLElement>("[data-key]").forEach((el, n) => {
      const before = prev.get(el.dataset.key as string);
      const r = el.getBoundingClientRect();
      if (before) {
        const dx = before.left - r.left;
        const dy = before.top - r.top;
        if (Math.abs(dx) + Math.abs(dy) < 2) return;
        el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], {
          duration: 560,
          easing: "cubic-bezier(0.3, 1.15, 0.4, 1)",
        });
      } else {
        el.animate(
          [
            { opacity: 0, transform: "scale(0.7) translateY(24px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 520, delay: n * 35, easing: "cubic-bezier(0.3, 1.4, 0.5, 1)", fill: "backwards" },
        );
      }
    });
  }, [items]);

  return (
    <section id="more" className="relative border-t border-line py-28 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="reveal flex items-end justify-between gap-6">
          <div>
            <Eyebrow>
              <span>{T(lang, { en: "More projects", jp: "その他のプロジェクト" })}</span>
            </Eyebrow>
            <h2 className="mt-6 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1] tracking-tight">
              <RiseTitle text={T(lang, { en: "All works", jp: "全作品集" })} />
            </h2>
          </div>
          <a
            href="https://github.com/Sanny-Un-Sowadh-Wamik"
            target="_blank"
            rel="noopener"
            className="mono inline-flex min-h-11 items-center text-xs tracking-[0.2em] uppercase text-accent-ink transition-colors hover:text-ink"
          >
            github ↗
          </a>
        </div>

        <p className="mt-4">
          <Clue id="filter">
            <Both
              mouse={T(lang, { en: "Filter, shuffle, then hover a card", jp: "絞り込み・シャッフル・カードにカーソル" })}
              touch={T(lang, { en: "Filter, shuffle, then press a card", jp: "絞り込み・シャッフル・カードを長押し" })}
            />
          </Clue>
        </p>
        <div className="filter-row swipe-row" role="group" aria-label={T(lang, { en: "Filter projects", jp: "プロジェクトを絞り込む" })}>
          {WORK_CATS.map((c) => (
            <button
              key={c.id}
              className="filter-chip"
              aria-pressed={filter === c.id}
              onClick={() => {
                if (filter === c.id) return;
                dismissClue("filter");
                capture();
                setFilter(c.id);
                haptic(6);
              }}
            >
              {T(lang, c.l)} <b>{counts[c.id]}</b>
            </button>
          ))}
          <button
            className="filter-chip filter-chip--shuffle"
            onClick={() => {
              dismissClue("filter");
              capture();
              setShuffle((s) => s + 1);
              haptic([8, 30, 8]);
            }}
          >
            {T(lang, { en: "Shuffle", jp: "シャッフル" })}
          </button>
        </div>
        <p className="mono mt-5 text-xs tracking-[0.14em] uppercase text-dim" role="status" aria-live="polite">
          {T(lang, {
            en: `Showing ${items.length} of ${MORE.length} projects`,
            jp: `${MORE.length}件中 ${items.length}件を表示`,
          })}
        </p>

        <div ref={gridRef} className="work-grid">
          {items.map((m) => {
            const col = LANG_COLOR[m.tokens[0]] ?? { c: "#d1342a", on: "#ffffff" };
            return (
              <a
                key={m.href}
                data-key={m.href}
                href={m.href}
                target="_blank"
                rel="noopener"
                className="work-card spot"
                style={{ "--c": col.c, "--on": col.on } as React.CSSProperties}
              >
                <span aria-hidden className="work-num">{String(m.i + 1).padStart(2, "0")}</span>
                <div className="flex items-start justify-between gap-3">
                  <span className="work-tag">{m.tag}</span>
                  <span aria-hidden className="work-arrow">↗</span>
                </div>
                <h4 className="work-title">{T(lang, m.t)}</h4>
                <p className="work-desc">{T(lang, m.p)}</p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   Data Lab — mounts external lab.js
   ──────────────────────────────────────────────────────────────── */

const TAB_ORDER = ["fraud", "overfit", "neural", "coin", "kmeans", "regression", "correlation", "heatmap", "network", "beeswarm", "violin", "treemap", "dex"];
const CLASSIC_TABS = ["kmeans", "regression", "correlation", "heatmap", "network", "beeswarm", "violin", "treemap"];

type LabApi = { onSlideShown: (el: Element | null) => void; switchTab?: (n: string) => void; pause?: () => void };

function DataLab({ lang }: { lang: Lang }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<string>("fraud");
  const tabRef = useRef(tab);
  tabRef.current = tab;
  const dex = useDex();

  const labApi = () => (window as unknown as { DataLab?: LabApi }).DataLab;

  useEffect(() => {
    const boot = () => {
      labApi()?.onSlideShown(ref.current);
      if (!CLASSIC_TABS.includes(tabRef.current)) labApi()?.pause?.();
    };
    if (!document.querySelector('script[data-lab="1"]')) {
      const s = document.createElement("script");
      s.src = "/js/lab.js?v=2";
      s.dataset.lab = "1";
      s.onload = boot;
      document.body.appendChild(s);
    } else {
      boot();
    }
  }, []);

  const stageRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const prevHeight = useRef(0);
  const [dir, setDir] = useState<"next" | "prev">("next");

  const selectTab = (id: string) => {
    dismissClue("lab");
    if (id === tabRef.current) return;
    prevHeight.current = stageRef.current?.offsetHeight ?? 0;
    setDir(TAB_ORDER.indexOf(id) >= TAB_ORDER.indexOf(tabRef.current) ? "next" : "prev");
    setTab(id);
    haptic(8);
    if (CLASSIC_TABS.includes(id)) labApi()?.switchTab?.(id);
    else labApi()?.pause?.();
  };

  // Any real poke at a classic tool earns its Dex card
  const onStageDown = (e: React.PointerEvent) => {
    const el = e.target;
    if (!(el instanceof Element)) return;
    const id = el.closest<HTMLElement>(".lab-panel")?.dataset.lab;
    if (id && CLASSIC_TABS.includes(id) && el.closest("canvas, button, input")) dex.unlock(id);
  };

  useEffect(() => {
    if (!dex.fresh) return;
    haptic([15, 30, 15]);
    burst(window.innerWidth / 2, window.innerHeight * 0.7, 18);
    if (dex.got.length === DEX.length) {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => burst(window.innerWidth * (0.2 + Math.random() * 0.6), window.innerHeight * (0.25 + Math.random() * 0.4), 34), 300 + i * 220);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dex.fresh]);

  // Smoothly resize the stage to the new panel, and bring the active tab into view
  useLayoutEffect(() => {
    const el = stageRef.current;
    const from = prevHeight.current;
    prevHeight.current = 0;
    if (!el || !from || reducedMotion()) return;
    const to = el.offsetHeight;
    if (Math.abs(to - from) < 4) return;
    el.style.height = `${from}px`;
    el.style.overflow = "hidden";
    void el.offsetHeight;
    el.style.transition = "height 0.5s cubic-bezier(0.3, 1, 0.4, 1)";
    el.style.height = `${to}px`;
    const done = () => {
      el.style.height = "";
      el.style.overflow = "";
      el.style.transition = "";
    };
    const timer = window.setTimeout(done, 560);
    return () => {
      window.clearTimeout(timer);
      done();
    };
  }, [tab]);

  useEffect(() => {
    const bar = tabsRef.current;
    const btn = bar?.querySelector<HTMLElement>(".lab-tab.active");
    if (!bar || !btn || bar.scrollWidth <= bar.clientWidth) return;
    bar.scrollTo({
      left: btn.offsetLeft - (bar.clientWidth - btn.offsetWidth) / 2,
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  }, [tab]);

  const tabs: { id: string; game?: boolean; l: Bi }[] = [
    { id: "fraud", game: true, l: { en: "Beat the fraud model", jp: "不正検知バトル" } },
    { id: "overfit", game: true, l: { en: "Break the model", jp: "過学習ラボ" } },
    { id: "neural", game: true, l: { en: "Train a neural net", jp: "ニューラルネット" } },
    { id: "coin", game: true, l: { en: "Coin-flip challenge", jp: "コイントス対決" } },
    { id: "kmeans", l: { en: "K-Means", jp: "クラスタリング" } },
    { id: "regression", l: { en: "Regression", jp: "線形回帰" } },
    { id: "correlation", l: { en: "Correlation", jp: "相関ゲーム" } },
    { id: "heatmap", l: { en: "Heat Map", jp: "ヒートマップ" } },
    { id: "network", l: { en: "Network", jp: "ネットワーク" } },
    { id: "beeswarm", l: { en: "Beeswarm", jp: "ビースウォーム" } },
    { id: "violin", l: { en: "Violin", jp: "バイオリン" } },
    { id: "treemap", l: { en: "Treemap", jp: "ツリーマップ" } },
  ];

  return (
    <section id="lab" className="relative border-t border-line py-28 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="reveal flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>
              <span>{T(lang, { en: "Interactive lab", jp: "インタラクティブ・ラボ" })}</span>
            </Eyebrow>
            <h2 className="mt-6 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1] tracking-tight">
              <RiseTitle text={T(lang, { en: "Data lab", jp: "データラボ" })} />
            </h2>
            <p className="mt-4 max-w-2xl text-base text-dim">
              {T(lang, {
                en: "Four games and eight tools. Beat a fraud model, break a regression, train a neural net, and try to out-guess the market. Collect every card in the Data Dex.",
                jp: "4つのゲームと8つのツール。不正検知モデルに挑み、回帰を壊し、ニューラルネットを育て、相場を当てにいこう。データずかんを全部集めよう。",
              })}
            </p>
            <p className="mt-3">
              <Clue id="lab">
                <Both
                  mouse={T(lang, { en: "Pick a tab · collect all 12 Dex cards", jp: "タブを選ぶ・図鑑12枚を集めよう" })}
                  touch={T(lang, { en: "Swipe the tabs · collect all 12 Dex cards", jp: "タブをスワイプ・図鑑12枚を集めよう" })}
                />
              </Clue>
            </p>
          </div>
          <button className="dex-chip" onClick={() => selectTab("dex")} aria-label={T(lang, { en: "Open the Data Dex", jp: "データずかんを開く" })}>
            <span>{T(lang, { en: "Data Dex", jp: "データずかん" })}</span>
            <b>{dex.got.length}/{DEX.length}</b>
          </button>
        </div>

        <div ref={ref} className="reveal mt-12">
          <div ref={tabsRef} className="lab-tabs swipe-row" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                className={`lab-tab ${tab === t.id ? "active" : ""} ${t.game ? "lab-tab--game" : ""}`}
                data-lab={t.id}
                onClick={() => selectTab(t.id)}
              >
                {T(lang, t.l)}
              </button>
            ))}
            <button
              role="tab"
              aria-selected={tab === "dex"}
              className={`lab-tab lab-tab--dex ${tab === "dex" ? "active" : ""}`}
              data-lab="dex"
              onClick={() => selectTab("dex")}
            >
              {T(lang, { en: "Data Dex", jp: "データずかん" })} {dex.got.length}/{DEX.length}
            </button>
          </div>

          {dex.fresh && (
            <div className="dex-toast" role="status">
              {T(lang, { en: "New Dex entry", jp: "図鑑に追加" })}: <b>{dexName(dex.fresh, lang)}</b>
            </div>
          )}

          <div ref={stageRef} data-dir={dir} className="lab-stage" onPointerDownCapture={onStageDown}>
            <div className={`lab-panel lab-panel--game ${tab === "fraud" ? "active" : ""}`} data-lab="fraud">
              <FraudGame lang={lang} active={tab === "fraud"} onUnlock={dex.unlock} />
            </div>
            <div className={`lab-panel lab-panel--game ${tab === "overfit" ? "active" : ""}`} data-lab="overfit">
              <OverfitLab lang={lang} active={tab === "overfit"} onUnlock={dex.unlock} />
            </div>
            <div className={`lab-panel lab-panel--game ${tab === "neural" ? "active" : ""}`} data-lab="neural">
              <NeuralLab lang={lang} active={tab === "neural"} onUnlock={dex.unlock} />
            </div>
            <div className={`lab-panel lab-panel--game ${tab === "coin" ? "active" : ""}`} data-lab="coin">
              <CoinFlipGame lang={lang} active={tab === "coin"} onUnlock={dex.unlock} />
            </div>
            <div className={`lab-panel lab-panel--game ${tab === "dex" ? "active" : ""}`} data-lab="dex">
              <DexPanel lang={lang} got={dex.got} fresh={dex.fresh} onGo={selectTab} onReset={dex.reset} />
            </div>

            {/* K-Means */}
            <div className={`lab-panel ${tab === "kmeans" ? "active" : ""}`} data-lab="kmeans">
              <div className="lab-canvas-wrap">
                <canvas id="labKmeansCanvas" />
                <div className="lab-hint">{T(lang, { en: "Click to add points", jp: "クリックで点を追加" })}</div>
              </div>
              <div className="lab-controls">
                <div className="lab-ctrl-title">K-MEANS CLUSTERING</div>
                <p className="lab-ctrl-desc">{T(lang, { en: "Group points into K clusters — the same technique behind my RFM customer-segmentation project.", jp: "データ点をK個のクラスタに分割。RFM顧客セグメンテーションと同じ手法です。" })}</p>
                <div className="lab-slider-row">
                  <label>CLUSTERS · K</label>
                  <input type="range" min={2} max={5} defaultValue={3} step={1} className="lab-range" id="labK" />
                  <span className="lab-kval" id="labKVal">3</span>
                </div>
                <div className="lab-status" id="labKmeansStatus">// READY</div>
                <div className="lab-btn-row">
                  <button className="lab-btn" id="labKmeansGen">GENERATE</button>
                  <button className="lab-btn lab-btn-primary" id="labKmeansRun">RUN ▶</button>
                  <button className="lab-btn" id="labKmeansClear">CLEAR</button>
                </div>
              </div>
            </div>

            {/* Regression */}
            <div className={`lab-panel ${tab === "regression" ? "active" : ""}`} data-lab="regression">
              <div className="lab-canvas-wrap">
                <canvas id="labRegCanvas" />
                <div className="lab-hint">{T(lang, { en: "Click to add points", jp: "クリックで点を追加" })}</div>
              </div>
              <div className="lab-controls">
                <div className="lab-ctrl-title">LINEAR REGRESSION</div>
                <p className="lab-ctrl-desc">{T(lang, { en: "Drop points and watch a least-squares line fit in real time.", jp: "点を追加すると最小二乗法で回帰直線がリアルタイムに当てはまります。" })}</p>
                <div className="lab-readout">
                  <div className="lab-readout-row"><span>EQUATION</span><b id="labRegEq">y = —</b></div>
                  <div className="lab-readout-row"><span>R²</span><b id="labRegR2">—</b></div>
                  <div className="lab-readout-row"><span>POINTS</span><b id="labRegN">0</b></div>
                </div>
                <div className="lab-btn-row">
                  <button className="lab-btn" id="labRegSeed">SAMPLE</button>
                  <button className="lab-btn" id="labRegClear">CLEAR</button>
                </div>
              </div>
            </div>

            {/* Correlation */}
            <div className={`lab-panel ${tab === "correlation" ? "active" : ""}`} data-lab="correlation">
              <div className="lab-canvas-wrap">
                <canvas id="labCorrCanvas" />
                <div className="lab-hint" id="labCorrReveal" />
              </div>
              <div className="lab-controls">
                <div className="lab-ctrl-title">GUESS THE CORRELATION</div>
                <p className="lab-ctrl-desc">{T(lang, { en: "How strong is the relationship? Slide to guess r, then reveal the truth.", jp: "散布図の関係はどのくらい強い？ スライダーで相関係数 r を推測してみよう。" })}</p>
                <div className="lab-slider-row">
                  <label>r</label>
                  <input type="range" min={-100} max={100} defaultValue={0} step={1} className="lab-range" id="labCorrGuess" />
                  <span className="lab-kval" id="labCorrGuessVal">0.00</span>
                </div>
                <div className="lab-status" id="labCorrResult">// GUESS r THEN SUBMIT</div>
                <div className="lab-scorebar">
                  <span>SCORE</span><b id="labCorrScore">0</b>
                  <span>ROUND</span><b id="labCorrRound">1</b>
                </div>
                <div className="lab-btn-row">
                  <button className="lab-btn lab-btn-primary" id="labCorrSubmit">SUBMIT</button>
                  <button className="lab-btn" id="labCorrNew">NEW ROUND</button>
                </div>
              </div>
            </div>

            {/* Heatmap */}
            <div className={`lab-panel ${tab === "heatmap" ? "active" : ""}`} data-lab="heatmap">
              <div className="lab-canvas-wrap">
                <canvas id="labHeatCanvas" />
                <div className="lab-hint">{T(lang, { en: "Hover the map", jp: "マップにマウスを重ねてみよう" })}</div>
              </div>
              <div className="lab-controls">
                <div className="lab-ctrl-title">GEOGRAPHIC HEAT MAP</div>
                <p className="lab-ctrl-desc">{T(lang, { en: "Inverse-distance-weighted (IDW) interpolation turns scattered stations into a smooth heat field.", jp: "観測点から逆距離加重（IDW）で連続的な熱フィールドを補間します。" })}</p>
                <div className="lab-status" id="labHeatInfo">// HOVER FOR VALUE</div>
                <div className="lab-btn-row">
                  <button className="lab-btn lab-btn-primary" id="labHeatNew">RESHUFFLE</button>
                </div>
              </div>
            </div>

            {/* Network */}
            <div className={`lab-panel ${tab === "network" ? "active" : ""}`} data-lab="network">
              <div className="lab-canvas-wrap">
                <canvas id="labNetCanvas" />
                <div className="lab-hint">{T(lang, { en: "Drag the nodes", jp: "ノードをドラッグ" })}</div>
              </div>
              <div className="lab-controls">
                <div className="lab-ctrl-title">FORCE-DIRECTED NETWORK</div>
                <p className="lab-ctrl-desc">{T(lang, { en: "A spring + repulsion physics sim lets the graph lay itself out.", jp: "バネと反発の物理シミュレーションでグラフが自己組織化。" })}</p>
                <div className="lab-status" id="labNetInfo">// NODES 0 · EDGES 0</div>
                <div className="lab-btn-row">
                  <button className="lab-btn lab-btn-primary" id="labNetAdd">ADD NODE</button>
                  <button className="lab-btn" id="labNetShake">SHAKE</button>
                  <button className="lab-btn" id="labNetReset">RESET</button>
                </div>
              </div>
            </div>

            {/* Beeswarm */}
            <div className={`lab-panel ${tab === "beeswarm" ? "active" : ""}`} data-lab="beeswarm">
              <div className="lab-canvas-wrap">
                <canvas id="labBeeCanvas" />
                <div className="lab-hint">{T(lang, { en: "Hover a point", jp: "点にマウスを重ねてみよう" })}</div>
              </div>
              <div className="lab-controls">
                <div className="lab-ctrl-title">BEESWARM PLOT</div>
                <p className="lab-ctrl-desc">{T(lang, { en: "Shows a 1-D distribution without hiding points — collision-avoidance packing.", jp: "一次元の分布を、点を重ねずに表示。衝突回避のパッキングで各点が居場所を見つけて整列。" })}</p>
                <div className="lab-status" id="labBeeInfo">// 3 GROUPS</div>
                <div className="lab-btn-row">
                  <button className="lab-btn lab-btn-primary" id="labBeeNew">RESHUFFLE</button>
                </div>
              </div>
            </div>

            {/* Violin */}
            <div className={`lab-panel ${tab === "violin" ? "active" : ""}`} data-lab="violin">
              <div className="lab-canvas-wrap">
                <canvas id="labViolinCanvas" />
                <div className="lab-hint">{T(lang, { en: "Distribution shapes", jp: "分布の形に注目" })}</div>
              </div>
              <div className="lab-controls">
                <div className="lab-ctrl-title">VIOLIN PLOT</div>
                <p className="lab-ctrl-desc">{T(lang, { en: "Kernel-density estimation draws each group's distribution shape.", jp: "カーネル密度推定（KDE）で各グループの分布の形を描画。" })}</p>
                <div className="lab-status" id="labViolinInfo">// 4 DISTRIBUTIONS</div>
                <div className="lab-btn-row">
                  <button className="lab-btn lab-btn-primary" id="labViolinNew">NEW SAMPLE</button>
                </div>
              </div>
            </div>

            {/* Treemap */}
            <div className={`lab-panel ${tab === "treemap" ? "active" : ""}`} data-lab="treemap">
              <div className="lab-canvas-wrap">
                <canvas id="labTreeCanvas" />
                <div className="lab-hint">{T(lang, { en: "Hover a cell", jp: "セルにマウスを重ねてみよう" })}</div>
              </div>
              <div className="lab-controls">
                <div className="lab-ctrl-title">CONVEX TREEMAP</div>
                <p className="lab-ctrl-desc">{T(lang, { en: "A Voronoi tessellation builds convex cells whose area encodes value, animated with Lloyd relaxation.", jp: "ボロノイ分割で面積＝値の凸セルを生成し、ロイド緩和で滑らかに形が整います。" })}</p>
                <div className="lab-status" id="labTreeInfo">// HOVER A CELL</div>
                <div className="lab-btn-row">
                  <button className="lab-btn lab-btn-primary" id="labTreeNew">REGENERATE</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   Contact
   ──────────────────────────────────────────────────────────────── */

function Contact({ lang }: { lang: Lang }) {
  return (
    <section id="contact" className="relative border-t border-line bg-surface/30 py-28 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="grid grid-cols-12 gap-6">
          <div className="reveal col-span-12 md:col-span-7">
            <Eyebrow>
              <span>{T(lang, { en: "Contact", jp: "連絡先" })}</span>
            </Eyebrow>
            <h2 className="mt-6 text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.02em]">
              {T(lang, {
                en: "Let's build something with data.",
                jp: "データで一緒に何かを作りましょう。",
              })}
            </h2>
            <p className="mt-6 max-w-xl text-lg text-dim">
              {T(lang, {
                en: "Open for data science collaboration, analytics projects, or data-related opportunities.",
                jp: "データサイエンスのコラボレーション、分析プロジェクト、またはデータ関連の仕事についてお気軽にご連絡ください。",
              })}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="mailto:sannyunsowadh01@gmail.com"
                data-magnetic
                className="group inline-flex items-center gap-3 rounded-full bg-accent px-6 py-3 mono text-xs tracking-[0.2em] uppercase text-white transition-all hover:bg-accent-ink"
              >
                {T(lang, { en: "Email me", jp: "メールを送る" })}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
              <a
                href="https://github.com/Sanny-Un-Sowadh-Wamik"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-3 rounded-full border border-line px-6 py-3 mono text-xs tracking-[0.2em] uppercase text-ink transition-all hover:border-accent hover:text-accent-ink"
              >
                GitHub ↗
              </a>
              <a
                href="https://www.linkedin.com/in/sanny-un-sowadh-wamik/"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-3 rounded-full border border-line px-6 py-3 mono text-xs tracking-[0.2em] uppercase text-ink transition-all hover:border-accent hover:text-accent-ink"
              >
                LinkedIn ↗
              </a>
            </div>
          </div>

          <div className="reveal col-span-12 md:col-span-5">
            <div className="spot border border-line bg-surface p-7">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                <span className="mono text-xs tracking-[0.22em] uppercase text-emerald-400">
                  {T(lang, { en: "Currently available", jp: "現在対応可" })}
                </span>
              </div>
              <div className="mt-4 text-2xl font-bold leading-snug">
                {T(lang, { en: "Open to opportunities", jp: "採用・コラボ対応可" })}
              </div>
              <div className="mono mt-2 text-xs uppercase tracking-widest text-dim">
                Data Science / ML / Analytics
              </div>

              <div className="mt-6 grid grid-cols-3 gap-px bg-line">
                {[
                  { v: "21", l: { en: "Repos", jp: "リポジトリ" } },
                  { v: "10+", l: { en: "Models", jp: "MLモデル" } },
                  { v: "18", l: { en: "Projects", jp: "公開PJ" } },
                ].map((s, i) => (
                  <div key={i} className="bg-background p-4 text-center">
                    <div className="text-2xl font-bold">{s.v}</div>
                    <div className="mono mt-1 text-xs tracking-widest uppercase text-dim">
                      {T(lang, s.l)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-line pt-5">
                <div className="mono text-xs tracking-[0.22em] uppercase text-accent-ink">
                  {T(lang, { en: "Tech stack", jp: "技術スタック" })}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {TECH.slice(0, 12).map((t) => (
                    <span
                      key={t}
                      className="mono border border-line bg-surface/60 px-2.5 py-1 text-xs tracking-wider text-dim"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mono mt-6 text-center text-xs tracking-[0.3em] uppercase text-dim">
              RMIT University // Melbourne // Class of 2027
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   Footer
   ──────────────────────────────────────────────────────────────── */

function Footer({ lang }: { lang: Lang }) {
  const toTop = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 18);
    haptic([10, 30, 10]);
    window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
  };

  return (
    <footer id="footer" className="site-footer">
      <div className="footer-wrap">
        <div className="footer-top">
          <div>
            <p className="footer-lead">
              {T(lang, { en: "Thanks for scrolling all the way down.", jp: "ここまでスクロールしてくれてありがとう。" })}
            </p>
            <a className="footer-mail" href="mailto:sannyunsowadh01@gmail.com">
              sannyunsowadh01@gmail.com <span aria-hidden>→</span>
            </a>
          </div>
          <button type="button" className="footer-top-btn" data-magnetic onClick={toTop}>
            <span aria-hidden>↑</span>
            {T(lang, { en: "Back to top", jp: "トップへ" })}
          </button>
        </div>

        <div className="footer-cols">
          <nav aria-label={T(lang, { en: "Footer", jp: "フッター" })}>
            <h4>{T(lang, { en: "Navigate", jp: "ナビゲーション" })}</h4>
            <ul>
              {MENU_LINKS.map((m) => (
                <li key={m.id}>
                  <a
                    href={`#${m.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      goToSection(m.id);
                    }}
                  >
                    {T(lang, m.l)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h4>{T(lang, { en: "Elsewhere", jp: "リンク" })}</h4>
            <ul>
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target={s.href.startsWith("http") ? "_blank" : undefined} rel="noopener">
                    {s.label} {s.href.startsWith("http") ? "↗" : ""}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>{T(lang, { en: "Status", jp: "ステータス" })}</h4>
            <p className="footer-status">
              <i aria-hidden />
              {T(lang, { en: "Open to roles", jp: "採用対応可" })}
            </p>
            <p className="footer-small">RMIT B.DS &rsquo;27</p>
          </div>
        </div>

        <div className="footer-word" aria-hidden>
          {"WAMIK".split("").map((c, i) => (
            <span key={i} className="hop">{c}</span>
          ))}
          <em>.DATA</em>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Sanny Un Sowadh Wamik</span>
          <Clue id="konami" keyboard>
            <span className="for-mouse">{T(lang, { en: "psst… ↑ ↑ ↓ ↓ ← → ← → B A", jp: "こっそり… ↑ ↑ ↓ ↓ ← → ← → B A" })}</span>
          </Clue>
        </div>
      </div>
    </footer>
  );
}

/* ────────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────────── */

function Portfolio() {
  const [lang, setLang] = useState<Lang>("en");
  useReveal();
  usePlay();
  useTouchPlay();
  useScrollFallback();
  useStartAtTop();
  useEffect(() => {
    document.documentElement.lang = lang === "jp" ? "ja" : "en";
  }, [lang]);
  return (
    <div className="relative min-h-screen text-foreground">
      <Intro />
      <CursorRing />
      <Header lang={lang} setLang={setLang} />
      <main>
        <Hero lang={lang} />
        <Band words={["Data science", "Machine learning", "MLOps", "Python"]} />
        <About lang={lang} />
        <Skills lang={lang} />
        <ProjectsFeatured lang={lang} />
        <MoreWork lang={lang} />
        <Band words={["Click it", "Drag it", "Run it", "Break it"]} dir={-1} sun />
        <DataLab lang={lang} />
        <Contact lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  );
}
