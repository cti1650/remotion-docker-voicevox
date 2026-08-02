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
import { useLipSync, LipSyncData, DialogueLipSync } from "../hooks/useLipSync";
import {
  SceneConfig,
  VideoConfig,
  EmotionType,
  EMOTION_PRESETS,
  BackgroundConfig,
} from "../types/scene";

// 生成されたシーンデータ（音声・リップシンク情報を含む）
export interface GeneratedScene extends SceneConfig {
  audioFile: string;      // 音声ファイルパス
  lipsyncData: LipSyncData;  // リップシンクデータ
  startTime: number;      // 開始時間（秒）
}

interface SceneCompositionProps {
  config: VideoConfig;
  scenes: GeneratedScene[];
}

// 字幕コンポーネント
const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 0,
        right: 0,
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

  // 背景の取得
  const background: BackgroundConfig | string =
    currentScene?.background ?? config.defaultBackground ?? "gradient";

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
      {/* 背景 */}
      <Background config={background} />

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
            <Subtitle text={scene.text} />
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
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
