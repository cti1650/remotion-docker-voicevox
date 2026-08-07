import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Audio,
  staticFile,
  interpolate,
} from "remotion";
import { CharacterRenderer, getCharacter } from "../characters";
import { Background } from "./Background";
import { HighlightImage } from "./HighlightImage";
import { SlideRenderer } from "./slide";
import { SubtitleRenderer } from "./subtitle";
import { OpeningRenderer } from "./opening";
import { SoundEffect } from "./SoundEffect";
import { useLipSync, LipSyncData, DialogueLipSync } from "../hooks/useLipSync";
import { resolveMediaSrc } from "../utils/media";
import {
  SceneConfig,
  VideoConfig,
  EmotionType,
  BackgroundConfig,
  SlideConfig,
  BgmConfig,
} from "../types/scene";

// 生成されたシーンデータ（音声・リップシンク情報を含む）
export interface GeneratedScene extends SceneConfig {
  audioFile: string;      // 音声ファイルパス
  lipsyncData: LipSyncData;  // リップシンクデータ
  startTime: number;      // 開始時間（秒）
  slideIndex?: number;    // 表示中のスライド番号（1始まり）
}

// 同じスライドを表示し続けるシーンのまとまり
interface SlideGroup {
  slide: SlideConfig;
  index: number;
  startTime: number;
}

interface SceneCompositionProps {
  config: VideoConfig;
  scenes: GeneratedScene[];
}

// BGM（ループ再生 + フェードイン/フェードアウト）
const Bgm: React.FC<{
  config: BgmConfig | string;
  totalDuration: number;
}> = ({ config, totalDuration }) => {
  const { fps } = useVideoConfig();

  const bgm: BgmConfig = typeof config === "string" ? { src: config } : config;
  const { volume = 0.12, fadeIn = 1, fadeOut = 2, loop = true } = bgm;

  const totalFrames = Math.ceil(totalDuration * fps);
  const fadeInFrames = Math.max(1, Math.floor(fadeIn * fps));
  const fadeOutFrames = Math.max(1, Math.floor(fadeOut * fps));

  // URL指定の場合はダウンロードに時間がかかるため待ち時間を延ばす
  // （デフォルトの28秒では回線状況によって失敗する）
  const isRemote = /^https?:\/\//.test(bgm.src);

  return (
    <Audio
      src={resolveMediaSrc(bgm.src)}
      loop={loop}
      delayRenderTimeoutInMilliseconds={isRemote ? 120000 : undefined}
      delayRenderRetries={isRemote ? 2 : undefined}
      // ループしても音量カーブを最初から数え直さない（フェードを1回だけにする）
      loopVolumeCurveBehavior="extend"
      volume={(f) =>
        volume *
        interpolate(f, [0, fadeInFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }) *
        interpolate(
          f,
          [Math.max(0, totalFrames - fadeOutFrames), totalFrames],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )
      }
    />
  );
};

