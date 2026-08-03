import { staticFile } from "remotion";

/**
 * メディアのパスを解決する
 *
 * http(s)から始まる場合はURLとしてそのまま使い、
 * それ以外はpublic/配下のファイルとして扱う。
 *
 *   "audio/bgm/foo.mp3"        -> public/audio/bgm/foo.mp3
 *   "https://example.com/a.mp3" -> そのまま
 */
export const resolveMediaSrc = (src: string): string =>
  /^https?:\/\//.test(src) ? src : staticFile(src);
