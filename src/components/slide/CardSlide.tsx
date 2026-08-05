import React from "react";
import { SlideVariantComponent } from "./types";
import { SlideShell } from "./parts/SlideShell";
import { SlideHeader } from "./parts/SlideHeader";
import { SlideBody } from "./parts/SlideBody";
import { SlideFooter } from "./parts/SlideFooter";

/**
 * card: 白いカードにタイトル・箇条書き・フッターを載せる標準のスライド
 * variantを指定しなければこれが使われる
 */
export const CardSlide: SlideVariantComponent = ({
  slide,
  localFrame,
  fps,
  accent,
  highlight,
  index,
  total,
}) => (
  <SlideShell localFrame={localFrame} fps={fps}>
    <SlideHeader title={slide.title} accent={accent} />
    <SlideBody
      slide={slide}
      localFrame={localFrame}
      fps={fps}
      accent={accent}
      highlight={highlight}
    />
    <SlideFooter note={slide.note} accent={accent} index={index} total={total} />
  </SlideShell>
);
