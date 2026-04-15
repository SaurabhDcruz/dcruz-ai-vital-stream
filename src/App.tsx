import React, { useEffect, useState, useRef, useMemo } from 'react';
import { WebcamFeed } from './components/WebcamFeed';
import { 
  Activity, Zap, HeartPulse, Hand, Cpu, MousePointer2, 
  HandMetal, ScanLine, ChevronLeft, ChevronRight, 
  Maximize2, FileText, User, Calendar, Droplets, Thermometer,
  AlertCircle
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
  const hudPositionRef = useRef<{x: number, y: number} | null>(null);
  const hudTransformRef = useRef({ x: 0, y: 0 });

  // Throttled State Refs
  const lastGestureType = useRef<string>('none');
  const lastStabilityScore = useRef<number>(0);
  const lastHoveredId = useRef<string | null>(null);
  const lastIsClicked = useRef<boolean>(false);
  const lastViewMode = useRef<'dashboard' | 'report'>('dashboard');
  
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

  useEffect(() => {
    if (systemStage === 'dashboard') {
      console.log("[System] Rendering Hospital Dashboard stage.");
    }
  }, [systemStage]);

  // --- NEW ENHANCEMENT HANDLERS ---
  const handleHUDMouseDown = (e: React.MouseEvent) => {
    if (!hudRef.current) return;
    isDraggingHUD.current = true;
    const rect = hudRef.current.getBoundingClientRect();
    dragStartOffset.current = {
      x: e.clientX - (hudPositionRef.current?.x || rect.left),
      y: e.clientY - (hudPositionRef.current?.y || rect.top)
    };
    // Prevent text selection during drag
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
      // 1. Smooth Cursor Movement
      currentPosRef.current.x += (targetPosRef.current.x - currentPosRef.current.x) * lerpFactor;
      currentPosRef.current.y += (targetPosRef.current.y - currentPosRef.current.y) * lerpFactor;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentPosRef.current.x - 16}px, ${currentPosRef.current.y - 16}px, 0)`;
        
        // Update visual states directly to avoid React re-renders
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
        // Initial position
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
    
    if (!ctx) return;
    if (!handLandmarker || !isAIReady) return;

    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    const now = performance.now();
    
    const drawScanline = () => {
      if (!debugMode) return;
      const time = now / 1000;
      const scanY = (Math.sin(time * 2) * 0.5 + 0.5) * canvas.height;
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();
    };

    // --- HIGH PERFORMANCE CURSOR UPDATE (60 FPS) ---
    // Moved to separate animation loop in useEffect for better performance

    // 1. Throttle Detection Frequency (~25 FPS)
    // 2. Prevent Overlapping Processing
    if (now - lastDetectionTime.current < detectionInterval || isProcessing.current) {
      drawScanline();
      return;
    }

    isProcessing.current = true;
    lastDetectionTime.current = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    try {
      const results = handLandmarker.detectForVideo(video, now);
      const detectionLatency = performance.now() - now;
      
      // FPS Tracking
      frameCount.current++;
      if (now - lastFpsUpdate.current > 1000) {
        const fps = frameCount.current;
        setCurrentFps(fps);
        frameCount.current = 0;
        lastFpsUpdate.current = now;
        if (debugMode) console.log(`[Performance] Detection FPS: ${fps}, Latency: ${detectionLatency.toFixed(1)}ms`);
      }

      const hasHand = results.landmarks && results.landmarks.length > 0;
      
      // --- ENHANCEMENT: TRACKING STABILITY WRAPPER ---
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
          // Temporarily reuse last known landmarks
          effectiveLandmarks = lastLandmarksRef.current;
        } else {
          if (!isTrackingLost) setIsTrackingLost(true);
        }
      }

      // Stability Tracking (Original logic preserved)
      stabilityBuffer.current.push(hasHand);
      if (stabilityBuffer.current.length > STABILITY_WINDOW) {
        stabilityBuffer.current.shift();
      }
      const detectedCount = stabilityBuffer.current.filter(Boolean).length;
      const score = Math.round((detectedCount / STABILITY_WINDOW) * 100);
      if (Math.abs(score - lastStabilityScore.current) > 2) {
        setStabilityScore(score);
        lastStabilityScore.current = score;
      }
      const stable = score > 90 && stabilityBuffer.current.length === STABILITY_WINDOW;
      if (stable !== isStable) {
        setIsStable(stable);
      }

      if (effectiveLandmarks) {
        const gestureState = gestureProcessor.current.process(effectiveLandmarks);
        
        if (gestureState.type !== lastGestureType.current || gestureState.isNew || gestureState.isEnding) {
          setGesture(gestureState);
          lastGestureType.current = gestureState.type;
        }

        const screenX = (1 - gestureState.position.x) * window.innerWidth;
        const screenY = gestureState.position.y * window.innerHeight;
        
        // --- ENHANCEMENT: OPTIONAL SMOOTHING LAYER ---
        // Apply AFTER existing calculations
        if (smoothedTargetPosRef.current.x === 0 && smoothedTargetPosRef.current.y === 0) {
          smoothedTargetPosRef.current = { x: screenX, y: screenY };
        } else {
          smoothedTargetPosRef.current.x += (screenX - smoothedTargetPosRef.current.x) * smoothingAlpha;
          smoothedTargetPosRef.current.y += (screenY - smoothedTargetPosRef.current.y) * smoothingAlpha;
        }

        // Update target position ref with smoothed value
        targetPosRef.current = { x: smoothedTargetPosRef.current.x, y: smoothedTargetPosRef.current.y };

        // Process interactions (Available in both stages for buttons)
        const element = document.elementFromPoint(screenX, screenY);
        const interactiveEl = element?.closest('[data-interactive-id]');
        const currentId = interactiveEl?.getAttribute('data-interactive-id') || null;

        if (currentId !== lastHoveredId.current) {
          if (dwellTimer.current) window.clearTimeout(dwellTimer.current);
          if (currentId) {
            // Reduced dwell time for faster response (250ms -> 120ms)
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
          if (gestureState.isNew) {
            if (!lastIsClicked.current) {
              setIsClicked(true);
              lastIsClicked.current = true;
            }
            if (interactiveEl instanceof HTMLElement) {
              if (debugMode) console.log('[Interaction] Gesture Click on:', currentId);
              interactiveEl.click();
            }
          }
          // Zoom Logic (Dashboard only)
          if (systemStage === 'dashboard' && viewMode === 'dashboard') {
            const delta = (gestureState.position.y - 0.5) * -0.05;
            setImgScale(prev => Math.max(1, Math.min(5, prev + delta)));
          }
        } else {
          if (lastIsClicked.current) {
            setIsClicked(false);
            lastIsClicked.current = false;
          }
        }

        // Dashboard-specific gestures
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

          if (gestureState.type === 'swipe_left' && gestureState.isNew) {
            setActivePatientIndex(prev => (prev + 1) % PATIENTS.length);
          }
          if (gestureState.type === 'swipe_right' && gestureState.isNew) {
            setActivePatientIndex(prev => (prev - 1 + PATIENTS.length) % PATIENTS.length);
          }
          if (gestureState.type === 'open_palm' && gestureState.isNew) {
            setViewMode('dashboard');
            setImgScale(1);
            setImgOffset({ x: 0, y: 0 });
          }
        }

        // Render Hand Landmarks (Always visible in Test Screen, optional in Dashboard)
        if (systemStage === 'test' || debugMode) {
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          HAND_CONNECTIONS.forEach(([start, end]) => {
            const startPoint = effectiveLandmarks[start];
            const endPoint = effectiveLandmarks[end];
            ctx.beginPath();
            ctx.moveTo((1 - startPoint.x) * canvas.width, startPoint.y * canvas.height);
            ctx.lineTo((1 - endPoint.x) * canvas.width, endPoint.y * canvas.height);
            ctx.stroke();
          });
          effectiveLandmarks.forEach((landmark, index) => {
            const x = (1 - landmark.x) * canvas.width;
            const y = landmark.y * canvas.height;
            // Highlight index tip (landmark 8)
            ctx.fillStyle = index === 8 ? '#EF4444' : ((index === 4 || index === 12 || index === 16 || index === 20) ? '#3B82F6' : '#FFFFFF');
            ctx.beginPath();
            ctx.arc(x, y, index === 8 ? 8 : (index === 0 ? 6 : 4), 0, 2 * Math.PI);
            ctx.fill();
            if (index === 8) {
              ctx.strokeStyle = 'white';
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          });
        }
      } else {
        // Handle Tracking Loss
        const timeSinceLastSeen = now - lastSeenTime.current;
        
        if (timeSinceLastSeen > trackingGracePeriod) {
          setGesture({ type: 'none', confidence: 0, position: { x: 0, y: 0 }, isNew: false, isEnding: false });
          setHoveredId(null);
          lastPanPos.current = null;
          setIsClicked(false);
        }
        // If within grace period, we do nothing - targetPosRef stays at last known position
      }
    } catch (err) {
      console.error("[HandDetection] Error:", err);
    } finally {
      isProcessing.current = false;
    }

    drawScanline();
  };

  if (systemStage === 'test') {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-center p-8">
        {/* Persistent Tracking Layer (Floating & Draggable) */}
        <div 
          ref={hudRef}
          className="fixed w-72 aspect-video z-[10002] group cursor-grab active:cursor-grabbing top-6 right-6 will-change-transform"
          style={{ pointerEvents: 'auto' }}
          onMouseDown={handleHUDMouseDown}
        >
          <div className="absolute -top-8 left-0 right-0 h-8 bg-slate-900/95 backdrop-blur-sm border border-blue-500/20 rounded-t-xl flex items-center px-3 justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Live Tracking</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            </div>
          </div>
          <WebcamFeed 
            onFrame={handleFrame} 
            minimal
            className="w-full h-full border border-blue-500/20 shadow-xl rounded-b-2xl rounded-tr-2xl overflow-hidden bg-slate-900/95 backdrop-blur-sm" 
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={isTrackingLost ? "bg-red-500 text-white border-none" : "bg-emerald-500 text-white border-none"}>
              {isTrackingLost ? "TRACKING LOST" : "TRACKING ACTIVE"}
            </Badge>
            <Badge variant="outline" className="bg-slate-900/80 text-blue-400 border-blue-500/30 backdrop-blur-md">
              {currentFps} FPS
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3">
             <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-slate-900/80 px-2 py-1 rounded-md backdrop-blur-md border border-blue-500/20">
               {gesture.type}
             </div>
          </div>
        </div>

        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tighter italic">VITAL<span className="text-blue-500">STREAM</span> <span className="text-slate-500 font-normal not-italic text-2xl ml-2">Calibration</span></h1>
            <p className="text-slate-400">Please position your hand in front of the camera to verify tracking stability.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="md:col-span-2 bg-slate-900 border-slate-800 overflow-hidden relative aspect-video shadow-2xl flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20">
                  {aiError ? (
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  ) : (
                    <Hand className={`w-10 h-10 ${isStable ? 'text-emerald-400' : 'text-blue-400 animate-pulse'}`} />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {aiError ? 'AI Engine Error' : (isStable ? 'Stability Achieved' : 'Analyzing Hand Biometrics...')}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {aiError || 'Calibration ensures precise gesture mapping'}
                  </p>
                </div>
                <div className="flex justify-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-blue-500">{stabilityScore}%</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Confidence</div>
                  </div>
                  <div className="w-[1px] bg-slate-800" />
                  <div className="text-center">
                    <div className="text-2xl font-black text-blue-500">{currentFps}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Engine FPS</div>
                  </div>
                </div>
              </div>
              
              {/* Progress Ring Overlay */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none opacity-20">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-800"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="100 100"
                  className="text-blue-500"
                  animate={{ strokeDashoffset: 100 - stabilityScore }}
                />
              </svg>
            </Card>

            <div className="space-y-6">
              <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Diagnostic Data</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Hand Detected</span>
                    <span className={gesture.type !== 'none' ? "text-emerald-400 font-bold" : "text-red-400"}>
                      {gesture.type !== 'none' ? "YES" : "NO"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Gesture</span>
                    <span className="text-blue-400 font-mono uppercase">{gesture.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Stability</span>
                    <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-500"
                        animate={{ width: `${stabilityScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Instructions</h3>
                <ul className="text-xs space-y-2 text-slate-400">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full" /> Keep hand 1-2 feet from camera</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full" /> Ensure good lighting</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full" /> Test Pinch, Point, and Palm</li>
                </ul>
              </Card>

              <Button 
                data-interactive-id="btn-start"
                disabled={!isStable}
                onClick={() => {
                  console.log("[Action] Start System button clicked manually.");
                  setSystemStage('dashboard');
                }}
                className={`w-full h-16 rounded-2xl font-bold text-lg transition-all ${isStable ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-500'} ${hoveredId === 'btn-start' ? 'ring-4 ring-blue-500/30 scale-105' : ''}`}
              >
                {isStable ? "START SYSTEM" : "WAITING FOR STABILITY..."}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 overflow-hidden">
      {/* Persistent Tracking Layer (Floating & Draggable) */}
      <div 
        ref={hudRef}
        className="fixed w-72 aspect-video z-[10002] group cursor-grab active:cursor-grabbing top-6 right-6 will-change-transform"
        style={{ pointerEvents: 'auto' }}
        onMouseDown={handleHUDMouseDown}
      >
        <div className="absolute -top-8 left-0 right-0 h-8 bg-white/95 backdrop-blur-sm border border-blue-100 rounded-t-xl flex items-center px-3 justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Live Tracking</span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          </div>
        </div>
        <WebcamFeed 
          onFrame={handleFrame} 
          minimal
          className="w-full h-full border border-blue-500/20 shadow-xl rounded-b-2xl rounded-tr-2xl overflow-hidden bg-white/95 backdrop-blur-sm" 
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={isTrackingLost ? "bg-red-500 text-white border-none" : "bg-emerald-500 text-white border-none"}>
            {isTrackingLost ? "TRACKING LOST" : "TRACKING ACTIVE"}
          </Badge>
          <Badge variant="outline" className="bg-white/80 text-blue-600 border-blue-100 backdrop-blur-md">
            {currentFps} FPS
          </Badge>
        </div>
        <div className="absolute bottom-3 right-3">
           <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-white/80 px-2 py-1 rounded-md backdrop-blur-md border border-blue-100">
             {gesture.type}
           </div>
        </div>
      </div>

      {/* Tracking Status Indicator */}
      <AnimatePresence>
        {isTrackingLost && systemStage === 'dashboard' && (
          <motion.div
            key="lost"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[10001] bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            TRACKING LOST - POSITION FROZEN
          </motion.div>
        )}
        {showRestored && systemStage === 'dashboard' && (
          <motion.div
            key="restored"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[10001] bg-emerald-500 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-white rounded-full" />
            TRACKING RESTORED
          </motion.div>
        )}
      </AnimatePresence>

      {/* Virtual Cursor (Direct DOM manipulation for position) */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-blue-500 pointer-events-none z-[9999] flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-150 will-change-transform"
        style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(1px)',
          borderColor: 'rgba(59,130,246,0.2)',
          transform: `translate3d(${currentPosRef.current.x - 16}px, ${currentPosRef.current.y - 16}px, 0)`,
        }}
      >
        <div className={`w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] ${isClicked ? 'scale-150' : 'scale-100'} transition-transform duration-200`} />
        
        {/* Animated Ring for Active Gestures */}
        {gesture.type !== 'none' && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: [0.2, 0.5, 0.2] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 rounded-full border border-blue-400/30"
          />
        )}
        
        {/* Debug Target Indicator */}
        {debugMode && hoveredId && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
            TARGET: {hoveredId}
          </div>
        )}
      </div>

      {/* Raw Debug Dot */}
      {debugMode && (
        <div 
          ref={rawCursorRef}
          className="fixed top-0 left-0 w-2 h-2 bg-red-500 rounded-full pointer-events-none z-[10000] opacity-50"
          style={{ transform: `translate3d(${targetPosRef.current.x - 4}px, ${targetPosRef.current.y - 4}px, 0)` }}
        />
      )}

      {/* Debug Panel */}
      {debugMode && (
        <div className="fixed bottom-4 right-4 z-[10000] bg-white/90 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-2xl text-[10px] font-mono space-y-1 w-48">
          <div className="flex justify-between border-b border-slate-100 pb-1 mb-1">
            <span className="font-bold text-slate-400 uppercase">Debug Engine</span>
            <button onClick={() => setDebugMode(false)} className="text-slate-400 hover:text-red-500">×</button>
          </div>
          <div className="flex justify-between"><span>Gesture:</span> <span className="text-blue-600 font-bold">{gesture.type}</span></div>
          <div className="flex justify-between"><span>X:</span> <span>{Math.round(currentPosRef.current.x)}</span></div>
          <div className="flex justify-between"><span>Y:</span> <span>{Math.round(currentPosRef.current.y)}</span></div>
          <div className="flex justify-between"><span>Target:</span> <span className="text-emerald-600">{hoveredId || 'None'}</span></div>
          <div className="flex justify-between"><span>Click:</span> <span className={isClicked ? 'text-red-500 font-bold' : ''}>{isClicked ? 'TRUE' : 'FALSE'}</span></div>
        </div>
      )}

      <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <HeartPulse className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 italic">VITAL<span className="text-blue-500">STREAM</span></h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Optical Diagnostic Interface</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <AnimatePresence mode="wait">
            {gesture.type !== 'none' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-3 px-5 py-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl"
              >
                {gesture.type === 'pinch' && <MousePointer2 className="w-4 h-4" />}
                {gesture.type === 'open_palm' && <HandMetal className="w-4 h-4" />}
                {gesture.type === 'point' && <ScanLine className="w-4 h-4" />}
                {gesture.type.startsWith('swipe') && <Zap className="w-4 h-4" />}
                <span className="text-xs font-black uppercase tracking-widest">
                  {gesture.type.replace('_', ' ')}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="h-8 w-[1px] bg-slate-200" />
          <div className="flex items-center gap-3">
            {!isAIReady ? (
              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 px-3 py-1">
                <Cpu className="w-3.5 h-3.5 mr-2 animate-spin" />
                BOOTING CORE...
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 px-3 py-1">
                <Hand className="w-3.5 h-3.5 mr-2" />
                SYSTEM READY
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-8 grid lg:grid-cols-12 gap-8 h-[calc(100vh-80px)]">
        
        {/* Left Column: Patient List & Info */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          <Card className="bg-white border-slate-200 shadow-xl overflow-hidden flex-1 flex flex-col">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <User className="w-5 h-5 text-blue-500" />
                  Patient Directory
                </CardTitle>
                <div className="flex gap-1">
                  {PATIENTS.map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activePatientIndex ? 'bg-blue-500' : 'bg-slate-300'}`} />
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
              <div className="p-6 space-y-4 flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePatient.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center border border-slate-200 shadow-inner">
                        <User className="w-12 h-12 text-slate-400" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-slate-900">{activePatient.name}</h2>
                        <div className="flex gap-3 mt-2">
                          <Badge className="bg-blue-50 text-blue-600 border-blue-100">{activePatient.age} Years</Badge>
                          <Badge className={activePatient.condition === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}>
                            {activePatient.condition}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                          <Activity className="w-3 h-3" /> Heart Rate
                        </div>
                        <div className="text-2xl font-black text-slate-900">{activePatient.vitals.hr} <span className="text-xs font-normal text-slate-400">BPM</span></div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                          <Droplets className="w-3 h-3" /> Blood Pressure
                        </div>
                        <div className="text-2xl font-black text-slate-900">{activePatient.vitals.bp}</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                          <Thermometer className="w-3 h-3" /> Temperature
                        </div>
                        <div className="text-2xl font-black text-slate-900">{activePatient.vitals.temp}</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                          <Calendar className="w-3 h-3" /> Admission
                        </div>
                        <div className="text-2xl font-black text-slate-900">12 Oct</div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Controls */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-4">
                <Button 
                  data-interactive-id="btn-prev"
                  onClick={() => setActivePatientIndex(prev => (prev - 1 + PATIENTS.length) % PATIENTS.length)}
                  variant="outline" 
                  className={`h-16 rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300 ${hoveredId === 'btn-prev' ? 'bg-blue-600 text-white border-blue-500 scale-105 shadow-lg shadow-blue-200' : ''}`}
                >
                  <ChevronLeft className="w-6 h-6 mr-2" /> Previous
                </Button>
                <Button 
                  data-interactive-id="btn-next"
                  onClick={() => setActivePatientIndex(prev => (prev + 1) % PATIENTS.length)}
                  variant="outline" 
                  className={`h-16 rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300 ${hoveredId === 'btn-next' ? 'bg-blue-600 text-white border-blue-500 scale-105 shadow-lg shadow-blue-200' : ''}`}
                >
                  Next <ChevronRight className="w-6 h-6 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Optical Engine Diagnostics (Persistent Layer replaces local feed) */}
          <Card className="bg-white border-slate-200 h-48 overflow-hidden relative shadow-lg">
            <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                  <Cpu className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engine Status: Nominal</p>
              </div>
            </div>
            <div className="relative p-6 h-full flex flex-col justify-end bg-gradient-to-t from-white via-white/80 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Optical Stream</p>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Hand className="w-4 h-4" /> Gesture Engine Active
                  </h3>
                </div>
                <Badge className="bg-blue-50 text-blue-600 border-blue-100">{currentFps} FPS</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Image Viewer & Actions */}
        <div className="lg:col-span-8 space-y-6 flex flex-col">
          <Card className="bg-white border-slate-200 shadow-2xl flex-1 overflow-hidden flex flex-col relative group">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <Maximize2 className="w-5 h-5 text-blue-500" />
                  Diagnostic Image Viewer
                </CardTitle>
                <div className="flex gap-4">
                  <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-500">ZOOM: {imgScale.toFixed(1)}x</Badge>
                  <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-500">PAN: {Math.round(imgOffset.x)}, {Math.round(imgOffset.y)}</Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 relative bg-slate-50 overflow-hidden cursor-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePatient.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <motion.img
                    src={activePatient.image}
                    alt="Diagnostic Scan"
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-full object-contain pointer-events-none shadow-2xl"
                    animate={{ 
                      scale: imgScale,
                      x: imgOffset.x,
                      y: imgOffset.y
                    }}
                    transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Viewer Overlays */}
              <div className="absolute inset-0 pointer-events-none border-[40px] border-transparent">
                <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-blue-500/20" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-blue-500/20" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-blue-500/20" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-blue-500/20" />
                
                {/* Crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center opacity-10">
                  <div className="w-full h-[1px] bg-blue-500" />
                  <div className="absolute w-[1px] h-full bg-blue-500" />
                </div>
              </div>

              {/* Instructions Overlay */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-slate-200 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-700 shadow-lg">
                  <MousePointer2 className="w-3 h-3 text-blue-500" /> Pinch to Zoom
                </div>
                <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-slate-200 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-700 shadow-lg">
                  <ScanLine className="w-3 h-3 text-blue-500" /> Point to Pan
                </div>
                <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-slate-200 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-700 shadow-lg">
                  <HandMetal className="w-3 h-3 text-blue-500" /> Palm to Reset
                </div>
              </div>
            </CardContent>

            {/* Action Bar */}
            <div className="h-24 bg-white border-t border-slate-100 p-4 flex items-center justify-center gap-6">
              <Button 
                data-interactive-id="btn-report"
                onClick={() => setViewMode(viewMode === 'dashboard' ? 'report' : 'dashboard')}
                className={`h-14 px-10 rounded-2xl bg-blue-600 text-white font-bold transition-all duration-300 shadow-lg shadow-blue-200 ${hoveredId === 'btn-report' ? 'bg-blue-500 scale-105 ring-4 ring-blue-500/10' : ''}`}
              >
                <FileText className="w-5 h-5 mr-3" /> {viewMode === 'dashboard' ? 'VIEW FULL REPORT' : 'BACK TO VIEWER'}
              </Button>
              <Button 
                data-interactive-id="btn-reset"
                onClick={() => { setImgScale(1); setImgOffset({ x: 0, y: 0 }); }}
                variant="outline"
                className={`h-14 px-10 rounded-2xl border-slate-200 bg-white text-slate-700 font-bold transition-all duration-300 ${hoveredId === 'btn-reset' ? 'bg-slate-50 scale-105 border-blue-500 text-blue-600' : ''}`}
              >
                <RefreshCw className="w-5 h-5 mr-3" /> RESET VIEW
              </Button>
            </div>
          </Card>
        </div>

      </main>
    </div>
  );
}

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}


