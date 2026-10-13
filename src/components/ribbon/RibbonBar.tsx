import React from 'react';
import {
  useDocumentStore,
  RibbonTab,
} from '../../store/useDocumentStore';
import {
  Play,
  RotateCcw,
  RotateCw,
  Plus,
  Trash2,
  Copy,
  Type,
  Square,
  Circle,
  Triangle,
  Table as TableIcon,
  CheckSquare,
  MousePointer,
  HelpCircle,
  FileDown,
  Sparkles,
  Sliders,
  Monitor,
  Eye,
  Tv,
  Save,
  Home,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';
import { SlideTransitionType, AnimationPreset } from '../../types/schema';

export const RibbonBar: React.FC = () => {
  const {
    document,
    activeRibbonTab,
    setRibbonTab,
    setView,
    undo,
    redo,
    history,
    addSlide,
    deleteSlide,
    duplicateSlide,
    activeSlideId,
    addElement,
    selectedElementIds,
    updateSlideTransition,
    addAnimation,
    startPresentation,
    updateManifest,
  } = useDocumentStore();

  const activeSlide = document.slides.find((s) => s.id === activeSlideId);
  const selectedElementId = selectedElementIds[0];

  const handleAddText = () => {
    addElement({
      name: 'New Text',
      type: 'text',
      content: 'Click to type text',
      x: 300,
      y: 300,
      width: 400,
      height: 80,
      rotation: 0,
      opacity: 1,
      isLocked: false,
      isHidden: false,
      fontSize: 32,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      textColor: '#f8fafc',
      animations: [],
      interactiveHooks: [],
    });
  };

  const handleAddShape = (shapeType: 'rectangle' | 'circle' | 'triangle') => {
    addElement({
      name: `${shapeType.toUpperCase()}`,
      type: 'shape',
      shapeType,
      x: 350,
      y: 350,
      width: 240,
      height: 240,
      rotation: 0,
      opacity: 1,
      isLocked: false,
      isHidden: false,
      fillColor: '#3b82f6',
      strokeColor: '#60a5fa',
      strokeWidth: 2,
      borderRadius: shapeType === 'rectangle' ? 12 : 0,
      animations: [],
      interactiveHooks: [],
    });
  };

  const handleAddInteractiveInput = () => {
    addElement({
      name: 'Interactive Input Field',
      type: 'interactive',
      interactiveKind: 'input_field',
      placeholder: 'Student answer here...',
      defaultValue: '',
      variableBinding: 'ans_var',
      validationRule: {
        type: 'regex',
        expected: '^[A-Za-z]+$',
      },
      feedbackOnSuccess: '✅ Correct response!',
      feedbackOnFailure: '❌ Please check your answer.',
      x: 300,
      y: 400,
      width: 500,
      height: 64,
      rotation: 0,
      opacity: 1,
      isLocked: false,
      isHidden: false,
      animations: [],
      interactiveHooks: [],
    });
  };

  const handleAddInteractiveButton = () => {
    addElement({
      name: 'Interactive Action Button',
      type: 'interactive',
      interactiveKind: 'button',
      label: '⚡ Trigger Action',
      variant: 'primary',
      action: { type: 'trigger_hook' },
      x: 350,
      y: 450,
      width: 260,
      height: 60,
      rotation: 0,
      opacity: 1,
      isLocked: false,
      isHidden: false,
      animations: [],
      interactiveHooks: [],
    });
  };

  const handleAddQuiz = () => {
    addElement({
      name: 'Interactive Quiz Card',
      type: 'interactive',
      interactiveKind: 'quiz_card',
      question: 'Which component stores energy in chloroplasts?',
      options: [
        { id: '1', text: 'Stroma', isCorrect: false },
        { id: '2', text: 'ATP & NADPH', isCorrect: true },
        { id: '3', text: 'Ribosome', isCorrect: false },
      ],
      points: 10,
      showFeedbackImmediately: true,
      x: 240,
      y: 200,
      width: 1200,
      height: 520,
      rotation: 0,
      opacity: 1,
      isLocked: false,
      isHidden: false,
      animations: [],
      interactiveHooks: [],
    });
  };

  const handleAddTable = () => {
    addElement({
      name: 'Data Table',
      type: 'table',
      rows: 3,
      cols: 3,
      headers: ['Col 1', 'Col 2', 'Col 3'],
      data: [
        ['Data A1', 'Data B1', 'Data C1'],
        ['Data A2', 'Data B2', 'Data C2'],
      ],
      headerBgColor: '#2563eb',
      cellBgColor: '#1e293b',
      borderColor: '#475569',
      x: 300,
      y: 300,
      width: 800,
      height: 300,
      rotation: 0,
      opacity: 1,
      isLocked: false,
      isHidden: false,
      animations: [],
      interactiveHooks: [],
    });
  };

  const applyTransition = (type: SlideTransitionType) => {
    if (activeSlide) {
      updateSlideTransition(activeSlide.id, {
        type,
        duration: 0.5,
        timingFunction: 'ease-in-out',
      });
    }
  };

  const applyAnimation = (preset: AnimationPreset) => {
    if (selectedElementId) {
      addAnimation(selectedElementId, {
        id: `anim_${Date.now()}`,
        trigger: 'on_slide_enter',
        preset,
        duration: 0.6,
        delay: 0.1,
        easing: 'power2.inOut',
        repeat: 0,
      });
    }
  };

  const tabs: { id: RibbonTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'files', label: 'Files' },
    { id: 'insert', label: 'Insert' },
    { id: 'transitions', label: 'Transitions' },
    { id: 'animations', label: 'Animations' },
    { id: 'functions', label: 'Functions' },
    { id: 'presentation', label: 'Presentation' },
    { id: 'review', label: 'Review' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-200 select-none flex flex-col shrink-0">
      {/* Top Application Bar */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-slate-800 text-xs">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800 text-cyan-400 font-bold transition"
            title="Go to Homepage"
          >
            <span className="w-5 h-5 rounded bg-cyan-600 text-slate-950 font-black flex items-center justify-center text-xs">
              K
            </span>
            <span>KinetiQ Slides</span>
          </button>

          <span className="text-slate-600">|</span>

          {/* Editable Document Title */}
          <input
            type="text"
            value={document.manifest.title}
            onChange={(e) => updateManifest({ title: e.target.value })}
            className="bg-transparent hover:bg-slate-800 focus:bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-medium border border-transparent focus:border-cyan-500 w-80 text-xs transition"
            placeholder="Presentation Title"
          />

          <span className="text-slate-500 text-[11px] bg-slate-800 px-2 py-0.5 rounded-full">
            CvSU-LSHS Edition
          </span>
        </div>

        {/* Quick Access Toolbar */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView('backstage')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition"
            title="Save / Backstage"
          >
            <Save size={15} />
          </button>
          <button
            onClick={undo}
            disabled={history.past.length === 0}
            className={`p-1.5 rounded transition ${
              history.past.length > 0
                ? 'hover:bg-slate-800 text-slate-300'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={redo}
            disabled={history.future.length === 0}
            className={`p-1.5 rounded transition ${
              history.future.length > 0
                ? 'hover:bg-slate-800 text-slate-300'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <RotateCw size={15} />
          </button>

          <span className="text-slate-700 mx-1">|</span>

          {/* Quick Present Button */}
          <button
            onClick={() => startPresentation('fullscreen')}
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold px-3 py-1 rounded text-xs transition shadow-sm"
          >
            <Play size={13} fill="currentColor" />
            <span>Present</span>
          </button>
        </div>
      </div>

      {/* Ribbon Navigation Tabs */}
      <nav className="flex items-center gap-1 px-3 bg-slate-950 border-b border-slate-800/80 text-xs font-medium">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setRibbonTab(tab.id)}
            className={`px-3 py-1.5 rounded-t transition-colors ${
              activeRibbonTab === tab.id
                ? 'bg-slate-900 text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Ribbon Command Strip */}
      <div className="h-20 px-4 bg-slate-900/95 flex items-center gap-4 text-xs overflow-x-auto">
        {/* TAB: HOME */}
        {activeRibbonTab === 'home' && (
          <>
            {/* Slide Actions */}
            <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
              <button
                onClick={() => addSlide()}
                className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-800 hover:text-cyan-400 transition"
              >
                <Plus size={18} className="text-cyan-400" />
                <span className="text-[11px] mt-1">New Slide</span>
              </button>
              <button
                onClick={() => activeSlideId && duplicateSlide(activeSlideId)}
                className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-800 transition"
              >
                <Copy size={18} />
                <span className="text-[11px] mt-1">Duplicate</span>
              </button>
              <button
                onClick={() => activeSlideId && deleteSlide(activeSlideId)}
                className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-red-950/40 text-red-400 transition"
              >
                <Trash2 size={18} />
                <span className="text-[11px] mt-1">Delete</span>
              </button>
            </div>

            {/* Quick Insert Items */}
            <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
              <button
                onClick={handleAddText}
                className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-800 hover:text-cyan-400 transition"
              >
                <Type size={18} />
                <span className="text-[11px] mt-1">Text Box</span>
              </button>
              <button
                onClick={() => handleAddShape('rectangle')}
                className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-800 hover:text-cyan-400 transition"
              >
                <Square size={18} />
                <span className="text-[11px] mt-1">Rectangle</span>
              </button>
              <button
                onClick={() => handleAddShape('circle')}
                className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-800 hover:text-cyan-400 transition"
              >
                <Circle size={18} />
                <span className="text-[11px] mt-1">Circle</span>
              </button>
            </div>

            {/* Presentation shortcuts */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => startPresentation('fullscreen')}
                className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-800 text-cyan-400 transition"
              >
                <Monitor size={18} />
                <span className="text-[11px] mt-1">Fullscreen</span>
              </button>
              <button
                onClick={() => startPresentation('presenter')}
                className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-800 text-purple-400 transition"
              >
                <Tv size={18} />
                <span className="text-[11px] mt-1">Presenter View</span>
              </button>
            </div>
          </>
        )}

        {/* TAB: FILES */}
        {activeRibbonTab === 'files' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded transition"
            >
              <Home size={16} />
              <span>Homepage & Templates</span>
            </button>
            <button
              onClick={() => setView('backstage')}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded transition"
            >
              <Save size={16} />
              <span>Save & Export (.kqs / PDF / PPTX)</span>
            </button>
          </div>
        )}

        {/* TAB: INSERT */}
        {activeRibbonTab === 'insert' && (
          <>
            <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
              <button
                onClick={handleAddText}
                className="flex flex-col items-center p-1.5 rounded hover:bg-slate-800 transition"
              >
                <Type size={18} />
                <span className="text-[11px] mt-1">Text</span>
              </button>
              <button
                onClick={() => handleAddShape('rectangle')}
                className="flex flex-col items-center p-1.5 rounded hover:bg-slate-800 transition"
              >
                <Square size={18} />
                <span className="text-[11px] mt-1">Rectangle</span>
              </button>
              <button
                onClick={() => handleAddShape('circle')}
                className="flex flex-col items-center p-1.5 rounded hover:bg-slate-800 transition"
              >
                <Circle size={18} />
                <span className="text-[11px] mt-1">Circle</span>
              </button>
              <button
                onClick={() => handleAddShape('triangle')}
                className="flex flex-col items-center p-1.5 rounded hover:bg-slate-800 transition"
              >
                <Triangle size={18} />
                <span className="text-[11px] mt-1">Triangle</span>
              </button>
              <button
                onClick={handleAddTable}
                className="flex flex-col items-center p-1.5 rounded hover:bg-slate-800 transition"
              >
                <TableIcon size={18} />
                <span className="text-[11px] mt-1">Table</span>
              </button>
            </div>

            {/* Interactive Elements (Core Feature) */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded">
                Interactive Components
              </span>
              <button
                onClick={handleAddInteractiveInput}
                className="flex flex-col items-center p-1.5 rounded hover:bg-slate-800 text-cyan-300 transition"
              >
                <CheckSquare size={18} />
                <span className="text-[11px] mt-1">Regex Input</span>
              </button>
              <button
                onClick={handleAddInteractiveButton}
                className="flex flex-col items-center p-1.5 rounded hover:bg-slate-800 text-amber-300 transition"
              >
                <MousePointer size={18} />
                <span className="text-[11px] mt-1">Action Button</span>
              </button>
              <button
                onClick={handleAddQuiz}
                className="flex flex-col items-center p-1.5 rounded hover:bg-slate-800 text-green-300 transition"
              >
                <HelpCircle size={18} />
                <span className="text-[11px] mt-1">Quiz Card</span>
              </button>
            </div>
          </>
        )}

        {/* TAB: TRANSITIONS */}
        {activeRibbonTab === 'transitions' && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs mr-2">Slide Transition:</span>
            {(
              [
                'none',
                'fade',
                'slide_left',
                'slide_right',
                'slide_up',
                'zoom',
                'flip',
              ] as SlideTransitionType[]
            ).map((type) => (
              <button
                key={type}
                onClick={() => applyTransition(type)}
                className={`px-3 py-1.5 rounded text-xs uppercase font-medium transition ${
                  activeSlide?.transition.type === type
                    ? 'bg-cyan-600 text-slate-950 font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}

        {/* TAB: ANIMATIONS */}
        {activeRibbonTab === 'animations' && (
          <div className="flex items-center gap-2">
            {selectedElementId ? (
              <>
                <span className="text-slate-400 text-xs mr-2">Add Preset:</span>
                {(
                  [
                    'fade_in',
                    'slide_in_left',
                    'slide_in_up',
                    'zoom_in',
                    'bounce',
                    'pulse',
                    'spin',
                  ] as AnimationPreset[]
                ).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => applyAnimation(preset)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-900/60 hover:text-cyan-300 rounded text-xs capitalize transition"
                  >
                    {preset.replace('_', ' ')}
                  </button>
                ))}
              </>
            ) : (
              <span className="text-slate-500 italic text-xs">
                Select an element on the canvas to configure animations.
              </span>
            )}
          </div>
        )}

        {/* TAB: FUNCTIONS */}
        {activeRibbonTab === 'functions' && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded">
              <Sparkles size={16} className="text-amber-400" />
              <div>
                <p className="font-semibold text-slate-200">STEM Variables & Formula Hooks</p>
                <p className="text-[11px] text-slate-400">
                  Bind student input to state variables and trigger responsive actions.
                </p>
              </div>
            </div>
            <button
              onClick={() => alert('Dynamic STEM Variables: \n• student_score\n• ans_var\n\nVariables update in real-time as students submit responses during presentations.')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-xs font-medium"
            >
              View Variables Matrix
            </button>
          </div>
        )}

        {/* TAB: PRESENTATION */}
        {activeRibbonTab === 'presentation' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => startPresentation('fullscreen', 0)}
              className="flex items-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold rounded text-xs transition"
            >
              <Play size={15} fill="currentColor" />
              <span>From Beginning</span>
            </button>
            <button
              onClick={() => startPresentation('fullscreen')}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition"
            >
              <Monitor size={15} />
              <span>From Current Slide</span>
            </button>
            <button
              onClick={() => startPresentation('presenter')}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded text-xs transition"
            >
              <Tv size={15} />
              <span>Presenter Dual View</span>
            </button>
          </div>
        )}

        {/* TAB: REVIEW */}
        {activeRibbonTab === 'review' && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-emerald-400" />
              <span className="text-xs text-slate-300">
                ISO/IEC 25010 Quality Verification: Functional Suitability & Offline Reliability Active.
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

