import React from "react";
import { EndingConfig, EndingVariant } from "../../types/scene";
import { DEFAULT_ACCENT } from "../slide/layout";
import { EndingVariantComponent } from "./types";
import { CenterEnding } from "./CenterEnding";
import { BandEnding } from "./BandEnding";
import { MinimalEnding } from "./MinimalEnding";

export type { EndingVariantProps, EndingVariantComponent } from "./types";
export { useEndingTiming } from "./parts/useEndingTiming";

/**
 * エンディングの見た目の一覧
 *
 * 追加手順は他のバリアントと同じ3ステップ
 *   1. コンポーネントを追加（EndingVariantComponentを実装）
 *   2. ここに登録
 *   3. src/types/scene.ts の EndingVariant に名前を追加
 */
export const ENDING_VARIANTS = {
  center: CenterEnding,
  band: BandEnding,
  minimal: MinimalEnding,
} satisfies Record<EndingVariant, EndingVariantComponent>;

export const DEFAULT_ENDING_VARIANT: EndingVariant = "center";

interface EndingRendererProps {
  ending: EndingConfig;
  durationInFrames: number;
}

/** エンディング設定から適切なバリアントを選んで描画する */
export const EndingRenderer: React.FC<EndingRendererProps> = ({
  ending,
  durationInFrames,
}) => {
  const name = ending.variant ?? DEFAULT_ENDING_VARIANT;
  const Variant = ENDING_VARIANTS[name] ?? ENDING_VARIANTS[DEFAULT_ENDING_VARIANT];

  return (
    <Variant
      ending={ending}
      accent={ending.accent ?? DEFAULT_ACCENT}
      durationInFrames={durationInFrames}
    />
  );
};
