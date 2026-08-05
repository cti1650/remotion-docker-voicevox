import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { OpeningVariantComponent } from "./types";
import { useOpeningTiming } from "./parts/useOpeningTiming";
import { TitleStack } from "./parts/TitleStack";

/**
 * center: 画面中央に大きくタイトルを出す（デフォルト）
 * アクセント色の横線が左右に伸びる
 */
export const CenterOpening: OpeningVariantComponent = ({
  opening,
  accent,
  durationInFrames,
}) => {
  const { enter, opacity, riseY } = useOpeningTiming(durationInFrames);
  const lineWidth = interpolate(enter, [0, 1], [0, 420]);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `translateY(${riseY}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 34,
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
          title={opening.title}
          subtitle={opening.subtitle}
          badge={opening.badge}
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
