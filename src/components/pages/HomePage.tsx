import React from 'react';
import { useDocumentStore } from '../../store/useDocumentStore';
import {
  Plus,
  FolderOpen,
  ArrowRight,
  Sparkles,
  Clock,
  Layers,
  BookOpen,
  GraduationCap,
  Atom,
  Calculator,
} from 'lucide-react';
import { createDefaultDocument } from '../../utils/defaultData';

export const HomePage: React.FC = () => {
  const { setView, createNewDocument, setDocument, document } = useDocumentStore();

  const sampleTemplates = [
    {
      id: 'tmpl_bio',
      title: 'STEM Biology: Photosynthesis',
      subject: 'Biology',
      icon: Atom,
      color: 'from-emerald-600 to-teal-800',
      description: 'Photosystems, chemical equations, and formative concept checks.',
      action: () => {
        setDocument(createDefaultDocument());
        setView('workspace');
      },
    },
    {
      id: 'tmpl_math',
      title: 'Mathematics: Quadratic Functions',
      subject: 'Math',
      icon: Calculator,
      color: 'from-blue-600 to-indigo-800',
      description: 'Dynamic formula variables, equation validation, and tables.',
      action: () => {
        const mathDoc = createDefaultDocument();
        mathDoc.manifest.title = 'Mathematics: Quadratic Functions';
        mathDoc.slides[0].title = 'Quadratic Functions & Parabolas';
        mathDoc.slides[0].elements[1] = {
          ...mathDoc.slides[0].elements[1],
          content: 'Quadratic Equations:\nf(x) = ax² + bx + c',
        } as any;
        setDocument(mathDoc);
        setView('workspace');
      },
    },
    {
      id: 'tmpl_quiz',
      title: 'Classroom Formative Quiz Deck',
      subject: 'Evaluation',
      icon: GraduationCap,
      color: 'from-amber-600 to-orange-800',
      description: 'Multiple-choice interactive cards with instantaneous engagement scoring.',
      action: () => {
        const quizDoc = createDefaultDocument();
        quizDoc.manifest.title = 'Formative Assessment Deck';
        setDocument(quizDoc);
        setView('workspace');
      },
    },
    {
      id: 'tmpl_clean',
      title: 'CvSU Academic Dark Minimal',
      subject: 'General',
      icon: BookOpen,
      color: 'from-slate-700 to-slate-900',
      description: 'Modern, high-contrast academic layout for general high school lectures.',
      action: () => {
        createNewDocument('Academic Lecture Deck');
      },
    },
  ];

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 overflow-y-auto p-10 select-none">
      {/* Top Banner */}
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex items-center justify-between border-b border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={14} />
              <span>Cavite State University • Laboratory Science High School</span>
            </div>
            <h1 className="text-4xl font-black text-slate-100 tracking-tight">
              KinetiQ Slides
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Create your new presentations, or use sampled templates
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                createNewDocument('New Presentation');
                setView('workspace');
              }}
              className="flex items-center gap-2 px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg cursor-pointer"
            >
              <Plus size={18} />
              <span>Blank Presentation</span>
            </button>
            <button
              onClick={() => setView('workspace')}
              className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition cursor-pointer border border-slate-700"
            >
              <span>Back to Editor</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </header>

        {/* Template Gallery */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-200">Subject-Specific Master Templates</h2>
            <span className="text-xs text-slate-500">Read-only master copies (creates editable instance)</span>
          </div>

          <div className="grid grid-cols-4 gap-5">
            {sampleTemplates.map((tmpl) => {
              const Icon = tmpl.icon;
              return (
                <div
                  key={tmpl.id}
                  onClick={tmpl.action}
                  className="group bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-2xl overflow-hidden p-5 flex flex-col justify-between transition cursor-pointer hover:shadow-xl hover:-translate-y-1"
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tmpl.color} flex items-center justify-center text-white mb-4 shadow-md`}
                    >
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded">
                      {tmpl.subject}
                    </span>
                    <h3 className="font-bold text-slate-100 text-base mt-2 group-hover:text-cyan-300 transition">
                      {tmpl.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 group-hover:text-cyan-400 font-medium">
                    <span>Use Template</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Projects List */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <Clock size={18} className="text-cyan-400" />
            <span>Active & Recent Presentation Files</span>
          </h2>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
            <div
              onClick={() => setView('workspace')}
              className="p-4 flex items-center justify-between hover:bg-slate-800/60 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold">
                  <Layers size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm">{document.manifest.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {document.slides.length} slides • Last modified {new Date(document.manifest.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <button className="px-3 py-1.5 bg-slate-800 group-hover:bg-cyan-600 text-slate-300 rounded-lg text-xs font-semibold">
                Open in Workspace
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

