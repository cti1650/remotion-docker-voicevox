import type React from "react";
import type { OpeningConfig } from "../../types/scene";

/**
 * オープニングバリアントが受け取るprops
 *
 * Sequenceの中で描画されるため、useCurrentFrame()は
 * オープニング開始からの相対フレームになる。
 */
export interface OpeningVariantProps {
  opening: OpeningConfig;
  accent: string;          // 解決済みのアクセントカラー
  durationInFrames: number; // 退場アニメーションの起点に使う
}

export type OpeningVariantComponent = React.FC<OpeningVariantProps>;
