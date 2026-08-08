import type React from "react";
import type { EndingConfig } from "../../types/scene";

/**
 * エンディングバリアントが受け取るprops
 *
 * Sequenceの中で描画されるため、useCurrentFrame()は
 * エンディング開始からの相対フレームになる。
 */
export interface EndingVariantProps {
  ending: EndingConfig;
  accent: string;           // 解決済みのアクセントカラー
  durationInFrames: number; // 退場アニメーションの起点に使う
}

export type EndingVariantComponent = React.FC<EndingVariantProps>;
