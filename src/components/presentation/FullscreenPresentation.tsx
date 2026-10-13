import React, { useEffect, useState } from 'react';
import { useDocumentStore } from '../../store/useDocumentStore';
import {
  ChevronLeft,
  ChevronRight,
  X,
  MousePointer,
  HelpCircle,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  SlideElement,
  InteractiveElement,
  TextElement,
  ShapeElement,
  TableElement,
} from '../../types/schema';

export const FullscreenPresentation: React.FC = () => {
  const {
    document,
    presentationSlideIndex,
    nextSlide,
    prevSlide,
    exitPresentation,
    executeHook,
    logEngagement,
  } = useDocumentStore();

  const currentSlide = document.slides[presentationSlideIndex] || document.slides[0];

  // Local state for interactive inputs and quiz selections during presentation
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [inputFeedbacks, setInputFeedbacks] = useState<Record<string, { success: boolean; msg: string }>>({});
  const [quizSelections, setQuizSelections] = useState<Record<string, string>>({});
  const [hiddenElementsOverride, setHiddenElementsOverride] = useState<Record<string, boolean>>({});

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Escape') {
        exitPresentation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, exitPresentation]);

  if (!currentSlide) return null;

  const canvasWidth = document.settings.dimensions.width; // 1920
  const canvasHeight = document.settings.dimensions.height; // 1080

  // Calculate fit scale to viewport
  const scale = Math.min(
    window.innerWidth / canvasWidth,
    window.innerHeight / canvasHeight
  );

  const handleInputSubmit = (el: InteractiveElement, value: string) => {
    if (el.interactiveKind !== 'input_field') return;
    const rule = el.validationRule;

    let isCorrect = true;
    if (rule?.type === 'regex' && rule.expected) {
      try {
        const reg = new RegExp(rule.expected, 'i');
        isCorrect = reg.test(value.trim());
      } catch {
        isCorrect = false;
      }
    }

    setInputFeedbacks((prev) => ({
      ...prev,
      [el.id]: {
        success: isCorrect,
        msg: isCorrect
          ? el.feedbackOnSuccess || 'Correct!'
          : el.feedbackOnFailure || 'Incorrect response.',
      },
    }));

    logEngagement({
      slideId: currentSlide.id,
      elementId: el.id,
      eventType: 'input_submission',
      studentResponse: value,
      isCorrect,
    });
  };

  const handleQuizSelect = (el: InteractiveElement, optionId: string, isCorrect: boolean) => {
    if (el.interactiveKind !== 'quiz_card') return;
    setQuizSelections((prev) => ({ ...prev, [el.id]: optionId }));

    logEngagement({
      slideId: currentSlide.id,
      elementId: el.id,
      eventType: 'quiz_attempt',
      studentResponse: optionId,
      isCorrect,
      scoreAwarded: isCorrect ? el.points : 0,
    });
  };

  const handleButtonClick = (el: InteractiveElement) => {
    if (el.interactiveHooks?.length > 0) {
      el.interactiveHooks.forEach((hook) => {
        if (hook.action === 'toggle_visibility' && hook.targetElementId) {
          setHiddenElementsOverride((prev) => ({
            ...prev,
            [hook.targetElementId]: !prev[hook.targetElementId],
          }));
        }
        executeHook(hook);
      });
    }
  };

  const renderElement = (element: SlideElement) => {
    // Check if element is hidden and not overridden
    const isOverridden = hiddenElementsOverride[element.id];
    const isHidden = isOverridden !== undefined ? !isOverridden : element.isHidden;

    if (isHidden) return null;

    return (
      <div
        key={element.id}
        style={{
          position: 'absolute',
          left: `${element.x}px`,
          top: `${element.y}px`,
          width: `${element.width}px`,
          height: `${element.height}px`,
          transform: `rotate(${element.rotation}deg)`,
          opacity: element.opacity,
          zIndex: element.zIndex,
        }}
        className="pointer-events-auto"
      >
        {element.type === 'text' && (
          <div
            style={{
              fontSize: `${(element as TextElement).fontSize}px`,
              fontFamily: (element as TextElement).fontFamily,
              fontWeight: (element as TextElement).fontWeight,
              fontStyle: (element as TextElement).fontStyle,
              textAlign: (element as TextElement).textAlign,
              color: (element as TextElement).textColor,
              lineHeight: (element as TextElement).lineHeight || 1.2,
              whiteSpace: 'pre-wrap',
            }}
            className="w-full h-full"
          >
            {(element as TextElement).content}
          </div>
        )}

        {element.type === 'shape' && (
          <div
            style={{
              backgroundColor: (element as ShapeElement).fillColor,
              borderColor: (element as ShapeElement).strokeColor,
              borderWidth: `${(element as ShapeElement).strokeWidth}px`,
              borderRadius: `${(element as ShapeElement).borderRadius || 0}px`,
            }}
            className="w-full h-full border"
          />
        )}

        {element.type === 'table' && (
          <div className="w-full h-full overflow-hidden rounded border border-slate-700 text-slate-100 text-lg">
            <table className="w-full h-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: (element as TableElement).headerBgColor }}>
                  {(element as TableElement).headers.map((h, i) => (
                    <th key={i} className="p-3 border border-slate-700 text-left font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(element as TableElement).data.map((row, rIdx) => (
                  <tr key={rIdx} style={{ backgroundColor: (element as TableElement).cellBgColor }}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 border border-slate-700">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {element.type === 'interactive' && (
          <>
            {(element as InteractiveElement).interactiveKind === 'button' && (
              <button
                onClick={() => handleButtonClick(element as InteractiveElement)}
                className="w-full h-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold flex items-center justify-center gap-2 shadow-2xl transition active:scale-95 text-2xl px-6 cursor-pointer"
              >
                <MousePointer size={28} />
                <span>{(element as InteractiveElement).label}</span>
              </button>
            )}

            {(element as InteractiveElement).interactiveKind === 'input_field' && (
              <div className="w-full h-full flex flex-col justify-center">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={(element as InteractiveElement).placeholder}
                    value={inputValues[element.id] || ''}
                    onChange={(e) =>
                      setInputValues({ ...inputValues, [element.id]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleInputSubmit(element as InteractiveElement, inputValues[element.id] || '');
                      }
                    }}
                    className="flex-1 h-16 bg-slate-900 border-2 border-cyan-500 focus:border-cyan-400 rounded-xl px-5 text-2xl text-slate-100 placeholder-slate-500 shadow-xl"
                  />
                  <button
                    onClick={() =>
                      handleInputSubmit(element as InteractiveElement, inputValues[element.id] || '')
                    }
                    className="px-6 h-16 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-lg cursor-pointer transition"
                  >
                    Submit
                  </button>
                </div>
                {inputFeedbacks[element.id] && (
                  <div
                    className={`mt-2 p-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                      inputFeedbacks[element.id].success
                        ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-700'
                        : 'bg-red-950/90 text-red-300 border border-red-700'
                    }`}
                  >
                    {inputFeedbacks[element.id].success ? <Check size={16} /> : <AlertCircle size={16} />}
                    <span>{inputFeedbacks[element.id].msg}</span>
                  </div>
                )}
              </div>
            )}

            {(element as InteractiveElement).interactiveKind === 'quiz_card' && (
              <div className="w-full h-full bg-slate-900/95 border-2 border-slate-700 rounded-2xl p-8 flex flex-col justify-between shadow-2xl">
                <div>
                  <div className="flex items-center gap-2 text-cyan-400 text-base font-semibold mb-3">
                    <HelpCircle size={20} />
                    <span>Interactive Formative Quiz ({(element as InteractiveElement).points} pts)</span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-100 mb-8">
                    {(element as InteractiveElement).question}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  {(element as InteractiveElement).options.map((opt, idx) => {
                    const isSelected = quizSelections[element.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() =>
                          handleQuizSelect(element as InteractiveElement, opt.id, opt.isCorrect)
                        }
                        className={`p-5 rounded-xl border flex items-center justify-between text-xl text-left transition cursor-pointer ${
                          isSelected
                            ? opt.isCorrect
                              ? 'bg-emerald-900/80 border-emerald-500 text-emerald-100'
                              : 'bg-red-900/80 border-red-500 text-red-100'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                        }`}
                      >
                        <span>
                          <strong className="text-cyan-400 mr-3">{String.fromCharCode(65 + idx)}.</strong>
                          {opt.text}
                        </span>
                        {isSelected && (
                          <span className="text-sm font-bold">
                            {opt.isCorrect ? '✅ Correct' : '❌ Try Again'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {quizSelections[element.id] && (element as InteractiveElement).explanation && (
                  <p className="text-base text-slate-300 mt-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                    💡 <strong>Explanation:</strong> {(element as InteractiveElement).explanation}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden select-none">
      {/* 16:9 Aspect Presentation Frame */}
      <div
        style={{
          width: `${canvasWidth * scale}px`,
          height: `${canvasHeight * scale}px`,
          backgroundColor: currentSlide.backgroundColor || '#0f172a',
        }}
        className="relative overflow-hidden shadow-2xl transition-all"
      >
        <div
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          className="absolute top-0 left-0"
        >
          {currentSlide.elements.map(renderElement)}
        </div>
      </div>

      {/* Floating Presentation Controls (Bottom Hover Overlay) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-full flex items-center gap-4 text-slate-300 text-sm shadow-2xl opacity-20 hover:opacity-100 transition-opacity">
        <button
          onClick={prevSlide}
          disabled={presentationSlideIndex === 0}
          className="p-1 hover:text-cyan-400 disabled:opacity-30 cursor-pointer"
          title="Previous Slide (Left Arrow)"
        >
          <ChevronLeft size={20} />
        </button>

        <span className="font-mono text-xs">
          {presentationSlideIndex + 1} / {document.slides.length}
        </span>

        <button
          onClick={nextSlide}
          disabled={presentationSlideIndex === document.slides.length - 1}
          className="p-1 hover:text-cyan-400 disabled:opacity-30 cursor-pointer"
          title="Next Slide (Right Arrow / Space)"
        >
          <ChevronRight size={20} />
        </button>

        <span className="text-slate-700">|</span>

        <button
          onClick={exitPresentation}
          className="p-1 hover:text-red-400 cursor-pointer"
          title="Exit Presentation (Esc)"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

