import React from "react";
import { SlideConfig } from "../../../types/scene";
import { bulletDelay } from "../layout";
import { Bullet, BulletTone } from "./Bullet";
import { SlideImage } from "./SlideImage";

interface SlideBodyProps {
  slide: SlideConfig;
  localFrame: number;
  fps: number;
  accent: string;
  highlight?: number;
  bare?: boolean;      // 画像に枠を付けない（fullbleed用）
  tone?: BulletTone;   // 暗い背景に直接載せるときはlight
}

/**
 * 箇条書きと画像の並べ方
 *
 * imageLayoutが`split`なら横並び、`stack`なら縦積み。
 * 箇条書きが無ければ画像だけを大きく見せる。
 */
export const SlideBody: React.FC<SlideBodyProps> = ({
  slide,
  localFrame,
  fps,
  accent,
  highlight,
  bare = false,
  tone = "dark",
}) => {
  const hasBullets = Boolean(slide.bullets?.length);
  const hasImage = Boolean(slide.image);
  const layout = slide.imageLayout ?? "split";
  const side = hasBullets && hasImage && layout === "split";

  return (
    <div
      style={{
        flex: 1,
        padding: "40px 48px",
        display: "flex",
        flexDirection: side ? "row" : "column",
        alignItems: "center",
        justifyContent: "center",
        gap: hasBullets && hasImage ? 36 : 26,
        minHeight: 0,
      }}
    >
      {hasBullets && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 26,
            minWidth: 0,
            width: "100%",
          }}
        >
          {slide.bullets?.map((bullet, i) => (
            <Bullet
              key={i}
              text={bullet}
              index={i}
              localFrame={localFrame}
              fps={fps}
              accent={accent}
              active={highlight === i + 1}
              compact={side}
              tone={tone}
            />
          ))}
        </div>
      )}

      {hasImage && (
        <SlideImage
          src={slide.image as string}
          caption={slide.caption}
          localFrame={localFrame}
          fps={fps}
          delay={bulletDelay(slide.bullets?.length ?? 0, fps)}
          compact={hasBullets}
          side={side}
          bare={bare}
        />
      )}
    </div>
  );
};
