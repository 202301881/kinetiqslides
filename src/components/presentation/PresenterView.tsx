import React, { useEffect } from 'react';
import { useDocumentStore } from '../../store/useDocumentStore';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause,
  RotateCcw,
  Clock,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';

export const PresenterView: React.FC = () => {
  const {
    document,
    presentationSlideIndex,
    nextSlide,
    prevSlide,
    exitPresentation,
    speakerTimerSeconds,
    isSpeakerTimerRunning,
    toggleSpeakerTimer,
    resetSpeakerTimer,
    tickSpeakerTimer,
    engagementLogs,
  } = useDocumentStore();

  const currentSlide = document.slides[presentationSlideIndex];
  const nextSlideData = document.slides[presentationSlideIndex + 1];

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      tickSpeakerTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickSpeakerTimer]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalInteractions = engagementLogs.length;
  const quizPointsEarned = engagementLogs.reduce((acc, log) => acc + (log.scoreAwarded || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* Presenter Top Bar */}
      <header className="h-12 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="font-bold text-sm text-slate-200">
            KinetiQ Presenter Console • {document.manifest.title}
          </h2>
        </div>

        {/* Presenter Timer */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-1.5 rounded-lg border border-slate-800">
          <Clock size={16} className="text-cyan-400" />
          <span className="font-mono text-base font-bold text-cyan-300">
            {formatTimer(speakerTimerSeconds)}
          </span>
          <button
            onClick={toggleSpeakerTimer}
            className="p-1 hover:text-cyan-400 transition"
            title={isSpeakerTimerRunning ? 'Pause Timer' : 'Resume Timer'}
          >
            {isSpeakerTimerRunning ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={resetSpeakerTimer}
            className="p-1 hover:text-cyan-400 transition"
            title="Reset Timer"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* End Presentation Button */}
        <button
          onClick={exitPresentation}
          className="flex items-center gap-1.5 px-3 py-1 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 rounded text-xs font-semibold transition"
        >
          <X size={14} />
          <span>End Slide Show</span>
        </button>
      </header>

      {/* Main Console Grid */}
      <main className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
        {/* Left Column: Big Current Slide Preview */}
        <section className="col-span-8 flex flex-col">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-300">
              Active Slide: {presentationSlideIndex + 1} of {document.slides.length}
            </span>
            <span className="text-cyan-400 font-mono">
              Aspect 16:9 • {currentSlide?.title || 'Untitled'}
            </span>
          </div>

          <div
            className="flex-1 rounded-xl border-2 border-slate-800 overflow-hidden relative shadow-2xl flex items-center justify-center p-4"
            style={{ backgroundColor: currentSlide?.backgroundColor || '#0f172a' }}
          >
            <div className="text-center text-slate-400">
              <h3 className="text-3xl font-black text-slate-100 mb-3">{currentSlide?.title}</h3>
              <p className="text-base text-slate-400">
                ({currentSlide?.elements.length || 0} slide elements rendered in live audience window)
              </p>
            </div>
          </div>
        </section>

        {/* Right Column: Next Slide, Speaker Notes, Analytics */}
        <section className="col-span-4 flex flex-col gap-4 overflow-y-auto">
          {/* Next Slide Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <Layers size={14} className="text-purple-400" />
              <span>Next Slide</span>
            </div>
            {nextSlideData ? (
              <div
                className="w-full aspect-video rounded border border-slate-800 flex items-center justify-center p-3 text-center"
                style={{ backgroundColor: nextSlideData.backgroundColor || '#0f172a' }}
              >
                <span className="text-xs font-semibold text-slate-300">
                  {nextSlideData.title || 'Untitled Slide'}
                </span>
              </div>
            ) : (
              <div className="w-full aspect-video rounded border border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-xs">
                End of presentation
              </div>
            )}
          </div>

          {/* Speaker Notes */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
            <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <FileText size={14} className="text-amber-400" />
              <span>Lecturer Speaker Notes</span>
            </div>
            <div className="flex-1 bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 text-slate-200 text-sm overflow-y-auto leading-relaxed">
              {currentSlide?.notes || (
                <span className="text-slate-600 italic">No notes recorded for this slide.</span>
              )}
            </div>
          </div>

          {/* Real-time Engagement Tracker */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
              <Activity size={14} className="text-emerald-400" />
              <span>Classroom Engagement Analytics</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-2xl font-black text-cyan-400">{totalInteractions}</span>
                <p className="text-[11px] text-slate-400 mt-1">Interactions Logged</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-2xl font-black text-emerald-400">{quizPointsEarned}</span>
                <p className="text-[11px] text-slate-400 mt-1">Quiz Points Earned</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Presenter Footer Navigation */}
      <footer className="h-16 bg-slate-900 border-t border-slate-800 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={prevSlide}
            disabled={presentationSlideIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-xs font-semibold transition"
          >
            <ChevronLeft size={16} />
            <span>Previous Slide</span>
          </button>
          <button
            onClick={nextSlide}
            disabled={presentationSlideIndex === document.slides.length - 1}
            className="flex items-center gap-1.5 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-slate-950 rounded-lg text-xs font-bold transition shadow-md"
          >
            <span>Next Slide</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          KinetiQ Presenter View • CvSU-LSHS Local Sync Active
        </span>
      </footer>
    </div>
  );
};

