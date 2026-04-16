import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Activity, Cpu, Settings } from 'lucide-react';
import { PatientPanel } from './PatientPanel';
import { ImageViewer } from './ImageViewer';
import { ActionPanel } from './ActionPanel';
import { Footer } from './Footer';
import { Patient } from '../../constants/patients';
import { GestureState } from '../../services/gestureService';

interface DashboardProps {
  activePatient: Patient;
  imgScale: number;
  imgOffset: { x: number; y: number };
  gesture: GestureState;
  debugMode: boolean;
  onDebugToggle: () => void;
  onPrevPatient: () => void;
  onNextPatient: () => void;
  onRunAnalysis: () => void;
  onResetView: () => void;
  isTrackingLost: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  activePatient,
  imgScale,
  imgOffset,
  gesture,
  debugMode,
  onDebugToggle,
  onPrevPatient,
  onNextPatient,
  onRunAnalysis,
  onResetView,
  isTrackingLost
}) => {
  return (
    <div className="w-full h-screen flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-[1000] w-full bg-white border-b border-[#E2E8F0] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <Activity className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-[#0F172A] tracking-tight">
            Vital<span className="text-blue-600">Stream</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {gesture.type !== 'none' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg text-xs font-medium capitalize"
              >
                {gesture.type}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={onDebugToggle}
            title="Debug Mode"
            className={`p-2 rounded-xl border transition-all duration-200 ${debugMode ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'}`}
          >
            <Cpu className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-slate-50 transition-all duration-200">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 grid lg:grid-cols-12 gap-4 md:gap-6 overflow-auto">
        {/* Patient Panel */}
        <div className="lg:col-span-4 xl:col-span-3">
          <PatientPanel
            activePatient={activePatient}
            onPrev={onPrevPatient}
            onNext={onNextPatient}
          />
        </div>

        {/* Image Viewer + Action Panel */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-5">
          <div className="flex-1 flex flex-col min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] rounded-[20px] sm:rounded-[28px] bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-xl border border-white/40 shadow-[0_10px_40px_rgba(15,23,42,0.06)] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            {/* Image Area */}
            <div className="flex-1 relative bg-gradient-to-br from-slate-50 to-slate-100/60">
              {/* subtle inner glow */}
              <div className="absolute inset-0 bg-white/20 pointer-events-none" />

              <ImageViewer image={activePatient.image} imgScale={imgScale} imgOffset={imgOffset} />
            </div>

            {/* Divider (premium subtle line) */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            {/* Action Panel */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white/60 backdrop-blur-xl border-t border-white/30">
              <ActionPanel onRunAnalysis={onRunAnalysis} onReset={onResetView} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
