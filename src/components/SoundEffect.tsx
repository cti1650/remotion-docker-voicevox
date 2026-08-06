import React from "react";
import { Audio, Sequence, useVideoConfig } from "remotion";
import { SoundEffectConfig, SoundEffectInput } from "../types/scene";
import { resolveMediaSrc } from "../utils/media";

// セリフを邪魔しない程度の音量
const DEFAULT_SE_VOLUME = 0.35;

/**
 * YAMLの書き方を1つの形にそろえる
 *
 *   "audio/se/pop.ogg"          → { src: "audio/se/pop.ogg" }
 *   { src: "...", volume: 0.2 } → そのまま
 *   null / undefined            → 鳴らさない
 */
export const resolveSoundEffect = (
  input: SoundEffectInput | undefined
): SoundEffectConfig | null => {
  if (!input) return null;
  const config = typeof input === "string" ? { src: input } : input;
  return config.src ? config : null;
};

/**
 * 効果音を1回だけ鳴らす
 *
 * `startFrame`（表示が始まる絶対フレーム）に合わせて鳴らすので、
 * テロップやスライドの登場と音がそろう。
 */
export const SoundEffect: React.FC<{
  config: SoundEffectInput | undefined;
  startFrame: number;
}> = ({ config, startFrame }) => {
  const { fps } = useVideoConfig();
  const se = resolveSoundEffect(config);
  if (!se) return null;

  const from = startFrame + Math.round((se.delay ?? 0) * fps);

  return (
    <Sequence from={Math.max(0, from)}>
      <Audio src={resolveMediaSrc(se.src)} volume={se.volume ?? DEFAULT_SE_VOLUME} />
    </Sequence>
  );
};