export const SceneComposition: React.FC<SceneCompositionProps> = ({
  config,
  scenes,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const currentTime = frame / fps;

  // 立ち絵・表情・クレジットはキャラクター定義が持つ
  const character = getCharacter(config.character);

  // オープニング（本編の前のタイトル演出）
  const opening = config.opening;
  const openingDuration = opening?.duration ?? 0;
  const inOpening = openingDuration > 0 && currentTime < openingDuration;

  // リップシンク用データを作成
  // オープニングにセリフがあれば、それも口パクの対象にする
  const lipSyncDialogues: DialogueLipSync[] = [
    ...(opening?.lipsyncData
      ? [{ start: 0, lipsyncData: opening.lipsyncData }]
      : []),
    ...scenes.map((scene) => ({
      start: scene.startTime,
      lipsyncData: scene.lipsyncData,
    })),
  ];

  const mouth = useLipSync(lipSyncDialogues, character);

  // 現在のシーンを取得
  const getCurrentScene = (): GeneratedScene | undefined => {
    for (const scene of scenes) {
      const sceneEnd = scene.startTime + scene.lipsyncData.duration + (scene.pause ?? 0.5);
      if (currentTime >= scene.startTime && currentTime < sceneEnd) {
        return scene;
      }
    }
    return undefined;
  };

  const currentScene = getCurrentScene();
  const emotion: EmotionType = inOpening
    ? opening?.emotion ?? "happy"
    : currentScene?.emotion ?? "normal";

  // オープニング中はキャラクターを隠せる（character: falseのとき）
  const showCharacter = !inOpening || (opening?.character ?? true);

  // 連続して同じスライドを表示するシーンをまとめる（登場アニメーションを1回にするため）
  const slideGroups: SlideGroup[] = [];
  for (const scene of scenes) {
    if (!scene.slide) continue;

    const last = slideGroups[slideGroups.length - 1];
    if (last && last.index === scene.slideIndex) continue;

    slideGroups.push({
      slide: scene.slide,
      index: scene.slideIndex ?? slideGroups.length + 1,
      startTime: scene.startTime,
    });
  }

  const activeSlideGroup = currentScene?.slide
    ? slideGroups.find((g) => g.index === currentScene.slideIndex)
    : undefined;

  // 背景の取得（オープニング中は専用の背景を使える）
  const background: BackgroundConfig | string = inOpening
    ? opening?.background ?? config.defaultBackground ?? "gradient"
    : currentScene?.background ?? config.defaultBackground ?? "gradient";

  // BGMのクレジット表記（設定されていれば動画末尾に追記する）
  const bgmCredit =
    typeof config.bgm === "object" ? config.bgm.credit : undefined;

  // キャラクター配置（原寸も置き場所もキャラクター定義から取る）
  const { scale: characterScale, offsetX, offsetY } = character.placement;
  const characterX =
    (width - character.art.width * characterScale) / 2 + offsetX;
  const characterY = height - character.art.height * characterScale - offsetY;

  // 動画の長さ（最後のシーンが終わる時刻）
  // scene.startTimeはオープニングの尺を含んだ絶対時刻なので、これだけで足りる
  const lastScene = scenes[scenes.length - 1];
  const totalDuration = lastScene
    ? lastScene.startTime +
      lastScene.lipsyncData.duration +
      (lastScene.pause ?? 0.5)
    : openingDuration;

  return (
    <AbsoluteFill>
      {/* BGM */}
      {config.bgm && (
        <Bgm config={config.bgm} totalDuration={totalDuration} />
      )}
      {/* 背景 */}
      <Background config={background} />
      {/* スライド */}
      {activeSlideGroup && (
        <SlideRenderer
          slide={activeSlideGroup.slide}
          startFrame={Math.floor(activeSlideGroup.startTime * fps)}
          highlight={currentScene?.highlight}
          index={activeSlideGroup.index}
          total={slideGroups.length}
          fallbackVariant={config.defaultSlideVariant}
        />
      )}
      {/* キャラクター */}
      {showCharacter && (
        <CharacterRenderer
          character={character}
          scale={characterScale}
          x={characterX}
          y={characterY}
          mouth={mouth}
          emotion={emotion}
          enableBlink={true}
          enableBreathing={true}
        />
      )}
      {/* オープニング */}
      {opening && openingDuration > 0 && (
        <>
          <Sequence from={0} durationInFrames={Math.ceil(openingDuration * fps)}>
            <OpeningRenderer
              opening={opening}
              durationInFrames={Math.ceil(openingDuration * fps)}
            />
            {opening.audioFile && <Audio src={staticFile(opening.audioFile)} />}
          </Sequence>
          <SoundEffect config={opening.se} startFrame={0} />
        </>
      )}
      {/* スライド登場時の効果音（同じスライドを続けるシーンでは鳴らさない） */}
      {slideGroups.map((group) => (
        <SoundEffect
          key={`slide-se-${group.index}`}
          config={group.slide.se}
          startFrame={Math.floor(group.startTime * fps)}
        />
      ))}
      {/* シーンごとの字幕・音声・強調画像 */}
      {scenes.map((scene, i) => {
        const startFrame = Math.floor(scene.startTime * fps);
        const duration = scene.lipsyncData.duration + (scene.pause ?? 0.5);
        const durationInFrames = Math.ceil(duration * fps);

        // シーンに書かれていなければ動画全体の設定を使う（nullなら鳴らさない）
        const sceneSe = scene.se !== undefined ? scene.se : config.defaultSe;

        return (
          <React.Fragment key={i}>
            <SoundEffect config={sceneSe} startFrame={startFrame} />
            <Sequence from={startFrame} durationInFrames={durationInFrames}>
              <SubtitleRenderer
                text={scene.text}
                withSlide={Boolean(scene.slide)}
                variant={scene.subtitle}
                fallbackVariant={config.defaultSubtitle}
                accent={scene.slide?.accent}
              />
              <Audio src={staticFile(scene.audioFile)} />
              {scene.image && <HighlightImage config={scene.image} />}
            </Sequence>
          </React.Fragment>
        );
      })}
      {/* クレジット（最後の2秒） */}
      <Sequence
        from={Math.floor((totalDuration - 2) * fps)}
        durationInFrames={Math.floor(2 * fps)}
      >
        <div
          style={{
            position: "absolute",
            bottom: 30,
            left: 30,
            fontSize: 20,
            color: "rgba(255,255,255,0.8)",
            fontFamily: "'Noto Sans JP', sans-serif",
            opacity: interpolate(
              frame - Math.floor((totalDuration - 2) * fps),
              [0, 15],
              [0, 1],
              { extrapolateRight: "clamp" }
            ),
          }}
        >
          {character.credits.map((credit) => (
            <div key={credit}>{credit}</div>
          ))}
          {bgmCredit && <div>{bgmCredit}</div>}
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
