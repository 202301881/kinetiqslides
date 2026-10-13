/**
 * KinetiQ Slides - Core Document & System Data Contracts
 * Compliant with ISO/IEC 25010 Standards and CvSU-LSHS Educational Requirements
 */

export type DocumentId = string;
export type SlideId = string;
export type ElementId = string;
export type AssetId = string;

// ==========================================
// 1. Presentation Document Manifest & Model
// ==========================================

export interface PresentationManifest {
  formatVersion: '1.0.0';
  id: DocumentId;
  title: string;
  author: string;
  subject?: string;
  createdAt: string;
  updatedAt: string;
  appVersion: string;
  thumbnail?: string; // Path or base64 preview
}

export interface DocumentSettings {
  aspectRatio: '16:9' | '4:3' | 'custom';
  dimensions: { width: number; height: number }; // Defaults: 1920 x 1080
  theme: 'dark' | 'light' | 'system';
  autoSaveIntervalMs: number; // 0 for off, default 30000 (30s)
  locale: string;
}

export interface PresentationDocument {
  manifest: PresentationManifest;
  settings: DocumentSettings;
  slides: Slide[];
  assets: Record<AssetId, AssetMetadata>;
  variables: Record<string, string | number | boolean>; // Dynamic slide state variables for math & logic
}

// ==========================================
// 2. Slide Specifications
// ==========================================

export type SlideTransitionType =
  | 'none'
  | 'fade'
  | 'slide_left'
  | 'slide_right'
  | 'slide_up'
  | 'slide_down'
  | 'zoom'
  | 'flip';

export interface SlideTransition {
  type: SlideTransitionType;
  duration: number; // in seconds, e.g. 0.5
  timingFunction: 'linear' | 'ease' | 'ease-in-out' | 'cubic-bezier';
}

export interface Slide {
  id: SlideId;
  order: number;
  title: string;
  backgroundColor: string;
  backgroundImageAssetId?: AssetId;
  transition: SlideTransition;
  elements: SlideElement[];
  notes: string; // Speaker notes
  hidden?: boolean;
}

// ==========================================
// 3. Slide Element Model (Discriminated Union)
// ==========================================

export interface BaseElement {
  id: ElementId;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // In degrees
  opacity: number;  // 0.0 to 1.0
  zIndex: number;
  isLocked: boolean;
  isHidden: boolean;
  animations: ElementAnimation[];
  interactiveHooks: InteractiveHook[];
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | '600' | '800';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textColor: string;
  backgroundColor?: string;
  lineHeight?: number;
  letterSpacing?: number;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'star' | 'diamond' | 'arrow_right';
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  borderRadius?: number; // For rounded rects
}

export interface LineElement extends BaseElement {
  type: 'line';
  strokeColor: string;
  strokeWidth: number;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  arrowStart: boolean;
  arrowEnd: boolean;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  assetId: AssetId;
  objectFit: 'contain' | 'cover' | 'fill';
  borderRadius?: number;
}

export interface MediaElement extends BaseElement {
  type: 'media';
  mediaType: 'video' | 'audio';
  assetId: AssetId;
  autoPlay: boolean;
  loop: boolean;
  showControls: boolean;
}

export interface IconElement extends BaseElement {
  type: 'icon';
  iconName: string; // Lucide icon identifier
  color: string;
}

export interface TableElement extends BaseElement {
  type: 'table';
  rows: number;
  cols: number;
  headers: string[];
  data: string[][];
  headerBgColor: string;
  cellBgColor: string;
  borderColor: string;
}

