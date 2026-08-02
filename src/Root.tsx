import React from "react";
import { Composition, Folder } from "remotion";
import { MyComposition } from "./Composition";
import { SceneVideo, GeneratedVideoData } from "./SceneVideo";

// 生成された動画データを直接インポート
// generate-from-scenes.sh実行時に自動更新
import * as demoData from "./generated/demo.json";

// インポートした動画データを配列化
const generatedVideos: GeneratedVideoData[] = [
  demoData as unknown as GeneratedVideoData,
].filter((v) => v && v.id); // 有効なデータのみ

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* デモ用コンポジション */}
      <Folder name="Demo">
        <Composition
          id="MyComposition"
          component={MyComposition}
          durationInFrames={390}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>

      {/* 生成された動画 */}
      {generatedVideos.length > 0 && (
        <Folder name="Generated">
          {generatedVideos.map((videoData) => (
            <Composition
              key={videoData.id}
              id={videoData.id}
              component={SceneVideo}
              durationInFrames={Math.ceil(
                videoData.totalDuration * (videoData.config.fps ?? 30)
              )}
              fps={videoData.config.fps ?? 30}
              width={videoData.config.width ?? 1920}
              height={videoData.config.height ?? 1080}
              defaultProps={{ videoData }}
            />
          ))}
        </Folder>
      )}
    </>
  );
};
