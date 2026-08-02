import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
} from "remotion";

// 口の形状タイプ（英語名）
export type MouthType =
  | "closed" | "a" | "aa" | "u" | "e"
  | "aha" | "smile" | "smirk" | "n" | "nn"
  | "ne" | "o" | "triangle" | "uwaa" | "muku" | "uhee";

// 目の形状タイプ（英語名）
export type EyeType =
  | "normal" | "normal_up" | "normal_left" | "normal_right"
  | "normal2" | "normal2_up" | "normal2_left" | "normal2_right"
  | "jitome" | "jitome_left" | "jitome_right"
  | "jitome2" | "jitome2_left" | "jitome2_right"
  | "narrow" | "narrow_heart"
  | "closed" | "smile" | "uu" | "happy" | "relaxed" | "circle";

// 眉の形状タイプ（英語名）
export type EyebrowType =
  | "normal" | "normal2" | "angry" | "angry2" | "raised" | "troubled";

// 枝豆の状態（英語名）
export type EdamameType = "normal" | "standing" | "standing_bent" | "wilted";

// 顔色（英語名）
export type FaceColorType = "cheek_normal" | "cheek_red" | "blush" | "pale";

// 腕のポーズ（英語名）
export type ArmPoseType = "waist" | "default" | "side" | "raise_hand" | "point_side" | "point_up" | "chop" | "near_mouth";

interface ZundamonCharacterProps {
  scale?: number;
  x?: number;
  y?: number;
  mouth?: MouthType;
  eye?: EyeType;
  eyebrow?: EyebrowType;
  edamame?: EdamameType;
  faceColor?: FaceColorType;
  rightArm?: ArmPoseType;
  leftArm?: ArmPoseType;
  enableBlink?: boolean;
  enableBreathing?: boolean;
  showSweat?: boolean;
  showTears?: boolean;
  showTail?: boolean;
}

function useBlinkState(enabled: boolean, defaultEye: EyeType): EyeType {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!enabled) return defaultEye;

  const blinkInterval = fps * 3;
  const blinkDuration = Math.floor(fps * 0.12);
  const cycleFrame = frame % blinkInterval;

  if (cycleFrame < blinkDuration) {
    return "closed";
  }

  return defaultEye;
}

function useBreathingOffset(enabled: boolean): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!enabled) return 0;

  const breathingPeriod = fps * 4;
  const progress = (frame % breathingPeriod) / breathingPeriod;
  return Math.sin(progress * Math.PI * 2) * 3;
}

export const ZundamonCharacter: React.FC<ZundamonCharacterProps> = ({
  scale = 1,
  x = 0,
  y = 0,
  mouth = "closed",
  eye: propEye = "normal",
  eyebrow = "normal",
  edamame = "normal",
  faceColor = "cheek_normal",
  rightArm = "waist",
  leftArm = "waist",
  enableBlink = true,
  enableBreathing = true,
  showSweat = false,
  showTears = false,
  showTail = true,
}) => {
  const eye = useBlinkState(enableBlink, propEye);
  const breathingOffset = useBreathingOffset(enableBreathing);

  const basePath = "parts/zundamon_en";

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + breathingOffset,
        transform: `scale(${scale})`,
        transformOrigin: "bottom center",
        width: 1082,
        height: 1594,
      }}
    >
      {/* 尻尾 */}
      {showTail && (
        <Img
          src={staticFile(`${basePath}/tail.png`)}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      )}

      {/* 体 */}
      <Img
        src={staticFile(`${basePath}/body.png`)}
        style={{ position: "absolute", top: 0, left: 0 }}
      />

      {/* 右腕 */}
      <Img
        src={staticFile(`${basePath}/arm_right/${rightArm}.png`)}
        style={{ position: "absolute", top: 0, left: 0 }}
      />

      {/* 左腕 */}
      <Img
        src={staticFile(`${basePath}/arm_left/${leftArm}.png`)}
        style={{ position: "absolute", top: 0, left: 0 }}
      />

      {/* 頭 */}
      <Img
        src={staticFile(`${basePath}/head_front/head.png`)}
        style={{ position: "absolute", top: 0, left: 0 }}
      />

      {/* 枝豆 */}
      <Img
        src={staticFile(`${basePath}/head_front/edamame/${edamame}.png`)}
        style={{ position: "absolute", top: 0, left: 0 }}
      />

      {/* 顔色 */}
      <Img
        src={staticFile(`${basePath}/head_front/face_color/${faceColor}.png`)}
        style={{ position: "absolute", top: 0, left: 0 }}
      />

      {/* 眉 */}
      <Img
        src={staticFile(`${basePath}/head_front/eyebrow/${eyebrow}.png`)}
        style={{ position: "absolute", top: 0, left: 0 }}
      />

      {/* 目 */}
      <Img
        src={staticFile(`${basePath}/head_front/eye/${eye}.png`)}
        style={{ position: "absolute", top: 0, left: 0 }}
      />

      {/* 口 */}
      <Img
        src={staticFile(`${basePath}/head_front/mouth/${mouth}.png`)}
        style={{ position: "absolute", top: 0, left: 0 }}
      />

      {/* 汗 */}
      {showSweat && (
        <Img
          src={staticFile(`${basePath}/head_front/sweat.png`)}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      )}

      {/* 涙 */}
      {showTears && (
        <Img
          src={staticFile(`${basePath}/head_front/tears.png`)}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      )}
    </div>
  );
};

// 口パク用のマッピング
export const MOUTH_MAP = {
  a: "a" as MouthType,
  i: "smile" as MouthType,
  u: "u" as MouthType,
  e: "e" as MouthType,
  o: "o" as MouthType,
  n: "n" as MouthType,
  closed: "closed" as MouthType,
};
