#!/usr/bin/env node
// シーンYAMLから動画・サムネイルをレンダリングする
//
//   node scripts/render.mjs scenes/demo.yaml                  # 音声生成 + レンダリング
//   node scripts/render.mjs scenes/demo.yaml --skip-generate  # レンダリングのみ
//   node scripts/render.mjs --thumbnail scenes/demo.yaml      # サムネイルを静止画で出力
//
// エントリポイントは remotion.config.ts の setEntryPoint で設定済みのため、
// remotionコマンドには渡さない。

import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { PROJECT_DIR, run, printAvailableVideos, loadScenesYaml } from "./lib.mjs";

const argv = process.argv.slice(2);
const thumbnail = argv.includes("--thumbnail");
const skipGenerate = argv.includes("--skip-generate");
// 残りは [YAML, 出力先(省略可), ...remotionへの追加オプション]
const rest = argv.filter((a) => a !== "--thumbnail" && a !== "--skip-generate");
const [yamlFile, ...extraArgs] = rest;

const usage = () => {
  if (thumbnail) {
    console.log("Usage: npm run thumbnail -- <scenes.yaml> [output.png]");
  } else {
    console.log("Usage: npm run video -- <scenes.yaml> [--skip-generate] [remotion options...]");
    console.log("");
    console.log("Examples:");
    console.log("  npm run video -- scenes/demo.yaml                  # 音声生成 + レンダリング");
    console.log("  npm run video -- scenes/demo.yaml --skip-generate  # レンダリングのみ");
  }
  console.log("");
  printAvailableVideos();
  process.exit(1);
};

if (!yamlFile) usage();

if (!existsSync(path.join(PROJECT_DIR, yamlFile))) {
  console.error(`ERROR: File not found: ${yamlFile}`);
  process.exit(1);
}

const videoId = path.basename(yamlFile, ".yaml");
const generatedJson = path.join("src/generated", `${videoId}.json`);

/** レンダリング前に生成JSONが揃っているか確かめる */
const requireGenerated = () => {
  if (existsSync(path.join(PROJECT_DIR, generatedJson))) return;
  console.error(`ERROR: 先に音声を生成してください: npm run voice -- ${yamlFile}`);
  process.exit(1);
};

if (thumbnail) {
  requireGenerated();

  // thumbnail: を書いたYAMLだけ <id>-thumbnail のStillが登録されている
  const config = loadScenesYaml(path.join(PROJECT_DIR, yamlFile));
  if (!config.thumbnail) {
    console.error(`ERROR: ${yamlFile} に thumbnail: が書かれていません`);
    console.error("  例:");
    console.error("    thumbnail:");
    console.error('      title: "タイトル"');
    console.error('      subtitle: "サブタイトル"');
    process.exit(1);
  }

  // 第2引数が .png なら出力先、それ以外はremotionへのオプションとして渡す
  const [maybeOut, ...remotionArgs] = extraArgs;
  const out = maybeOut?.endsWith(".png")
    ? maybeOut
    : `output/${videoId}-thumbnail.png`;
  if (maybeOut && !maybeOut.endsWith(".png")) remotionArgs.unshift(maybeOut);

  mkdirSync(path.join(PROJECT_DIR, path.dirname(out)), { recursive: true });
  console.log("==> Rendering thumbnail...");
  const code = await run("npx", ["remotion", "still", `${videoId}-thumbnail`, out, ...remotionArgs]);
  if (code !== 0) process.exit(code);
  console.log(`\n==> Done!\n    Output: ${out}`);
  process.exit(0);
}

// Step 1: 音声とリップシンク
if (skipGenerate) {
  console.log("==> Step 1: Skipped (--skip-generate)");
  requireGenerated();
} else {
  console.log("==> Step 1: Generating audio and lipsync data...");
  const code = await run("node", ["scripts/generate.mjs", yamlFile]);
  if (code !== 0) process.exit(code);
}

// Step 2: レンダリング
const out = `output/${videoId}.mp4`;
console.log("\n==> Step 2: Rendering video...");
mkdirSync(path.join(PROJECT_DIR, "output"), { recursive: true });
const code = await run("npx", ["remotion", "render", videoId, out, ...extraArgs]);
if (code !== 0) process.exit(code);

console.log(`\n==> Done!\n    Output: ${out}`);
