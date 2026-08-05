import React from "react";
import { interpolate } from "remotion";
import { SubtitleVariantComponent } from "./types";
import { FONT, subtitleFrameStyle, useSubtitleAppear } from "./layout";

/**
 * bar: 横幅いっぱいの帯（ニュース番組風）
 * 左端にアクセント色の線が入る
 */
export const BarSubtitle: SubtitleVariantComponent = ({
  text,
  withSlide,
  accent,
}) => {
  const opacity = useSubtitleAppear();

  return (
    <div
      style={{
        ...subtitleFrameStyle(withSlide, { withSlide: 48, alone: 64 }),
        justifyContent: "stretch",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "stretch",
          margin: withSlide ? 0 : "0 72px",
          opacity,
          transform: `translateY(${interpolate(opacity, [0, 1], [12, 0])}px)`,
          boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div style={{ width: 12, backgroundColor: accent, flexShrink: 0 }} />
        <div
          style={{
            flex: 1,
            backgroundColor: "rgba(16, 16, 28, 0.88)",
            color: "#ffffff",
            padding: "22px 32px",
            fontSize: 40,
            fontFamily: FONT,
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};
