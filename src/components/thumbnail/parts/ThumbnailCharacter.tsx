import React from "react";
import { useVideoConfig } from "remotion";
import { CharacterRenderer, useCharacter } from "../../../characters";
import { EmotionType } from "../../../types/scene";

interface ThumbnailCharacterProps {
  emotion?: EmotionType;
  align?: "right" | "center";
  scale?: number;      // 画面高さに対する倍率（1.0で画面いっぱい）
  bottomCrop?: number; // 足元を切る割合（0.06なら6%切る）
}

/**
 * サムネイル用のキャラクター配置
 *
 * CharacterRendererのx/yは「拡大前のボックスの左上」で、
 * 拡大はbottom centerを軸に行われる。
 * ここでは見せたい位置（画面上の見た目）から逆算する。
 *
 * 立ち絵の原寸はキャラクター定義から取るので、
 * サイズの違うキャラでも同じ見え方になる。
 */
export const ThumbnailCharacter: React.FC<ThumbnailCharacterProps> = ({
  emotion = "happy",
  align = "right",
  scale = 1,
  bottomCrop = 0.04,
}) => {
  const { width, height } = useVideoConfig();
  const character = useCharacter();
  const { width: artWidth, height: artHeight } = character.art;

  // 画面の高さに対して少し大きめにして、足元を切る
  const drawHeight = height * 1.06 * scale;
  const s = drawHeight / artHeight;
  const drawWidth = artWidth * s;

  // 見せたい位置（画面上の座標）
  const visibleLeft =
    align === "right" ? width - drawWidth * 0.88 : (width - drawWidth) / 2;
  const visibleTop = height + drawHeight * bottomCrop - drawHeight;

  // transform-origin: bottom center を打ち消して、拡大前の座標に変換する
  const x = visibleLeft - (artWidth / 2) * (1 - s);
  const y = visibleTop - artHeight * (1 - s);

  return (
    <CharacterRenderer
      character={character}
      scale={s}
      x={x}
      y={y}
      emotion={emotion}
      enableBlink={false}
      enableBreathing={false}
    />
  );
};