export interface ChartElement extends BaseElement {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie';
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

// ==========================================
// 4. Interactive Components (Core Differentiator)
// ==========================================

export type InteractiveKind =
  | 'input_field'
  | 'button'
  | 'draggable'
  | 'drop_zone'
  | 'quiz_card'
  | 'canvas_sketch';

export interface InteractiveBase extends BaseElement {
  type: 'interactive';
  interactiveKind: InteractiveKind;
}

export interface InteractiveInputElement extends InteractiveBase {
  interactiveKind: 'input_field';
  placeholder: string;
  defaultValue: string;
  variableBinding?: string; // Ties input value to state variable
  validationRule?: {
    type: 'exact' | 'regex' | 'numeric_range';
    expected: string;
    tolerance?: number;
  };
  feedbackOnSuccess?: string;
  feedbackOnFailure?: string;
}

export interface InteractiveButtonElement extends InteractiveBase {
  interactiveKind: 'button';
  label: string;
  variant: 'primary' | 'secondary' | 'accent' | 'success' | 'danger';
  action: {
    type: 'trigger_hook' | 'next_slide' | 'prev_slide' | 'jump_slide' | 'reset_slide';
    targetSlideId?: SlideId;
  };
}

export interface InteractiveDraggableElement extends InteractiveBase {
  interactiveKind: 'draggable';
  content: string; // Text or icon
  dragTag: string; // Used to match with drop zone
  snapBackOnMiss: boolean;
  correctDropZoneId?: ElementId;
}

export interface InteractiveDropZoneElement extends InteractiveBase {
  interactiveKind: 'drop_zone';
  acceptedTags: string[];
  label: string;
  highlightColor: string;
}

export interface InteractiveQuizCardElement extends InteractiveBase {
  interactiveKind: 'quiz_card';
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation?: string;
  points: number;
  showFeedbackImmediately: boolean;
}

export interface InteractiveCanvasSketchElement extends InteractiveBase {
  interactiveKind: 'canvas_sketch';
  brushColor: string;
  brushSize: number;
  allowClear: boolean;
}

export type InteractiveElement =
  | InteractiveInputElement
  | InteractiveButtonElement
  | InteractiveDraggableElement
  | InteractiveDropZoneElement
  | InteractiveQuizCardElement
  | InteractiveCanvasSketchElement;

export type SlideElement =
  | TextElement
  | ShapeElement
  | LineElement
  | ImageElement
  | MediaElement
  | IconElement
  | TableElement
  | ChartElement
  | InteractiveElement;

// ==========================================
// 5. Animations & Interactive Event Hooks
// ==========================================

export type AnimationPreset =
  | 'fade_in'
  | 'fade_out'
  | 'slide_in_left'
  | 'slide_in_right'
  | 'slide_in_up'
  | 'slide_in_down'
  | 'zoom_in'
  | 'zoom_out'
  | 'bounce'
  | 'pulse'
  | 'spin';

export interface KeyframeStep {
  offset: number; // 0.0 to 1.0
  x?: number;
  y?: number;
  scale?: number;
  opacity?: number;
  rotation?: number;
}

export interface ElementAnimation {
  id: string;
  trigger: 'on_slide_enter' | 'on_click' | 'on_hover' | 'hook';
  preset: AnimationPreset | 'custom_keyframes';
  duration: number; // Seconds
  delay: number;    // Seconds
  easing: 'power1.out' | 'power2.inOut' | 'back.out' | 'elastic.out' | 'linear';
  repeat: number;   // 0 for once, -1 for infinite
  keyframes?: KeyframeStep[];
}

export type HookTriggerEvent =
  | 'click'
  | 'hover'
  | 'input_change'
  | 'input_submit'
  | 'drop_success'
  | 'quiz_answered';

export type HookActionType =
  | 'play_animation'
  | 'toggle_visibility'
  | 'show_message'
  | 'jump_to_slide'
  | 'set_variable'
  | 'calculate_math';

export interface InteractiveHook {
  id: string;
  name: string;
  event: HookTriggerEvent;
  targetElementId: ElementId;
  action: HookActionType;
  actionPayload?: {
    animationId?: string;
    targetVisibility?: boolean;
    variableName?: string;
    expression?: string; // Math or conditional string: e.g., "x + 5"
    message?: string;
  };
}

// ==========================================
// 6. Assets & File System Metadata
// ==========================================

export interface AssetMetadata {
  id: AssetId;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  localPath: string; // Relative path inside .kqs archive (e.g. "assets/img1.png")
  dataUrl?: string;  // Cached runtime data/base64 URL
}

// ==========================================
// 7. Presentation Runtime & Engagement Logging
// ==========================================

export interface EngagementLogEntry {
  id: string;
  timestamp: number;
  slideId: SlideId;
  elementId?: ElementId;
  eventType: 'quiz_attempt' | 'input_submission' | 'drag_drop' | 'slide_visit';
  studentResponse?: string;
  isCorrect?: boolean;
  scoreAwarded?: number;
}

export interface EngagementReport {
  presentationId: DocumentId;
  startTime: string;
  endTime: string;
  totalSlidesPresented: number;
  interactionsCount: number;
  quizScoreSum: number;
  totalQuizPoints: number;
  logs: EngagementLogEntry[];
}

// ==========================================
// 8. Dual-Window Presenter/Audience IPC Protocol
// ==========================================

export type PresenterSyncAction =
  | { type: 'NAVIGATE'; slideIndex: number }
  | { type: 'INTERACTION_EVENT'; elementId: ElementId; eventData: unknown }
  | { type: 'RESET_SLIDE'; slideId: SlideId }
  | { type: 'UPDATE_VARIABLE'; key: string; value: string | number | boolean }
  | { type: 'TIMER_STATE'; isRunning: boolean; elapsedSeconds: number };

export interface PresenterSyncPayload {
  source: 'presenter' | 'audience';
  timestamp: number;
  action: PresenterSyncAction;
}

