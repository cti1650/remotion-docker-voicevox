#!/usr/bin/env node
// シーンYAMLから動画用データ（音声・リップシンク・生成JSON）を作る
//
//   node scripts/generate.mjs scenes/demo.yaml   # 特定のYAMLを処理
//   node scripts/generate.mjs                     # scenes/*.yamlをすべて処理

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  PROJECT_DIR,
  ensureVoicevox,
  engineRequest,
  loadScenesYaml,
  listSceneFiles,
} from "./lib.mjs";
import { generateVoice } from "./voice.mjs";

const SHARED_DICT = "config/voicevox-dict.json";
const DEFAULT_CHARACTER = "zundamon";
const VOICE_PARAM_KEYS = ["speedScale", "pitchScale", "intonationScale", "volumeScale"];

// 辞書は「読みを直すための上書き」なので、内蔵辞書に必ず勝たせる。
// デフォルトのpriority=5だと日本語の複合語（例: 複数人）が
// 内蔵辞書の分割に負けて登録した読みが効かない
const DEFAULT_PRIORITY = 10;

const round3 = (x) => Number(Number(x).toFixed(3));
const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

// ---------------------------------------------------------------- キャラクター

const characterCache = new Map();

/** キャラクター定義を読む（同じ動画で何度も参照するのでキャッシュする） */
function loadCharacter(name) {
  if (characterCache.has(name)) return characterCache.get(name);

  const file = path.join(PROJECT_DIR, "src/characters", name, "character.json");
  if (!existsSync(file)) {
    const dir = path.join(PROJECT_DIR, "src/characters");
    const available = readdirSync(dir)
      .filter((d) => existsSync(path.join(dir, d, "character.json")))
      .sort();
    fail(
      `ERROR: キャラクター "${name}" が見つかりません: ${path.relative(PROJECT_DIR, file)}\n` +
        `  登録済み: ${available.join(" / ")}\n` +
        "  静止画から作るには scripts/create-character.py を使ってください"
    );
  }

  const data = JSON.parse(readFileSync(file, "utf8"));
  characterCache.set(name, data);
  return data;
}

// -------------------------------------------------------------------- 辞書

/**
 * 共有辞書とYAMLの辞書をまとめる（同じ語はYAML側が勝つ）
 *
 * VOICEVOXは表記を全角に正規化して保持するため、
 * 重複判定はNFKC正規化した表記で行う。
 */
function buildDictEntries(config) {
  const entries = new Map();
  const put = (surface, value) => {
    const key = String(surface).normalize("NFKC");
    entries.set(
      key,
      typeof value === "object" && value !== null
        ? {
            pronunciation: value.pronunciation,
            accent_type: value.accent_type ?? 0,
            priority: value.priority ?? DEFAULT_PRIORITY,
          }
        : { pronunciation: String(value), accent_type: 0, priority: DEFAULT_PRIORITY }
    );
  };

  const sharedPath = path.join(PROJECT_DIR, SHARED_DICT);
  if (existsSync(sharedPath)) {
    for (const word of JSON.parse(readFileSync(sharedPath, "utf8"))) {
      put(word.surface, word);
    }
  }
  for (const [surface, value] of Object.entries(config.dict ?? {})) {
    put(surface, value);
  }
  return entries;
}

/**
 * エンジンのユーザー辞書を毎回作り直す
 *
 * エンジンの辞書はグローバルかつコンテナを作り直すと消えるため、
 * 共有辞書とYAMLの辞書だけを正として総入れ替えする。
 */
async function applyDict(entries) {
  const current = (await engineRequest("/user_dict")) ?? {};
  for (const uuid of Object.keys(current)) {
    await engineRequest(`/user_dict_word/${uuid}`, { method: "DELETE" });
  }
  for (const [surface, word] of entries) {
    try {
      await engineRequest("/user_dict_word", {
        method: "POST",
        params: {
          surface,
          pronunciation: word.pronunciation,
          accent_type: word.accent_type,
          priority: word.priority,
        },
      });
    } catch (e) {
      fail(
        `ERROR: 辞書に登録できません: ${surface} → ${word.pronunciation}\n` +
          `  読みは全角カタカナで指定してください (${e.status ?? ""})`
      );
    }
  }
}

// ------------------------------------------------------------------ 素材チェック

