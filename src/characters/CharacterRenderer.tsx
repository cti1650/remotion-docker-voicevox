import React from "react";
import { useCurrentFrame, useVideoConfig, Img, staticFile } from "remotion";
import type { CharacterDefinition } from "./types";

interface CharacterRendererProps {
  character: CharacterDefinition;
  scale?: number;
  x?: number;
  y?: number;
  /** 表情プリセット名。キャラが持っていなければ既定のスロットのまま描く */
  emotion?: string;
  /** リップシンクが決めた口のパーツ名（母音キーではない） */
  mouth?: string;
  /** スロットの個別指定（腕のポーズなど） */
  slots?: Record<string, string>;
  /** レイヤーのwhenが参照するフラグ */
  flags?: Record<string, boolean>;
  enableBlink?: boolean;
  enableBreathing?: boolean;
}

/** 一定間隔で目を閉じる。目のスロットを持たないキャラでは何もしない */
function useBlinkSlot(
  character: CharacterDefinition,
  enabled: boolean
): Record<string, string> {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const blink = character.blink;
  if (!enabled || !blink) return {};

  const blinkInterval = fps * 3;
  const blinkDuration = Math.floor(fps * 0.12);

  if (frame % blinkInterval < blinkDuration) {
    return { [blink.slot]: blink.closed };
  }
  return {};
}

function useBreathingOffset(enabled: boolean): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!enabled) return 0;

  const breathingPeriod = fps * 4;
  const progress = (frame % breathingPeriod) / breathingPeriod;
  return Math.sin(progress * Math.PI * 2) * 3;
}

/**
 * キャラクター定義のlayersを順に重ねて描くだけの汎用コンポーネント
 *
 * 何を描くかは character.json 側が決めるので、
 * キャラクターを増やしてもこのファイルは変更しない。
 */
export const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  character,
  scale = 1,
  x = 0,
  y = 0,
  emotion = "normal",
  mouth,
  slots: slotOverrides,
  flags: flagOverrides,
  enableBlink = true,
  enableBreathing = true,
}) => {
  const blinkSlot = useBlinkSlot(character, enableBlink);
  const breathingOffset = useBreathingOffset(enableBreathing);

  // 後に書いたものが勝つ（既定 → 表情 → 個別指定 → 口 → 瞬き）
  const slots: Record<string, string> = {
    ...character.defaultSlots,
    ...(character.emotions[emotion] ?? {}),
    ...(slotOverrides ?? {}),
    ...(mouth ? { [character.mouthSlot]: mouth } : {}),
    ...blinkSlot,
  };

  const flags: Record<string, boolean> = {
    ...(character.defaultFlags ?? {}),
    ...(flagOverrides ?? {}),
  };

  const { basePath, width, height, layers, ext = "png" } = character.art;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + breathingOffset,
        transform: `scale(${scale})`,
        transformOrigin: "bottom center",
        width,
        height,
      }}
    >
      {layers.map((layer, i) => {
        if (layer.when && !flags[layer.when]) return null;

        let file: string | undefined;
        if (layer.file) {
          file = layer.file;
        } else if (layer.dir && layer.slot) {
          const part = slots[layer.slot];
          // スロットに値が無いレイヤーは描かない（そのキャラには無いパーツ）
          if (!part) return null;
          file = `${layer.dir}/${part}.${ext}`;
        }
        if (!file) return null;

        return (
          <Img
            key={i}
            src={staticFile(`${basePath}/${file}`)}
            style={{ position: "absolute", top: 0, left: 0 }}
          />
        );
      })}
    </div>
  );
};
