import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

/**
 * エンディング共通の入りアニメーション
 *
 * オープニングと違い、**終わり際にフェードアウトしない**。
 * 動画の最後なので、出したまま終わるほうが自然なため。
 * クレジットは最後の2秒に重ねて表示される（併存）。
 */
export const useEndingTiming = (durationInFrames: number, delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, stiffness: 90 },
  });

  return {
    frame,
    fps,
    durationInFrames,
    enter,
    opacity: enter,
    riseY: interpolate(enter, [0, 1], [40, 0]),
  };
};
