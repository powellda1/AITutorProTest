import { useState, useCallback, useEffect } from "react";

interface DraggableDividerProps {
  onResize: (newTopHeight: number) => void;
  containerHeight: number;
  minTopHeight?: number;
  minBottomHeight?: number;
}

export default function DraggableDivider({
  onResize,
  containerHeight,
  minTopHeight = 200,
  minBottomHeight = 100,
}: DraggableDividerProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const container = document.getElementById("middle-panel");
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newTopHeight = e.clientY - containerRect.top;
      const newBottomHeight = containerHeight - newTopHeight - 4; // 4px for divider

      if (newTopHeight >= minTopHeight && newBottomHeight >= minBottomHeight) {
        onResize(newTopHeight);
      }
    },
    [isDragging, onResize, containerHeight, minTopHeight, minBottomHeight]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`h-4 bg-blue-600 hover:bg-blue-500 cursor-ns-resize transition-all duration-200 border-t border-b border-blue-500 flex items-center justify-center group shadow-md ${
        isDragging ? "bg-blue-400 shadow-lg" : ""
      }`}
      onMouseDown={handleMouseDown}
      style={{ zIndex: 10 }}
    >
      {/* Modern grip lines indicator */}
      <div className="flex flex-col space-y-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
        <div className="w-8 h-0.5 bg-white rounded-full"></div>
        <div className="w-8 h-0.5 bg-white rounded-full"></div>
        <div className="w-8 h-0.5 bg-white rounded-full"></div>
      </div>
    </div>
  );
}