import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { OpeningVariantComponent } from "./types";
import { useOpeningTiming } from "./parts/useOpeningTiming";
import { TitleStack } from "./parts/TitleStack";

/**
 * minimal: 左下に寄せた控えめなタイトル
 * キャラクターや背景を見せたいときに使う
 */
export const MinimalOpening: OpeningVariantComponent = ({
  opening,
  accent,
  durationInFrames,
}) => {
  const { enter, opacity } = useOpeningTiming(durationInFrames);
  const slideX = interpolate(enter, [0, 1], [-60, 0]);

  return (
    <AbsoluteFill
      style={{
        alignItems: "flex-start",
        justifyContent: "flex-end",
        padding: "0 0 140px 120px",
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
          title={opening.title}
          subtitle={opening.subtitle}
          badge={opening.badge}
          accent={accent}
          align="left"
          titleSize={82}
        />
      </div>
    </AbsoluteFill>
  );
};
