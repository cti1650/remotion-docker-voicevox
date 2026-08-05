import React from "react";
import { interpolate, spring } from "remotion";
import { SlideVariantComponent } from "./types";
import { SlideShell } from "./parts/SlideShell";

/**
 * title: タイトルだけを大きく見せる章扉
 *
 * 話題の切り替わりを示すときに使う。
 * bulletsは書いてもここでは表示しないので、noteに一言添える運用。
 */
export const TitleSlide: SlideVariantComponent = ({
  slide,
  localFrame,
  fps,
  accent,
  index,
  total,
}) => {
  const appear = spring({
    frame: localFrame - Math.floor(fps * 0.15),
    fps,
    config: { damping: 200, stiffness: 120 },
  });

  return (
    <SlideShell
      localFrame={localFrame}
      fps={fps}
      background="#ffffff"
      padding="0 72px"
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
          opacity: appear,
          transform: `translateY(${interpolate(appear, [0, 1], [24, 0])}px)`,
        }}
      >
        <div
          style={{
            width: 96,
            height: 12,
            borderRadius: 6,
            backgroundColor: accent,
          }}
        />
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            color: "#1a1a2e",
            lineHeight: 1.25,
          }}
        >
          {slide.title ?? ""}
        </div>
        {slide.note && (
          <div style={{ fontSize: 36, color: "#6b6b80", lineHeight: 1.5 }}>
            {slide.note}
          </div>
        )}
      </div>

      {index && total ? (
        <div
          style={{
            padding: "0 0 36px",
            fontSize: 26,
            fontWeight: 700,
            color: accent,
            textAlign: "right",
          }}
        >
          {index} / {total}
        </div>
      ) : null}
    </SlideShell>
  );
};
