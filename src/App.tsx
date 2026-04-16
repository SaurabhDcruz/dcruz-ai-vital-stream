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
import { CinematicOverlay } from './components/dashboard/CinematicOverlay';
import { CameraHUD } from './components/hud/CameraHUD';
import { Cursor } from './components/hud/Cursor';

// Services
import { initHandDetection } from './services/handDetectionService';
import { GestureState } from './services/gestureService';

export default function App() {
  const [isAIReady, setIsAIReady] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [systemStage, setSystemStage] = useState<'test' | 'dashboard'>('test');
  const [showCinematic, setShowCinematic] = useState(false);
  const [stabilityScore, setStabilityScore] = useState(0);
  const [isStable, setIsStable] = useState(false);

  const [gesture, setGesture] = useState<GestureState>({
    type: 'none',
    confidence: 0,
    position: { x: 0, y: 0 },
    isNew: false,
    isEnding: false
  });
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
  const { cursorRef, rawCursorRef, targetPosRef, lastIsClicked, lastGestureType } = useCursor(
    1.0,
    debugMode
  );

  const handleOverlayComplete = React.useCallback(() => {
    setShowCinematic(false);
    setSystemStage('dashboard');
  }, []);

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
      .catch(err => {
        console.error('[System] Hand Detection AI failed to load:', err);
        setAiError(
          'Failed to load hand tracking model. Please focus on fixing the failed tool call with sequential tool calls and try again. Do not do parallel tool calls and if you are fixing multiple tool calls, do them one at a time. Do not apologize. '
        );
      });
  }, []);

  useEffect(() => {
    if (isStable && systemStage === 'test') {
      const timer = setTimeout(() => {
        setShowCinematic(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isStable, systemStage]);

  const activePatient = PATIENTS[activePatientIndex];

  if (aiError) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-10 text-center">
        <div className="space-y-4 max-w-md">
          <h1 className="text-red-500 font-bold text-xl">System Initialization Error</h1>
          <p className="text-[#64748B] text-sm">{aiError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-blue-500/20 overflow-hidden relative">
      <div className="fixed inset-0 bg-gradient-to-b from-[#F8FAFC] to-[#EEF2FF] -z-20" />

      {systemStage === 'test' ? (
        !showCinematic && (
          <CalibrationScreen
            isStable={isStable}
            stabilityScore={stabilityScore}
            currentFps={currentFps}
            onAccess={() => {
              setShowCinematic(true);
            }}
          />
        )
      ) : (
        <Dashboard
          activePatient={activePatient}
          imgScale={imgScale}
          imgOffset={imgOffset}
          gesture={gesture}
          debugMode={debugMode}
          onDebugToggle={() => setDebugMode(!debugMode)}
          onPrevPatient={() =>
            setActivePatientIndex(p => (p - 1 + PATIENTS.length) % PATIENTS.length)
          }
          onNextPatient={() => setActivePatientIndex(p => (p + 1) % PATIENTS.length)}
          onRunAnalysis={() => setViewMode('report')}
          onResetView={() => {
            setImgScale(1);
            setImgOffset({ x: 0, y: 0 });
          }}
          isTrackingLost={isTrackingLost}
        />
      )}

      <AnimatePresence>
        {showCinematic && (
          <CinematicOverlay onComplete={handleOverlayComplete} />
        )}
      </AnimatePresence>

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

      <AnimatePresence>
        {viewMode === 'report' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/30 flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-8"
            >
              <h2 className="text-xl font-bold text-[#0F172A] mb-6">Diagnostic Summary</h2>
              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5 mb-6">
                <div className="text-base font-bold text-[#0F172A]">{activePatient.name}</div>
                <div className="text-sm text-[#64748B] mt-1">
                  ID: {activePatient.id.toUpperCase()} &middot; Status: {activePatient.condition}
                </div>
              </div>
              <Button
                data-interactive-id="btn-close-report"
                onClick={() => setViewMode('dashboard')}
                className="w-full h-11 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Close Report
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Cursor cursorRef={cursorRef} rawCursorRef={rawCursorRef} debugMode={debugMode} />
    </div>
  );
}
