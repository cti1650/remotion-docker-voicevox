import { useCurrentFrame, interpolate } from "remotion";
import { SLIDE_AREA } from "../slide/layout";

export const FONT = "'Noto Sans JP', sans-serif";

/**
 * テロップの置き場所
 *
 * スライド表示中はスライドの真下に寄せて、右側のキャラクターに被らないようにする。
 * バリアントはこれをベースにして、中身の見た目だけを変える。
 */
export const subtitleFrameStyle = (
  withSlide: boolean,
  bottom?: { withSlide: number; alone: number }
): React.CSSProperties => ({
  position: "absolute",
  bottom: withSlide ? bottom?.withSlide ?? 60 : bottom?.alone ?? 80,
  left: withSlide ? SLIDE_AREA.left : 0,
  right: withSlide ? undefined : 0,
  width: withSlide ? SLIDE_AREA.width : undefined,
  display: "flex",
  justifyContent: "center",
});

/** テロップのフェードイン（全バリアント共通） */
export const useSubtitleAppear = () => {
  const frame = useCurrentFrame();
  return interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
};
