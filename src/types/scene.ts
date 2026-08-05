/**
 * シーン定義の型
 * scenes.yamlから読み込むデータ構造
 */

import type { EyeType, EyebrowType, FaceColorType, EdamameType } from "../components/ZundamonCharacter";
import type { LipSyncData } from "../hooks/useLipSync";

// 表情プリセット
export type EmotionType =
  | "normal"    // 通常
  | "happy"     // 嬉しい
  | "sad"       // 悲しい
  | "angry"     // 怒り
  | "surprised" // 驚き
  | "thinking"  // 考え中
  | "smug"      // ドヤ顔
  | "tired";    // 疲れ

// 背景タイプ
export type BackgroundType =
  | "gradient"  // グラデーション
  | "solid"     // 単色
  | "image";    // 画像

// 背景設定
export interface BackgroundConfig {
  type: BackgroundType;
  // gradientの場合: ["#667eea", "#764ba2"]
  // solidの場合: "#ffffff"
  // imageの場合: "backgrounds/office.jpg"
  value: string | string[];
}

// 強調画像設定
export interface HighlightImage {
  src: string;           // 画像パス (public/からの相対パス)
  position?: "top-right" | "top-left" | "center" | "bottom-right" | "bottom-left";
  scale?: number;        // スケール (デフォルト: 1)
  animation?: "fade-in" | "slide-in" | "zoom-in" | "none";
}

// スライド内の画像配置
// split: 箇条書きの右に並べる / stack: 箇条書きの下に置く
// 箇条書きが無い場合はレイアウトに関わらず画像だけを大きく表示する
export type SlideImageLayout = "split" | "stack";

// テロップ（字幕）の見た目
// 実体は src/components/subtitle/ の各バリアント
export type SubtitleVariant =
  | "boxed"    // 黒い角丸ボックス（デフォルト）
  | "bar"      // 画面幅いっぱいの帯
  | "outline"  // 背景なし・縁取り文字
  | "card"     // 白いカード + アクセントの縦線
  | "none";    // 表示しない

// スライドの見た目
// 実体は src/components/slide/ の各バリアント
export type SlideVariant =
  | "card"       // 白いカード（デフォルト）
  | "fullbleed"  // 枠なしで領域いっぱいに広げる
  | "title";     // タイトルだけを大きく見せる章扉

// スライド設定
export interface SlideConfig {
  title?: string;        // スライドのタイトル
  bullets?: string[];    // 箇条書き
  image?: string;        // 画像パス (public/からの相対パス)
  imageLayout?: SlideImageLayout;  // 画像の配置 (デフォルト: split)
  caption?: string;      // 画像のキャプション
  note?: string;         // 下部の補足テキスト
  accent?: string;       // アクセントカラー (デフォルト: #6c5ce7)
  variant?: SlideVariant;  // 見た目 (デフォルト: card)
}

// 1シーンの定義
export interface SceneConfig {
  text: string;                    // セリフ
  emotion?: EmotionType;           // 表情 (デフォルト: normal)
  background?: BackgroundConfig | string;  // 背景 (文字列の場合はgradientプリセット)
  image?: HighlightImage | string; // 強調画像 (文字列の場合はsrcのみ)
  slide?: SlideConfig | null;      // スライド (省略時は直前のスライドを継続、nullで非表示)
  highlight?: number;              // 強調する箇条書きの番号 (1始まり)
  subtitle?: SubtitleVariant;      // テロップの見た目 (省略時は動画全体の設定)
  duration?: number;               // 表示時間の上書き (秒、通常は音声長+余白)
  pause?: number;                  // セリフ後の間 (秒、デフォルト: 0.5)
}

// オープニング（本編の前に流すタイトル演出）の見た目
// 実体は src/components/opening/
export type OpeningVariant =
  | "center"   // 画面中央に大きくタイトル（デフォルト）
  | "band"     // 斜めの帯にタイトルを載せる
  | "minimal"; // 細い線とタイトルだけ

export interface OpeningConfig {
  variant?: OpeningVariant;
  title: string;             // 大きく出すタイトル
  subtitle?: string;         // 補足の一行
  badge?: string;            // 「解説」などの小さいラベル
  accent?: string;           // アクセントカラー
  background?: BackgroundConfig | string;
  emotion?: EmotionType;     // キャラクターの表情
  character?: boolean;       // キャラクターを出すか (デフォルト: true)
  text?: string;             // セリフ。書くと音声を生成し、尺は音声の長さになる
  duration?: number;         // textが無いときの尺 (秒、デフォルト: 3)
  pause?: number;            // セリフ後の間 (秒)
}

// サムネイルの見た目
// 実体は src/components/thumbnail/
export type ThumbnailVariant =
  | "bold"    // 左に特大タイトル、右にキャラクター（デフォルト）
  | "split"   // 上下に分けて帯を敷く
  | "simple"; // 中央寄せの控えめな構成

