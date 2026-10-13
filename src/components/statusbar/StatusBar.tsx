import React from 'react';
import { useDocumentStore } from '../../store/useDocumentStore';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  HardDrive,
  Monitor,
} from 'lucide-react';

export const StatusBar: React.FC = () => {
  const {
    document,
    activeSlideId,
    zoomLevel,
    setZoomLevel,
    startPresentation,
  } = useDocumentStore();

  const activeIndex = document.slides.findIndex((s) => s.id === activeSlideId);
  const currentNum = activeIndex !== -1 ? activeIndex + 1 : 1;
  const totalSlides = document.slides.length;

  return (
    <footer className="h-7 bg-slate-950 border-t border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400 select-none shrink-0">
      {/* Left: Slide Progress & Offline Status */}
      <div className="flex items-center gap-4">
        <span className="font-medium text-slate-300">
          Slide {currentNum} of {totalSlides}
        </span>
        <span className="text-slate-700">|</span>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
          <HardDrive size={12} />
          <span>Offline Ready • Local Device Storage</span>
        </div>
      </div>

      {/* Right: Zoom Factor & Quick Presentation Controls */}
      <div className="flex items-center gap-3">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoomLevel(zoomLevel - 0.05)}
            className="p-1 hover:text-slate-200"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>

          <input
            type="range"
            min="0.3"
            max="1.5"
            step="0.05"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
            className="w-24 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />

          <button
            onClick={() => setZoomLevel(zoomLevel + 0.05)}
            className="p-1 hover:text-slate-200"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>

          <button
            onClick={() => setZoomLevel(0.65)}
            className="font-mono text-[11px] px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-300 w-12 text-center"
            title="Reset Zoom"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
        </div>

        <span className="text-slate-700">|</span>

        {/* Start Presentation Shortcut */}
        <button
          onClick={() => startPresentation('fullscreen')}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition text-[11px] font-medium"
        >
          <Monitor size={12} />
          <span>Present</span>
        </button>
      </div>
    </footer>
  );
};

