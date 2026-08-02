import React from "react";
import { Img, staticFile } from "remotion";
import { BackgroundConfig, BACKGROUND_PRESETS } from "../types/scene";

interface BackgroundProps {
  config: BackgroundConfig | string;
}

export const Background: React.FC<BackgroundProps> = ({ config }) => {
  // 文字列の場合はプリセットから取得
  const bgConfig: BackgroundConfig =
    typeof config === "string"
      ? BACKGROUND_PRESETS[config] || BACKGROUND_PRESETS.gradient
      : config;

  const style: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

  if (bgConfig.type === "solid") {
    return (
      <div
        style={{
          ...style,
          backgroundColor: bgConfig.value as string,
        }}
      />
    );
  }

  if (bgConfig.type === "gradient") {
    const colors = bgConfig.value as string[];
    const gradient = `linear-gradient(135deg, ${colors.join(", ")})`;
    return (
      <>
        <div
          style={{
            ...style,
            background: gradient,
          }}
        />
        {/* 装飾パターン */}
        <div
          style={{
            ...style,
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)
            `,
          }}
        />
      </>
    );
  }

  if (bgConfig.type === "image") {
    return (
      <Img
        src={staticFile(bgConfig.value as string)}
        style={{
          ...style,
          objectFit: "cover",
          width: "100%",
          height: "100%",
        }}
      />
    );
  }

  return null;
};