export interface ThumbnailConfig {
  variant?: ThumbnailVariant;
  title: string;             // 特大で出す文字
  subtitle?: string;
  badge?: string;            // 左上の小さいラベル
  accent?: string;
  background?: BackgroundConfig | string;
  emotion?: EmotionType;
  image?: string;            // 併せて載せる画像
  width?: number;            // デフォルト: 1280（YouTube推奨）
  height?: number;           // デフォルト: 720
}

// BGM設定
export interface BgmConfig {
  src: string;       // 音声ファイルパス (public/からの相対パス)
  volume?: number;   // 音量 0〜1 (デフォルト: 0.12)
  fadeIn?: number;   // フェードイン (秒、デフォルト: 1)
  fadeOut?: number;  // フェードアウト (秒、デフォルト: 2)
  loop?: boolean;    // 動画が長い場合に繰り返すか (デフォルト: true)
  credit?: string;   // 動画末尾のクレジットに追記する表記
}

// 動画全体の設定（YAML入力用 - scenesが必須）
export interface VideoConfigInput {
  title?: string;
  speaker_id?: number;             // VOICEVOXの話者ID (デフォルト: 3)
  fps?: number;                    // フレームレート (デフォルト: 30)
  width?: number;                  // 幅 (デフォルト: 1920)
  height?: number;                 // 高さ (デフォルト: 1080)
  defaultBackground?: BackgroundConfig | string;
  defaultPause?: number;           // デフォルトの間 (デフォルト: 0.5)
  defaultSubtitle?: SubtitleVariant;   // テロップの見た目 (デフォルト: boxed)
  defaultSlideVariant?: SlideVariant;  // スライドの見た目 (デフォルト: card)
  bgm?: BgmConfig | string;        // BGM (文字列の場合はsrcのみ)
  opening?: OpeningConfig;         // 本編前のタイトル演出
  thumbnail?: ThumbnailConfig;     // サムネイル (npm run thumbnail で静止画出力)
  scenes: SceneConfig[];
}

// 動画設定（生成後用 - scenesなし）
export interface VideoConfig {
  title?: string;
  speaker_id?: number;
  fps?: number;
  width?: number;
  height?: number;
  defaultBackground?: BackgroundConfig | string;
  defaultPause?: number;
  defaultSubtitle?: SubtitleVariant;
  defaultSlideVariant?: SlideVariant;
  bgm?: BgmConfig | string;
  opening?: GeneratedOpening;
  thumbnail?: ThumbnailConfig;
}

// 生成後のオープニング（尺と音声が確定した状態）
export interface GeneratedOpening extends OpeningConfig {
  duration: number;             // 尺（秒）
  audioFile?: string;           // textを書いた場合の音声
  lipsyncData?: LipSyncData;    // 同上。口パクに使う
}

// 表情プリセット → パーツマッピング
export interface EmotionPreset {
  eye: EyeType;
  eyebrow: EyebrowType;
  faceColor: FaceColorType;
  edamame: EdamameType;
}

// 表情プリセット定義
export const EMOTION_PRESETS: Record<EmotionType, EmotionPreset> = {
  normal: {
    eye: "normal",
    eyebrow: "normal",
    faceColor: "cheek_normal",
    edamame: "normal",
  },
  happy: {
    eye: "smile",
    eyebrow: "normal",
    faceColor: "cheek_red",
    edamame: "normal",
  },
  sad: {
    eye: "normal",
    eyebrow: "troubled",
    faceColor: "cheek_normal",
    edamame: "wilted",
  },
  angry: {
    eye: "jitome",
    eyebrow: "angry",
    faceColor: "cheek_red",
    edamame: "normal",
  },
  surprised: {
    eye: "circle",
    eyebrow: "raised",
    faceColor: "cheek_normal",
    edamame: "standing",
  },
  thinking: {
    eye: "normal_up",
    eyebrow: "normal",
    faceColor: "cheek_normal",
    edamame: "normal",
  },
  smug: {
    eye: "jitome",
    eyebrow: "normal",
    faceColor: "cheek_normal",
    edamame: "normal",
  },
  tired: {
    eye: "relaxed",
    eyebrow: "troubled",
    faceColor: "pale",
    edamame: "wilted",
  },
};

// 背景プリセット
export const BACKGROUND_PRESETS: Record<string, BackgroundConfig> = {
  gradient: {
    type: "gradient",
    value: ["#667eea", "#764ba2", "#f093fb"],
  },
  purple: {
    type: "gradient",
    value: ["#667eea", "#764ba2"],
  },
  blue: {
    type: "gradient",
    value: ["#00c6fb", "#005bea"],
  },
  green: {
    type: "gradient",
    value: ["#11998e", "#38ef7d"],
  },
  orange: {
    type: "gradient",
    value: ["#f12711", "#f5af19"],
  },
  pink: {
    type: "gradient",
    value: ["#ee9ca7", "#ffdde1"],
  },
  dark: {
    type: "solid",
    value: "#1a1a2e",
  },
  white: {
    type: "solid",
    value: "#ffffff",
  },
};
