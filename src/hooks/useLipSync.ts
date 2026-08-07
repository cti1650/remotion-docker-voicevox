import { useCurrentFrame, useVideoConfig } from "remotion";
import { resolveMouth } from "../characters/registry";
import type { CharacterDefinition } from "../characters/types";

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
  /** そのセリフを喋るキャラクター（途中で切り替わる場合があるので個別に持つ） */
  character: CharacterDefinition;
}

// ============================================
// VOICEVOXリップシンクフック（推奨）
// ============================================

/**
 * VOICEVOXのタイミングデータを使った正確なリップシンク
 *
 * リップシンクJSONに入っているのは母音キー（a/i/u/e/o/n/closed）だけで、
 * それをどのパーツ名に対応させるかはキャラクター定義のmouthMapが決める。
 *
 * 音声の先頭の無音（prePhonemeLength）は生成時に吸収済みなので、
 * ここでの補正はキャラクター定義の`voice.lipSyncOffset`だけ。
 * 喋る人が途中で変わってもいいように、口の形はセリフごとのキャラクターで解決する。
 *
 * @param dialogues セリフ・リップシンクデータ・喋るキャラクターの配列
 * @param fallback 喋っていないときに口を閉じるためのキャラクター（表示中のもの）
 * @returns 現在のフレームに対応する口のパーツ名
 */
export function useLipSync(
  dialogues: DialogueLipSync[],
  fallback: CharacterDefinition
): string {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // 現在再生中のセリフを探す
  for (const dialogue of dialogues) {
    // 正の値で口が遅く、負の値で口が早くなる
    const offset = dialogue.character.voice.lipSyncOffset ?? 0;
    const dialogueEnd = dialogue.start + dialogue.lipsyncData.duration;

    if (currentTime >= dialogue.start && currentTime < dialogueEnd) {
      // セリフ内の相対時間
      const relativeTime = currentTime - dialogue.start - offset;

      // 該当する音素を探す
      for (const entry of dialogue.lipsyncData.lipsync) {
        const entryEnd = entry.time + entry.duration;

        if (relativeTime >= entry.time && relativeTime < entryEnd) {
          return resolveMouth(dialogue.character, entry.mouth);
        }
      }
    }
  }

  // 喋っていないときは閉じた口
  return resolveMouth(fallback, "closed");
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
