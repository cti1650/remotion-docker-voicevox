import React from "react";

interface SlideFooterProps {
  note?: string;
  accent: string;
  index?: number;
  total?: number;
  color?: string;
}

/**
 * スライド下部の補足テキストとページ番号
 */
export const SlideFooter: React.FC<SlideFooterProps> = ({
  note,
  accent,
  index,
  total,
  color = "#9a9aaa",
}) => (
  <div
    style={{
      padding: "0 48px 30px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: 26,
      color,
    }}
  >
    <div>{note ?? ""}</div>
    {index && total ? (
      <div style={{ fontWeight: 700, color: accent }}>
        {index} / {total}
      </div>
    ) : null}
  </div>
);
