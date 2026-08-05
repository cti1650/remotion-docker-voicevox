import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { ThumbnailVariantComponent } from "./types";
import { ThumbnailCharacter } from "./parts/ThumbnailCharacter";
import { TitleStack } from "../opening/parts/TitleStack";

/**
 * bold: 左に特大タイトル、右にキャラクター（デフォルト）
 * 一覧で目立たせたいときの標準形
 */
export const BoldThumbnail: ThumbnailVariantComponent = ({
  thumbnail,
  accent,
}) => {
  const { width, height } = useVideoConfig();
  // 1280x720を基準にした文字サイズ。サイズを変えても見た目が崩れないようにする
  const k = height / 720;

  return (
    <AbsoluteFill>
      <ThumbnailCharacter emotion={thumbnail.emotion} align="right" />

      {/* 文字を読みやすくするため左側を暗く落とす */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(90deg, rgba(10,10,20,0.82) 0%, rgba(10,10,20,0.7) 48%, rgba(10,10,20,0) 78%)`,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          padding: `0 ${width * 0.38}px 0 ${64 * k}px`,
        }}
      >
        <TitleStack
          title={thumbnail.title}
          subtitle={thumbnail.subtitle}
          badge={thumbnail.badge}
          accent={accent}
          align="left"
          titleSize={Math.round(96 * k)}
        />
      </AbsoluteFill>

      {/* 下端のアクセントライン */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 14 * k,
          backgroundColor: accent,
        }}
      />
    </AbsoluteFill>
  );
};
