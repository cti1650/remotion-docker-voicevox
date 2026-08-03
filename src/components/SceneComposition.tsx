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
import { ZundamonCharacter, MouthType } from "./ZundamonCharacter";
import { Background } from "./Background";
import { HighlightImage } from "./HighlightImage";
import { SlideFrame, SLIDE_AREA } from "./SlideFrame";
import { useLipSync, LipSyncData, DialogueLipSync } from "../hooks/useLipSync";
import { resolveMediaSrc } from "../utils/media";
import {
  SceneConfig,
  VideoConfig,
  EmotionType,
  EMOTION_PRESETS,
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

// 字幕コンポーネント
// スライド表示中は字幕をスライドの真下に寄せて、キャラクターに被らないようにする
const Subtitle: React.FC<{ text: string; withSlide?: boolean }> = ({
  text,
  withSlide = false,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: withSlide ? 60 : 80,
        left: withSlide ? SLIDE_AREA.left : 0,
        right: withSlide ? undefined : 0,
        width: withSlide ? SLIDE_AREA.width : undefined,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          color: "white",
          padding: "20px 40px",
          borderRadius: 12,
          fontSize: 42,
          fontFamily: "'Noto Sans JP', sans-serif",
          fontWeight: 700,
          opacity,
          maxWidth: "85%",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {text}
      </div>
    </div>
  );
};

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

  // リップシンク用データを作成
  const lipSyncDialogues: DialogueLipSync[] = scenes.map((scene) => ({
    start: scene.startTime,
    lipsyncData: scene.lipsyncData,
  }));

  const mouth = useLipSync(lipSyncDialogues, "closed");

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
  const emotion: EmotionType = currentScene?.emotion ?? "normal";
  const emotionPreset = EMOTION_PRESETS[emotion];

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

  // 背景の取得
  const background: BackgroundConfig | string =
    currentScene?.background ?? config.defaultBackground ?? "gradient";

  // BGMのクレジット表記（設定されていれば動画末尾に追記する）
  const bgmCredit =
    typeof config.bgm === "object" ? config.bgm.credit : undefined;

  // キャラクター配置
  const characterScale = 0.55;
  const characterWidth = 1082 * characterScale;
  const characterHeight = 1594 * characterScale;
  const characterX = (width - characterWidth) / 2 + 400;
  const characterY = height - characterHeight - 730;

  // 総フレーム数を計算
  const totalDuration = scenes.reduce((acc, scene) => {
    return acc + scene.lipsyncData.duration + (scene.pause ?? 0.5);
  }, 0);

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
        <SlideFrame
          slide={activeSlideGroup.slide}
          startFrame={Math.floor(activeSlideGroup.startTime * fps)}
          highlight={currentScene?.highlight}
          index={activeSlideGroup.index}
          total={slideGroups.length}
        />
      )}

      {/* キャラクター */}
      <ZundamonCharacter
        scale={characterScale}
        x={characterX}
        y={characterY}
        mouth={mouth}
        eye={emotionPreset.eye}
        eyebrow={emotionPreset.eyebrow}
        faceColor={emotionPreset.faceColor}
        edamame={emotionPreset.edamame}
        enableBlink={true}
        enableBreathing={true}
      />

      {/* シーンごとの字幕・音声・強調画像 */}
      {scenes.map((scene, i) => {
        const startFrame = Math.floor(scene.startTime * fps);
        const duration = scene.lipsyncData.duration + (scene.pause ?? 0.5);
        const durationInFrames = Math.ceil(duration * fps);

        return (
          <Sequence key={i} from={startFrame} durationInFrames={durationInFrames}>
            <Subtitle text={scene.text} withSlide={Boolean(scene.slide)} />
            <Audio src={staticFile(scene.audioFile)} />
            {scene.image && <HighlightImage config={scene.image} />}
          </Sequence>
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
          <div>VOICEVOX:ずんだもん</div>
          <div>立ち絵素材: 坂本アヒル</div>
          {bgmCredit && <div>{bgmCredit}</div>}
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
