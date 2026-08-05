import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SlideConfig, SlideVariant } from "../../types/scene";
import { DEFAULT_ACCENT } from "./layout";
import { SlideVariantComponent } from "./types";
import { CardSlide } from "./CardSlide";
import { FullBleedSlide } from "./FullBleedSlide";
import { TitleSlide } from "./TitleSlide";

export { SLIDE_AREA, DEFAULT_ACCENT, FONT, bulletDelay } from "./layout";
export type { SlideVariantProps, SlideVariantComponent } from "./types";

/**
 * スライドの見た目の一覧
 *
 * バリアントを増やすときは
 *   1. src/components/slide/ にコンポーネントを追加（SlideVariantComponentを実装）
 *   2. ここに登録
 *   3. src/types/scene.ts の SlideVariant に名前を追加
 * の3つだけで済む。SceneCompositionは触らなくてよい。
 */
export const SLIDE_VARIANTS = {
  card: CardSlide,
  fullbleed: FullBleedSlide,
  title: TitleSlide,
} satisfies Record<SlideVariant, SlideVariantComponent>;

export const DEFAULT_SLIDE_VARIANT: SlideVariant = "card";

interface SlideRendererProps {
  slide: SlideConfig;
  startFrame: number;      // このスライドが表示され始めた絶対フレーム
  highlight?: number;
  index?: number;
  total?: number;
  fallbackVariant?: SlideVariant;  // 動画全体のデフォルト
}

/**
 * スライド設定から適切なバリアントを選んで描画する
 * 絶対フレーム → localFrame の変換と、accentの解決をここで済ませる
 */
export const SlideRenderer: React.FC<SlideRendererProps> = ({
  slide,
  startFrame,
  highlight,
  index,
  total,
  fallbackVariant,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const name = slide.variant ?? fallbackVariant ?? DEFAULT_SLIDE_VARIANT;
  const Variant = SLIDE_VARIANTS[name] ?? SLIDE_VARIANTS[DEFAULT_SLIDE_VARIANT];

  return (
    <Variant
      slide={slide}
      localFrame={frame - startFrame}
      fps={fps}
      accent={slide.accent ?? DEFAULT_ACCENT}
      highlight={highlight}
      index={index}
      total={total}
    />
  );
};
