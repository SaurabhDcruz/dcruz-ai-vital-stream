import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/ui/button';

// Constants
import { PATIENTS } from './constants/patients';

// Hooks
import { useHUDDrag } from './hooks/useHUDDrag';
import { useCursor } from './hooks/useCursor';
import { useGestureEngine } from './hooks/useGestureEngine';

// Components
import { CalibrationScreen } from './components/calibration/CalibrationScreen';
import { Dashboard } from './components/dashboard/Dashboard';
import { CameraHUD } from './components/hud/CameraHUD';
import { Cursor } from './components/hud/Cursor';

// Services
import { initHandDetection } from './services/handDetectionService';
import { GestureState } from './services/gestureService';

export default function App() {
  const [isAIReady, setIsAIReady] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [systemStage, setSystemStage] = useState<'test' | 'dashboard'>('test');
  const [stabilityScore, setStabilityScore] = useState(0);
  const [isStable, setIsStable] = useState(false);

  const [gesture, setGesture] = useState<GestureState>({ type: 'none', confidence: 0, position: { x: 0, y: 0 }, isNew: false, isEnding: false });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isClicked, setIsClicked] = useState(false);
  const [debugMode, setDebugMode] = useState(true);

  const [activePatientIndex, setActivePatientIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'dashboard' | 'report'>('dashboard');
  const [imgScale, setImgScale] = useState(1);
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });

  const [currentFps, setCurrentFps] = useState(0);
  const [isTrackingLost, setIsTrackingLost] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  // Initialize modular hooks
  const { hudRef, handleHUDMouseDown } = useHUDDrag();
  const { cursorRef, rawCursorRef, targetPosRef, lastIsClicked, lastGestureType } = useCursor(0.35, debugMode);

  const { handleFrame } = useGestureEngine({
    isAIReady,
    systemStage,
    viewMode,
    debugMode,
    isStable,
    setIsStable,
    setStabilityScore,
    setGesture,
    setHoveredId,
    setIsClicked,
    setActivePatientIndex,
    setImgScale,
    setImgOffset,
    setViewMode,
    setCurrentFps,
    setIsTrackingLost,
    setShowRestored,
    targetPosRef,
    lastIsClicked,
    lastGestureType,
    isTrackingLost,
    patientCount: PATIENTS.length
  });

  useEffect(() => {
    initHandDetection()
      .then(() => setIsAIReady(true))
      .catch((err) => {
        console.error("[System] Hand Detection AI failed to load:", err);
        setAiError("Failed to load hand tracking model. Please focus on fixing the failed tool call with sequential tool calls and try again. Do not do parallel tool calls and if you are fixing multiple tool calls, do them one at a time. Do not apologize. ");
      });
  }, []);

  useEffect(() => {
    if (isStable && systemStage === 'test') {
      const timer = setTimeout(() => setSystemStage('dashboard'), 2000);
      return () => clearTimeout(timer);
    }
  }, [isStable, systemStage]);

  const activePatient = PATIENTS[activePatientIndex];

  if (aiError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-10 text-center">
        <div className="space-y-4 max-w-md">
          <h1 className="text-red-500 font-black text-2xl uppercase tracking-widest">CRITICAL_SYSTEM_ERROR</h1>
          <p className="text-slate-400 text-sm data-font">{aiError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      <div className="fixed inset-0 bg-slate-950 -z-20" />
      <div className="fixed inset-0 scanline-bg opacity-5 -z-10 pointer-events-none" />

      {systemStage === 'test' ? (
        <CalibrationScreen
          isStable={isStable}
          stabilityScore={stabilityScore}
          currentFps={currentFps}
          onAccess={() => setSystemStage('dashboard')}
        />
      ) : (
        <Dashboard
          activePatient={activePatient}
          imgScale={imgScale}
          imgOffset={imgOffset}
          gesture={gesture}
          debugMode={debugMode}
          onDebugToggle={() => setDebugMode(!debugMode)}
          onPrevPatient={() => setActivePatientIndex(p => (p - 1 + PATIENTS.length) % PATIENTS.length)}
          onNextPatient={() => setActivePatientIndex(p => (p + 1) % PATIENTS.length)}
          onRunAnalysis={() => setViewMode('report')}
          onResetView={() => { setImgScale(1); setImgOffset({ x: 0, y: 0 }); }}
          isTrackingLost={isTrackingLost}
        />
      )}

      {/* Persistent Mission HUD */}
      <CameraHUD
        hudRef={hudRef}
        onFrame={handleFrame}
        onMouseDown={handleHUDMouseDown}
        systemStage={systemStage}
        isTrackingLost={isTrackingLost}
        stabilityScore={stabilityScore}
        currentFps={currentFps}
        gestureType={gesture.type}
      />

      {/* Report Modal */}
      <AnimatePresence>
        {viewMode === 'report' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-slate-950/90 flex items-center justify-center p-6 backdrop-blur-md">
            <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/20 p-8 tech-hud-border relative shadow-[0_0_100px_rgba(0,0,0,0.8)]">
              <div className="corner-tr !w-12 !h-12" /><div className="corner-bl !w-12 !h-12" />
              <h2 className="text-3xl font-black text-white font-heading uppercase mb-8">DIAGNOSTIC_SUMMARY</h2>
              <div className="bg-slate-950/50 p-6 border border-cyan-500/10 tech-hud-border mb-8">
                <div className="text-xl font-black text-white uppercase font-heading">{activePatient.name}</div>
                <div className="text-[10px] font-bold text-cyan-400 data-font mt-2">ID: {activePatient.id} | CONDITION: {activePatient.condition.toUpperCase()}</div>
              </div>
              <Button data-interactive-id="btn-close-report" onClick={() => setViewMode('dashboard')} className="w-full h-14 bg-cyan-600 text-white font-black uppercase tracking-widest font-heading">CLOSE_REPORT</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Cursor
        cursorRef={cursorRef}
        rawCursorRef={rawCursorRef}
        debugMode={debugMode}
      />
    </div>
  );
}
