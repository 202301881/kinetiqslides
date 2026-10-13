import React from 'react';
import { useDocumentStore } from '../../store/useDocumentStore';
import {
  SlideElement,
  TextElement,
  ShapeElement,
  InteractiveElement,
  SlideTransitionType,
  AnimationPreset,
} from '../../types/schema';
import {
  Layers,
  Sparkles,
  Sliders,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  Plus,
  Play,
} from 'lucide-react';

export const PropertyInspector: React.FC = () => {
  const {
    document,
    activeSlideId,
    selectedElementIds,
    updateElement,
    deleteSelectedElements,
    duplicateSelectedElements,
    bringElementForward,
    sendElementBackward,
    bringElementToFront,
    sendElementToBack,
    updateSlideBackground,
    updateSlideTransition,
    updateSlideNotes,
    addAnimation,
    removeAnimation,
    addHook,
    removeHook,
  } = useDocumentStore();

  const activeSlide = document.slides.find((s) => s.id === activeSlideId);
  const selectedElement = activeSlide?.elements.find((el) =>
    selectedElementIds.includes(el.id)
  );

  // If no element is selected, show Slide Properties
  if (!selectedElement) {
    if (!activeSlide) return null;

    return (
      <aside className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 text-slate-300 text-xs select-none overflow-y-auto p-4 space-y-6">
        <div>
          <div className="flex items-center gap-1.5 font-bold text-slate-100 text-sm mb-1">
            <Sliders size={16} className="text-cyan-400" />
            <span>Slide Properties</span>
          </div>
          <p className="text-[11px] text-slate-400">Configure background and transitions</p>
        </div>

        {/* Slide Title */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase">Slide Title</label>
          <input
            type="text"
            value={activeSlide.title}
            onChange={(e) => {
              const updated = document.slides.map((s) =>
                s.id === activeSlide.id ? { ...s, title: e.target.value } : s
              );
              useDocumentStore.setState({ document: { ...document, slides: updated } });
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:border-cyan-500"
          />
        </div>

        {/* Background Color */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-400 uppercase">Background Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={activeSlide.backgroundColor || '#0f172a'}
              onChange={(e) => updateSlideBackground(activeSlide.id, e.target.value)}
              className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
            />
            <span className="font-mono text-slate-400">{activeSlide.backgroundColor}</span>
          </div>

          {/* Quick Color Presets */}
          <div className="flex items-center gap-1.5 pt-1">
            {['#0f172a', '#020617', '#1e1b4b', '#064e3b', '#18181b', '#f8fafc'].map((color) => (
              <button
                key={color}
                onClick={() => updateSlideBackground(activeSlide.id, color)}
                style={{ backgroundColor: color }}
                className="w-6 h-6 rounded border border-slate-700 hover:scale-110 transition"
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Slide Transition */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-400 uppercase">Slide Transition</label>
          <select
            value={activeSlide.transition.type}
            onChange={(e) =>
              updateSlideTransition(activeSlide.id, {
                ...activeSlide.transition,
                type: e.target.value as SlideTransitionType,
              })
            }
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 capitalize"
          >
            {['none', 'fade', 'slide_left', 'slide_right', 'slide_up', 'zoom', 'flip'].map((t) => (
              <option key={t} value={t}>
                {t.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Presenter Speaker Notes */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-[11px] font-semibold text-slate-400 uppercase">
            Speaker Notes (Presenter View)
          </label>
          <textarea
            value={activeSlide.notes || ''}
            onChange={(e) => updateSlideNotes(activeSlide.id, e.target.value)}
            rows={5}
            placeholder="Add notes visible only in Presenter Dual View..."
            className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-xs focus:border-cyan-500 resize-none leading-relaxed"
          />
        </div>
      </aside>
    );
  }

  // ELEMENT PROPERTIES INSPECTOR
  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 text-slate-300 text-xs select-none overflow-y-auto p-4 space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded">
            {selectedElement.type}
          </span>
          <h4 className="font-bold text-slate-100 text-sm mt-1">{selectedElement.name}</h4>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => duplicateSelectedElements()}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400"
            title="Duplicate Element"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => deleteSelectedElements()}
            className="p-1.5 rounded hover:bg-red-950/40 text-slate-400 hover:text-red-400"
            title="Delete Element"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Geometry / Transform */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-400 uppercase">Position & Size</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-500">X Position</span>
            <input
              type="number"
              value={selectedElement.x}
              onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500">Y Position</span>
            <input
              type="number"
              value={selectedElement.y}
              onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500">Width</span>
            <input
              type="number"
              value={selectedElement.width}
              onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500">Height</span>
            <input
              type="number"
              value={selectedElement.height}
              onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Layering & Visibility */}
      <div className="space-y-2 border-t border-slate-800 pt-3">
        <label className="text-[11px] font-semibold text-slate-400 uppercase">Layer & State</label>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => bringElementForward(selectedElement.id)}
            className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 rounded flex items-center justify-center gap-1 text-[11px]"
          >
            <ArrowUp size={12} /> Up
          </button>
          <button
            onClick={() => sendElementBackward(selectedElement.id)}
            className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 rounded flex items-center justify-center gap-1 text-[11px]"
          >
            <ArrowDown size={12} /> Down
          </button>
          <button
            onClick={() => updateElement(selectedElement.id, { isHidden: !selectedElement.isHidden })}
            className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] ${
              selectedElement.isHidden ? 'bg-red-950/80 text-red-300' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {selectedElement.isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        </div>
      </div>

      {/* Specific Element Type Attributes */}
      {selectedElement.type === 'text' && (
        <div className="space-y-3 border-t border-slate-800 pt-3">
          <label className="text-[11px] font-semibold text-slate-400 uppercase">Text Typography</label>
          <textarea
            value={(selectedElement as TextElement).content}
            onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-xs"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-500">Font Size (px)</span>
              <input
                type="number"
                value={(selectedElement as TextElement).fontSize}
                onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={(selectedElement as TextElement).textColor}
                  onChange={(e) => updateElement(selectedElement.id, { textColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedElement.type === 'shape' && (
        <div className="space-y-3 border-t border-slate-800 pt-3">
          <label className="text-[11px] font-semibold text-slate-400 uppercase">Shape Styling</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-500">Fill Color</span>
              <input
                type="color"
                value={(selectedElement as ShapeElement).fillColor}
                onChange={(e) => updateElement(selectedElement.id, { fillColor: e.target.value })}
                className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Stroke Color</span>
              <input
                type="color"
                value={(selectedElement as ShapeElement).strokeColor}
                onChange={(e) => updateElement(selectedElement.id, { strokeColor: e.target.value })}
                className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Interactive Trigger Hooks Configuration (CvSU-LSHS Key Feature) */}
      <div className="space-y-3 border-t border-slate-800 pt-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-cyan-400 uppercase flex items-center gap-1">
            <Sparkles size={13} />
            <span>Event Hooks & Triggers</span>
          </label>
          <button
            onClick={() =>
              addHook(selectedElement.id, {
                id: `hook_${Date.now()}`,
                name: 'Reveal Concept',
                event: 'click',
                targetElementId: 'elem_hidden_fact',
                action: 'toggle_visibility',
              })
            }
            className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded hover:bg-cyan-900 transition flex items-center gap-1"
          >
            <Plus size={10} /> Add Hook
          </button>
        </div>

        {selectedElement.interactiveHooks.length === 0 ? (
          <p className="text-[11px] text-slate-500 italic">No triggers connected to this element.</p>
        ) : (
          <div className="space-y-2">
            {selectedElement.interactiveHooks.map((h) => (
              <div
                key={h.id}
                className="p-2 bg-slate-950 border border-slate-800 rounded flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-cyan-300 text-[11px]">{h.name}</p>
                  <p className="text-[10px] text-slate-400">
                    On {h.event} ➔ {h.action}
                  </p>
                </div>
                <button
                  onClick={() => removeHook(selectedElement.id, h.id)}
                  className="text-slate-500 hover:text-red-400 p-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assigned Animations */}
      <div className="space-y-2 border-t border-slate-800 pt-3">
        <label className="text-[11px] font-semibold text-slate-400 uppercase">
          Assigned Animations ({selectedElement.animations.length})
        </label>
        {selectedElement.animations.map((anim) => (
          <div
            key={anim.id}
            className="p-2 bg-slate-950 border border-slate-800 rounded flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-slate-200 capitalize text-[11px]">
                {anim.preset.replace('_', ' ')}
              </p>
              <p className="text-[10px] text-slate-500">
                Trigger: {anim.trigger} • {anim.duration}s
              </p>
            </div>
            <button
              onClick={() => removeAnimation(selectedElement.id, anim.id)}
              className="text-slate-500 hover:text-red-400 p-1"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
};

