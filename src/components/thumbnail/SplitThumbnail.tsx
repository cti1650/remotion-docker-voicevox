import React from "react";
import { AbsoluteFill, Img, useVideoConfig } from "remotion";
import { ThumbnailVariantComponent } from "./types";
import { ThumbnailCharacter } from "./parts/ThumbnailCharacter";
import { TitleStack } from "../opening/parts/TitleStack";
import { resolveMediaSrc } from "../../utils/media";

/**
 * split: 上にタイトルの帯、下にキャラクターと画像
 * 図や画面写真を見せたいときに使う
 */
export const SplitThumbnail: ThumbnailVariantComponent = ({
  thumbnail,
  accent,
}) => {
  const { height } = useVideoConfig();
  const k = height / 720;

  return (
    <AbsoluteFill>
      {thumbnail.image && (
        <AbsoluteFill
          style={{
            alignItems: "flex-start",
            justifyContent: "flex-end",
            padding: `0 0 ${40 * k}px ${56 * k}px`,
          }}
        >
          <Img
            src={resolveMediaSrc(thumbnail.image)}
            style={{
              maxWidth: "52%",
              maxHeight: "46%",
              objectFit: "contain",
              borderRadius: 18 * k,
              boxShadow: "0 18px 48px rgba(0,0,0,0.45)",
            }}
          />
        </AbsoluteFill>
      )}

      {/* 上部の帯。キャラクターより先に描いて、頭が帯から飛び出すようにする */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          padding: `${34 * k}px ${56 * k}px ${30 * k}px`,
          backgroundColor: "rgba(10,10,20,0.86)",
          borderBottom: `${8 * k}px solid ${accent}`,
        }}
      >
        <TitleStack
          title={thumbnail.title}
          subtitle={thumbnail.subtitle}
          badge={thumbnail.badge}
          accent={accent}
          align="left"
          titleSize={Math.round(78 * k)}
        />
      </div>

      <ThumbnailCharacter
        emotion={thumbnail.emotion}
        align="right"
        scale={0.92}
      />
    </AbsoluteFill>
  );
};
