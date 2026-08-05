import React from "react";
import { SubtitleVariant } from "../../types/scene";
import { DEFAULT_ACCENT } from "../slide/layout";
import { SubtitleVariantComponent } from "./types";
import { BoxedSubtitle } from "./BoxedSubtitle";
import { BarSubtitle } from "./BarSubtitle";
import { OutlineSubtitle } from "./OutlineSubtitle";
import { CardSubtitle } from "./CardSubtitle";

export { FONT, subtitleFrameStyle, useSubtitleAppear } from "./layout";
export type { SubtitleVariantProps, SubtitleVariantComponent } from "./types";

/**
 * テロップの見た目の一覧
 *
 * バリアントを増やすときは
 *   1. src/components/subtitle/ にコンポーネントを追加（SubtitleVariantComponentを実装）
 *   2. ここに登録
 *   3. src/types/scene.ts の SubtitleVariant に名前を追加
 * の3つだけで済む。SceneCompositionは触らなくてよい。
 */
export const SUBTITLE_VARIANTS = {
  boxed: BoxedSubtitle,
  bar: BarSubtitle,
  outline: OutlineSubtitle,
  card: CardSubtitle,
  none: () => null,
} satisfies Record<SubtitleVariant, SubtitleVariantComponent>;

export const DEFAULT_SUBTITLE_VARIANT: SubtitleVariant = "boxed";

interface SubtitleRendererProps {
  text: string;
  withSlide: boolean;
  variant?: SubtitleVariant;          // シーン単位の指定
  fallbackVariant?: SubtitleVariant;  // 動画全体のデフォルト
  accent?: string;
}

/** シーンの設定から適切なテロップを選んで描画する */
export const SubtitleRenderer: React.FC<SubtitleRendererProps> = ({
  text,
  withSlide,
  variant,
  fallbackVariant,
  accent,
}) => {
  const name = variant ?? fallbackVariant ?? DEFAULT_SUBTITLE_VARIANT;
  const Variant =
    SUBTITLE_VARIANTS[name] ?? SUBTITLE_VARIANTS[DEFAULT_SUBTITLE_VARIANT];

  return (
    <Variant
      text={text}
      withSlide={withSlide}
      accent={accent ?? DEFAULT_ACCENT}
    />
  );
};
