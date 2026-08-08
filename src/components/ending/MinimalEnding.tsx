import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { EndingVariantComponent } from "./types";
import { useEndingTiming } from "./parts/useEndingTiming";
import { TitleStack } from "../opening/parts/TitleStack";

/**
 * minimal: 右上に寄せた控えめなメッセージ
 *
 * オープニングのminimalは左下だが、エンディングでは
 * 左下にクレジットが重なる（併存）ため、そこを避けて上に置く。
 */
export const MinimalEnding: EndingVariantComponent = ({
  ending,
  accent,
  durationInFrames,
}) => {
  const { enter, opacity } = useEndingTiming(durationInFrames);
  const slideX = interpolate(enter, [0, 1], [-60, 0]);

  return (
    <AbsoluteFill
      style={{
        alignItems: "flex-start",
        justifyContent: "flex-start",
        padding: "150px 0 0 120px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 32,
          opacity,
          transform: `translateX(${slideX}px)`,
        }}
      >
        <div
          style={{
            width: 10,
            borderRadius: 5,
            backgroundColor: accent,
            flexShrink: 0,
          }}
        />
        <TitleStack
          title={ending.title}
          subtitle={ending.subtitle}
          badge={ending.badge}
          accent={accent}
          align="left"
          titleSize={82}
        />
      </div>
    </AbsoluteFill>
  );
};
