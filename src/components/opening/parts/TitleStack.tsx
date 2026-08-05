import React from "react";
import { FONT } from "../../slide/layout";

interface TitleStackProps {
  title: string;
  subtitle?: string;
  badge?: string;
  accent: string;
  align?: "left" | "center";
  titleSize?: number;
  color?: string;
  subColor?: string;
}

/**
 * バッジ・タイトル・サブタイトルの縦積み
 * オープニングとサムネイルで共通で使う
 */
export const TitleStack: React.FC<TitleStackProps> = ({
  title,
  subtitle,
  badge,
  accent,
  align = "center",
  titleSize = 108,
  color = "#ffffff",
  subColor = "rgba(255,255,255,0.85)",
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: align === "center" ? "center" : "flex-start",
      textAlign: align,
      gap: 24,
      fontFamily: FONT,
    }}
  >
    {badge && (
      <div
        style={{
          backgroundColor: accent,
          color: "#ffffff",
          fontSize: Math.round(titleSize * 0.26),
          fontWeight: 800,
          padding: "8px 24px",
          borderRadius: 999,
          letterSpacing: 2,
        }}
      >
        {badge}
      </div>
    )}

    <div
      style={{
        fontSize: titleSize,
        fontWeight: 900,
        color,
        lineHeight: 1.15,
        letterSpacing: 1,
        textShadow: "0 10px 40px rgba(0,0,0,0.35)",
      }}
    >
      {title}
    </div>

    {subtitle && (
      <div
        style={{
          fontSize: Math.round(titleSize * 0.34),
          fontWeight: 700,
          color: subColor,
          lineHeight: 1.4,
        }}
      >
        {subtitle}
      </div>
    )}
  </div>
);
