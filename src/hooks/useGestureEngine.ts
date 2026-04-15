import { useRef } from 'react';
import { getHandLandmarker } from '../services/handDetectionService';
import { GestureProcessor, GestureState } from '../services/gestureService';
import { HAND_CONNECTIONS } from '../constants/handConnections';

interface GestureEngineProps {
    isAIReady: boolean;
    systemStage: 'test' | 'dashboard';
    viewMode: 'dashboard' | 'report';
    debugMode: boolean;
    isStable: boolean;
    setIsStable: (v: boolean) => void;
    setStabilityScore: (v: number) => void;
    setGesture: (v: GestureState) => void;
    setHoveredId: (v: string | null) => void;
    setIsClicked: (v: boolean) => void;
    setActivePatientIndex: (update: (prev: number) => number) => void;
    setImgScale: (update: (prev: number) => number) => void;
    setImgOffset: (update: (prev: { x: number; y: number }) => { x: number; y: number }) => void;
    setViewMode: (v: 'dashboard' | 'report') => void;
    setCurrentFps: (v: number) => void;
    setIsTrackingLost: (v: boolean) => void;
    setShowRestored: (v: boolean) => void;
    targetPosRef: React.MutableRefObject<{ x: number; y: number }>;
    lastIsClicked: React.MutableRefObject<boolean>;
    lastGestureType: React.MutableRefObject<string>;
    isTrackingLost: boolean;
    patientCount: number;
}

export function useGestureEngine({
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
    patientCount
}: GestureEngineProps) {
    const gestureProcessor = useRef(new GestureProcessor());
    const dwellTimer = useRef<number | null>(null);
    const lastPanPos = useRef<{ x: number, y: number } | null>(null);
    const stabilityBuffer = useRef<boolean[]>([]);
    const STABILITY_WINDOW = 60;

    const isProcessing = useRef(false);
    const lastDetectionTime = useRef(0);
    const detectionInterval = 40;
    const frameCount = useRef(0);
    const lastFpsUpdate = useRef(0);

    const lastLandmarksRef = useRef<any>(null);
    const lastSeenTime = useRef(0);
    const trackingGracePeriod = 300;
    const lastStabilityScore = useRef<number>(0);
    const lastHoveredId = useRef<string | null>(null);

    const smoothedTargetPosRef = useRef({ x: 0, y: 0 });
    const smoothingAlpha = 0.2;

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
            if (score !== lastStabilityScore.current) {
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
                    if (gestureState.type === 'swipe_left' && gestureState.isNew) setActivePatientIndex(prev => (prev + 1) % patientCount);
                    if (gestureState.type === 'swipe_right' && gestureState.isNew) setActivePatientIndex(prev => (prev - 1 + patientCount) % patientCount);
                    if (gestureState.type === 'open_palm' && gestureState.isNew) {
                        setViewMode('dashboard');
                        setImgScale(() => 1);
                        setImgOffset(() => ({ x: 0, y: 0 }));
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

    return { handleFrame };
}
