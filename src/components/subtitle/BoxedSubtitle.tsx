import React from "react";
import { SubtitleVariantComponent } from "./types";
import { FONT, subtitleFrameStyle, useSubtitleAppear } from "./layout";

/**
 * boxed: 黒い半透明の角丸ボックス（デフォルト）
 * どんな背景でも読めるので、迷ったらこれ
 */
export const BoxedSubtitle: SubtitleVariantComponent = ({ text, withSlide }) => {
  const opacity = useSubtitleAppear();

  return (
    <div style={subtitleFrameStyle(withSlide)}>
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          color: "white",
          padding: "20px 40px",
          borderRadius: 12,
          fontSize: 42,
          fontFamily: FONT,
          fontWeight: 700,
          opacity,
          maxWidth: "85%",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {text}
      </div>
    </div>
  );
};
