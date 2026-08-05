import React from "react";
import { interpolate, spring } from "remotion";
import { SLIDE_AREA, FONT } from "../layout";

interface SlideShellProps {
  localFrame: number;
  fps: number;
  children: React.ReactNode;
  // 見た目の差し替え用。省略すると白いカードになる
  background?: string;
  borderRadius?: number;
  boxShadow?: string;
  padding?: number | string;
}

/**
 * スライドの外枠と登場アニメーション
 *
 * 全バリアントがこれを土台にすることで、
 * 位置・サイズ・出方が揃う。中身だけを差し替えればよい。
 */
export const SlideShell: React.FC<SlideShellProps> = ({
  localFrame,
  fps,
  children,
  background = "#ffffff",
  borderRadius = 28,
  boxShadow = "0 24px 60px rgba(0,0,0,0.28)",
  padding,
}) => {
  const enter = spring({
    frame: localFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });
  const enterOpacity = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enterX = interpolate(enter, [0, 1], [-40, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: SLIDE_AREA.left,
        top: SLIDE_AREA.top,
        width: SLIDE_AREA.width,
        height: SLIDE_AREA.height,
        opacity: enterOpacity,
        transform: `translateX(${enterX}px)`,
        backgroundColor: background,
        borderRadius,
        boxShadow,
        padding,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: FONT,
      }}
    >
      {children}
    </div>
  );
};
