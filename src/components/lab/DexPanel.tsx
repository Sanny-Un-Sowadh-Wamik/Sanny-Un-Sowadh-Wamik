import { DEX } from "./dex";
import { tr, type Lang } from "./types";

type Props = {
  lang: Lang;
  got: string[];
  fresh: string | null;
  onGo: (id: string) => void;
  onReset: () => void;
};

export function DexPanel({ lang, got, fresh, onGo, onReset }: Props) {
  const total = DEX.length;
  const pct = got.length / total;
  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <div className="dex">
      <div className="dex-head">
        <svg viewBox="0 0 80 80" className="dex-ring" role="img" aria-label={`${got.length} / ${total}`}>
          <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="8" />
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke="#f5c518"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - pct)}
            transform="rotate(-90 40 40)"
            style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.3, 1.2, 0.5, 1)" }}
          />
          <text x="40" y="45" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="700" fontFamily="var(--font-display)">
            {got.length}/{total}
          </text>
        </svg>
        <div>
          <div className="lab-ctrl-title">{tr(lang, "DATA DEX", "データずかん")}</div>
          <p className="lab-ctrl-desc">
            {got.length === total
              ? tr(lang, "Master Trainer. You have caught every entry.", "マスタートレーナー！全ての図鑑を集めました。")
              : tr(lang, "Play each tool to catch its card. Gotta train 'em all.", "各ツールで遊ぶとカードをゲット。ぜんぶ訓練しよう。")}
          </p>
        </div>
      </div>
      <ul className="dex-grid">
        {DEX.map((d, i) => {
          const has = got.includes(d.id);
          return (
            <li key={d.id} style={{ "--i": i } as React.CSSProperties}>
              <button
                className={`dex-card ${has ? "has" : ""} ${fresh === d.id ? "fresh" : ""}`}
                onClick={() => onGo(d.id)}
                aria-label={has ? d.name[lang] : tr(lang, `Locked entry ${i + 1}. Open the tool.`, `未取得 ${i + 1}。ツールを開く`)}
              >
                <span className="dex-num">#{String(i + 1).padStart(2, "0")}</span>
                <span className="dex-name">{has ? d.name[lang] : "???"}</span>
                <span className="dex-type">{has ? d.type[lang] : tr(lang, "locked", "ロック中")}</span>
                <span className="dex-blurb">{has ? d.blurb[lang] : tr(lang, "Play this tool to unlock.", "遊ぶと解放されます。")}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {got.length > 0 && (
        <button className="dex-reset" onClick={onReset}>
          {tr(lang, "Reset Dex", "ずかんをリセット")}
        </button>
      )}
    </div>
  );
}
