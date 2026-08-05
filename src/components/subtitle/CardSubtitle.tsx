import React from "react";
import { interpolate } from "remotion";
import { SubtitleVariantComponent } from "./types";
import { FONT, subtitleFrameStyle, useSubtitleAppear } from "./layout";

/**
 * card: 白いカードにアクセント色の縦線
 * スライドと並べたときに世界観を揃えたいときに使う
 */
export const CardSubtitle: SubtitleVariantComponent = ({
  text,
  withSlide,
  accent,
}) => {
  const opacity = useSubtitleAppear();

  return (
    <div style={subtitleFrameStyle(withSlide)}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          backgroundColor: "rgba(255,255,255,0.96)",
          padding: "20px 34px",
          borderRadius: 18,
          maxWidth: "88%",
          opacity,
          transform: `scale(${interpolate(opacity, [0, 1], [0.97, 1])})`,
          boxShadow: "0 12px 34px rgba(0,0,0,0.28)",
        }}
      >
        <div
          style={{
            width: 8,
            alignSelf: "stretch",
            borderRadius: 4,
            backgroundColor: accent,
            flexShrink: 0,
          }}
        />
        <div
          style={{
            color: "#1a1a2e",
            fontSize: 42,
            fontFamily: FONT,
            fontWeight: 700,
            lineHeight: 1.35,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};
