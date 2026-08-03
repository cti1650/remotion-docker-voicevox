import React from "react";
import {
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { SlideConfig } from "../types/scene";
import { resolveMediaSrc } from "../utils/media";

// スライド枠の配置（キャラクターは右側にいるので左寄せ）
export const SLIDE_AREA = {
  left: 64,
  top: 96,
  width: 1180,
  height: 760,
} as const;

const DEFAULT_ACCENT = "#6c5ce7";
const FONT = "'Noto Sans JP', 'Hiragino Sans', sans-serif";

interface SlideFrameProps {
  slide: SlideConfig;
  startFrame: number;   // このスライドが表示され始めた絶対フレーム
  highlight?: number;   // 強調する箇条書き番号（1始まり）
  index?: number;       // 現在のスライド番号（1始まり）
  total?: number;       // 全スライド数
}

export const SlideFrame: React.FC<SlideFrameProps> = ({
  slide,
  startFrame,
  highlight,
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  const accent = slide.accent ?? DEFAULT_ACCENT;
  const hasBullets = Boolean(slide.bullets?.length);
  const hasImage = Boolean(slide.image);
  const layout = slide.imageLayout ?? "split";

  // 枠全体の登場アニメーション
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
        backgroundColor: "#ffffff",
        borderRadius: 28,
        boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: FONT,
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          padding: "34px 48px 26px",
          borderBottom: "3px solid #f0f0f5",
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
            color: "#1a1a2e",
            lineHeight: 1.2,
          }}
        >
          {slide.title ?? ""}
        </div>
      </div>

      {/* 本文 */}
      <div
        style={{
          flex: 1,
          padding: "40px 48px",
          display: "flex",
          // 箇条書きと画像を横並びにするか縦積みにするか
          flexDirection: hasBullets && hasImage && layout === "split" ? "row" : "column",
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
                compact={hasImage && layout === "split"}
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
            side={hasBullets && layout === "split"}
          />
        )}
      </div>

      {/* フッター */}
      <div
        style={{
          padding: "0 48px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 26,
          color: "#9a9aaa",
        }}
      >
        <div>{slide.note ?? ""}</div>
        {index && total ? (
          <div style={{ fontWeight: 700, color: accent }}>
            {index} / {total}
          </div>
        ) : null}
      </div>
    </div>
  );
};

// 箇条書き・画像が順番に現れるときの遅延フレーム
const bulletDelay = (index: number, fps: number) =>
  Math.floor(fps * 0.18) * (index + 1);

interface SlideImageProps {
  src: string;
  caption?: string;
  localFrame: number;
  fps: number;
  delay: number;
  compact: boolean;  // 箇条書きと同居しているか
  side: boolean;     // 箇条書きの横に並べるか
}

const SlideImage: React.FC<SlideImageProps> = ({
  src,
  caption,
  localFrame,
  fps,
  delay,
  compact,
  side,
}) => {
  const appear = spring({
    frame: localFrame - delay,
    fps,
    config: { damping: 200, stiffness: 120 },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        // 横並びのときは幅を、縦積みのときは高さを制限する
        width: side ? "48%" : "100%",
        maxHeight: side ? "100%" : compact ? "42%" : "100%",
        flexShrink: 0,
        minHeight: 0,
        opacity: appear,
        transform: `scale(${interpolate(appear, [0, 1], [0.94, 1])})`,
      }}
    >
      <Img
        src={resolveMediaSrc(src)}
        style={{
          maxWidth: "100%",
          maxHeight: caption ? "88%" : "100%",
          objectFit: "contain",
          borderRadius: 16,
          border: "2px solid #eeeef4",
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
        }}
      />
      {caption && (
        <div style={{ fontSize: 24, color: "#8a8a9a", textAlign: "center" }}>
          {caption}
        </div>
      )}
    </div>
  );
};

interface BulletProps {
  text: string;
  index: number;
  localFrame: number;
  fps: number;
  accent: string;
  active: boolean;
  compact?: boolean;  // 画像と横並びのときは小さめにする
}

const Bullet: React.FC<BulletProps> = ({
  text,
  index,
  localFrame,
  fps,
  accent,
  active,
  compact = false,
}) => {
  // 箇条書きは順番に現れる
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
        backgroundColor: active ? `${accent}1a` : "transparent",
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
          backgroundColor: active ? accent : "#e8e8f0",
          color: active ? "#ffffff" : "#6b6b80",
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
          color: active ? "#1a1a2e" : "#3d3d52",
          lineHeight: 1.4,
        }}
      >
        {text}
      </div>
    </div>
  );
};
