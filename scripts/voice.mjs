// 1つのセリフから音声(.wav)とリップシンク(.json)を作る
//
// CLIとしても使える:
//   node scripts/voice.mjs "テキスト" 3 public/audio/voice/demo/scene_001 '{"pitchScale":0.1}'

import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { engineRequest, ensureVoicevox } from "./lib.mjs";

/** Pythonのround(x, 3)に合わせる。小数第3位までで丸める */
const round3 = (x) => Number(Number(x).toFixed(3));

// VOICEVOXのaudio_queryが受け付ける調整項目と範囲（GUIと同じ範囲にしてある）
const VOICE_LIMITS = {
  speedScale: [0.5, 2.0],
  pitchScale: [-0.15, 0.15],
  intonationScale: [0.0, 2.0],
  volumeScale: [0.0, 2.0],
};

// モーラの母音→母音キーの正規化（パーツ名への変換はキャラクター定義のmouthMapが行う）
// 大文字は無声化した母音。VOICEVOXはここに子音を入れてこないので、
// 'ん'は大文字のNだけ。な行の子音は小文字のnで別枠（下の子音の扱いを参照）
const VOWEL_TO_MOUTH = {
  a: "a", A: "a",
  i: "i", I: "i",
  u: "u", U: "u",
  e: "e", E: "e",
  o: "o", O: "o",
  N: "n",       // ん
  cl: "closed", // 促音
  pau: "closed",
};

// 唇を閉じてから発音する音（両唇音）。ここだけは子音の区間で口を閉じる
const BILABIAL = new Set(["m", "my", "p", "py", "b", "by"]);

/** 声の調整をクエリに反映する。範囲外は止める */
export function applyVoiceParams(query, params = {}) {
  for (const [key, [low, high]] of Object.entries(VOICE_LIMITS)) {
    const value = params[key];
    if (value === undefined || value === null) continue;
    const n = Number(value);
    if (!(n >= low && n <= high)) {
      throw new Error(`${key}=${n} は範囲外です (${low}〜${high})`);
    }
    query[key] = n;
  }
  return query;
}

/**
 * audio_queryの結果からリップシンクを組み立てる
 *
 * 合成される音声は先頭にprePhonemeLength分の無音が入る。
 * ここを0から数え始めると口だけが先に動くので、無音の分だけ後ろにずらす。
 * 既定の0.1秒は30fpsで3フレームぶんあり、話速の速い話者ほど目立つ。
 * pre/postPhonemeLengthも話速で割られる（実測で確認済み）。
 *
 * accent_phrasesの長さは話速をかける前の値なので、speedで割って実時間に直す。
 */
export function buildLipSync(query) {
  const speed = Number(query.speedScale ?? 1.0) || 1.0;
  const lipsync = [];
  let currentTime = Number(query.prePhonemeLength ?? 0) / speed;

  for (const phrase of query.accent_phrases ?? []) {
    for (const mora of phrase.moras ?? []) {
      const consonant = mora.consonant;
      const consonantLen = (mora.consonant_length ?? 0) / speed;
      const vowel = mora.vowel ?? "";
      const vowelLen = (mora.vowel_length ?? 0) / speed;
      const vowelMouth = VOWEL_TO_MOUTH[vowel] ?? "closed";

      // 子音部分
      // 両唇音以外は後ろに続く母音と同じ形にする。
      // 実際の発音でも口は母音に向かって動いているし、子音は1フレーム程度しか
      // ないことが多いため、専用の形にするとチラついて見える
      if (consonant && consonantLen > 0) {
        lipsync.push({
          time: round3(currentTime),
          duration: round3(consonantLen),
          phoneme: consonant,
          mouth: BILABIAL.has(consonant) ? "closed" : vowelMouth,
        });
        currentTime += consonantLen;
      }

      // 母音部分
      if (vowel && vowelLen > 0) {
        lipsync.push({
          time: round3(currentTime),
          duration: round3(vowelLen),
          phoneme: vowel,
          mouth: vowelMouth,
        });
        currentTime += vowelLen;
      }
    }

    // フレーズ間のポーズ
    const pauseLen = (phrase.pause_mora?.vowel_length ?? 0) / speed;
    if (pauseLen > 0) {
      lipsync.push({
        time: round3(currentTime),
        duration: round3(pauseLen),
        phoneme: "pau",
        mouth: "closed",
      });
      currentTime += pauseLen;
    }
  }

  // 最後に口を閉じるエントリを追加
  lipsync.push({
    time: round3(currentTime),
    duration: 0.5,
    phoneme: "end",
    mouth: "closed",
  });
  currentTime += 0.5;

  return { lipsync, duration: round3(currentTime) };
}

/**
 * セリフから音声とリップシンクを生成し、<outputBase>.wav / .json に書く
 * @returns リップシンクデータ
 */
export async function generateVoice(text, speakerId, outputBase, voiceParams = {}) {
  const query = await engineRequest("/audio_query", {
    method: "POST",
    params: { text, speaker: speakerId },
  });

  // リップシンクも音声も同じクエリから作るので、ここで一度上書きすれば両方に効く
  applyVoiceParams(query, voiceParams);

  const wav = await engineRequest("/synthesis", {
    method: "POST",
    params: { speaker: speakerId },
    body: query,
  });

  const { lipsync, duration } = buildLipSync(query);
  const output = { text, speaker_id: Number(speakerId), duration, lipsync };

  mkdirSync(path.dirname(outputBase), { recursive: true });
  writeFileSync(`${outputBase}.wav`, wav);
  writeFileSync(`${outputBase}.json`, JSON.stringify(output, null, 2) + "\n");

  return output;
}

// CLIとして実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  const [text, speaker = "3", outputBase = "output", paramsJson = "{}"] =
    process.argv.slice(2);
  if (!text) {
    console.error(
      'Usage: node scripts/voice.mjs "テキスト" <speaker_id> <output_base> [voice_params_json]'
    );
    process.exit(1);
  }
  try {
    await ensureVoicevox();
    const result = await generateVoice(text, Number(speaker), outputBase, JSON.parse(paramsJson));
    console.log(`    Duration: ${result.duration}s`);
    console.log(`    Phonemes: ${result.lipsync.length}`);
  } catch (e) {
    // 範囲外の値などはユーザーが直せる問題なのでメッセージだけ出す
    console.error(`\n${e.message}`);
    process.exit(1);
  }
}
