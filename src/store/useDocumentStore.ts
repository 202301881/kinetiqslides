import { create } from 'zustand';
import {
  PresentationDocument,
  Slide,
  SlideElement,
  ElementId,
  SlideId,
  ElementAnimation,
  InteractiveHook,
  EngagementLogEntry,
  PresentationManifest,
  DocumentSettings,
  SlideTransition,
} from '../types/schema';
import { createDefaultDocument } from '../utils/defaultData';

export type AppView = 'workspace' | 'home' | 'backstage';
export type RibbonTab =
  | 'home'
  | 'files'
  | 'insert'
  | 'transitions'
  | 'animations'
  | 'functions'
  | 'presentation'
  | 'review';

export type PresentationMode = 'off' | 'fullscreen' | 'presenter' | 'audience';

interface HistoryState {
  past: PresentationDocument[];
  future: PresentationDocument[];
}

export interface DocumentState {
  // 1. Core Document
  document: PresentationDocument;
  activeSlideId: SlideId;
  selectedElementIds: ElementId[];

  // 2. View & Navigation
  currentView: AppView;
  activeRibbonTab: RibbonTab;
  zoomLevel: number; // e.g. 0.7 = 70%

  // 3. Presentation Runtime
  presentationMode: PresentationMode;
  presentationSlideIndex: number;
  speakerTimerSeconds: number;
  isSpeakerTimerRunning: boolean;

  // 4. Dynamic Runtime State & Engagement
  runtimeVariables: Record<string, string | number | boolean>;
  engagementLogs: EngagementLogEntry[];

  // 5. History / Undo-Redo
  history: HistoryState;

  // =====================
  // Actions
  // =====================

  // Navigation & View Actions
  setView: (view: AppView) => void;
  setRibbonTab: (tab: RibbonTab) => void;
  setZoomLevel: (zoom: number) => void;

  // Document Operations
  setDocument: (doc: PresentationDocument) => void;
  createNewDocument: (title?: string) => void;
  updateManifest: (manifest: Partial<PresentationManifest>) => void;
  updateSettings: (settings: Partial<DocumentSettings>) => void;
  undo: () => void;
  redo: () => void;

  // Slide Operations
  setActiveSlide: (slideId: SlideId) => void;
  addSlide: (afterIndex?: number) => void;
  deleteSlide: (slideId: SlideId) => void;
  duplicateSlide: (slideId: SlideId) => void;
  reorderSlides: (startIndex: number, endIndex: number) => void;
  updateSlideBackground: (slideId: SlideId, color: string) => void;
  updateSlideTransition: (slideId: SlideId, transition: SlideTransition) => void;
  updateSlideNotes: (slideId: SlideId, notes: string) => void;

  // Element Operations
  setSelectedElements: (elementIds: ElementId[]) => void;
  toggleElementSelection: (elementId: ElementId, multi?: boolean) => void;
  clearSelection: () => void;
  addElement: (element: Omit<SlideElement, 'id' | 'zIndex'>) => void;
  updateElement: (elementId: ElementId, updates: Partial<SlideElement>) => void;
  deleteSelectedElements: () => void;
  duplicateSelectedElements: () => void;
  bringElementForward: (elementId: ElementId) => void;
  sendElementBackward: (elementId: ElementId) => void;
  bringElementToFront: (elementId: ElementId) => void;
  sendElementToBack: (elementId: ElementId) => void;

  // Animation & Hook Operations
  addAnimation: (elementId: ElementId, animation: ElementAnimation) => void;
  removeAnimation: (elementId: ElementId, animationId: string) => void;
  addHook: (elementId: ElementId, hook: InteractiveHook) => void;
  removeHook: (elementId: ElementId, hookId: string) => void;

  // Presentation Runtime Actions
  startPresentation: (mode: PresentationMode, fromSlideIndex?: number) => void;
  exitPresentation: () => void;
  nextSlide: () => void;
  prevSlide: () => void;
  goToSlideIndex: (index: number) => void;
  toggleSpeakerTimer: () => void;
  resetSpeakerTimer: () => void;
  tickSpeakerTimer: () => void;

