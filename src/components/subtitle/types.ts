import type React from "react";

/**
 * テロップバリアントが受け取るprops
 *
 * バリアントはSequenceの中で描画されるため、
 * useCurrentFrame()はシーン開始からの相対フレームになる。
 */
export interface SubtitleVariantProps {
  text: string;
  withSlide: boolean;  // スライド表示中は配置を寄せる
  accent: string;      // アクセントカラー（使わないバリアントもある）
}

export type SubtitleVariantComponent = React.FC<SubtitleVariantProps>;