/** 再配布できない素材をコミットしてしまわないよう、生成時に気付けるようにする */
function checkMedia(config) {
  const bgm = config.bgm;
  if (bgm) {
    const src = typeof bgm === "string" ? bgm : (bgm.src ?? "");
    if (/^https?:\/\//.test(src)) {
      console.log(`  BGM: ${src} (URL参照)`);
    } else {
      const file = path.join(PROJECT_DIR, "public", src);
      if (!existsSync(file)) {
        console.error(`ERROR: BGMファイルが見つかりません: public/${src}`);
        if (src.includes("audio/bgm/local/")) {
          console.error("  local/はgit管理外です。配布元からダウンロードして配置してください");
        }
        process.exit(1);
      }
      if (!src.includes("audio/bgm/local/")) {
        console.log(`  BGM: ${src}`);
        console.log("  ※ここはコミット対象です。再配布が禁止されている素材は");
        console.log("    public/audio/bgm/local/ に置いてください");
      }
    }
  }

  // YAML中の効果音の指定を全部集める（重複は除く）
  const sources = [];
  const add = (value) => {
    if (!value) return;
    const src = typeof value === "string" ? value : (value.src ?? "");
    if (src && !sources.includes(src)) sources.push(src);
  };
  add(config.defaultSe);
  add(config.opening?.se);
  add(config.ending?.se);
  for (const scene of config.scenes) {
    add(scene.se);
    add(scene.slide?.se);
  }

  if (!sources.length) return;
  const committed = sources.filter(
    (s) => !/^https?:\/\//.test(s) && !s.includes("audio/se/local/")
  );
  for (const src of sources) {
    if (/^https?:\/\//.test(src)) continue;
    if (!existsSync(path.join(PROJECT_DIR, "public", src))) {
      console.error(`ERROR: 効果音ファイルが見つかりません: public/${src}`);
      if (src.includes("audio/se/local/")) {
        console.error("  local/はgit管理外です。配布元からダウンロードして配置してください");
      }
      process.exit(1);
    }
  }
  console.log(`  効果音: ${sources.length}種類`);
  if (committed.length) {
    console.log("  ※ここはコミット対象です。再配布が禁止されている素材は");
    console.log("    public/audio/se/local/ に置いてください");
  }
}

// ------------------------------------------------------------------ 本体

async function processYaml(yamlFile) {
  const basename = path.basename(yamlFile, ".yaml");
  // 生成物はpublic/audio/voice/配下にまとめる（ここは丸ごとgit管理外）
  const outputDir = path.join("public/audio/voice", basename);
  const generatedJson = path.join("src/generated", `${basename}.json`);

  console.log(`==> Processing: ${yamlFile}`);
  mkdirSync(path.join(PROJECT_DIR, outputDir), { recursive: true });

  // スキーマ検証つきで読む。未知キーやタイポはここで止まる
  const config = loadScenesYaml(path.join(PROJECT_DIR, yamlFile));
  const scenes = config.scenes;
  const defaultPause = config.defaultPause ?? 0.5;
  const defaultCharacterName = config.character ?? DEFAULT_CHARACTER;

  /**
   * そのキャラクターの話者IDと声の調整を決める
   *
   * トップレベルのspeaker_id/voiceは「この動画の既定キャラクターへの上書き」
   * として扱う。途中で別のキャラクターに切り替えたシーンは、
   * そのキャラクター自身の声をそのまま使う（そうしないと声が切り替わらない）。
   */
  const resolveVoice = (name) => {
    const voice = loadCharacter(name).voice;
    const params = {};
    for (const k of VOICE_PARAM_KEYS) {
      if (voice[k] !== undefined && voice[k] !== null) params[k] = voice[k];
    }
    if (name !== defaultCharacterName) return [voice.defaultSpeakerId, params];
    for (const [k, v] of Object.entries(config.voice ?? {})) {
      if (VOICE_PARAM_KEYS.includes(k) && v !== undefined && v !== null) params[k] = v;
    }
    return [config.speaker_id ?? voice.defaultSpeakerId, params];
  };

  const defaultCharacter = loadCharacter(defaultCharacterName);
  const [speakerId, voiceParams] = resolveVoice(defaultCharacterName);

  console.log(
    `  キャラクター: ${defaultCharacter.displayName ?? defaultCharacterName} (話者ID: ${speakerId})`
  );
  if (Object.keys(voiceParams).length) {
    console.log(`  声の調整: ${JSON.stringify(voiceParams)}`);
  }

  const dictEntries = buildDictEntries(config);
  await applyDict(dictEntries);
  if (dictEntries.size) {
    const own = Object.keys(config.dict ?? {}).length;
    console.log(`  辞書: ${dictEntries.size}語を登録 (共有 + ${own}語はこのYAML固有)`);
  }

  checkMedia(config);

  const voiceFor = (name) => {
    const [sid, params] = resolveVoice(name);
    return { sid, params };
  };

  // オープニング（本編の前のタイトル演出）
  // textがあれば音声を生成して尺を音声に合わせる。無ければdurationで固定
  let generatedOpening = null;
  if (config.opening) {
    generatedOpening = { ...config.opening };
    if (config.opening.text) {
      console.log("  オープニングの音声を生成...");
      const { sid, params } = voiceFor(defaultCharacterName);
      const lipsync = await generateVoice(
        config.opening.text, sid, path.join(PROJECT_DIR, outputDir, "opening"), params
      );
      generatedOpening.audioFile = `audio/voice/${basename}/opening.wav`;
      generatedOpening.lipsyncData = lipsync;
      generatedOpening.duration = round3(lipsync.duration + (config.opening.pause ?? 0.6));
    } else {
      generatedOpening.duration = round3(config.opening.duration ?? 3);
    }
    console.log(`  オープニング: ${generatedOpening.duration}s`);
  }

  const generatedScenes = [];
  // 開始前のマージン。オープニングがあればその後ろから本編を始める
  let currentTime = (generatedOpening ? generatedOpening.duration : 0) + 0.5;

  // スライドは明示的に切り替えるまで次のシーンへ引き継ぐ
  let currentSlide = null;
  let slideIndex = 0;
  // キャラクターもスライドと同じく、明示的に切り替えるまで引き継ぐ
  let currentCharacter = defaultCharacterName;

  console.log(`  Processing ${scenes.length} scenes...`);

  for (const [i, scene] of scenes.entries()) {
    const outputBase = path.join(outputDir, `scene_${String(i + 1).padStart(3, "0")}`);

    // characterは書き方で意味が変わる（slideと同じ書き味）
    //   文字列 → そのキャラクターに切り替える（以降も継続）
    //   false  → このシーンだけ隠す
    //   true / 省略 → そのまま表示
    let showCharacter = true;
    if (typeof scene.character === "string") {
      if (scene.character !== currentCharacter) {
        loadCharacter(scene.character); // 無ければここで止まる
        console.log(`    → キャラクターを ${scene.character} に切り替え`);
      }
      currentCharacter = scene.character;
    } else if (scene.character === false) {
      showCharacter = false;
    }

    console.log(`    Scene ${i + 1}: ${scene.text.slice(0, 30)}...`);

    const { sid, params } = voiceFor(currentCharacter);
    const lipsyncData = await generateVoice(
      scene.text, sid, path.join(PROJECT_DIR, outputBase), params
    );

    const pause = scene.pause ?? defaultPause;
    const generatedScene = {
      text: scene.text,
      emotion: scene.emotion ?? "normal",
      audioFile: `audio/voice/${basename}/scene_${String(i + 1).padStart(3, "0")}.wav`,
      lipsyncData,
      startTime: round3(currentTime),
      pause,
      // 解決済みの値を書く（描画側で解釈し直さなくていいように）
      character: currentCharacter,
      showCharacter,
    };

    // スライドの切り替え（未指定なら直前のスライドを継続、nullで非表示に戻す）
    if ("slide" in scene) {
      if (scene.slide === null) {
        currentSlide = null;
      } else {
        currentSlide = scene.slide;
        slideIndex++;
      }
    }
    if (currentSlide) {
      generatedScene.slide = currentSlide;
      generatedScene.slideIndex = slideIndex;
    }

    // Optional fields（characterは上で解決済みなのでここには含めない）
    for (const key of ["background", "image", "highlight", "subtitle", "se"]) {
      if (key in scene) generatedScene[key] = scene[key];
    }

    generatedScenes.push(generatedScene);
    currentTime += lipsyncData.duration + pause;
  }

  // エンディング（本編の後に流す締めの演出）
  // オープニングと同じく、textがあれば音声を生成して尺を音声に合わせる。
  // 省略すればエンディングは付かない
  let generatedEnding = null;
  if (config.ending) {
    generatedEnding = { ...config.ending, startTime: round3(currentTime) };
    if (config.ending.text) {
      console.log("  エンディングの音声を生成...");
      const { sid, params } = voiceFor(currentCharacter);
      const lipsync = await generateVoice(
        config.ending.text, sid, path.join(PROJECT_DIR, outputDir, "ending"), params
      );
      generatedEnding.audioFile = `audio/voice/${basename}/ending.wav`;
      generatedEnding.lipsyncData = lipsync;
      generatedEnding.duration = round3(lipsync.duration + (config.ending.pause ?? 0.6));
    } else {
      generatedEnding.duration = round3(config.ending.duration ?? 4);
    }
    currentTime += generatedEnding.duration;
    console.log(`  エンディング: ${generatedEnding.duration}s`);
  }

  const output = {
    id: basename,
    config: {
      title: config.title ?? basename,
      // 既定値が将来変わっても古いJSONの見た目が変わらないよう、常に書き出す
      character: defaultCharacterName,
      speaker_id: speakerId,
      ...(Object.keys(voiceParams).length ? { voice: voiceParams } : {}),
      fps: config.fps ?? 30,
      width: config.width ?? 1920,
      height: config.height ?? 1080,
      defaultBackground: config.defaultBackground ?? "gradient",
      defaultPause,
      // テロップ・スライドの見た目（未指定ならコンポーネント側のデフォルト）
      ...Object.fromEntries(
        ["defaultSubtitle", "defaultSlideVariant", "defaultSe"]
          .filter((k) => k in config)
          .map((k) => [k, config[k]])
      ),
      ...(("bgm" in config) ? { bgm: config.bgm } : {}),
      ...(generatedOpening ? { opening: generatedOpening } : {}),
      ...(generatedEnding ? { ending: generatedEnding } : {}),
      ...(("thumbnail" in config) ? { thumbnail: config.thumbnail } : {}),
    },
    scenes: generatedScenes,
    totalDuration: round3(currentTime + 0.5),
  };

  mkdirSync(path.join(PROJECT_DIR, "src/generated"), { recursive: true });
  writeFileSync(
    path.join(PROJECT_DIR, generatedJson),
    // Python版のjson.dumpに合わせて末尾に改行を付けない（差分を出さないため）
    JSON.stringify(output, null, 2)
  );

  console.log(`  Generated: ${generatedJson}`);
  console.log(`  Duration: ${output.totalDuration}s`);
}

/** src/generated/*.json を読み込むよう src/Root.tsx を書き換える */
function updateRoot() {
  const generatedDir = path.join(PROJECT_DIR, "src/generated");
  const names = readdirSync(generatedDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.basename(f, ".json"))
    .sort();

  if (!names.length) {
    console.log("  No generated videos found");
    return;
  }

  const varName = (n) => n.replace(/[-.]/g, "_") + "Data";
  const imports = names
    .map((n) => `import * as ${varName(n)} from "./generated/${n}.json";`)
    .join("\n");
  const array = names
    .map((n) => `  ${varName(n)} as unknown as GeneratedVideoData`)
    .join(",\n");

  const rootFile = path.join(PROJECT_DIR, "src/Root.tsx");
  let content = readFileSync(rootFile, "utf8");

  content = content.replace(
    /\/\/ 生成された動画データを直接インポート[\s\S]*?(?=\n\n\/\/ インポートした動画データを配列化)/,
    `// 生成された動画データを直接インポート\n// generate.mjs実行時に自動更新\n${imports}`
  );
  content = content.replace(
    /const generatedVideos: GeneratedVideoData\[\] = \[[\s\S]*?\]\.filter/,
    `const generatedVideos: GeneratedVideoData[] = [\n${array},\n].filter`
  );

  writeFileSync(rootFile, content);
  console.log(`  Updated with ${names.length} video(s): ${names.join(", ")}`);
}

// ------------------------------------------------------------------ エントリ

async function main() {
  const args = process.argv.slice(2);
  await ensureVoicevox();

  if (args.length) {
    for (const file of args) {
      if (!existsSync(path.join(PROJECT_DIR, file))) fail(`ERROR: File not found: ${file}`);
      await processYaml(file);
    }
  } else {
    const files = listSceneFiles();
    if (!files.length) fail("No YAML files found in scenes/");
    for (const file of files) await processYaml(file);
    console.log(`\n==> Processed ${files.length} video(s)`);
  }

  console.log("\n==> Updating Root.tsx imports...");
  updateRoot();
  console.log("\n==> Done! Run 'npm run dev' to preview");
}

// スキーマ違反などはユーザーが直せる問題なので、
// スタックトレースではなくメッセージだけを出す
main().catch((e) => {
  console.error(`\n${e.message}`);
  process.exit(1);
});
