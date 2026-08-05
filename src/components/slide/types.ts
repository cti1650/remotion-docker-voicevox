import type React from "react";
import type { SlideConfig } from "../../types/scene";

/**
 * スライドバリアントが受け取るprops
 *
 * 時間は`localFrame`（スライドが出てからの経過フレーム）で渡す。
 * バリアント側で絶対フレームを扱わせないことで、
 * 同じ登場アニメーションを使い回せるようにしている。
 */
export interface SlideVariantProps {
  slide: SlideConfig;
  localFrame: number;
  fps: number;
  accent: string;     // slide.accentを解決済みの値
  highlight?: number; // 強調する箇条書き番号（1始まり）
  index?: number;     // 現在のスライド番号（1始まり）
  total?: number;     // 全スライド数
}

export type SlideVariantComponent = React.FC<SlideVariantProps>;
