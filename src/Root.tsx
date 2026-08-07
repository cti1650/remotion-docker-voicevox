import React from "react";
import { Composition, Folder, Still } from "remotion";
import { SceneVideo, GeneratedVideoData } from "./SceneVideo";
import { ThumbnailComposition, thumbnailSize } from "./components/thumbnail";

// 生成された動画データを直接インポート
// generate-from-scenes.sh実行時に自動更新
import * as cosenseData from "./generated/cosense.json";
import * as demoData from "./generated/demo.json";
import * as opening_demoData from "./generated/opening-demo.json";
import * as presenter_demoData from "./generated/presenter-demo.json";
import * as slide_demoData from "./generated/slide-demo.json";
import * as variants_demoData from "./generated/variants-demo.json";

// インポートした動画データを配列化
const generatedVideos: GeneratedVideoData[] = [
  cosenseData as unknown as GeneratedVideoData,
  demoData as unknown as GeneratedVideoData,
  opening_demoData as unknown as GeneratedVideoData,
  presenter_demoData as unknown as GeneratedVideoData,
  slide_demoData as unknown as GeneratedVideoData,
  variants_demoData as unknown as GeneratedVideoData,
].filter((v) => v && v.id); // 有効なデータのみ

export const RemotionRoot: React.FC = () => {
  return (
    <>
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

      {/* サムネイル（thumbnail:を書いたYAMLだけ。npm run thumbnail で静止画出力） */}
      {generatedVideos.some((v) => v.config.thumbnail) && (
        <Folder name="Thumbnails">
          {generatedVideos
            .filter((videoData) => videoData.config.thumbnail)
            .map((videoData) => {
              const thumbnail = videoData.config.thumbnail!;
              const { width, height } = thumbnailSize(thumbnail);
              return (
                <Still
                  key={videoData.id}
                  id={`${videoData.id}-thumbnail`}
                  component={ThumbnailComposition}
                  width={width}
                  height={height}
                  defaultProps={{
                    thumbnail,
                    character: videoData.config.character,
                  }}
                />
              );
            })}
        </Folder>
      )}
    </>
  );
};
