import React from "react";
import { Img, interpolate, spring } from "remotion";
import { resolveMediaSrc } from "../../../utils/media";

interface SlideImageProps {
  src: string;
  caption?: string;
  localFrame: number;
  fps: number;
  delay: number;
  compact: boolean;  // 箇条書きと同居しているか
  side: boolean;     // 箇条書きの横に並べるか
  bare?: boolean;    // 枠・影を付けない（fullbleed用）
}

/**
 * スライドに差し込む画像
 * 箇条書きが出そろってから現れるよう、delayで遅らせる
 */
export const SlideImage: React.FC<SlideImageProps> = ({
  src,
  caption,
  localFrame,
  fps,
  delay,
  compact,
  side,
  bare = false,
}) => {
  const appear = spring({
    frame: localFrame - delay,
    fps,
    config: { damping: 200, stiffness: 120 },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        // 横並びのときは幅を、縦積みのときは高さを制限する
        width: side ? "48%" : "100%",
        maxHeight: side ? "100%" : compact ? "42%" : "100%",
        flexShrink: 0,
        minHeight: 0,
        opacity: appear,
        transform: `scale(${interpolate(appear, [0, 1], [0.94, 1])})`,
      }}
    >
      <Img
        src={resolveMediaSrc(src)}
        style={{
          maxWidth: "100%",
          maxHeight: caption ? "88%" : "100%",
          objectFit: "contain",
          borderRadius: bare ? 20 : 16,
          border: bare ? "none" : "2px solid #eeeef4",
          boxShadow: bare
            ? "0 18px 50px rgba(0,0,0,0.35)"
            : "0 8px 24px rgba(0,0,0,0.10)",
        }}
      />
      {caption && (
        <div
          style={{
            fontSize: 24,
            color: bare ? "rgba(255,255,255,0.85)" : "#8a8a9a",
            textAlign: "center",
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
};
