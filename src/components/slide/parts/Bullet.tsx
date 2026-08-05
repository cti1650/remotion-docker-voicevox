import React from "react";
import { interpolate, spring } from "remotion";
import { bulletDelay } from "../layout";

// 明るい面に載せるか、暗い背景に直接載せるか
export type BulletTone = "dark" | "light";

const TONES = {
  dark: {
    text: "#3d3d52",
    activeText: "#1a1a2e",
    badgeBg: "#e8e8f0",
    badgeText: "#6b6b80",
    activeBg: (accent: string) => `${accent}1a`,
  },
  light: {
    text: "rgba(255,255,255,0.92)",
    activeText: "#ffffff",
    badgeBg: "rgba(255,255,255,0.22)",
    badgeText: "#ffffff",
    activeBg: () => "rgba(255,255,255,0.16)",
  },
} as const;

interface BulletProps {
  text: string;
  index: number;
  localFrame: number;
  fps: number;
  accent: string;
  active: boolean;
  compact?: boolean;  // 画像と横並びのときは小さめにする
  tone?: BulletTone;  // 暗い背景に直接載せるときはlight
}

/**
 * 番号付きの箇条書き1行
 * 順番に現れ、highlightで指定された行だけ色が付く
 */
export const Bullet: React.FC<BulletProps> = ({
  text,
  index,
  localFrame,
  fps,
  accent,
  active,
  compact = false,
  tone = "dark",
}) => {
  const palette = TONES[tone];
  const delay = bulletDelay(index, fps);
  const appear = spring({
    frame: localFrame - delay,
    fps,
    config: { damping: 200, stiffness: 120 },
  });

  // 強調時のふわっとした拡大
  const emphasis = active ? 1.03 : 1;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 16 : 22,
        padding: compact ? "12px 18px" : "16px 22px",
        borderRadius: 16,
        backgroundColor: active ? palette.activeBg(accent) : "transparent",
        opacity: appear,
        transform: `translateY(${interpolate(appear, [0, 1], [16, 0])}px) scale(${emphasis})`,
        transformOrigin: "left center",
      }}
    >
      <div
        style={{
          width: compact ? 38 : 44,
          height: compact ? 38 : 44,
          borderRadius: 22,
          backgroundColor: active ? accent : palette.badgeBg,
          color: active ? "#ffffff" : palette.badgeText,
          fontSize: compact ? 21 : 24,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {index + 1}
      </div>
      <div
        style={{
          fontSize: compact ? 33 : 40,
          fontWeight: active ? 800 : 600,
          color: active ? palette.activeText : palette.text,
          lineHeight: 1.4,
        }}
      >
        {text}
      </div>
    </div>
  );
};
