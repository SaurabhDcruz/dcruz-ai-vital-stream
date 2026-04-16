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

// Types
import { ErrorType } from './components/initialization/InitializationError';
import { InitializationError } from './components/initialization/InitializationError';

export default function App() {
  const [isAIReady, setIsAIReady] = useState(false);
  const [systemError, setSystemError] = useState<{ type: ErrorType; message: string } | null>(null);
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
  const [viewState, setViewState] = useState({ scale: 1, x: 0, y: 0 });

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
    setViewState,
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

  const initializeSystem = async () => {
    setSystemError(null);
    setIsAIReady(false);

    try {
      // 1. Warm up camera check (optional but helps isolate permissions)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(t => t.stop());
      } catch (camErr: any) {
        console.error('[System] Camera access failed:', camErr);
        setSystemError({
          type: 'CAMERA_PERMISSION_DENIED',
          message: 'Webcam access is required for touchless gesture control. Please enable permissions in your browser.'
        });
        return;
      }

      // 2. Load AI hand tracking model
      await initHandDetection();
      setIsAIReady(true);
    } catch (err: any) {
      console.error('[System] AI initialization failed:', err);

      if (!navigator.onLine) {
        setSystemError({
          type: 'NETWORK_ERROR',
          message: 'Unable to load AI model. Please check your internet connection and try again.'
        });
      } else {
        setSystemError({
          type: 'MODEL_LOAD_FAILED',
          message: 'Failed to initialize the hand tracking engine. This can happen due to slow network or content blockers.'
        });
      }
    }
  };

  useEffect(() => {
    initializeSystem();
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

  if (systemError) {
    return (
      <InitializationError
        type={systemError.type}
        message={systemError.message}
        onRetry={initializeSystem}
      />
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
          viewState={viewState}
          gesture={gesture}
          debugMode={debugMode}
          onDebugToggle={() => setDebugMode(!debugMode)}
          onPrevPatient={() =>
            setActivePatientIndex(p => (p - 1 + PATIENTS.length) % PATIENTS.length)
          }
          onNextPatient={() => setActivePatientIndex(p => (p + 1) % PATIENTS.length)}
          onRunAnalysis={() => setViewMode('report')}
          onResetView={() => {
            setViewState({ scale: 1, x: 0, y: 0 });
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

      <Cursor
        cursorRef={cursorRef}
        rawCursorRef={rawCursorRef}
        debugMode={debugMode}
        isZooming={gesture.type === 'pinch' && viewState.scale > 1}
      />
    </div>
  );
}
