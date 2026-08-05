/**
 * スライド共通のレイアウト定数
 *
 * バリアントを追加するときは、この値を基準に配置する。
 * 字幕側（src/components/subtitle/）もスライドと重ならないようこの値を参照する。
 */

// スライドを描画してよい領域（キャラクターは右側にいるので左寄せ）
export const SLIDE_AREA = {
  left: 64,
  top: 96,
  width: 1180,
  height: 760,
} as const;

export const DEFAULT_ACCENT = "#6c5ce7";
export const FONT = "'Noto Sans JP', 'Hiragino Sans', sans-serif";

// 箇条書き・画像が順番に現れるときの遅延フレーム
export const bulletDelay = (index: number, fps: number) =>
  Math.floor(fps * 0.18) * (index + 1);
