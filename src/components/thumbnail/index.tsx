import React from "react";
import { AbsoluteFill } from "remotion";
import { ThumbnailConfig, ThumbnailVariant } from "../../types/scene";
import { CharacterProvider } from "../../characters";
import { DEFAULT_ACCENT } from "../slide/layout";
import { Background } from "../Background";
import { ThumbnailVariantComponent, THUMBNAIL_SIZE } from "./types";
import { BoldThumbnail } from "./BoldThumbnail";
import { SplitThumbnail } from "./SplitThumbnail";
import { SimpleThumbnail } from "./SimpleThumbnail";

export type { ThumbnailVariantProps, ThumbnailVariantComponent } from "./types";
export { THUMBNAIL_SIZE } from "./types";
export { ThumbnailCharacter } from "./parts/ThumbnailCharacter";

/**
 * サムネイルの見た目の一覧
 *
 * 追加手順は他のバリアントと同じ3ステップ
 *   1. コンポーネントを追加（ThumbnailVariantComponentを実装）
 *   2. ここに登録
 *   3. src/types/scene.ts の ThumbnailVariant に名前を追加
 */
export const THUMBNAIL_VARIANTS = {
  bold: BoldThumbnail,
  split: SplitThumbnail,
  simple: SimpleThumbnail,
} satisfies Record<ThumbnailVariant, ThumbnailVariantComponent>;

export const DEFAULT_THUMBNAIL_VARIANT: ThumbnailVariant = "bold";

/** サムネイルのサイズを解決する（未指定なら1280x720） */
export const thumbnailSize = (thumbnail?: ThumbnailConfig) => ({
  width: thumbnail?.width ?? THUMBNAIL_SIZE.width,
  height: thumbnail?.height ?? THUMBNAIL_SIZE.height,
});

/**
 * サムネイル1枚を描画するコンポジション
 * `npx remotion still` で静止画として書き出す
 *
 * キャラクターはコンテキストで配るので、
 * 各バリアントは ThumbnailCharacter を置くだけでよく、
 * どのキャラクターかを知る必要がない。
 */
export const ThumbnailComposition: React.FC<{
  thumbnail: ThumbnailConfig;
  character?: string;
}> = ({ thumbnail, character }) => {
  const name = thumbnail.variant ?? DEFAULT_THUMBNAIL_VARIANT;
  const Variant =
    THUMBNAIL_VARIANTS[name] ?? THUMBNAIL_VARIANTS[DEFAULT_THUMBNAIL_VARIANT];

  return (
    <CharacterProvider name={character}>
      <AbsoluteFill>
        <Background config={thumbnail.background ?? "gradient"} />
        <Variant
          thumbnail={thumbnail}
          accent={thumbnail.accent ?? DEFAULT_ACCENT}
        />
      </AbsoluteFill>
    </CharacterProvider>
  );
};
