import React from "react";
import { SlideVariantComponent } from "./types";
import { SlideShell } from "./parts/SlideShell";
import { SlideHeader } from "./parts/SlideHeader";
import { SlideBody } from "./parts/SlideBody";
import { SlideFooter } from "./parts/SlideFooter";

/**
 * fullbleed: カードの白地を外して背景の上に直接置く
 * 画像を主役にしたいときや、背景の色をそのまま見せたいときに使う
 */
export const FullBleedSlide: SlideVariantComponent = ({
  slide,
  localFrame,
  fps,
  accent,
  highlight,
  index,
  total,
}) => (
  <SlideShell
    localFrame={localFrame}
    fps={fps}
    background="transparent"
    boxShadow="none"
    borderRadius={0}
  >
    <SlideHeader
      title={slide.title}
      accent={accent}
      color="#ffffff"
      divider="3px solid rgba(255,255,255,0.25)"
    />
    <SlideBody
      slide={slide}
      localFrame={localFrame}
      fps={fps}
      accent={accent}
      highlight={highlight}
      bare
      tone="light"
    />
    <SlideFooter
      note={slide.note}
      accent="#ffffff"
      index={index}
      total={total}
      color="rgba(255,255,255,0.75)"
    />
  </SlideShell>
);
