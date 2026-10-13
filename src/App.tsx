import { useDocumentStore } from './store/useDocumentStore';
import { RibbonBar } from './components/ribbon/RibbonBar';
import { SlideThumbnailSidebar } from './components/sidebar/SlideThumbnailSidebar';
import { SlideCanvas } from './components/canvas/SlideCanvas';
import { PropertyInspector } from './components/inspector/PropertyInspector';
import { StatusBar } from './components/statusbar/StatusBar';
import { FullscreenPresentation } from './components/presentation/FullscreenPresentation';
import { PresenterView } from './components/presentation/PresenterView';
import { HomePage } from './components/pages/HomePage';
import { BackstagePage } from './components/pages/BackstagePage';
import './App.css';

export function App() {
  const { currentView, presentationMode } = useDocumentStore();

  // 1. Fullscreen Presentation Mode
  if (presentationMode === 'fullscreen') {
    return <FullscreenPresentation />;
  }

  // 2. Dual Presenter Mode
  if (presentationMode === 'presenter') {
    return <PresenterView />;
  }

  // 3. Homepage / Template Gallery View
  if (currentView === 'home') {
    return (
      <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
        <HomePage />
      </div>
    );
  }

  // 4. Backstage / Save & Export View
  if (currentView === 'backstage') {
    return (
      <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
        <BackstagePage />
      </div>
    );
  }

  // 5. Main Authoring Workspace
  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Ribbon Bar */}
      <RibbonBar />

      {/* Main Authoring Station */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Thumbnails Panel */}
        <SlideThumbnailSidebar />

        {/* Central 16:9 Scaled Canvas */}
        <SlideCanvas />

        {/* Right Property & Function Inspector */}
        <PropertyInspector />
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />
    </div>
  );
}

export default App;
