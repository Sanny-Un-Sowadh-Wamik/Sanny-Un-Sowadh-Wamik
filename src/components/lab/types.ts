export type Lang = "en" | "jp";

export type LabProps = {
  lang: Lang;
  /** True while this game's tab is the visible one. Loops pause otherwise. */
  active: boolean;
  /** Award a Data Dex entry. */
  onUnlock: (id: string) => void;
};

export const tr = (lang: Lang, en: string, jp: string) => (lang === "jp" ? jp : en);
