import React from 'react';
import { useDocumentStore } from '../../store/useDocumentStore';
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Layers,
} from 'lucide-react';

export const SlideThumbnailSidebar: React.FC = () => {
  const {
    document,
    activeSlideId,
    setActiveSlide,
    addSlide,
    deleteSlide,
    duplicateSlide,
    reorderSlides,
  } = useDocumentStore();

  const handleMoveUp = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (index > 0) {
      reorderSlides(index, index - 1);
    }
  };

  const handleMoveDown = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (index < document.slides.length - 1) {
      reorderSlides(index, index + 1);
    }
  };

  return (
    <aside className="w-56 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Sidebar Header */}
      <div className="h-10 px-3 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <Layers size={14} className="text-cyan-400" />
          <span>Slides ({document.slides.length})</span>
        </div>
        <button
          onClick={() => addSlide()}
          className="p-1 rounded hover:bg-slate-800 text-cyan-400 transition"
          title="Add New Slide"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Thumbnails Scroll Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {document.slides.map((slide, index) => {
          const isActive = slide.id === activeSlideId;

          return (
            <div
              key={slide.id}
              onClick={() => setActiveSlide(slide.id)}
              className={`group relative rounded-lg p-2 transition cursor-pointer border ${
                isActive
                  ? 'bg-slate-900 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Slide Number Badge */}
              <div className="flex items-center justify-between mb-1.5 text-[11px]">
                <span
                  className={`font-mono font-bold px-1.5 py-0.2 rounded ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  {index + 1}
                </span>

                {/* Hover Reorder / Action Controls */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition">
                  <button
                    onClick={(e) => handleMoveUp(e, index)}
                    disabled={index === 0}
                    className="p-0.5 text-slate-400 hover:text-slate-200 disabled:opacity-20"
                    title="Move Up"
                  >
                    <ChevronUp size={12} />
                  </button>
                  <button
                    onClick={(e) => handleMoveDown(e, index)}
                    disabled={index === document.slides.length - 1}
                    className="p-0.5 text-slate-400 hover:text-slate-200 disabled:opacity-20"
                    title="Move Down"
                  >
                    <ChevronDown size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSlide(slide.id);
                    }}
                    className="p-0.5 text-slate-400 hover:text-cyan-400"
                    title="Duplicate"
                  >
                    <Copy size={12} />
                  </button>
                  {document.slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSlide(slide.id);
                      }}
                      className="p-0.5 text-slate-400 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* 16:9 Aspect Ratio Mini Canvas Preview */}
              <div
                className="w-full aspect-video rounded border border-slate-800 overflow-hidden relative flex flex-col justify-between p-1.5"
                style={{ backgroundColor: slide.backgroundColor || '#0f172a' }}
              >
                {/* Mini Elements Representation */}
                <div className="truncate text-[9px] font-medium text-slate-300">
                  {slide.title || 'Untitled Slide'}
                </div>

                <div className="flex items-center justify-between text-[8px] text-slate-500">
                  <span>{slide.elements.length} items</span>
                  {slide.elements.some((e) => e.type === 'interactive') && (
                    <span className="text-cyan-400 font-semibold">⚡ Interactive</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Slide Quick Button */}
        <button
          onClick={() => addSlide()}
          className="w-full py-2 border border-dashed border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/60 rounded-lg text-slate-400 hover:text-cyan-400 flex items-center justify-center gap-1.5 text-xs transition"
        >
          <Plus size={14} />
          <span>New Slide</span>
        </button>
      </div>
    </aside>
  );
};

