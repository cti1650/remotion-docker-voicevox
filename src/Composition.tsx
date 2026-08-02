import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  interpolate,
  Audio,
  staticFile,
} from "remotion";
import { ZundamonCharacter } from "./components/ZundamonCharacter";
import { useLipSync, LipSyncData, DialogueLipSync } from "./hooks/useLipSync";

// リップシンクデータをインポート
import line1LipSync from "../public/audio/line1.json";
import line2LipSync from "../public/audio/line2.json";
import line3LipSync from "../public/audio/line3.json";
import line4LipSync from "../public/audio/line4.json";

interface SubtitleProps {
  text: string;
}

const Subtitle: React.FC<SubtitleProps> = ({ text }) => {
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

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // セリフデータ（リップシンクデータを含む）
  const dialogue = [
    { start: 0.5, text: "こんにちは！ずんだもんなのだ！", audio: "audio/line1.wav", lipsync: line1LipSync as LipSyncData },
    { start: 3.5, text: "今日はRemotionで動画を作るのだ", audio: "audio/line2.wav", lipsync: line2LipSync as LipSyncData },
    { start: 8.0, text: "VOICEVOXと組み合わせると...", audio: "audio/line3.wav", lipsync: line3LipSync as LipSyncData },
    { start: 10.5, text: "簡単に動画が作れるのだ！", audio: "audio/line4.wav", lipsync: line4LipSync as LipSyncData },
  ];

  // リップシンク用のデータを作成
  const lipSyncDialogues: DialogueLipSync[] = dialogue.map((d) => ({
    start: d.start,
    lipsyncData: d.lipsync,
  }));

  // VOICEVOXタイミングデータを使った正確なリップシンク
  const mouth = useLipSync(lipSyncDialogues, "closed");

  // キャラクターの位置計算（画面中央右寄りに配置）
  const characterScale = 0.55;
  const characterWidth = 1082 * characterScale;
  const characterHeight = 1594 * characterScale;
  const characterX = (width - characterWidth) / 2 + 400; // 中央より右
  const characterY = height - characterHeight - 730; // 画面下端より上

  return (
    <AbsoluteFill>
      {/* 背景グラデーション */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        }}
      />

      {/* 装飾パターン */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
        }}
      />

      {/* タイトル */}
      <Sequence from={0} durationInFrames={Math.floor(fps * 2.5)}>
        <div
          style={{
            position: "absolute",
            top: 100,
            left: 0,
            right: 0,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: 64,
              color: "white",
              fontFamily: "'Noto Sans JP', sans-serif",
              fontWeight: 900,
              textShadow: "4px 4px 8px rgba(0,0,0,0.3)",
              opacity: interpolate(
                frame,
                [0, 20, fps * 2.5 - 20, fps * 2.5],
                [0, 1, 1, 0],
                { extrapolateRight: "clamp" }
              ),
              margin: 0,
            }}
          >
            Remotion + VOICEVOX
          </h1>
          <p
            style={{
              fontSize: 32,
              color: "rgba(255,255,255,0.9)",
              fontFamily: "'Noto Sans JP', sans-serif",
              marginTop: 20,
              opacity: interpolate(
                frame,
                [10, 30, fps * 2.5 - 20, fps * 2.5],
                [0, 1, 1, 0],
                { extrapolateRight: "clamp" }
              ),
            }}
          >
            キャラクター動画作成デモ
          </p>
        </div>
      </Sequence>

      {/* ずんだもんキャラクター */}
      <ZundamonCharacter
        scale={characterScale}
        x={characterX}
        y={characterY}
        mouth={mouth}
        eye="normal"
        eyebrow="normal"
        enableBlink={true}
        enableBreathing={true}
      />

      {/* 字幕と音声 */}
      {dialogue.map((d, i) => {
        const nextStart = dialogue[i + 1]?.start ?? 14;
        const startFrame = Math.floor(d.start * fps);
        const subtitleDuration = Math.floor((nextStart - d.start) * fps);

        return (
          <Sequence key={i} from={startFrame} durationInFrames={subtitleDuration}>
            <Subtitle text={d.text} />
            <Audio src={staticFile(d.audio)} />
          </Sequence>
        );
      })}

      {/* クレジット */}
      <Sequence from={Math.floor(fps * 11)} durationInFrames={Math.floor(fps * 2)}>
        <div
          style={{
            position: "absolute",
            bottom: 30,
            left: 30,
            fontSize: 20,
            color: "rgba(255,255,255,0.8)",
            fontFamily: "'Noto Sans JP', sans-serif",
            opacity: interpolate(
              frame - fps * 11,
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
