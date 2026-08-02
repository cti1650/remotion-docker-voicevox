import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { HighlightImage as HighlightImageConfig } from "../types/scene";

interface HighlightImageProps {
  config: HighlightImageConfig | string;
}

export const HighlightImage: React.FC<HighlightImageProps> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 文字列の場合はsrcのみ
  const imageConfig: HighlightImageConfig =
    typeof config === "string"
      ? { src: config }
      : config;

  const {
    src,
    position = "top-right",
    scale = 1,
    animation = "fade-in",
  } = imageConfig;

  // 位置の計算
  const positionStyles: Record<string, React.CSSProperties> = {
    "top-right": { top: 40, right: 40 },
    "top-left": { top: 40, left: 40 },
    "center": { top: "50%", left: "50%", transform: `translate(-50%, -50%) scale(${scale})` },
    "bottom-right": { bottom: 120, right: 40 },
    "bottom-left": { bottom: 120, left: 40 },
  };

  // アニメーションの計算
  const animationDuration = Math.floor(fps * 0.5); // 0.5秒
  let opacity = 1;
  let translateY = 0;
  let scaleValue = scale;

  switch (animation) {
    case "fade-in":
      opacity = interpolate(frame, [0, animationDuration], [0, 1], {
        extrapolateRight: "clamp",
      });
      break;
    case "slide-in":
      opacity = interpolate(frame, [0, animationDuration], [0, 1], {
        extrapolateRight: "clamp",
      });
      translateY = interpolate(frame, [0, animationDuration], [-30, 0], {
        extrapolateRight: "clamp",
      });
      break;
    case "zoom-in":
      opacity = interpolate(frame, [0, animationDuration], [0, 1], {
        extrapolateRight: "clamp",
      });
      scaleValue = interpolate(frame, [0, animationDuration], [0.8, 1], {
        extrapolateRight: "clamp",
      }) * scale;
      break;
    case "none":
    default:
      break;
  }

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    maxWidth: 400,
    maxHeight: 300,
    objectFit: "contain",
    borderRadius: 12,
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    opacity,
    transform: position === "center"
      ? `translate(-50%, -50%) scale(${scaleValue}) translateY(${translateY}px)`
      : `scale(${scaleValue}) translateY(${translateY}px)`,
    ...positionStyles[position],
  };

  return (
    <Img
      src={staticFile(src)}
      style={baseStyle}
    />
  );
};
