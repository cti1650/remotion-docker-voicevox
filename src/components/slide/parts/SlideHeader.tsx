import React from "react";

interface SlideHeaderProps {
  title?: string;
  accent: string;
  // 枠なしのバリアントでは文字色と区切り線を変える
  color?: string;
  divider?: string;
}

/**
 * スライド上部のタイトル行（アクセントの縦棒 + タイトル）
 */
export const SlideHeader: React.FC<SlideHeaderProps> = ({
  title,
  accent,
  color = "#1a1a2e",
  divider = "3px solid #f0f0f5",
}) => (
  <div
    style={{
      padding: "34px 48px 26px",
      borderBottom: divider,
      display: "flex",
      alignItems: "center",
      gap: 20,
    }}
  >
    <div
      style={{
        width: 12,
        height: 52,
        borderRadius: 6,
        backgroundColor: accent,
        flexShrink: 0,
      }}
    />
    <div
      style={{
        fontSize: 52,
        fontWeight: 800,
        color,
        lineHeight: 1.2,
      }}
    >
      {title ?? ""}
    </div>
  </div>
);
