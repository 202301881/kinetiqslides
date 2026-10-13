import React, { useState } from 'react';
import { useDocumentStore } from '../../store/useDocumentStore';
import {
  ArrowLeft,
  Save,
  FileDown,
  Info,
  Settings,
  HardDrive,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { zipSync, strToU8 } from 'fflate';
import pptxgen from 'pptxgenjs';
import jsPDF from 'jspdf';

type BackstageTab = 'info' | 'save' | 'export' | 'settings';

export const BackstagePage: React.FC = () => {
  const { document, setView, updateManifest, updateSettings } = useDocumentStore();
  const [activeTab, setActiveTab] = useState<BackstageTab>('save');
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  // 1. Export as Native .kqs File (ZIP container of JSON and assets)
  const handleSaveKQS = () => {
    try {
      setExportStatus('Packaging .kqs presentation file...');

      const manifestContent = JSON.stringify(document.manifest, null, 2);
      const slidesContent = JSON.stringify(
        {
          settings: document.settings,
          slides: document.slides,
          variables: document.variables,
        },
        null,
        2
      );

      const zipped = zipSync({
        'manifest.json': strToU8(manifestContent),
        'slides.json': strToU8(slidesContent),
      });

      const blob = new Blob([zipped], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.manifest.title.replace(/\s+/g, '_') || 'presentation'}.kqs`;
      a.click();
      URL.revokeObjectURL(url);

      setExportStatus('✅ Successfully saved .kqs presentation file!');
      setTimeout(() => setExportStatus(null), 4000);
    } catch (err: any) {
      setExportStatus(`❌ Error saving file: ${err.message}`);
    }
  };

  // 2. Export as Bare PPTX
  const handleExportPPTX = async () => {
    try {
      setExportStatus('Generating bare PPTX presentation...');
      const pptx = new pptxgen();

      pptx.title = document.manifest.title;
      pptx.author = document.manifest.author;
      pptx.company = 'CvSU-LSHS';

      document.slides.forEach((slide) => {
        const pptSlide = pptx.addSlide();
        pptSlide.background = { color: slide.backgroundColor.replace('#', '') || '0F172A' };

        slide.elements.forEach((el) => {
          // Convert 1920x1080 canvas pixel coords to PPTX inches (10 x 5.625 standard)
          const scaleX = 10 / 1920;
          const scaleY = 5.625 / 1080;

          if (el.type === 'text') {
            pptSlide.addText(el.content, {
              x: el.x * scaleX,
              y: el.y * scaleY,
              w: el.width * scaleX,
              h: el.height * scaleY,
              fontSize: Math.round(el.fontSize * 0.75),
              color: el.textColor.replace('#', '') || 'FFFFFF',
              align: el.textAlign || 'left',
              bold: el.fontWeight === 'bold',
            });
          } else if (el.type === 'shape') {
            pptSlide.addShape(pptx.ShapeType.rect, {
              x: el.x * scaleX,
              y: el.y * scaleY,
              w: el.width * scaleX,
              h: el.height * scaleY,
              fill: { color: el.fillColor.replace('#', '') || '3B82F6' },
              line: { color: el.strokeColor.replace('#', '') || '60A5FA', width: el.strokeWidth },
            });
          }
        });
      });

      await pptx.writeFile({
        fileName: `${document.manifest.title.replace(/\s+/g, '_')}_bare.pptx`,
      });

      setExportStatus('✅ Successfully exported bare PPTX file!');
      setTimeout(() => setExportStatus(null), 4000);
    } catch (err: any) {
      setExportStatus(`❌ Error exporting PPTX: ${err.message}`);
    }
  };

  // 3. Export as PDF
  const handleExportPDF = () => {
    try {
      setExportStatus('Rendering PDF presentation document...');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [960, 540],
      });

      document.slides.forEach((slide, idx) => {
        if (idx > 0) pdf.addPage([960, 540], 'landscape');

        // Draw slide background
        pdf.setFillColor(slide.backgroundColor || '#0f172a');
        pdf.rect(0, 0, 960, 540, 'F');

        // Render slide text items
        slide.elements.forEach((el) => {
          if (el.type === 'text') {
            pdf.setTextColor(el.textColor || '#ffffff');
            pdf.setFontSize(Math.max(10, Math.round(el.fontSize * 0.4)));
            pdf.text(el.content, el.x * 0.5, (el.y + el.fontSize) * 0.5);
          }
        });
      });

      pdf.save(`${document.manifest.title.replace(/\s+/g, '_')}.pdf`);
      setExportStatus('✅ Successfully exported PDF presentation!');
      setTimeout(() => setExportStatus(null), 4000);
    } catch (err: any) {
      setExportStatus(`❌ Error exporting PDF: ${err.message}`);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex overflow-hidden select-none">
      {/* Left Backstage Navigation Menu */}
      <nav className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <button
            onClick={() => setView('workspace')}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold text-xs uppercase tracking-wider mb-6 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Return to Editor</span>
          </button>

          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('save')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                activeTab === 'save'
                  ? 'bg-cyan-600 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Save size={16} />
              <span>Save Presentation (.kqs)</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-cyan-600 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileDown size={16} />
              <span>Export To (PDF / PPTX)</span>
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-cyan-600 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Info size={16} />
              <span>Presentation Information</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-cyan-600 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Settings size={16} />
              <span>System Settings</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-4">
          <p className="font-semibold text-slate-400">CvSU-LSHS Research Prototype</p>
          <p>ISO/IEC 25010 Evaluated</p>
        </div>
      </nav>

      {/* Right Content Panel */}
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-3xl space-y-8">
          {/* Status Message */}
          {exportStatus && (
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/50 text-cyan-300 text-sm font-semibold flex items-center gap-2 shadow-lg animate-fade-in">
              <CheckCircle2 size={18} />
              <span>{exportStatus}</span>
            </div>
          )}

          {/* TAB: SAVE PRESENTATION (.KQS) */}
          {activeTab === 'save' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-100">
                  Save Native Presentation (.kqs)
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  KinetiQ Media Slide package bundles all slides, interactive regex components, quiz models, and media offline.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                    <HardDrive size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200 text-lg">
                      {document.manifest.title}.kqs
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Full-fidelity format preserving triggers, animations, and student response states.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={handleSaveKQS}
                    className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg cursor-pointer"
                  >
                    <Save size={18} />
                    <span>Save to Local Disk</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: EXPORT TO */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-100">Export Presentation</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Convert presentation to industry standard formats for handouts or PowerPoint compatibility.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* PDF Export */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <FileText size={32} className="text-red-400 mb-3" />
                    <h3 className="font-bold text-slate-200 text-base">Finalized PDF Document</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      High-resolution document suitable for student handouts, classroom printing, or archiving.
                    </p>
                  </div>
                  <button
                    onClick={handleExportPDF}
                    className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition cursor-pointer"
                  >
                    Export PDF
                  </button>
                </div>

                {/* PPTX Export */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <FileSpreadsheet size={32} className="text-orange-400 mb-3" />
                    <h3 className="font-bold text-slate-200 text-base">Bare Microsoft PowerPoint (.pptx)</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Exports structural slides, shapes, typography, and layout for Microsoft PowerPoint fallback.
                    </p>
                  </div>
                  <button
                    onClick={handleExportPPTX}
                    className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition cursor-pointer"
                  >
                    Export PPTX
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRESENTATION INFO */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-100">Document Information</h2>
                <p className="text-slate-400 text-sm mt-1">Project metadata and thesis filing attributes.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold">Title</label>
                  <input
                    type="text"
                    value={document.manifest.title}
                    onChange={(e) => updateManifest({ title: e.target.value })}
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold">Author / Faculty</label>
                  <input
                    type="text"
                    value={document.manifest.author}
                    onChange={(e) => updateManifest({ author: e.target.value })}
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold">Subject / Academic Area</label>
                  <input
                    type="text"
                    value={document.manifest.subject || ''}
                    onChange={(e) => updateManifest({ subject: e.target.value })}
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-100">System Settings</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Adjust interface theme, autosave interval, and authoring canvas.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-200">Auto-save Interval</h4>
                    <p className="text-slate-500 text-[11px]">Periodically snapshots project state</p>
                  </div>
                  <select
                    value={document.settings.autoSaveIntervalMs}
                    onChange={(e) => updateSettings({ autoSaveIntervalMs: Number(e.target.value) })}
                    className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200"
                  >
                    <option value={15000}>15 Seconds</option>
                    <option value={30000}>30 Seconds (Default)</option>
                    <option value={60000}>1 Minute</option>
                    <option value={0}>Off</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

