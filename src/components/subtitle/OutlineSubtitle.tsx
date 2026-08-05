import React from "react";
import { SubtitleVariantComponent } from "./types";
import { FONT, subtitleFrameStyle, useSubtitleAppear } from "./layout";

/**
 * outline: 背景を敷かず、縁取りだけで読ませる（実況・ゲーム配信風）
 * 背景やスライドを隠したくないときに使う
 */
export const OutlineSubtitle: SubtitleVariantComponent = ({
  text,
  withSlide,
}) => {
  const opacity = useSubtitleAppear();

  return (
    <div style={subtitleFrameStyle(withSlide, { withSlide: 52, alone: 72 })}>
      <div
        style={{
          color: "#ffffff",
          fontSize: 52,
          fontFamily: FONT,
          fontWeight: 900,
          opacity,
          maxWidth: "90%",
          textAlign: "center",
          lineHeight: 1.35,
          // 縁取り。paint-orderで文字が縁に潰されないようにする
          WebkitTextStroke: "10px #1a1a2e",
          paintOrder: "stroke fill",
          textShadow: "0 6px 18px rgba(0,0,0,0.45)",
        }}
      >
        {text}
      </div>
    </div>
  );
};
