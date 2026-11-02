import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "./types";

type Bi = { en: string; jp: string };

export type DexEntry = { id: string; name: Bi; type: Bi; blurb: Bi };

export const DEX: DexEntry[] = [
  { id: "fraud", name: { en: "Fraud Spotter", jp: "不正ハンター" }, type: { en: "Detective", jp: "探偵" }, blurb: { en: "Swiped through 12 transactions and went head to head with the model.", jp: "12件の取引を判定し、モデルと勝負した。" } },
  { id: "overfit", name: { en: "Overfitter", jp: "丸暗記くん" }, type: { en: "Memoriser", jp: "暗記" }, blurb: { en: "Cranked the model until it memorised the noise.", jp: "ノイズまで暗記するほどモデルを複雑にした。" } },
  { id: "neural", name: { en: "Neuronaut", jp: "ニューロノート" }, type: { en: "Brain", jp: "脳" }, blurb: { en: "Trained a tiny neural net to 95% accuracy.", jp: "小さなニューラルネットを精度95%まで育てた。" } },
  { id: "coin", name: { en: "Coin Caller", jp: "コイン予想士" }, type: { en: "Gambler", jp: "ギャンブラー" }, blurb: { en: "Called 20 market moves. The market was not impressed.", jp: "20回の値動きを予想した。相場は手強い。" } },
  { id: "kmeans", name: { en: "Clusterling", jp: "クラスタリン" }, type: { en: "Grouper", jp: "グループ" }, blurb: { en: "Sorted a pile of dots into K tidy groups.", jp: "点の山をK個のグループに仕分けした。" } },
  { id: "regression", name: { en: "Linerunner", jp: "ライナー" }, type: { en: "Liner", jp: "直線" }, blurb: { en: "Fitted a least-squares line through your points.", jp: "点に最小二乗の直線を引いた。" } },
  { id: "correlation", name: { en: "Matchmaker", jp: "相関メーカー" }, type: { en: "Guesser", jp: "推測" }, blurb: { en: "Guessed how strongly two things move together.", jp: "2つの動きの強さを当てにいった。" } },
  { id: "heatmap", name: { en: "Heatwave", jp: "ヒートウェーブ" }, type: { en: "Thermal", jp: "熱" }, blurb: { en: "Turned scattered stations into a smooth heat field.", jp: "観測点を滑らかな熱の場に変えた。" } },
  { id: "network", name: { en: "Webspinner", jp: "ウェブスピナー" }, type: { en: "Network", jp: "網" }, blurb: { en: "Dragged a graph into shape.", jp: "グラフをドラッグで整えた。" } },
  { id: "beeswarm", name: { en: "Swarmling", jp: "スウォームン" }, type: { en: "Swarm", jp: "群れ" }, blurb: { en: "Saw every point of a distribution at once.", jp: "分布の全ての点を一度に見た。" } },
  { id: "violin", name: { en: "Violinist", jp: "バイオリニスト" }, type: { en: "Shape", jp: "形" }, blurb: { en: "Read the shape of four distributions.", jp: "4つの分布の形を読み取った。" } },
  { id: "treemap", name: { en: "Cellmancer", jp: "セルマンサー" }, type: { en: "Cells", jp: "細胞" }, blurb: { en: "Watched area turn into value.", jp: "面積が値に変わるのを見た。" } },
];

const KEY = "dex.v1";

export function useDex() {
  const [got, setGot] = useState<string[]>([]);
  const [fresh, setFresh] = useState<string | null>(null);
  const gotRef = useRef<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          gotRef.current = parsed.filter((x): x is string => typeof x === "string");
          setGot(gotRef.current);
        }
      }
    } catch {
      /* storage unavailable: the Dex just lasts for this visit */
    }
  }, []);

  const unlock = useCallback((id: string) => {
    if (gotRef.current.includes(id) || !DEX.some((d) => d.id === id)) return;
    gotRef.current = [...gotRef.current, id];
    setGot(gotRef.current);
    setFresh(id);
    try {
      localStorage.setItem(KEY, JSON.stringify(gotRef.current));
    } catch {
      /* ignore */
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFresh(null), 3400);
  }, []);

  const reset = useCallback(() => {
    gotRef.current = [];
    setGot([]);
    setFresh(null);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { got, fresh, unlock, reset };
}

export const dexName = (id: string, lang: Lang) => {
  const e = DEX.find((d) => d.id === id);
  return e ? e.name[lang] : id;
};
