import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { OpeningVariantComponent } from "./types";
import { useOpeningTiming } from "./parts/useOpeningTiming";
import { TitleStack } from "./parts/TitleStack";

/**
 * band: 斜めの帯にタイトルを載せる
 * 帯が横から滑り込んでくるので、動きを付けたいときに使う
 */
export const BandOpening: OpeningVariantComponent = ({
  opening,
  accent,
  durationInFrames,
}) => {
  const { enter, exit, opacity } = useOpeningTiming(durationInFrames);
  const slideX = interpolate(enter, [0, 1], [-1400, 0]);

  // 右側にはキャラクターが立っているので、帯はそこに被らない幅に収める
  const BAND_WIDTH = "72%";

  return (
    <AbsoluteFill style={{ justifyContent: "center", opacity: exit }}>
      {/* 背面の細い帯 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          width: BAND_WIDTH,
          height: 24,
          top: "31%",
          backgroundColor: accent,
          transform: `translateX(${slideX * 0.4}px) rotate(-3deg)`,
          opacity: 0.9,
        }}
      />

      {/* タイトルの帯 */}
      <div
        style={{
          alignSelf: "flex-start",
          maxWidth: BAND_WIDTH,
          backgroundColor: "rgba(16,16,28,0.92)",
          padding: "56px 96px",
          transform: `translateX(${slideX}px) rotate(-3deg)`,
          boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
        }}
      >
        <TitleStack
          title={opening.title}
          subtitle={opening.subtitle}
          badge={opening.badge}
          accent={accent}
          align="left"
          titleSize={88}
        />
      </div>

      {/* 前面の細い帯 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          width: BAND_WIDTH,
          height: 14,
          bottom: "26%",
          backgroundColor: accent,
          transform: `translateX(${-slideX * 0.3}px) rotate(-3deg)`,
          opacity: opacity * 0.75,
        }}
      />
    </AbsoluteFill>
  );
};
