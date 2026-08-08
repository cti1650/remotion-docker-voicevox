import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { EndingVariantComponent } from "./types";
import { useEndingTiming } from "./parts/useEndingTiming";
import { TitleStack } from "../opening/parts/TitleStack";

/**
 * center: 画面中央に大きくメッセージを出す（デフォルト）
 * アクセント色の横線が左右に伸びる
 *
 * エンディングは「ご視聴ありがとうございました」のように長くなりやすいので、
 * 右のキャラクターに被らない幅で折り返す。
 */
const CONTENT_WIDTH = 980;
export const CenterEnding: EndingVariantComponent = ({
  ending,
  accent,
  durationInFrames,
}) => {
  const { enter, opacity, riseY } = useEndingTiming(durationInFrames);
  const lineWidth = interpolate(enter, [0, 1], [0, 420]);
  // 中央ではなく、キャラクターの左側の余白の中央に置く
  const centerX = -170;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `translate(${centerX}px, ${riseY}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 34,
          maxWidth: CONTENT_WIDTH,
        }}
      >
        <div
          style={{
            width: lineWidth,
            height: 8,
            borderRadius: 4,
            backgroundColor: accent,
          }}
        />
        <TitleStack
          title={ending.title}
          subtitle={ending.subtitle}
          badge={ending.badge}
          accent={accent}
          align="center"
        />
        <div
          style={{
            width: lineWidth,
            height: 8,
            borderRadius: 4,
            backgroundColor: accent,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
