import React, { useRef, useState } from 'react';
import { useDocumentStore } from '../../store/useDocumentStore';
import {
  SlideElement,
  InteractiveElement,
  TextElement,
  ShapeElement,
  TableElement,
} from '../../types/schema';
import { Check, X, MousePointer, HelpCircle } from 'lucide-react';

export const SlideCanvas: React.FC = () => {
  const {
    document,
    activeSlideId,
    selectedElementIds,
    setSelectedElements,
    updateElement,
    zoomLevel,
    executeHook,
  } = useDocumentStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const activeSlide = document.slides.find((s) => s.id === activeSlideId);

  // Dragging state for canvas elements
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ mouseX: number; mouseY: number; elX: number; elY: number } | null>(null);

  if (!activeSlide) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        No active slide selected.
      </div>
    );
  }

  const canvasWidth = document.settings.dimensions.width; // 1920
  const canvasHeight = document.settings.dimensions.height; // 1080

  const handleCanvasBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).id === 'slide-viewport') {
      setSelectedElements([]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, element: SlideElement) => {
    e.stopPropagation();
    setSelectedElements([element.id]);

    if (!element.isLocked) {
      setDraggingElementId(element.id);
      setDragStartPos({
        mouseX: e.clientX,
        mouseY: e.clientY,
        elX: element.x,
        elY: element.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingElementId || !dragStartPos) return;

    const deltaX = (e.clientX - dragStartPos.mouseX) / zoomLevel;
    const deltaY = (e.clientY - dragStartPos.mouseY) / zoomLevel;

    updateElement(draggingElementId, {
      x: Math.round(dragStartPos.elX + deltaX),
      y: Math.round(dragStartPos.elY + deltaY),
    });
  };

  const handleMouseUp = () => {
    setDraggingElementId(null);
    setDragStartPos(null);
  };

  const renderElementContent = (element: SlideElement, isSelected: boolean) => {
    switch (element.type) {
      case 'text': {
        const textEl = element as TextElement;
        return (
          <div
            style={{
              fontSize: `${textEl.fontSize}px`,
              fontFamily: textEl.fontFamily,
              fontWeight: textEl.fontWeight,
              fontStyle: textEl.fontStyle,
              textAlign: textEl.textAlign,
              color: textEl.textColor,
              lineHeight: textEl.lineHeight || 1.2,
              whiteSpace: 'pre-wrap',
            }}
            className="w-full h-full select-text cursor-text"
          >
            {textEl.content}
          </div>
        );
      }

      case 'shape': {
        const shapeEl = element as ShapeElement;
        if (shapeEl.shapeType === 'circle') {
          return (
            <div
              style={{
                backgroundColor: shapeEl.fillColor,
                borderColor: shapeEl.strokeColor,
                borderWidth: `${shapeEl.strokeWidth}px`,
              }}
              className="w-full h-full rounded-full border"
            />
          );
        }
        if (shapeEl.shapeType === 'triangle') {
          return (
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon
                points="50,5 95,95 5,95"
                fill={shapeEl.fillColor}
                stroke={shapeEl.strokeColor}
                strokeWidth={shapeEl.strokeWidth}
              />
            </svg>
          );
        }
        return (
          <div
            style={{
              backgroundColor: shapeEl.fillColor,
              borderColor: shapeEl.strokeColor,
              borderWidth: `${shapeEl.strokeWidth}px`,
              borderRadius: `${shapeEl.borderRadius || 0}px`,
            }}
            className="w-full h-full border"
          />
        );
      }

      case 'table': {
        const tableEl = element as TableElement;
        return (
          <div className="w-full h-full overflow-hidden rounded border border-slate-700 text-slate-200">
            <table className="w-full h-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: tableEl.headerBgColor }}>
                  {tableEl.headers.map((h, i) => (
                    <th key={i} className="p-3 border border-slate-700 text-left font-bold text-sm">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableEl.data.map((row, rIdx) => (
                  <tr key={rIdx} style={{ backgroundColor: tableEl.cellBgColor }}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 border border-slate-700 text-sm">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'interactive': {
        const interEl = element as InteractiveElement;

        if (interEl.interactiveKind === 'button') {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (interEl.interactiveHooks?.length > 0) {
                  interEl.interactiveHooks.forEach((hook) => executeHook(hook));
                }
              }}
              className="w-full h-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg transition active:scale-95 text-xl px-4"
            >
              <MousePointer size={24} />
              <span>{interEl.label}</span>
            </button>
          );
        }

        if (interEl.interactiveKind === 'input_field') {
          return (
            <div className="w-full h-full flex flex-col justify-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder={interEl.placeholder}
                  defaultValue={interEl.defaultValue}
                  className="w-full h-14 bg-slate-900/90 border-2 border-cyan-500/70 focus:border-cyan-400 rounded-xl px-4 text-xl text-slate-100 placeholder-slate-500 shadow-inner"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="absolute right-3 top-3.5 text-xs bg-cyan-950 text-cyan-300 font-mono px-2 py-1 rounded border border-cyan-800">
                  Regex: {interEl.validationRule?.expected || 'Active'}
                </span>
              </div>
            </div>
          );
        }

        if (interEl.interactiveKind === 'quiz_card') {
          return (
            <div className="w-full h-full bg-slate-900/95 border-2 border-slate-700 rounded-2xl p-6 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-2">
                  <HelpCircle size={18} />
                  <span>Formative Question ({interEl.points} pts)</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-100 mb-6">
                  {interEl.question}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {interEl.options.map((opt, idx) => (
                  <div
                    key={opt.id}
                    className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-between text-lg text-slate-200 transition cursor-pointer"
                  >
                    <span>
                      <strong className="text-cyan-400 mr-2">{String.fromCharCode(65 + idx)}.</strong>
                      {opt.text}
                    </span>
                    {opt.isCorrect && (
                      <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-700 px-2 py-0.5 rounded font-mono">
                        Correct Answer
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {interEl.explanation && (
                <p className="text-sm text-slate-400 italic mt-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  Rationale: {interEl.explanation}
                </p>
              )}
            </div>
          );
        }

        return <div className="text-white text-xs">Interactive Component</div>;
      }

      default:
        return null;
    }
  };

  return (
    <main
      ref={canvasRef}
      onClick={handleCanvasBackgroundClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="flex-1 bg-slate-950 canvas-checkerboard relative overflow-auto flex items-center justify-center p-8 select-none"
    >
      {/* 16:9 Scaled Slide Viewport */}
      <div
        id="slide-viewport"
        style={{
          width: `${canvasWidth * zoomLevel}px`,
          height: `${canvasHeight * zoomLevel}px`,
          backgroundColor: activeSlide.backgroundColor || '#0f172a',
        }}
        className="relative shadow-2xl rounded-sm transition-all duration-75 overflow-hidden border border-slate-800/80 shrink-0"
      >
        {/* Slide Scale Transform Container */}
        <div
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
          }}
          className="absolute top-0 left-0"
        >
          {activeSlide.elements.map((element) => {
            const isSelected = selectedElementIds.includes(element.id);

            return (
              <div
                key={element.id}
                onMouseDown={(e) => handleMouseDown(e, element)}
                style={{
                  position: 'absolute',
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  transform: `rotate(${element.rotation}deg)`,
                  opacity: element.isHidden ? 0.35 : element.opacity,
                  zIndex: element.zIndex,
                }}
                className={`group cursor-move transition-shadow ${
                  isSelected ? 'selected-element-box ring-2 ring-cyan-400' : 'hover:outline hover:outline-1 hover:outline-cyan-500/40'
                } ${element.isHidden ? 'border border-dashed border-red-500/60' : ''}`}
              >
                {/* Element Render Body */}
                {renderElementContent(element, isSelected)}

                {/* Transform / Selection Handles */}
                {isSelected && (
                  <>
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-cyan-400 border border-slate-900 rounded-sm cursor-nwse-resize" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-cyan-400 border border-slate-900 rounded-sm cursor-nesw-resize" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-cyan-400 border border-slate-900 rounded-sm cursor-nesw-resize" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-cyan-400 border border-slate-900 rounded-sm cursor-nwse-resize" />
                    {element.isHidden && (
                      <span className="absolute -top-6 left-0 bg-red-950 text-red-300 border border-red-800 text-[10px] px-1.5 py-0.5 rounded">
                        Hidden (Will reveal on hook)
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

