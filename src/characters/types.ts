/**
 * キャラクター定義の型
 *
 * 実体は各キャラクターディレクトリの character.json。
 * TypeScript（描画）とPython（音声生成）の両方から読むため、
 * ロジックを持たない素のJSONで表現している。
 */

/**
 * 重ねる画像1枚の指定
 *
 * - file: 固定の画像を1枚重ねる（体・頭など）
 * - dir + slot: スロットの現在値をファイル名として重ねる（口・目など）
 * - when: フラグ名。falseのときは描かない（尻尾・汗・涙など）
 */
export interface CharacterLayer {
  file?: string;
  dir?: string;
  slot?: string;
  when?: string;
}

/** 立ち絵の見た目 */
export interface CharacterArt {
  /** public/からの相対パス（例: parts/zundamon_en） */
  basePath: string;
  /**
   * パーツの拡張子（既定 png）
   * svgにすると拡大しても劣化しない。layersでファイル名を直接書いた場合は無視される
   */
  ext?: string;
  /** 画像の原寸。キャラごとに違ってよい */
  width: number;
  height: number;
  /** 手前に来るものほど後ろに書く */
  layers: CharacterLayer[];
}

/**
 * 本編での立ち絵の置き場所
 *
 *   x = (動画幅 - 原寸幅 * scale) / 2 + offsetX
 *   y = 動画高さ - 原寸高さ * scale - offsetY
 *
 * 拡大はbottom centerを軸に行うため、見た目の下端は y + 原寸高さ になる。
 * 原寸のサイズがキャラごとに違うので、この3つもキャラごとに持たせる。
 * 新しいキャラの値は scripts/create-character.py が計算して書き込む。
 */
export interface CharacterPlacement {
  scale: number;
  offsetX: number;
  offsetY: number;
}

/** 瞬き。目のスロットを持たないキャラでは省略する */
export interface CharacterBlink {
  slot: string;
  /** 閉じた目のパーツ名 */
  closed: string;
}

/**
 * 声。どれもYAML側の`voice:`で上書きできる既定値
 *
 * speedScale以外は音声生成にしか効かない（描画には使わない）。
 * 値の範囲はVOICEVOXのGUIに合わせてあり、外れると生成時にエラーになる。
 */
export interface CharacterVoice {
  defaultSpeakerId: number;
  /** 話速 0.5〜2.0（既定1.0）。変えるとリップシンクの尺も追従する */
  speedScale?: number;
  /** 音高 -0.15〜0.15（既定0）。上げると高い声になる */
  pitchScale?: number;
  /** 抑揚 0〜2.0（既定1.0）。下げると棒読みになる */
  intonationScale?: number;
  /** 音量 0〜2.0（既定1.0） */
  volumeScale?: number;
  /**
   * 口パクの微調整（秒。既定0）
   *
   * 音声の先頭の無音（prePhonemeLength）は生成時に自動で吸収しているので、
   * 通常は0のままでよい。それでも口が早い／遅いと感じるキャラクターだけ
   * ここで詰める。正の値で口が遅く、負の値で口が早くなる。
   * 30fpsなら0.033で1フレームぶん。
   */
  lipSyncOffset?: number;
}

export interface CharacterDefinition {
  name: string;
  displayName: string;
  art: CharacterArt;
  placement: CharacterPlacement;
  /** スロットの既定値（スロット名 → パーツ名） */
  defaultSlots: Record<string, string>;
  /** フラグの既定値（レイヤーのwhenが参照する） */
  defaultFlags?: Record<string, boolean>;
  /**
   * 表情プリセット（表情名 → 上書きするスロット）
   * 書かれていない表情・スロットは defaultSlots のままになるので、
   * 表情を持たないキャラは空オブジェクトでよい。
   */
  emotions: Record<string, Record<string, string>>;
  blink?: CharacterBlink;
  /** リップシンクが値を差し込むスロット名 */
  mouthSlot: string;
  /** 母音キー（a/i/u/e/o/n/closed）→ パーツ名 */
  mouthMap: Record<string, string>;
  voice: CharacterVoice;
  /** 動画末尾に出す表記。声と立ち絵の両方をここに書く */
  credits: string[];
}
