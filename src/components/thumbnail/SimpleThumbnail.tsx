import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { ThumbnailVariantComponent } from "./types";
import { ThumbnailCharacter } from "./parts/ThumbnailCharacter";
import { TitleStack } from "../opening/parts/TitleStack";

/**
 * simple: 中央寄せの落ち着いた構成
 * キャラクターは小さく足元に置く
 */
export const SimpleThumbnail: ThumbnailVariantComponent = ({
  thumbnail,
  accent,
}) => {
  const { height } = useVideoConfig();
  const k = height / 720;

  return (
    <AbsoluteFill>
      <ThumbnailCharacter
        emotion={thumbnail.emotion}
        align="right"
        scale={0.72}
      />

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,20,0.55) 0%, rgba(10,10,20,0.78) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: `0 ${80 * k}px`,
        }}
      >
        <TitleStack
          title={thumbnail.title}
          subtitle={thumbnail.subtitle}
          badge={thumbnail.badge}
          accent={accent}
          align="center"
          titleSize={Math.round(84 * k)}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
