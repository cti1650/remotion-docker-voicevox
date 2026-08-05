import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

/**
 * オープニング共通の出入りアニメーション
 *
 * 入りはspringで押し出し、終わり際は本編へつなぐためにフェードアウトする。
 * バリアントはこの値を好きな要素に当てるだけでよい。
 */
export const useOpeningTiming = (durationInFrames: number, delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, stiffness: 90 },
  });

  // 最後の0.5秒でフェードアウト
  const outStart = Math.max(0, durationInFrames - Math.floor(fps * 0.5));
  const exit = interpolate(frame, [outStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return {
    frame,
    fps,
    enter,
    exit,
    opacity: enter * exit,
    riseY: interpolate(enter, [0, 1], [40, 0]),
  };
};
