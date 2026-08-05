import React from "react";
import { OpeningConfig, OpeningVariant } from "../../types/scene";
import { DEFAULT_ACCENT } from "../slide/layout";
import { OpeningVariantComponent } from "./types";
import { CenterOpening } from "./CenterOpening";
import { BandOpening } from "./BandOpening";
import { MinimalOpening } from "./MinimalOpening";

export type { OpeningVariantProps, OpeningVariantComponent } from "./types";
export { useOpeningTiming } from "./parts/useOpeningTiming";
export { TitleStack } from "./parts/TitleStack";

/**
 * オープニングの見た目の一覧
 *
 * 追加手順はテロップ・スライドと同じ3ステップ
 *   1. コンポーネントを追加（OpeningVariantComponentを実装）
 *   2. ここに登録
 *   3. src/types/scene.ts の OpeningVariant に名前を追加
 */
export const OPENING_VARIANTS = {
  center: CenterOpening,
  band: BandOpening,
  minimal: MinimalOpening,
} satisfies Record<OpeningVariant, OpeningVariantComponent>;

export const DEFAULT_OPENING_VARIANT: OpeningVariant = "center";

interface OpeningRendererProps {
  opening: OpeningConfig;
  durationInFrames: number;
}

/** オープニング設定から適切なバリアントを選んで描画する */
export const OpeningRenderer: React.FC<OpeningRendererProps> = ({
  opening,
  durationInFrames,
}) => {
  const name = opening.variant ?? DEFAULT_OPENING_VARIANT;
  const Variant = OPENING_VARIANTS[name] ?? OPENING_VARIANTS[DEFAULT_OPENING_VARIANT];

  return (
    <Variant
      opening={opening}
      accent={opening.accent ?? DEFAULT_ACCENT}
      durationInFrames={durationInFrames}
    />
  );
};
