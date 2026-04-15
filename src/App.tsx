import React, { useEffect, useState, useRef, useMemo } from 'react';
import { WebcamFeed } from './components/WebcamFeed';
import {
  Activity, Zap, HeartPulse, Hand, Cpu, MousePointer2,
  HandMetal, ScanLine, ChevronLeft, ChevronRight,
  Maximize2, FileText, User, Calendar, Droplets, Thermometer,
  AlertCircle, CheckCircle2, Signal, Shield, Crosshair
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { initHandDetection, getHandLandmarker } from './services/handDetectionService';
import { GestureProcessor, GestureState } from './services/gestureService';

// MediaPipe Hand Connections
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [0, 9], [9, 10], [10, 11], [11, 12], // Middle
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [5, 9], [9, 13], [13, 17] // Palm
];

const PATIENTS = [
  { id: 'p1', name: 'John Doe', age: 45, condition: 'Stable', vitals: { hr: 72, bp: '120/80', temp: '36.6°C' }, image: 'https://picsum.photos/seed/xray1/800/600' },
  { id: 'p2', name: 'Jane Smith', age: 32, condition: 'Recovering', vitals: { hr: 68, bp: '115/75', temp: '36.8°C' }, image: 'https://picsum.photos/seed/xray2/800/600' },
  { id: 'p3', name: 'Robert Brown', age: 58, condition: 'Critical', vitals: { hr: 95, bp: '140/90', temp: '38.2°C' }, image: 'https://picsum.photos/seed/xray3/800/600' },
  { id: 'p4', name: 'Emily Davis', age: 27, condition: 'Observation', vitals: { hr: 75, bp: '110/70', temp: '37.1°C' }, image: 'https://picsum.photos/seed/xray4/800/600' },
];

