import React from "react";
import { SceneComposition, GeneratedScene } from "./components/SceneComposition";
import { VideoConfig } from "./types/scene";

// 生成データの型定義
export interface GeneratedVideoData {
  id: string;
  config: VideoConfig;
  scenes: GeneratedScene[];
  totalDuration: number;
}

export interface SceneVideoProps {
  videoData?: GeneratedVideoData;
}

// defaultPropsから動画データを受け取る
export const SceneVideo: React.FC<SceneVideoProps> = ({ videoData }) => {
  if (!videoData || !videoData.scenes || videoData.scenes.length === 0) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#1a1a2e",
        color: "white",
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: 32,
      }}>
        No video data - run generate-from-scenes.sh first
      </div>
    );
  }

  const { config, scenes } = videoData;

  return (
    <SceneComposition
      config={config}
      scenes={scenes}
    />
  );
};
