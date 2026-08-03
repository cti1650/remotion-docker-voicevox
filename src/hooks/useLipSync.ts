import { useCurrentFrame, useVideoConfig } from "remotion";
import { MouthType } from "../components/ZundamonCharacter";

// ============================================
// VOICEVOX リップシンクデータ型
// ============================================

/** リップシンクエントリ（1音素分） */
export interface LipSyncEntry {
  time: number;      // 開始時間（秒）
  duration: number;  // 長さ（秒）
  phoneme: string;   // 音素
  mouth: string;     // 口の形
}

/** 1セリフ分のリップシンクデータ */
export interface LipSyncData {
  text: string;
  speaker_id: number;
  duration: number;
  lipsync: LipSyncEntry[];
}

/** セリフとリップシンクの組み合わせ */
export interface DialogueLipSync {
  start: number;           // セリフ開始時間（秒）
  lipsyncData: LipSyncData;
}

// ============================================
// VOICEVOXリップシンクフック（推奨）
// ============================================

/**
 * VOICEVOXのタイミングデータを使った正確なリップシンク
 * @param dialogues セリフとリップシンクデータの配列
 * @param defaultMouth デフォルトの口の形
 * @returns 現在のフレームに対応する口の形
 */
export function useLipSync(
  dialogues: DialogueLipSync[],
  defaultMouth: MouthType = "closed"
): MouthType {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // 現在再生中のセリフを探す
  for (const dialogue of dialogues) {
    const dialogueEnd = dialogue.start + dialogue.lipsyncData.duration;

    if (currentTime >= dialogue.start && currentTime < dialogueEnd) {
      // セリフ内の相対時間
      const relativeTime = currentTime - dialogue.start;

      // 該当する音素を探す
      for (const entry of dialogue.lipsyncData.lipsync) {
        const entryEnd = entry.time + entry.duration;

        if (relativeTime >= entry.time && relativeTime < entryEnd) {
          return convertToMouthType(entry.mouth);
        }
      }
    }
  }

  return defaultMouth;
}

/**
 * 母音キーをMouthType（パーツ名）に変換
 *
 * 母音パーツは a/i/u/e/o に揃えてあるが、i.pngとu.pngはPSDに該当する絵が無く
 * scripts/generate-mouth-parts.py で生成した派生パーツである点に注意。
 */
function convertToMouthType(mouth: string): MouthType {
  const mouthMap: Record<string, MouthType> = {
    a: "a",
    i: "i",
    u: "u",
    e: "e",
    o: "o",
    n: "n",
    closed: "closed",
    smile: "i",   // 旧JSON互換（「い」がsmileで記録されていた時期のデータ用）
  };

  return mouthMap[mouth] || "closed";
}

// ============================================
// 旧式フック（後方互換性のため維持）
// ============================================

type MouthShape = "closed" | "open" | "half";

interface LegacyLipSyncData {
  startFrame: number;
  endFrame: number;
  shape: MouthShape;
}

/**
 * @deprecated useLipSyncを使用してください
 */
export function useLipSyncFromAmplitude(amplitudeData: number[]): MouthShape {
  const frame = useCurrentFrame();

  if (!amplitudeData || amplitudeData.length === 0) {
    return "closed";
  }

  const amplitude = amplitudeData[frame] ?? 0;

  if (amplitude > 0.6) {
    return "open";
  } else if (amplitude > 0.2) {
    return "half";
  }

  return "closed";
}

/**
 * @deprecated useLipSyncを使用してください
 */
export function useLipSyncFromData(lipSyncData: LegacyLipSyncData[]): MouthShape {
  const frame = useCurrentFrame();

  const currentLipSync = lipSyncData.find(
    (data) => frame >= data.startFrame && frame < data.endFrame
  );

  return currentLipSync?.shape ?? "closed";
}

/**
 * @deprecated useLipSyncを使用してください
 * 簡易的な自動口パク
 */
export function useSimpleLipSync(
  isSpeaking: boolean,
  speed: number = 1
): MouthShape {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!isSpeaking) {
    return "closed";
  }

  const cycleLength = Math.floor(fps / (4 * speed));
  const cycleFrame = frame % cycleLength;
  const progress = cycleFrame / cycleLength;

  if (progress < 0.3) {
    return "open";
  } else if (progress < 0.6) {
    return "half";
  } else if (progress < 0.8) {
    return "open";
  }

  return "half";
}

/**
 * @deprecated
 */
export function useIsSpeaking(
  text: string,
  startFrame: number,
  charsPerSecond: number = 8
): boolean {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const duration = (text.length / charsPerSecond) * fps;
  const endFrame = startFrame + duration;

  return frame >= startFrame && frame < endFrame;
}