  // Dynamic Variable & Engagement Actions
  setVariable: (key: string, value: string | number | boolean) => void;
  logEngagement: (entry: Omit<EngagementLogEntry, 'id' | 'timestamp'>) => void;
  executeHook: (hook: InteractiveHook) => void;
}

const MAX_HISTORY_STEPS = 25;

const pushHistory = (currentDoc: PresentationDocument, history: HistoryState): HistoryState => {
  const newPast = [...history.past, JSON.parse(JSON.stringify(currentDoc))];
  if (newPast.length > MAX_HISTORY_STEPS) {
    newPast.shift();
  }
  return {
    past: newPast,
    future: [],
  };
};

const initialDoc = createDefaultDocument();

export const useDocumentStore = create<DocumentState>((set, get) => ({
  document: initialDoc,
  activeSlideId: initialDoc.slides[0]?.id || 'slide_default',
  selectedElementIds: [],

  currentView: 'workspace',
  activeRibbonTab: 'home',
  zoomLevel: 0.65, // Comfortable default for 1920x1080 canvas

  presentationMode: 'off',
  presentationSlideIndex: 0,
  speakerTimerSeconds: 0,
  isSpeakerTimerRunning: false,

  runtimeVariables: { ...initialDoc.variables },
  engagementLogs: [],

  history: {
    past: [],
    future: [],
  },

  // View Navigation
  setView: (view) => set({ currentView: view }),
  setRibbonTab: (tab) => set({ activeRibbonTab: tab }),
  setZoomLevel: (zoom) => set({ zoomLevel: Math.max(0.2, Math.min(2.5, zoom)) }),

  // Document Operations
  setDocument: (newDoc) => {
    set((state) => ({
      document: newDoc,
      activeSlideId: newDoc.slides[0]?.id || '',
      selectedElementIds: [],
      runtimeVariables: { ...newDoc.variables },
      history: pushHistory(state.document, state.history),
    }));
  },

  createNewDocument: (title = 'Untitled Presentation') => {
    const fresh = createDefaultDocument();
    fresh.manifest.id = `doc_${Date.now()}`;
    fresh.manifest.title = title;
    fresh.slides = [
      {
        id: `slide_${Date.now()}`,
        order: 0,
        title: 'Title Slide',
        backgroundColor: '#0f172a',
        transition: { type: 'fade', duration: 0.5, timingFunction: 'ease' },
        elements: [
          {
            id: `title_${Date.now()}`,
            name: 'Title Text',
            type: 'text',
            content: 'Double click to edit title',
            x: 200,
            y: 360,
            width: 1520,
            height: 120,
            rotation: 0,
            opacity: 1,
            zIndex: 1,
            isLocked: false,
            isHidden: false,
            fontSize: 64,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            fontStyle: 'normal',
            textAlign: 'center',
            textColor: '#f8fafc',
            animations: [],
            interactiveHooks: [],
          },
          {
            id: `sub_${Date.now()}`,
            name: 'Subtitle Text',
            type: 'text',
            content: 'Subtitle description here',
            x: 200,
            y: 500,
            width: 1520,
            height: 60,
            rotation: 0,
            opacity: 1,
            zIndex: 2,
            isLocked: false,
            isHidden: false,
            fontSize: 28,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'normal',
            fontStyle: 'normal',
            textAlign: 'center',
            textColor: '#94a3b8',
            animations: [],
            interactiveHooks: [],
          },
        ],
        notes: '',
      },
    ];

    set((state) => ({
      document: fresh,
      activeSlideId: fresh.slides[0].id,
      selectedElementIds: [],
      currentView: 'workspace',
      history: pushHistory(state.document, state.history),
    }));
  },

  updateManifest: (manifestUpdates) => {
    set((state) => ({
      document: {
        ...state.document,
        manifest: {
          ...state.document.manifest,
          ...manifestUpdates,
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  },

  updateSettings: (settingsUpdates) => {
    set((state) => ({
      document: {
        ...state.document,
        settings: {
          ...state.document.settings,
          ...settingsUpdates,
        },
      },
    }));
  },

  undo: () => {
    const { history, document } = get();
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);

    set({
      document: previous,
      activeSlideId: previous.slides[0]?.id || '',
      selectedElementIds: [],
      history: {
        past: newPast,
        future: [JSON.parse(JSON.stringify(document)), ...history.future],
      },
    });
  },

  redo: () => {
    const { history, document } = get();
    if (history.future.length === 0) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);

    set({
      document: next,
      activeSlideId: next.slides[0]?.id || '',
      selectedElementIds: [],
      history: {
        past: [...history.past, JSON.parse(JSON.stringify(document))],
        future: newFuture,
      },
    });
  },

  // Slide Operations
  setActiveSlide: (slideId) => set({ activeSlideId: slideId, selectedElementIds: [] }),

  addSlide: (afterIndex) => {
    const { document, history } = get();
    const newHistory = pushHistory(document, history);

    const newSlideId = `slide_${Date.now()}`;
    const newSlide: Slide = {
      id: newSlideId,
      order: 0,
      title: `Slide ${document.slides.length + 1}`,
      backgroundColor: '#0f172a',
      transition: { type: 'fade', duration: 0.5, timingFunction: 'ease' },
      elements: [],
      notes: '',
    };

    let updatedSlides = [...document.slides];
    const targetIdx = afterIndex !== undefined ? afterIndex + 1 : updatedSlides.length;
    updatedSlides.splice(targetIdx, 0, newSlide);

    updatedSlides = updatedSlides.map((s, idx) => ({ ...s, order: idx }));

    set({
      document: { ...document, slides: updatedSlides },
      activeSlideId: newSlideId,
      selectedElementIds: [],
      history: newHistory,
    });
  },

  deleteSlide: (slideId) => {
    const { document, history, activeSlideId } = get();
    if (document.slides.length <= 1) return; // Prevent deleting the sole slide

    const newHistory = pushHistory(document, history);
    const updatedSlides = document.slides
      .filter((s) => s.id !== slideId)
      .map((s, idx) => ({ ...s, order: idx }));

    let newActiveId = activeSlideId;
    if (activeSlideId === slideId) {
      newActiveId = updatedSlides[0]?.id || '';
    }

    set({
      document: { ...document, slides: updatedSlides },
      activeSlideId: newActiveId,
      selectedElementIds: [],
      history: newHistory,
    });
  },

  duplicateSlide: (slideId) => {
    const { document, history } = get();
    const targetIdx = document.slides.findIndex((s) => s.id === slideId);
    if (targetIdx === -1) return;

    const sourceSlide = document.slides[targetIdx];
    const newSlideId = `slide_${Date.now()}`;
    const duplicatedElements = sourceSlide.elements.map((el) => ({
      ...el,
      id: `elem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    }));

    const clonedSlide: Slide = {
      ...JSON.parse(JSON.stringify(sourceSlide)),
      id: newSlideId,
      title: `${sourceSlide.title} (Copy)`,
      elements: duplicatedElements,
    };

    const newHistory = pushHistory(document, history);
    const updatedSlides = [...document.slides];
    updatedSlides.splice(targetIdx + 1, 0, clonedSlide);
    const reordered = updatedSlides.map((s, idx) => ({ ...s, order: idx }));

    set({
      document: { ...document, slides: reordered },
      activeSlideId: newSlideId,
      selectedElementIds: [],
      history: newHistory,
    });
  },

  reorderSlides: (startIndex, endIndex) => {
    const { document, history } = get();
    const updatedSlides = Array.from(document.slides);
    const [removed] = updatedSlides.splice(startIndex, 1);
    updatedSlides.splice(endIndex, 0, removed);

    const reordered = updatedSlides.map((s, idx) => ({ ...s, order: idx }));
    set({
      document: { ...document, slides: reordered },
      history: pushHistory(document, history),
    });
  },

  updateSlideBackground: (slideId, color) => {
    const { document } = get();
    const updatedSlides = document.slides.map((s) =>
      s.id === slideId ? { ...s, backgroundColor: color } : s
    );
    set({ document: { ...document, slides: updatedSlides } });
  },

  updateSlideTransition: (slideId, transition) => {
    const { document } = get();
    const updatedSlides = document.slides.map((s) =>
      s.id === slideId ? { ...s, transition } : s
    );
    set({ document: { ...document, slides: updatedSlides } });
  },

  updateSlideNotes: (slideId, notes) => {
    const { document } = get();
    const updatedSlides = document.slides.map((s) =>
      s.id === slideId ? { ...s, notes } : s
    );
    set({ document: { ...document, slides: updatedSlides } });
  },

  // Element Operations
  setSelectedElements: (elementIds) => set({ selectedElementIds: elementIds }),

  toggleElementSelection: (elementId, multi = false) => {
    const { selectedElementIds } = get();
    if (!multi) {
      set({ selectedElementIds: [elementId] });
      return;
    }
    if (selectedElementIds.includes(elementId)) {
      set({ selectedElementIds: selectedElementIds.filter((id) => id !== elementId) });
    } else {
      set({ selectedElementIds: [...selectedElementIds, elementId] });
    }
  },

  clearSelection: () => set({ selectedElementIds: [] }),

  addElement: (elementData) => {
    const { document, activeSlideId, history } = get();
    const activeSlide = document.slides.find((s) => s.id === activeSlideId);
    if (!activeSlide) return;

    const maxZ = activeSlide.elements.reduce((acc, el) => Math.max(acc, el.zIndex), 0);
    const newElement: SlideElement = {
      ...elementData,
      id: `elem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      zIndex: maxZ + 1,
    } as SlideElement;

    const newHistory = pushHistory(document, history);
    const updatedSlides = document.slides.map((slide) => {
      if (slide.id === activeSlideId) {
        return {
          ...slide,
          elements: [...slide.elements, newElement],
        };
      }
      return slide;
    });

    set({
      document: { ...document, slides: updatedSlides },
      selectedElementIds: [newElement.id],
      history: newHistory,
    });
  },

  updateElement: (elementId, updates) => {
    const { document, activeSlideId } = get();
    const updatedSlides = document.slides.map((slide) => {
      if (slide.id === activeSlideId) {
        return {
          ...slide,
          elements: slide.elements.map((el) => {
            if (el.id === elementId) {
              return { ...el, ...updates } as SlideElement;
            }
            return el;
          }),
        };
      }
      return slide;
    });

    set({ document: { ...document, slides: updatedSlides } });
  },

  deleteSelectedElements: () => {
    const { document, activeSlideId, selectedElementIds, history } = get();
    if (selectedElementIds.length === 0) return;

    const newHistory = pushHistory(document, history);
    const updatedSlides = document.slides.map((slide) => {
      if (slide.id === activeSlideId) {
        return {
          ...slide,
          elements: slide.elements.filter((el) => !selectedElementIds.includes(el.id)),
        };
      }
      return slide;
    });

    set({
      document: { ...document, slides: updatedSlides },
      selectedElementIds: [],
      history: newHistory,
    });
  },

  duplicateSelectedElements: () => {
    const { document, activeSlideId, selectedElementIds, history } = get();
    const activeSlide = document.slides.find((s) => s.id === activeSlideId);
    if (!activeSlide || selectedElementIds.length === 0) return;

    const toDuplicate = activeSlide.elements.filter((el) => selectedElementIds.includes(el.id));
    const newHistory = pushHistory(document, history);

    const clones: SlideElement[] = toDuplicate.map((el) => ({
      ...JSON.parse(JSON.stringify(el)),
      id: `elem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      x: el.x + 24,
      y: el.y + 24,
      name: `${el.name} (Copy)`,
      zIndex: el.zIndex + 1,
    }));

    const updatedSlides = document.slides.map((slide) => {
      if (slide.id === activeSlideId) {
        return {
          ...slide,
          elements: [...slide.elements, ...clones],
        };
      }
      return slide;
    });

    set({
      document: { ...document, slides: updatedSlides },
      selectedElementIds: clones.map((c) => c.id),
      history: newHistory,
    });
  },

  bringElementForward: (elementId) => {
    const { document, activeSlideId } = get();
    const updatedSlides = document.slides.map((slide) => {
      if (slide.id === activeSlideId) {
        return {
          ...slide,
          elements: slide.elements.map((el) =>
            el.id === elementId ? { ...el, zIndex: el.zIndex + 1 } : el
          ),
        };
      }
      return slide;
    });
    set({ document: { ...document, slides: updatedSlides } });
  },

  sendElementBackward: (elementId) => {
    const { document, activeSlideId } = get();
    const updatedSlides = document.slides.map((slide) => {
      if (slide.id === activeSlideId) {
        return {
          ...slide,
          elements: slide.elements.map((el) =>
            el.id === elementId ? { ...el, zIndex: Math.max(0, el.zIndex - 1) } : el
          ),
        };
      }
      return slide;
    });
    set({ document: { ...document, slides: updatedSlides } });
  },

  bringElementToFront: (elementId) => {
    const { document, activeSlideId } = get();
    const activeSlide = document.slides.find((s) => s.id === activeSlideId);
    if (!activeSlide) return;

    const maxZ = activeSlide.elements.reduce((acc, el) => Math.max(acc, el.zIndex), 0);
    const updatedSlides = document.slides.map((slide) => {
      if (slide.id === activeSlideId) {
        return {
          ...slide,
          elements: slide.elements.map((el) =>
            el.id === elementId ? { ...el, zIndex: maxZ + 1 } : el
          ),
        };
      }
      return slide;
    });
    set({ document: { ...document, slides: updatedSlides } });
  },

  sendElementToBack: (elementId) => {
    const { document, activeSlideId } = get();
    const activeSlide = document.slides.find((s) => s.id === activeSlideId);
    if (!activeSlide) return;

    const minZ = activeSlide.elements.reduce((acc, el) => Math.min(acc, el.zIndex), 0);
    const updatedSlides = document.slides.map((slide) => {
      if (slide.id === activeSlideId) {
        return {
          ...slide,
          elements: slide.elements.map((el) =>
            el.id === elementId ? { ...el, zIndex: Math.max(0, minZ - 1) } : el
          ),
        };
      }
      return slide;
    });
    set({ document: { ...document, slides: updatedSlides } });
  },

  // Animations & Hooks
  addAnimation: (elementId, animation) => {
    const { document, activeSlideId } = get();
    const updatedSlides = document.slides.map((slide) => {
      if (slide.id === activeSlideId) {
        return {
          ...slide,
          elements: slide.elements.map((el) =>
            el.id === elementId
              ? { ...el, animations: [...el.animations, animation] }
              : el
          ),
        };
      }
      return slide;
    });
    set({ document: { ...document, slides: updatedSlides } });
  },

  removeAnimation: (elementId, animationId) => {
    const { document, activeSlideId } = get();
    const updatedSlides = document.slides.map((slide) => {
      if (slide.id === activeSlideId) {
        return {
          ...slide,
          elements: slide.elements.map((el) =>
            el.id === elementId
              ? { ...el, animations: el.animations.filter((a) => a.id !== animationId) }
              : el
          ),
        };
      }
      return slide;
    });
    set({ document: { ...document, slides: updatedSlides } });
  },

  addHook: (elementId, hook) => {
    const { document, activeSlideId } = get();
    const updatedSlides = document.slides.map((slide) => {
      if (slide.id === activeSlideId) {
        return {
          ...slide,
          elements: slide.elements.map((el) =>
            el.id === elementId
              ? { ...el, interactiveHooks: [...el.interactiveHooks, hook] }
              : el
          ),
        };
      }
      return slide;
    });
    set({ document: { ...document, slides: updatedSlides } });
  },

  removeHook: (elementId, hookId) => {
    const { document, activeSlideId } = get();
    const updatedSlides = document.slides.map((slide) => {
      if (slide.id === activeSlideId) {
        return {
          ...slide,
          elements: slide.elements.map((el) =>
            el.id === elementId
              ? { ...el, interactiveHooks: el.interactiveHooks.filter((h) => h.id !== hookId) }
              : el
          ),
        };
      }
      return slide;
    });
    set({ document: { ...document, slides: updatedSlides } });
  },

  // Presentation Mode
  startPresentation: (mode, fromSlideIndex) => {
    const { document, activeSlideId } = get();
    let targetIndex = fromSlideIndex ?? 0;
    if (fromSlideIndex === undefined) {
      const activeIdx = document.slides.findIndex((s) => s.id === activeSlideId);
      targetIndex = activeIdx !== -1 ? activeIdx : 0;
    }

    set({
      presentationMode: mode,
      presentationSlideIndex: targetIndex,
      isSpeakerTimerRunning: true,
      speakerTimerSeconds: 0,
    });
  },

  exitPresentation: () => {
    set({
      presentationMode: 'off',
      isSpeakerTimerRunning: false,
    });
  },

  nextSlide: () => {
    const { presentationSlideIndex, document } = get();
    if (presentationSlideIndex < document.slides.length - 1) {
      const nextIdx = presentationSlideIndex + 1;
      set({
        presentationSlideIndex: nextIdx,
        activeSlideId: document.slides[nextIdx].id,
      });
    }
  },

  prevSlide: () => {
    const { presentationSlideIndex, document } = get();
    if (presentationSlideIndex > 0) {
      const prevIdx = presentationSlideIndex - 1;
      set({
        presentationSlideIndex: prevIdx,
        activeSlideId: document.slides[prevIdx].id,
      });
    }
  },

  goToSlideIndex: (index) => {
    const { document } = get();
    if (index >= 0 && index < document.slides.length) {
      set({
        presentationSlideIndex: index,
        activeSlideId: document.slides[index].id,
      });
    }
  },

  toggleSpeakerTimer: () => {
    set((state) => ({ isSpeakerTimerRunning: !state.isSpeakerTimerRunning }));
  },

  resetSpeakerTimer: () => {
    set({ speakerTimerSeconds: 0 });
  },

  tickSpeakerTimer: () => {
    set((state) => ({
      speakerTimerSeconds: state.isSpeakerTimerRunning
        ? state.speakerTimerSeconds + 1
        : state.speakerTimerSeconds,
    }));
  },

  // Dynamic Variable & Interactive Hooks Evaluation
  setVariable: (key, value) => {
    set((state) => ({
      runtimeVariables: {
        ...state.runtimeVariables,
        [key]: value,
      },
    }));
  },

  logEngagement: (entry) => {
    const newEntry: EngagementLogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    set((state) => ({
      engagementLogs: [...state.engagementLogs, newEntry],
    }));
  },

  executeHook: (hook) => {
    const { document, activeSlideId, updateElement, setVariable } = get();
    if (hook.action === 'toggle_visibility' && hook.targetElementId) {
      const activeSlide = document.slides.find((s) => s.id === activeSlideId);
      const targetEl = activeSlide?.elements.find((el) => el.id === hook.targetElementId);
      if (targetEl) {
        updateElement(targetEl.id, { isHidden: !targetEl.isHidden });
      }
    } else if (hook.action === 'set_variable' && hook.actionPayload?.variableName) {
      setVariable(hook.actionPayload.variableName, hook.actionPayload.expression ?? true);
    }
  },
}));

