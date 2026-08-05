import type React from "react";
import type { ThumbnailConfig } from "../../types/scene";

/**
 * サムネイルバリアントが受け取るprops
 *
 * 静止画なのでフレームは渡さない。
 * サイズはコンポジション側（useVideoConfig）から取る。
 */
export interface ThumbnailVariantProps {
  thumbnail: ThumbnailConfig;
  accent: string;
}

export type ThumbnailVariantComponent = React.FC<ThumbnailVariantProps>;

// サムネイルの既定サイズ（YouTube推奨）
export const THUMBNAIL_SIZE = { width: 1280, height: 720 } as const;