export default function App() {
  const [isAIReady, setIsAIReady] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [systemStage, setSystemStage] = useState<'test' | 'dashboard'>('test');
  const [stabilityScore, setStabilityScore] = useState(0); // 0 to 100
  const [isStable, setIsStable] = useState(false);

  const [gesture, setGesture] = useState<GestureState>({ type: 'none', confidence: 0, position: { x: 0, y: 0 }, isNew: false, isEnding: false });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isClicked, setIsClicked] = useState(false);
  const [debugMode, setDebugMode] = useState(true);

  // Dashboard State
  const [activePatientIndex, setActivePatientIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'dashboard' | 'report'>('dashboard');
  const [imgScale, setImgScale] = useState(1);
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });

  const gestureProcessor = useRef(new GestureProcessor());
  const dwellTimer = useRef<number | null>(null);
  const lastPanPos = useRef<{ x: number, y: number } | null>(null);
  const stabilityBuffer = useRef<boolean[]>([]);
  const STABILITY_WINDOW = 60; // ~1-2 seconds

  const lastIsStable = useRef(false);

  // Performance Optimization Refs
  const isProcessing = useRef(false);
  const lastDetectionTime = useRef(0);
  const detectionInterval = 40; // ~25 FPS target for detection
  const frameCount = useRef(0);
  const lastFpsUpdate = useRef(0);
  const [currentFps, setCurrentFps] = useState(0);
  const [isTrackingLost, setIsTrackingLost] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  // Cursor Refs for high-performance updates
  const cursorRef = useRef<HTMLDivElement>(null);
  const rawCursorRef = useRef<HTMLDivElement>(null);
  const targetPosRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });
  const lerpFactor = 0.35; // Responsive but smooth

  // --- NEW ENHANCEMENT REFS ---
  const lastLandmarksRef = useRef<any>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const isDraggingHUD = useRef(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const smoothedTargetPosRef = useRef({ x: 0, y: 0 });
  const smoothingAlpha = 0.2; // For optional smoothing layer
  const hudPositionRef = useRef<{ x: number, y: number } | null>(null);

  // Throttled State Refs
  const lastGestureType = useRef<string>('none');
  const lastStabilityScore = useRef<number>(0);
  const lastHoveredId = useRef<string | null>(null);
  const lastIsClicked = useRef<boolean>(false);

  // Animation Loop Ref
  const animationFrameRef = useRef<number | null>(null);

  // Robustness Refs
  const lastSeenTime = useRef(0);
  const trackingGracePeriod = 300; // ms to keep last position

  useEffect(() => {
    console.log("[System] Initializing Hand Detection AI...");
    initHandDetection()
      .then(() => {
        console.log("[System] Hand Detection AI Ready.");
        setIsAIReady(true);
      })
      .catch((err) => {
        console.error("[System] Hand Detection AI failed to load:", err);
        setAiError("Failed to load hand tracking model. Please check your internet connection and refresh.");
      });
  }, []);

  // Auto-transition logic and logging
  useEffect(() => {
    if (isStable !== lastIsStable.current) {
      console.log(`[System] Stability state changed: ${isStable ? 'STABLE' : 'UNSTABLE'}`);
      lastIsStable.current = isStable;
    }

    if (isStable && systemStage === 'test') {
      console.log("[System] Stability threshold maintained. Transitioning in 2s...");
      const timer = setTimeout(() => {
        console.log("[System] Triggering transition to Dashboard stage.");
        setSystemStage('dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isStable, systemStage]);

  // --- NEW ENHANCEMENT HANDLERS ---
  const handleHUDMouseDown = (e: React.MouseEvent) => {
    if (!hudRef.current) return;
    isDraggingHUD.current = true;
    const rect = hudRef.current.getBoundingClientRect();
    dragStartOffset.current = {
      x: e.clientX - (hudPositionRef.current?.x || rect.left),
      y: e.clientY - (hudPositionRef.current?.y || rect.top)
    };
    e.preventDefault();
  };

  useEffect(() => {
    let dragFrame: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingHUD.current && hudRef.current) {
        cancelAnimationFrame(dragFrame);
        dragFrame = requestAnimationFrame(() => {
          const x = e.clientX - dragStartOffset.current.x;
          const y = e.clientY - dragStartOffset.current.y;
          if (hudRef.current) {
            hudRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            hudRef.current.style.left = '0';
            hudRef.current.style.top = '0';
            hudRef.current.style.right = 'auto';
          }
          hudPositionRef.current = { x, y };
        });
      }
    };

    const handleMouseUp = () => {
      isDraggingHUD.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(dragFrame);
    };
  }, []);

  // --- SEPARATE 60 FPS CURSOR & UI LOOP ---
  useEffect(() => {
    const updateLoop = () => {
      currentPosRef.current.x += (targetPosRef.current.x - currentPosRef.current.x) * lerpFactor;
      currentPosRef.current.y += (targetPosRef.current.y - currentPosRef.current.y) * lerpFactor;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentPosRef.current.x - 16}px, ${currentPosRef.current.y - 16}px, 0)`;
        const isClickedNow = lastIsClicked.current;
        const gestureTypeNow = lastGestureType.current;
        cursorRef.current.style.backgroundColor = isClickedNow ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255,255,255,0.1)';
        cursorRef.current.style.scale = isClickedNow ? '0.7' : (gestureTypeNow !== 'none' ? '1.5' : '1');
        cursorRef.current.style.borderColor = gestureTypeNow === 'none' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 1)';
      }

      if (rawCursorRef.current && debugMode) {
        rawCursorRef.current.style.transform = `translate3d(${targetPosRef.current.x - 4}px, ${targetPosRef.current.y - 4}px, 0)`;
      }

      animationFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animationFrameRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [debugMode]);

  useEffect(() => {
    if (hudRef.current) {
      if (hudPositionRef.current) {
        hudRef.current.style.transform = `translate3d(${hudPositionRef.current.x}px, ${hudPositionRef.current.y}px, 0)`;
      } else {
        const x = window.innerWidth - 312;
        const y = 24;
        hudRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        hudPositionRef.current = { x, y };
      }
      hudRef.current.style.left = '0';
      hudRef.current.style.top = '0';
      hudRef.current.style.right = 'auto';
    }
  }, [systemStage]);

  const activePatient = useMemo(() => PATIENTS[activePatientIndex], [activePatientIndex]);

  const handleFrame = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    const handLandmarker = getHandLandmarker();

    if (!ctx || !handLandmarker || !isAIReady) return;
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;

    const now = performance.now();

    if (now - lastDetectionTime.current < detectionInterval || isProcessing.current) return;

    isProcessing.current = true;
    lastDetectionTime.current = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const results = handLandmarker.detectForVideo(video, now);

      frameCount.current++;
      if (now - lastFpsUpdate.current > 1000) {
        setCurrentFps(frameCount.current);
        frameCount.current = 0;
        lastFpsUpdate.current = now;
      }

      const hasHand = results.landmarks && results.landmarks.length > 0;
      let effectiveLandmarks = null;
      if (hasHand) {
        effectiveLandmarks = results.landmarks[0];
        lastLandmarksRef.current = effectiveLandmarks;
        lastSeenTime.current = now;
        if (isTrackingLost) {
          setIsTrackingLost(false);
          setShowRestored(true);
          setTimeout(() => setShowRestored(false), 2000);
        }
      } else {
        const timeSinceLastSeen = now - lastSeenTime.current;
        if (timeSinceLastSeen <= trackingGracePeriod && lastLandmarksRef.current) {
          effectiveLandmarks = lastLandmarksRef.current;
        } else if (!isTrackingLost) {
          setIsTrackingLost(true);
        }
      }

      stabilityBuffer.current.push(hasHand);
      if (stabilityBuffer.current.length > STABILITY_WINDOW) stabilityBuffer.current.shift();
      const score = Math.round((stabilityBuffer.current.filter(Boolean).length / STABILITY_WINDOW) * 100);
      if (Math.abs(score - lastStabilityScore.current) > 2) {
        setStabilityScore(score);
        lastStabilityScore.current = score;
      }
      const stable = score > 90 && stabilityBuffer.current.length === STABILITY_WINDOW;
      if (stable !== isStable) setIsStable(stable);

      if (effectiveLandmarks) {
        const gestureState = gestureProcessor.current.process(effectiveLandmarks);
        if (gestureState.type !== lastGestureType.current || gestureState.isNew || gestureState.isEnding) {
          setGesture(gestureState);
          lastGestureType.current = gestureState.type;
        }

        const screenX = (1 - gestureState.position.x) * window.innerWidth;
        const screenY = gestureState.position.y * window.innerHeight;

        smoothedTargetPosRef.current.x += (screenX - smoothedTargetPosRef.current.x) * smoothingAlpha;
        smoothedTargetPosRef.current.y += (screenY - smoothedTargetPosRef.current.y) * smoothingAlpha;
        targetPosRef.current = { x: smoothedTargetPosRef.current.x, y: smoothedTargetPosRef.current.y };

        const element = document.elementFromPoint(screenX, screenY);
        const interactiveEl = element?.closest('[data-interactive-id]');
        const currentId = interactiveEl?.getAttribute('data-interactive-id') || null;

        if (currentId !== lastHoveredId.current) {
          if (dwellTimer.current) window.clearTimeout(dwellTimer.current);
          if (currentId) {
            dwellTimer.current = window.setTimeout(() => {
              setHoveredId(currentId);
              lastHoveredId.current = currentId;
            }, 120);
          } else {
            setHoveredId(null);
            lastHoveredId.current = null;
          }
        }

        if (gestureState.type === 'pinch') {
          if (!lastIsClicked.current) {
            setIsClicked(true);
            lastIsClicked.current = true;
            if (interactiveEl instanceof HTMLElement) interactiveEl.click();
          }
          if (systemStage === 'dashboard' && viewMode === 'dashboard') {
            const delta = (gestureState.position.y - 0.5) * -0.05;
            setImgScale(prev => Math.max(1, Math.min(5, prev + delta)));
          }
        } else if (lastIsClicked.current) {
          setIsClicked(false);
          lastIsClicked.current = false;
        }

        if (systemStage === 'dashboard') {
          if (gestureState.type === 'point') {
            if (lastPanPos.current) {
              const dx = (screenX - lastPanPos.current.x) * 1.5;
              const dy = (screenY - lastPanPos.current.y) * 1.5;
              setImgOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            }
            lastPanPos.current = { x: screenX, y: screenY };
          } else {
            lastPanPos.current = null;
          }
          if (gestureState.type === 'swipe_left' && gestureState.isNew) setActivePatientIndex(prev => (prev + 1) % PATIENTS.length);
          if (gestureState.type === 'swipe_right' && gestureState.isNew) setActivePatientIndex(prev => (prev - 1 + PATIENTS.length) % PATIENTS.length);
          if (gestureState.type === 'open_palm' && gestureState.isNew) {
            setViewMode('dashboard');
            setImgScale(1);
            setImgOffset({ x: 0, y: 0 });
          }
        }

        if (systemStage === 'test' || debugMode) {
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          HAND_CONNECTIONS.forEach(([start, end]) => {
            const sp = effectiveLandmarks[start];
            const ep = effectiveLandmarks[end];
            ctx.beginPath();
            ctx.moveTo((1 - sp.x) * canvas.width, sp.y * canvas.height);
            ctx.lineTo((1 - ep.x) * canvas.width, ep.y * canvas.height);
            ctx.stroke();
          });
          effectiveLandmarks.forEach((lm, i) => {
            const x = (1 - lm.x) * canvas.width;
            const y = lm.y * canvas.height;
            ctx.fillStyle = i === 8 ? '#EF4444' : ([4, 12, 16, 20].includes(i) ? '#3B82F6' : '#FFFFFF');
            ctx.beginPath();
            ctx.arc(x, y, i === 8 ? 8 : (i === 0 ? 6 : 4), 0, 2 * Math.PI);
            ctx.fill();
          });
        }
      } else {
        const timeSinceLastSeen = now - lastSeenTime.current;
        if (timeSinceLastSeen > trackingGracePeriod) {
          setGesture({ type: 'none', confidence: 0, position: { x: 0, y: 0 }, isNew: false, isEnding: false });
          setHoveredId(null);
          lastPanPos.current = null;
          setIsClicked(false);
          lastIsClicked.current = false;
        }
      }
    } catch (err) {
      console.error("[HandDetection] Error:", err);
    } finally {
      isProcessing.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      <div className="fixed inset-0 bg-slate-950 -z-20" />
      <div className="fixed inset-0 scanline-bg opacity-5 -z-10 pointer-events-none" />

      {systemStage === 'test' ? (
        <div className="fixed inset-0 bg-slate-950 overflow-hidden">
          <div className="absolute inset-0 industrial-grid opacity-20" />
          <div className="absolute inset-0 scanline-bg opacity-30 pointer-events-none" />
          <div className="relative z-10 w-full h-full flex flex-col p-6 md:p-10 pointer-events-none">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-auto">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-10 bg-cyan-500 rounded-full glow-cyan" />
                  <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white font-heading uppercase">
                    VITAL<span className="text-cyan-500">STREAM</span>_OS
                  </h1>
                  <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 data-font text-[9px] px-2">v.2.0.4_INDUSTRIAL</Badge>
                </div>
                <div className="text-[10px] font-black text-slate-500 tracking-[0.4em] uppercase ml-5">PRECISION_BIOMETRIC_CALIBRATION_MODULE</div>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px] flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full overflow-visible opacity-40">
                  <motion.circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" strokeDasharray="4 20" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} />
                  <motion.circle cx="50%" cy="50%" r="40%" fill="none" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="8" strokeDasharray="2 48" animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} />
                  <motion.circle cx="50%" cy="50%" r="35%" fill="none" stroke={isStable ? "rgba(16, 185, 129, 0.4)" : "rgba(6, 182, 212, 0.2)"} strokeWidth="2" strokeDasharray="100 100" animate={{ strokeDashoffset: 100 - stabilityScore }} className="transition-colors duration-500" />
                </svg>
                <div className="relative z-20 flex flex-col items-center justify-center text-center space-y-6 md:space-y-10">
                  <motion.div className={`w-24 h-24 md:w-40 md:h-40 rounded-full border border-cyan-500/30 flex items-center justify-center bg-slate-900/60 backdrop-blur-xl relative z-21 ${isStable ? 'border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'shadow-[0_0_40px_rgba(6,182,212,0.1)]'}`} animate={{ scale: isStable ? [1, 1.02, 1] : 1 }} transition={{ duration: 0.5, repeat: isStable ? Infinity : 0 }}>
                    <Hand className={`w-12 h-12 md:w-20 md:h-20 transition-colors duration-500 ${isStable ? 'text-emerald-400' : 'text-cyan-400'}`} />
                  </motion.div>
                  <div className="space-y-2">
                    <h2 className={`text-2xl md:text-4xl font-black font-heading tracking-[0.3em] uppercase transition-colors duration-500 ${isStable ? 'text-emerald-400 glow-cyan' : 'text-cyan-500 glow-cyan'}`}>{isStable ? 'STABILITY_LOCKED' : 'AUTH_SCANNING_...'}</h2>
                    <div className="data-font text-[10px] md:text-[12px] text-slate-500 flex items-center justify-center gap-6 tracking-widest font-bold">
                      <span className={stabilityScore > 80 ? 'text-emerald-500' : 'text-cyan-400'}>CONFIDENCE: {stabilityScore}%</span>
                      <span className="text-cyan-400">FPS: {currentFps}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pointer-events-auto">
              <div className="tech-hud-border p-5 bg-slate-900/60 backdrop-blur-md">
                <div className="corner-tr" /><div className="corner-bl" />
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Cpu className="w-3.5 h-3.5 text-cyan-500" /> SYSTEM_TELEMETRY</div>
                <div className="space-y-3 data-font text-[11px] font-bold">
                  <div className="flex justify-between"><span className="text-slate-400">LATENCY</span><span className="text-cyan-400">{Math.round(1000 / Math.max(1, currentFps))}ms</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">LOAD</span><span className="text-cyan-400">{(currentFps * 1.2).toFixed(1)}%</span></div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1 border border-slate-700">
                    <motion.div className={`h-full ${stabilityScore > 90 ? 'bg-emerald-500' : 'bg-cyan-500'}`} animate={{ width: `${stabilityScore}%` }} />
                  </div>
                </div>
              </div>
              <div className="tech-hud-border p-5 bg-slate-900/60 backdrop-blur-md hidden sm:block">
                <div className="corner-tr" /><div className="corner-bl" />
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Signal className="w-3.5 h-3.5 text-cyan-500" /> SENSOR_INPUT_LOG</div>
                <div className="space-y-1.5 data-font text-[10px] font-bold">
                  <div className="flex gap-2 text-cyan-500/40"><span>[00:01]</span><span className="text-slate-300">DETECTION_ENGINE_ONLINE</span></div>
                  <div className="flex gap-2 text-cyan-500/40"><span>[00:02]</span><span className={isStable ? 'text-emerald-400' : 'text-amber-500 animate-pulse'}>{isStable ? 'SIGNAL_LOCKED' : 'SIGNAL_SCANNING'}</span></div>
                </div>
              </div>
              <div className="tech-hud-border p-5 bg-slate-900/60 backdrop-blur-md md:col-span-2 overflow-hidden relative group">
                <div className="corner-tr" /><div className="corner-bl" />
                <div className="relative z-10 flex flex-col justify-end h-full">
                  <Button data-interactive-id="btn-access" disabled={!isStable} onClick={() => setSystemStage('dashboard')} className={`h-12 w-full rounded border transition-all duration-500 font-heading font-black text-[11px] uppercase tracking-[0.3em] ${isStable ? 'bg-cyan-600 border-cyan-400 text-white tech-glow-blue hover:bg-cyan-500' : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed opacity-40'}`}>
                    {isStable ? 'ACCESS_SECURE_INTERFACE' : 'WAITING_FOR_SENSOR_LOCK...'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col">
          <AnimatePresence>
            {isTrackingLost && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-12 md:bottom-24 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-[10001] bg-slate-900 border border-red-500/30 text-red-500 px-10 py-4 rounded-xl font-black shadow-2xl flex items-center gap-6 tech-glass tech-hud-border">
                <ScanLine className="w-6 h-6 animate-pulse" />
                <div className="flex flex-col"><span className="text-[10px] uppercase tracking-[0.4em] opacity-60">ALERT_TRACKING_CRITICAL</span><span className="text-lg uppercase">SIGNAL_LOST</span></div>
              </motion.div>
            )}
          </AnimatePresence>

          <header className="sticky top-0 z-[1000] w-full bg-slate-950/90 backdrop-blur-2xl border-b border-cyan-500/15 px-6 py-4 flex items-center justify-between tech-hud-border">
            <div className="corner-tr" /><div className="corner-bl" />
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-cyan-600/20 rounded-xl flex items-center justify-center border border-cyan-500/30"><HeartPulse className="text-cyan-400 w-6 h-6 animate-pulse" /></div>
              <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase font-heading">VITAL<span className="text-cyan-500">STREAM</span></h1>
            </div>
            <div className="flex items-center gap-4 md:gap-8">
              <AnimatePresence mode="wait">
                {gesture.type !== 'none' && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">{gesture.type}</motion.div>}
              </AnimatePresence>
              <button onClick={() => setDebugMode(!debugMode)} className={`p-2.5 rounded-lg border ${debugMode ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-500'}`}><Cpu className="w-4 h-4" /></button>
            </div>
          </header>

          <main className="max-w-[1600px] mx-auto p-4 md:p-8 grid lg:grid-cols-12 gap-6 md:gap-10 min-h-[calc(100vh-5rem)] relative z-10">
            <div className="lg:col-span-4 space-y-6">
              <Card className="tech-glass bg-slate-900/40 border-cyan-500/10 overflow-hidden h-full flex flex-col tech-hud-border">
                <CardHeader className="border-b border-cyan-500/10 bg-cyan-500/5 px-6 py-4"><CardTitle className="text-sm font-black text-white uppercase tracking-widest">SUBJECT_DIRECTORY</CardTitle></CardHeader>
                <CardContent className="p-6 flex-1">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-950 rounded border border-cyan-500/20 flex items-center justify-center"><User className="w-8 h-8 text-cyan-500/40" /></div>
                      <div><div className="text-[8px] font-black text-slate-500 uppercase">ID: {activePatient.id}</div><h2 className="text-xl font-black text-white font-heading uppercase">{activePatient.name}</h2></div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-950/40 border border-cyan-500/10 rounded flex justify-between items-center"><span className="text-[8px] font-black text-slate-500">HEART_RATE</span><span className="text-cyan-400 font-black data-font">{activePatient.vitals.hr} BPM</span></div>
                      {/* Trendline placeholder */}
                      <div className="w-full h-8 bg-cyan-500/5 rounded border border-cyan-500/10 overflow-hidden">
                        <motion.div className="w-full h-full" animate={{ x: [-20, 0] }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                          <svg className="w-[120%] h-full opacity-30"><path d="M 0 15 L 20 5 L 40 25 L 60 10 L 80 15 L 100 5 L 120 25" fill="none" stroke="#22d3ee" strokeWidth="2" /></svg>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="p-6 border-t border-cyan-500/10 grid grid-cols-2 gap-4">
                  <Button data-interactive-id="btn-prev" onClick={() => setActivePatientIndex(prev => (prev - 1 + PATIENTS.length) % PATIENTS.length)} className="h-12 bg-slate-900 text-xs font-black uppercase tracking-widest hover:border-cyan-500">PREV</Button>
                  <Button data-interactive-id="btn-next" onClick={() => setActivePatientIndex(prev => (prev + 1) % PATIENTS.length)} className="h-12 bg-slate-900 text-xs font-black uppercase tracking-widest hover:border-cyan-500">NEXT</Button>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-8">
              <Card className="tech-glass bg-slate-900/40 border-cyan-500/10 h-full relative overflow-hidden tech-hud-border min-h-[500px] flex flex-col">
                <CardHeader className="border-b border-cyan-500/10 bg-cyan-500/5 px-6 py-4"><CardTitle className="text-sm font-black text-white uppercase tracking-widest">DIAGNOSTIC_VIEWER</CardTitle></CardHeader>
                <CardContent className="p-0 flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 industrial-grid opacity-10 pointer-events-none" />
                  <motion.img src={activePatient.image} className="max-w-[90%] max-h-[90%] object-contain brightness-110" animate={{ scale: imgScale, x: imgOffset.x, y: imgOffset.y }} transition={{ type: 'spring', damping: 30 }} />
                  <div className="absolute bottom-6 left-6 flex gap-4 opacity-50"><div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-white/10 rounded text-[8px] font-black uppercase tracking-widest"><RefreshCw className="w-3 h-3" /> PALM_RESET</div></div>
                </CardContent>
                <div className="h-20 bg-slate-950 border-t border-cyan-500/15 p-4 flex gap-4">
                  <Button data-interactive-id="btn-report" onClick={() => setViewMode('report')} className="flex-1 bg-cyan-600/10 border-cyan-500/20 text-cyan-400 font-black text-[10px] uppercase">RUN_ANALYSIS</Button>
                  <Button data-interactive-id="btn-reset" onClick={() => { setImgScale(1); setImgOffset({ x: 0, y: 0 }) }} className="flex-1 bg-slate-900 border-slate-700 text-slate-500 font-black text-[10px] uppercase">RESET</Button>
                </div>
              </Card>
            </div>
          </main>
        </div>
      )}

      {/* Persistent Mission HUD */}
      <div ref={hudRef} className={`fixed z-[10002] transition-all duration-700 pointer-events-auto ${systemStage === 'test' ? 'w-64 md:w-80' : 'w-48 md:w-72'}`} onMouseDown={handleHUDMouseDown}>
        <div className="h-8 bg-slate-900 border border-slate-800 rounded-t-lg flex items-center px-4 justify-between relative overflow-hidden">
          <div className="absolute inset-0 scanline-bg opacity-20" />
          <div className="flex items-center gap-2 relative z-10"><div className={`w-1.5 h-1.5 rounded-full ${isTrackingLost ? 'bg-red-500' : 'bg-cyan-500 animate-pulse'}`} /><span className="text-[8px] font-black uppercase text-white/90">LIVE_FEED</span></div>
          <div className="text-[8px] font-black text-cyan-500/70 data-font relative z-10">{stabilityScore}%</div>
        </div>
        <div className="relative aspect-video overflow-hidden border border-slate-800 rounded-b-xl tech-hud-border">
          <WebcamFeed onFrame={handleFrame} minimal className="w-full h-full bg-slate-900 opacity-80" />
          <div className="corner-tr" /><div className="corner-bl" />
          <div className="absolute top-2 left-2 flex gap-1.5"><div className="px-1.5 py-0.5 bg-slate-950/60 rounded text-[7px] font-black text-cyan-400 data-font">{currentFps} FPS</div><div className="px-1.5 py-0.5 bg-slate-950/60 rounded text-[7px] font-black text-cyan-400 data-font">{gesture.type}</div></div>
        </div>
      </div>

      {/* Modal Overlay for Report */}
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

      <div ref={cursorRef} className="fixed top-0 left-0 w-10 h-10 pointer-events-none z-[9999] flex items-center justify-center will-change-transform">
        <div className="absolute inset-0 border border-blue-500/30 rounded-lg tech-hud-border opacity-50" />
        <div className={`w-2 h-2 rounded-full bg-blue-600 tech-glow-blue transition-transform duration-200 ${isClicked ? 'scale-150' : 'scale-100'}`} />
      </div>
    </div>
  );
}

function RefreshCw(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" />
    </svg>
  );
}
